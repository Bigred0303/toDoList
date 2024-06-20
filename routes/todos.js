/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
// THIS PATTERN

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const {
  fetchOMDbMovies,
  fetchGoogleBooks,
  fetchYelpFoods,
  fetchAmazonProducts,
} = require("./apiHandlers"); // Adjust the path as per your file structure

const pool = new Pool({
  user: "labber",
  host: "localhost",
  database: "midterm",
  password: "labber",
  port: 5432,
});

// Structure to access database entries, category is required to make going from DB to backend much much easier
// This has changed some of our routes but I felt like it was worth changing the plan slightly and
// Should not have major side effects other than changing what you type your redirects to
let todos = {
  categories: {},
};

// Checks the database using pq to fetch table info which is then fed into the home page
// Uses promises so you're likely to get unhandled promise rejection errors when messing around with it
// You shouldn't have to use this at all however, since you don't need to fetch the database just change parts of it
const fetchTodos = async () => {
  const client = await pool.connect();
  try {
    const categories = ["movies", "books", "restaurants", "products"];
    const categoryPromises = categories.map(async (category) => {
      const res = await client.query(`SELECT id, name FROM ${category}`);
      return {
        [category]: res.rows,
      };
    });
    const categoryData = await Promise.all(categoryPromises);
    todos.categories = categoryData.reduce((acc, category) => {
      return { ...acc, ...category };
    }, {});
  } catch (err) {
    console.error(`Error fetching todos: ${err.message}`);
  } finally {
    client.release();
  }
};

fetchTodos();

// Main page, list of all items in 4 boxes
router.get("/", async (req, res) => {
  await fetchTodos();
  console.log("GET /todos");
  res.render("todos", { todos });
});

//////////////////////////////
// POST /todos route
//////////////////////////////
// Form on main page that allows users to enter items in toDoList
router.post("/", async (req, res) => {
  const taskName = req.body.title;

  console.log(`New task added: ${taskName}`);

  let omdbMovies = [];
  let googleBooks = [];
  let yelpFoods = [];
  let amazonProducts = [];

  try {
    // Fetch data from APIs
    [omdbMovies, googleBooks, yelpFoods, amazonProducts] = await Promise.all([
      fetchOMDbMovies(taskName).catch((err) =>
        console.error("Error fetching OMDb Movies:", err.message)
      ),
      fetchGoogleBooks(taskName).catch((err) =>
        console.error("Error fetching Google Books:", err.message)
      ),
      fetchYelpFoods(taskName).catch((err) =>
        console.error("Error fetching Yelp Foods:", err.message)
      ),
      fetchAmazonProducts(taskName).catch((err) =>
        console.error("Error fetching Amazon Products:", err.message)
      ),
    ]);
  } catch (err) {
    console.error(`Error fetching data from APIs: ${err.message}`);
    return res.status(500).send("Error fetching data from APIs");
  }

  // Logging fetched data for debugging
  console.log("OMDb Movies:", omdbMovies);
  console.log("Google Books:", googleBooks);
  console.log("Yelp Foods:", yelpFoods);
  console.log("Amazon Products:", amazonProducts);

  if (omdbMovies.length > 0) {
    const client = await pool.connect();
    const category = "movies";
    try {
      const queryString = `INSERT INTO ${category} (name, movie_title, release_date, rating, genre, imdb_score) VALUES ($1, $2, $3, $4, $5, $6)`;
      const values = [
        taskName,
        omdbMovies[0].name,
        omdbMovies[0].release_date,
        omdbMovies[0].rating,
        omdbMovies[0].genre,
        omdbMovies[0].imdb_score,
      ];

      await client.query(queryString, values);
      console.log(`category: ${category}`);
    } catch (err) {
      console.error(`Error adding movie to database: ${err.message}`);
    } finally {
      client.release();
    }
  } else {
    console.log(`Movies category not found`);
  }

  if (googleBooks.length > 0) {
    const client = await pool.connect();
    const category = "books";
    try {
      const queryString = `INSERT INTO ${category} (name, title, author, publish_date, page_count, purchase_link, price, language) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      const values = [
        taskName,
        googleBooks[0].title,
        googleBooks[0].author,
        googleBooks[0].publish_date,
        googleBooks[0].page_count,
        googleBooks[0].purchase_link,
        Math.round(googleBooks[0].price),
        googleBooks[0].language,
      ];

      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding book to database: ${err.message}`);
    } finally {
      client.release();
    }
  } else {
    console.log(`Books category not found`);
  }

  if (yelpFoods.length > 0) {
    const client = await pool.connect();
    const category = "restaurants";
    try {
      const queryString = `INSERT INTO ${category} (name, restaurant_name, review_count, rating, phone_number, website_url, address, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      const values = [
        taskName,
        yelpFoods[0].name,
        yelpFoods[0].review_count,
        yelpFoods[0].rating,
        yelpFoods[0].phone_number,
        yelpFoods[0].website_url,
        yelpFoods[0].address,
        yelpFoods[0].category,
      ];

      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding restaurant to database: ${err.message}`);
    } finally {
      client.release();
    }
  } else {
    console.log(`Restaurants category not found`);
  }

  if (amazonProducts.length > 0) {
    const client = await pool.connect();
    const category = "products";
    try {
      const queryString = `INSERT INTO ${category} (name, product_name, number_of_products, lowest_price, highest_price, avg_star_rating, is_prime) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      const values = [
        taskName,
        amazonProducts[0].product_title,
        amazonProducts[0].product_num_offers,
        Math.round(amazonProducts[0].product_price),
        Math.round(amazonProducts[0].product_price),
        amazonProducts[0].product_star_rating,
        amazonProducts[0].is_prime,
      ];

      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding product to database: ${err.message}`);
    } finally {
      client.release();
    }
  } else {
    console.log(`Products category not found`);
  }
  res.redirect("/todos");
});

// GET route to render edit form
router.get("/:category/:id/edit", (req, res) => {
  const category = req.params.category;
  const id = req.params.id;

  // Fetch task details based on category and taskId
  // Render edit form (e.g., edit-task.ejs) with pre-filled task details
  res.render("edit", { category, id });
});

// GET route to render edit form
router.get("/:category/:id/edit", (req, res) => {
  const category = req.params.category;
  const id = req.params.id;

  // Fetch task details based on category and taskId
  // Render edit form (e.g., edit-task.ejs) with pre-filled task details
  res.render("edit", { category, id });
});

// Update task
router.post("/:category/:id/edit", async (req, res) => {
  const client = await pool.connect();
  const category = req.params.category;
  const id = req.params.id;
  const newTask = req.body.editTask;

  let omdbMovies = [];
  let googleBooks = [];
  let yelpFoods = [];
  let amazonProducts = [];

  console.log(`Task Name updated: ${newTask}`);

  try {
    // Fetch data from APIs
    [omdbMovies, googleBooks, yelpFoods, amazonProducts] = await Promise.all([
      fetchOMDbMovies(newTask).catch((err) =>
        console.error("Error fetching OMDb Movies:", err.message)
      ),
      fetchGoogleBooks(newTask).catch((err) =>
        console.error("Error fetching Google Books:", err.message)
      ),
      fetchYelpFoods(newTask).catch((err) =>
        console.error("Error fetching Yelp Foods:", err.message)
      ),
      fetchAmazonProducts(newTask).catch((err) =>
        console.error("Error fetching Amazon Products:", err.message)
      ),
    ]);
  } catch (err) {
    console.error(`Error fetching data from APIs: ${err.message}`);
    return res.status(500).send("Error fetching data from APIs");
  }

  // Logging fetched data for debugging
  console.log("Google Books:", googleBooks);
  console.log("Amazon Products:", amazonProducts);
  console.log("OMDb Movies:", omdbMovies);
  console.log("Yelp Foods:", yelpFoods);

  // console.log(`todos.categories[category]: ${todos.categories[category]}`);

  // Update table
  if (category === "movies") {
    try {
      const queryString = `UPDATE movies
                            SET name = $1, movie_title = $2, release_date = $3, rating = $4, genre = $5, imdb_score = $6
                            WHERE id = $7`;
      const values = [
        newTask,
        omdbMovies[0].name,
        omdbMovies[0].release_date,
        omdbMovies[0].rating,
        omdbMovies[0].genre,
        omdbMovies[0].imdb_score,
        id,
      ];

      await client.query(queryString, values);
      console.log(`category: ${category}`);
    } catch (err) {
      console.error(`Error updating movie in the database: ${err.message}`);
    } finally {
      client.release();
    }
  } else if (category === "books") {
    try {
      const queryString = `UPDATE books
                            SET name = $1, title = $2, author = $3, publish_date = $4, page_count = $5, purchase_link = $6, price = $7, language = $8
                            WHERE id = $9`;
      const values = [
        newTask,
        googleBooks[0].title,
        googleBooks[0].author,
        googleBooks[0].publish_date,
        googleBooks[0].page_count,
        googleBooks[0].purchase_link,
        Math.round(googleBooks[0].price),
        googleBooks[0].language,
        id,
      ];

      await client.query(queryString, values);
      console.log(`category: ${category}`);
    } catch (err) {
      console.error(`Error updating book in the database: ${err.message}`);
    } finally {
      client.release();
    }
  } else if (category === "restaurants") {
    try {
      const queryString = `UPDATE restaurants
                            SET name = $1, restaurant_name = $2, review_count = $3, rating = $4, phone_number = $5, website_url = $6, address = $7, category = $8
                            WHERE id = $9`;
      const values = [
        newTask,
        yelpFoods[0].name,
        yelpFoods[0].review_count,
        yelpFoods[0].rating,
        yelpFoods[0].phone_number,
        yelpFoods[0].website_url,
        yelpFoods[0].address,
        yelpFoods[0].category,
        id,
      ];

      await client.query(queryString, values);
      console.log(`category: ${category}`);
    } catch (err) {
      console.error(
        `Error updating restaurant in the database: ${err.message}`
      );
    } finally {
      client.release();
    }
  } else if (category === "products") {
    try {
      const queryString = `UPDATE products
                            SET name = $1, product_name = $2, number_of_products = $3, lowest_price = $4, highest_price = $5, avg_star_rating = $6, is_prime = $7                            WHERE id = $8`;
      const values = [
        newTask,
        amazonProducts[0].product_title,
        amazonProducts[0].product_num_offers,
        Math.round(amazonProducts[0].product_price),
        Math.round(amazonProducts[0].product_price),
        amazonProducts[0].product_star_rating,
        amazonProducts[0].is_prime,
        id,
      ];

      await client.query(queryString, values);
      console.log(`category: ${category}`);
    } catch (err) {
      console.error(`Error updating product in the database: ${err.message}`);
    } finally {
      client.release();
    }
  } else {
    console.log(`Category ${category} not found`);
  }
  res.redirect("/todos");
});

// Category allows us to have the same id numbers in different tables
// Edit the data of an item as the user wishes
router.post("/:category/:id", async (req, res) => {});

// Category allows us to have the same id numbers in different tables
// Remove item from list
router.post("/:category/:id/delete", async (req, res) => {
  const client = await pool.connect();
  const allowedCategories = ['movies', 'books', 'restaurants', 'products'];
  const category = req.params.category;
  const id = req.params.id;

  if (!allowedCategories.includes(category)) {
    return res.status(400).send(`Invalid category: ${category}`);
  }
  
  const queryString = `DELETE FROM ${category} WHERE id = $1`;
  try {
    await client.query(queryString, [id]);
    console.log(`category: ${category}`);
  } catch (err) {
    console.error(`Error deleting item from ${category}: ${err.message}`);
  } finally {
    client.release();
  }
  res.redirect("/todos");
});

// Removes an item from one list, API call for metadata for new list, error message if API cannot find, Adds it to the list selected by the user
router.post("/:id/:category", async (req, res) => {});

module.exports = router;
