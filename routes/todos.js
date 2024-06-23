const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const {
  fetchOMDbMovies,
  fetchGoogleBooks,
  fetchYelpFoods,
  fetchAmazonProducts,
} = require("./apiHandlers"); // Import API handlers for fetching data from external APIs
var he = require('he');

const pool = new Pool({
  user: "labber",
  host: "localhost",
  database: "midterm",
  password: "labber",
  port: 5432,
});

// Structure to store todo items by category
let todos = {
  categories: {},
};

// Function to fetch todos from the database
const fetchTodos = async () => {
  const client = await pool.connect(); // Connect to the database
  try {
    const categories = ["movies", "books", "restaurants", "products"]; // Define categories
    const categoryPromises = categories.map(async (category) => {
      const res = await client.query(`SELECT id, name FROM ${category}`); // Query each category
      return {
        [category]: res.rows, // Store results by category
      };
    });

    const categoryData = await Promise.all(categoryPromises); // Wait for all queries to complete
    todos.categories = categoryData.reduce((acc, category) => {
      return { ...acc, ...category }; // Merge category data into todos object
    }, {});
  } catch (err) {
    console.error(`Error fetching todos: ${err.message}`); // Log any errors
  } finally {
    client.release(); // Release the database client
  }
};

fetchTodos(); // Fetch todos on startup

// Route to render the main page
router.get("/", async (req, res) => {
  await fetchTodos(); // Fetch the latest todos
  console.log("GET /todos");
  res.render("todos", { todos }); // Render the todos.ejs template with the todos data
});

// Route to handle new task creation
router.post("/", async (req, res) => {
  const taskName = req.body.title; // Get task name from request body
  console.log(`New task added: ${taskName}`);

  let omdbMovies = [];
  let googleBooks = [];
  let yelpFoods = [];
  let amazonProducts = [];

  try {
    // Fetch data from multiple APIs concurrently
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
    console.error(`Error fetching data from APIs: ${err.message}`); // Log any errors
    return res.status(500).send("Error fetching data from APIs"); // Return error response if data fetching fails
  }

  // Log fetched data for debugging
  console.log("OMDb Movies:", omdbMovies);
  console.log("Google Books:", googleBooks);
  console.log("Yelp Foods:", yelpFoods);
  console.log("Amazon Products:", amazonProducts);

  // Insert fetched OMDb movie data into the database
  if (omdbMovies.length > 0) {
    const client = await pool.connect();
    const category = "movies";
    try {
      omdbMovies[0].movie_title = he.decode(omdbMovies[0].movie_title);
      const queryString = `INSERT INTO ${category} (name, movie_title, release_date, rating, genre, imdb_score, poster_url) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      const values = [
        taskName,
        omdbMovies[0].movie_title,
        omdbMovies[0].release_date,
        omdbMovies[0].rating,
        omdbMovies[0].genre,
        omdbMovies[0].imdb_score,
        omdbMovies[0].poster_url
      ];
      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding movie to database: ${err.message}`); // Log any errors
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Movies category not found`); // Log if no movies found
  }

  // Insert fetched Google book data into the database
  if (googleBooks.length > 0) {
    const client = await pool.connect();
    const category = "books";
    try {
      googleBooks[0].title = he.decode(googleBooks[0].title);
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
      console.error(`Error adding book to database: ${err.message}`); // Log any errors
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Books category not found`); // Log if no books found
  }

  // Insert fetched Yelp food data into the database
  if (yelpFoods.length > 0) {
    const client = await pool.connect();
    const category = "restaurants";
    try {
      yelpFoods[0].restaurant_name = he.decode(yelpFoods[0].restaurant_name);
      const queryString = `INSERT INTO ${category} (name, restaurant_name, review_count, rating, phone_number, website_url, address, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      const values = [
        taskName,
        yelpFoods[0].restaurant_name,
        yelpFoods[0].review_count,
        yelpFoods[0].rating,
        yelpFoods[0].phone_number,
        yelpFoods[0].website_url,
        yelpFoods[0].address,
        yelpFoods[0].category,
      ];
      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding restaurant to database: ${err.message}`); // Log any errors
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Restaurants category not found`); // Log if no restaurants found
  }

  // Insert fetched Amazon product data into the database
  if (amazonProducts.length > 0) {
    const client = await pool.connect();
    const category = "products";
    try {
      amazonProducts[0].product_name = he.decode(amazonProducts[0].product_name);
      const queryString = `INSERT INTO ${category} (name, product_name, number_of_products, lowest_price, highest_price, avg_star_rating, is_prime, product_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      const values = [
        taskName,
        amazonProducts[0].product_name,
        amazonProducts[0].number_of_products,
        Math.round(amazonProducts[0].lowest_price),
        Math.round(amazonProducts[0].highest_price),
        amazonProducts[0].avg_star_rating,
        amazonProducts[0].is_prime,
        amazonProducts[0].product_url
      ];
      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding product to database: ${err.message}`); // Log any errors
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Products category not found`); // Log if no products found
  }

  res.redirect("/todos"); // Redirect to the todos page after processing the request
});

// Route to render edit form
router.get("/:category/:id/edit", async (req, res) => {
  const category = req.params.category; // Get category from request params
  const id = req.params.id; // Get task id from request params

  try {
    const result = await pool.query(`SELECT * FROM ${category} WHERE id = $1`, [
      id,
    ]); // Query task details
    const task = result.rows[0]; // Get the task from the query result

    if (task) {
      res.render("edit", { task, category, id }); // Render the edit form with task details
    } else {
      res.status(404).send("Task not found"); // Send 404 if task not found
    }
  } catch (err) {
    console.error(`Error fetching task for edit: ${err.message}`); // Log any errors
    res.status(500).send("Internal Server Error"); // Send 500 if server error
  }
});

// Route to update task
router.post("/:category/:id/edit", async (req, res) => {
  const client = await pool.connect(); // Connect to the database
  const category = req.params.category; // Get category from request params
  const id = req.params.id; // Get task id from request params
  const newTask = req.body.editTask; // Get updated task name from request body

  console.log(`Task Name updated: ${newTask}`);

  try {
    const queryString = `UPDATE ${category} SET name = $1 WHERE id = $2`; // Update task name
    const values = [newTask, id];
    await client.query(queryString, values);
  } catch (err) {
    console.error(`Error updating ${category} in the database: ${err.message}`); // Log any errors
  } finally {
    client.release(); // Release the database client
  }

  res.redirect("/todos"); // Redirect to the todos page after updating the task
});

// Route to delete task
router.post("/:category/:id/delete", async (req, res) => {
  const client = await pool.connect(); // Connect to the database
  const allowedCategories = ["movies", "books", "restaurants", "products"]; // Define allowed categories
  const category = req.params.category; // Get category from request params
  const id = req.params.id; // Get task id from request params

  if (!allowedCategories.includes(category)) {
    return res.status(400).send(`Invalid category: ${category}`); // Return 400 if category is invalid
  }

  const queryString = `DELETE FROM ${category} WHERE id = $1`; // Delete task from database
  try {
    await client.query(queryString, [id]);
  } catch (err) {
    console.error(`Error deleting item from ${category}: ${err.message}`); // Log any errors
  } finally {
    client.release(); // Release the database client
  }

  res.redirect("/todos"); // Redirect to the todos page after deleting the task
});

// Route to fetch and display task details
router.get("/:category/:id", async (req, res) => {
  const { category, id } = req.params; // Get category and id from request params
  const client = await pool.connect(); // Connect to the database

  try {
    const query = `SELECT * FROM ${category} WHERE id = $1`; // Query task details
    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Task not found"); // Send 404 if task not found
    }

    const task = result.rows[0];
    res.render("task-details", { task, category }); // Render task details view
  } catch (err) {
    console.error(`Error fetching task: ${err.message}`); // Log any errors
    res.status(500).send("Server error"); // Send 500 if server error
  } finally {
    client.release(); // Release the database client
  }
});

// Route to change task category
router.post("/:id/change-category", async (req, res) => {
  const client = await pool.connect(); // Connect to the database
  const { id } = req.params; // Get task id from request params
  const { newCategory, oldCategory } = req.body; // Get new and old category from request body
  const allowedCategories = ["movies", "books", "restaurants", "products"]; // Define allowed categories
  
  if (!allowedCategories.includes(newCategory)) {
    return res.status(400).send(`Invalid new category: ${newCategory}`); // Return 400 if new category is invalid
  }

  let currentTask = null;

  try {
    const result = await client.query(
      `SELECT * FROM ${oldCategory} WHERE id = $1`,
      [id]
    ); // Query task from old category
    if (result.rows.length > 0) {
      currentTask = result.rows[0]; // Get the current task
    } else {
      return res.status(404).send("Task not found"); // Return 404 if task not found
    }
  } catch (err) {
    console.error(`Error fetching task: ${err.message}`); // Log any errors
    return res.status(500).send("Internal server error"); // Send 500 if server error
  }

  try {
    await client.query(`DELETE FROM ${oldCategory} WHERE id = $1`, [id]); // Delete task from old category
  } catch (err) {
    console.error(`Error deleting task from ${oldCategory}: ${err.message}`); // Log any errors
  }

  let newTaskDetails = {};

  try {
    // Fetch new task details based on the new category
    if (newCategory === "movies") {
      console.log("CALLING MOVIE API - TEST TO FIND MISSING METADATA");
      const movies = await fetchOMDbMovies(currentTask.name);
      newTaskDetails = movies.length > 0 ? movies[0] : {};
    } else if (newCategory === "books") {
      const books = await fetchGoogleBooks(currentTask.name);
      newTaskDetails = books.length > 0 ? books[0] : {};
    } else if (newCategory === "restaurants") {
      const foods = await fetchYelpFoods(currentTask.name);
      newTaskDetails = foods.length > 0 ? foods[0] : {};
    } else if (newCategory === "products") {
      const products = await fetchAmazonProducts(currentTask.name);
      newTaskDetails = products.length > 0 ? products[0] : {};
    }
  } catch (err) {
    console.error(`Error fetching data from APIs: ${err.message}`); // Log any errors
  }

  let queryString;
  let values;

  // Define the query string and values for inserting the new task into the new category table
  if (newCategory === "movies") {
    queryString = `INSERT INTO movies (name, movie_title, release_date, rating, genre, imdb_score, poster_url, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    values = [
      currentTask.name,
      newTaskDetails.movie_title || "Unknown Title",
      newTaskDetails.release_date || new Date(),
      newTaskDetails.rating || "N/A",
      newTaskDetails.genre || "Unknown",
      parseFloat(newTaskDetails.imdb_score) || 0,
      newTaskDetails.poster_url || "Unknown",
      currentTask.user_id,
    ];
  } else if (newCategory === "books") {
    queryString = `INSERT INTO books (name, title, author, publish_date, page_count, purchase_link, price, language, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    values = [
      currentTask.name,
      newTaskDetails.title || "Unknown Title",
      newTaskDetails.author || "Unknown Author",
      newTaskDetails.publish_date || new Date(),
      parseInt(newTaskDetails.page_count) || 0,
      newTaskDetails.purchase_link || "",
      Math.round(newTaskDetails.price) || 0,
      newTaskDetails.language || "en",
      currentTask.user_id,
    ];
  } else if (newCategory === "restaurants") {
    queryString = `INSERT INTO restaurants (name, restaurant_name, review_count, rating, phone_number, website_url, address, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    values = [
      currentTask.name,
      newTaskDetails.restaurant_name || "Unknown Restaurant",
      newTaskDetails.review_count || 0,
      newTaskDetails.rating || 0,
      newTaskDetails.phone_number || "0",
      newTaskDetails.website_url || "Unknown",
      newTaskDetails.address || "Unknown Address",
      newTaskDetails.category || "Unknown",
      currentTask.user_id,
    ];
  } else if (newCategory === "products") {
    queryString = `INSERT INTO products (name, product_name, number_of_products, lowest_price, highest_price, avg_star_rating, is_prime, product_url , user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    values = [
      currentTask.name,
      newTaskDetails.product_name || "Unknown Product",
      newTaskDetails.number_of_products || 0,
      Math.round(newTaskDetails.lowest_price) || 0,
      Math.round(newTaskDetails.highest_price) || 0,
      newTaskDetails.avg_star_rating || 0,
      newTaskDetails.is_prime || false,
      newTaskDetails.product_url || "Unknown",
      currentTask.user_id,
    ];
  }


  console.log("Query values before inserting:", values);
  try {
    await client.query(queryString, values); // Insert the new task into the new category table
    console.log(`Task moved to ${newCategory}`); // Log the successful move
  } catch (err) {
    console.error(`Error inserting task into ${newCategory}: ${err.message}`); // Log any errors
  } finally {
    client.release(); // Release the database client
  }

  res.redirect("/todos"); // Redirect to the todos page after the operation
});

// Route to update item positions within a category
router.post("/update-positions", async (req, res) => {
  const client = await pool.connect(); // Connect to the database
  const { category, positions } = req.body; // Get category and positions from request body

  try {
    await Promise.all(
      positions.map(async (item) => {
        const queryString = `UPDATE ${category} SET position = $1 WHERE id = $2`; // Update position of each item
        const values = [item.position, item.id];
        await client.query(queryString, values);
      })
    );
    res.status(200).send("Positions updated successfully"); // Send success response
  } catch (err) {
    console.error(`Error updating positions: ${err.message}`); // Log any errors
    res.status(500).send("Internal server error"); // Send error response if server error
  } finally {
    client.release(); // Release the database client
  }
});

module.exports = router; // Export the router
