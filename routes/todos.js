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
  // Connect to the database using the pool
  const client = await pool.connect();
  try {
    // Define the categories to fetch data from
    const categories = ["movies", "books", "restaurants", "products"];
    
    // Create an array of promises to fetch data from each category
    const categoryPromises = categories.map(async (category) => {
      // Query the database for each category and return the results
      const res = await client.query(`SELECT id, name FROM ${category}`);
      return {
        [category]: res.rows, // Store the results in an object with the category name as the key
      };
    });
    
    // Wait for all the category data to be fetched
    const categoryData = await Promise.all(categoryPromises);
    
    // Combine the results into a single object
    todos.categories = categoryData.reduce((acc, category) => {
      return { ...acc, ...category }; // Merge each category's data into the accumulator object
    }, {});
  } catch (err) {
    // Log any errors that occur during the fetch
    console.error(`Error fetching todos: ${err.message}`);
  } finally {
    // Release the database client back to the pool
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
  const taskName = req.body.title; // Get the task name from the request body

  console.log(`New task added: ${taskName}`); // Log the new task name

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
    console.error(`Error fetching data from APIs: ${err.message}`);
    return res.status(500).send("Error fetching data from APIs"); // Return an error response if data fetching fails
  }

  // Logging fetched data for debugging purposes
  console.log("OMDb Movies:", omdbMovies);
  console.log("Google Books:", googleBooks);
  console.log("Yelp Foods:", yelpFoods);
  console.log("Amazon Products:", amazonProducts);

  // Insert fetched OMDb movie data into the database
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
      console.log(`category: ${category}`); // Log the category
    } catch (err) {
      console.error(`Error adding movie to database: ${err.message}`);
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Movies category not found`);
  }

  // Insert fetched Google book data into the database
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
      client.release(); // Release the database client
    }
  } else {
    console.log(`Books category not found`);
  }

  // Insert fetched Yelp food data into the database
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
      client.release(); // Release the database client
    }
  } else {
    console.log(`Restaurants category not found`);
  }

  // Insert fetched Amazon product data into the database
  if (amazonProducts.length > 0) {
    const client = await pool.connect();
    const category = "products";
    try {
      const queryString = `INSERT INTO ${category} (name, product_name, number_of_products, lowest_price, highest_price, avg_star_rating, is_prime) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
      const values = [
        taskName,
        amazonProducts[0].name,
        amazonProducts[0].number_of_products,
        Math.round(amazonProducts[0].lowest_price),
        Math.round(amazonProducts[0].highest_price),
        amazonProducts[0].avg_star_rating,
        amazonProducts[0].is_prime,
      ];

      await client.query(queryString, values);
    } catch (err) {
      console.error(`Error adding product to database: ${err.message}`);
    } finally {
      client.release(); // Release the database client
    }
  } else {
    console.log(`Products category not found`);
  }

  // Redirect to the todos page after processing the request
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

// Update task
router.post("/:category/:id/edit", async (req, res) => {
    const client = await pool.connect();
    const category = req.params.category;
    const id = req.params.id;
    const newTask = req.body.editTask;
  
    console.log(`Task Name updated: ${newTask}`);
  
    // Update table
    if (category === "movies") {
      try {
        const queryString = `UPDATE movies
                              SET name = $1
                              WHERE id = $2`;
        const values = [newTask, id];
  
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
                              SET name = $1
                              WHERE id = $2`;
        const values = [newTask, id];
  
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
                              SET name = $1
                              WHERE id = $2`;
        const values = [newTask, id];
  
        await client.query(queryString, values);
        console.log(`category: ${category}`);
      } catch (err) {
        console.error(`Error updating restaurant in the database: ${err.message}`);
      } finally {
        client.release();
      }
    } else if (category === "products") {
      try {
        const queryString = `UPDATE products
                              SET name = $1
                              WHERE id = $2`;
        const values = [newTask, id];
  
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
// Remove item from list
router.post("/:category/:id/delete", async (req, res) => {
  // Connect to the database using the pool
  const client = await pool.connect();
  
  // Define the allowed categories for deletion
  const allowedCategories = ['movies', 'books', 'restaurants', 'products'];
  const category = req.params.category; // Get the category from the request parameters
  const id = req.params.id; // Get the item ID from the request parameters

  // Check if the provided category is valid
  if (!allowedCategories.includes(category)) {
    return res.status(400).send(`Invalid category: ${category}`); // Return a 400 status code if the category is invalid
  }
  
  // Construct the SQL query string for deleting the item
  const queryString = `DELETE FROM ${category} WHERE id = $1`;
  try {
    // Execute the SQL query to delete the item
    await client.query(queryString, [id]);
    console.log(`category: ${category}`); // Log the category for debugging
  } catch (err) {
    // Log any errors that occur during the deletion
    console.error(`Error deleting item from ${category}: ${err.message}`);
  } finally {
    // Release the database client back to the pool
    client.release();
  }
  
  // Redirect to the todos page after deletion
  res.redirect("/todos");
});


router.get('/:category/:id', async (req, res) => {
  // Extract the category and id from the request parameters
  const { category, id } = req.params;
  // Connect to the database using the pool
  const client = await pool.connect();

  try {
    // Construct the SQL query to select the task by category and id
    const query = `SELECT * FROM ${category} WHERE id = $1`;
    // Execute the query with the provided id
    const result = await client.query(query, [id]);

    // Check if the task was found
    if (result.rows.length === 0) {
      // If no task is found, return a 404 status with a message
      return res.status(404).send('Task not found');
    }

    // Get the task from the query result
    const task = result.rows[0];
    // Render the task-details view, passing the task and category as data
    res.render('task-details', { task, category });
  } catch (err) {
    // Log any errors that occur during the fetch
    console.error(`Error fetching task: ${err.message}`);
    // Return a 500 status with a server error message
    res.status(500).send('Server error');
  } finally {
    // Release the database client back to the pool
    client.release();
  }
});



// Removes an item from one list, API call for metadata for new list, error message if API cannot find, Adds it to the list selected by the user
router.post('/:id/change-category', async (req, res) => {
  // Connect to the database using the pool
  const client = await pool.connect();
  const { id } = req.params; // Extract the task ID from the request parameters
  const { newCategory, oldCategory } = req.body; // Extract the new and old categories from the request body
  const allowedCategories = ['movies', 'books', 'restaurants', 'products']; // Define the allowed categories

  // Check if the new category is valid
  if (!allowedCategories.includes(newCategory)) {
    return res.status(400).send(`Invalid new category: ${newCategory}`); // Return a 400 status code if the category is invalid
  }

  let currentTask = null; // Initialize a variable to hold the current task

  try {
    // Fetch the current task from the old category table
    const result = await client.query(`SELECT * FROM ${oldCategory} WHERE id = $1`, [id]);
    if (result.rows.length > 0) {
      currentTask = result.rows[0]; // Assign the fetched task to currentTask
    } else {
      return res.status(404).send('Task not found'); // Return a 404 status code if the task is not found
    }
  } catch (err) {
    console.error(`Error fetching task: ${err.message}`); // Log any errors
    return res.status(500).send('Internal server error'); // Return a 500 status code for server errors
  }

  try {
    // Delete the task from the old category table
    await client.query(`DELETE FROM ${oldCategory} WHERE id = $1`, [id]);
  } catch (err) {
    console.error(`Error deleting task from ${oldCategory}: ${err.message}`); // Log any errors
  }

  let newTaskDetails = {}; // Initialize a variable to hold the new task details

  try {
    // Fetch new task details based on the new category
    if (newCategory === 'movies') {
      const movies = await fetchOMDbMovies(currentTask.name);
      newTaskDetails = movies.length > 0 ? movies[0] : {};
    } else if (newCategory === 'books') {
      const books = await fetchGoogleBooks(currentTask.name);
      newTaskDetails = books.length > 0 ? books[0] : {};
    } else if (newCategory === 'restaurants') {
      const foods = await fetchYelpFoods(currentTask.name);
      newTaskDetails = foods.length > 0 ? foods[0] : {};
    } else if (newCategory === 'products') {
      const products = await fetchAmazonProducts(currentTask.name);
      newTaskDetails = products.length > 0 ? products[0] : {};
    }
  } catch (err) {
    console.error(`Error fetching data from APIs: ${err.message}`); // Log any errors
  }

  // Define the query string and values for inserting the new task into the new category table
  let queryString;
  let values;

  // Set the query string and values based on the new category
  if (newCategory === 'movies') {
    queryString = `INSERT INTO movies (name, movie_title, release_date, rating, genre, imdb_score, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
    values = [
      // OPTION TO HAVE TASK NAME CHANGE WE SHOULD DISCUSS MERITS OF THIS OPTION newTaskDetails.movie_title || currentTask.name,
      currentTask.name,
      newTaskDetails.movie_title || 'Unknown Title',
      newTaskDetails.release_date || new Date(),
      newTaskDetails.rating || 'N/A',
      newTaskDetails.genre || 'Unknown',
      parseFloat(newTaskDetails.imdb_score) || 0,
      currentTask.user_id,
    ];
  } else if (newCategory === 'books') {
    queryString = `INSERT INTO books (name, title, author, publish_date, page_count, purchase_link, price, language, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    values = [
      // OPTION TO HAVE TASK NAME CHANGE WE SHOULD DISCUSS MERITS OF THIS OPTION newTaskDetails.title || currentTask.name,
      currentTask.name,
      newTaskDetails.title || 'Unknown Title',
      newTaskDetails.author || 'Unknown Author',
      newTaskDetails.publish_date || new Date(),
      parseInt(newTaskDetails.page_count) || 0,
      newTaskDetails.purchase_link || '',
      Math.round(newTaskDetails.price) || 0,
      newTaskDetails.language || 'en',
      currentTask.user_id,
    ];
  } else if (newCategory === 'restaurants') {
    queryString = `INSERT INTO restaurants (name, restaurant_name, review_count, rating, phone_number, website_url, address, category, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    values = [
      // OPTION TO HAVE TASK NAME CHANGE WE SHOULD DISCUSS MERITS OF THIS OPTION newTaskDetails.restaurant_name || currentTask.name,
      currentTask.name,
      newTaskDetails.restaurant_name || 'Unknown Restaurant',
      newTaskDetails.review_count || 0,
      newTaskDetails.rating || 0,
      newTaskDetails.phone_number || '0',
      newTaskDetails.website_url || 'Unknown',
      newTaskDetails.address || 'Unknown Address',
      newTaskDetails.category || 'Unknown',
      currentTask.user_id,
    ];
  } else if (newCategory === 'products') {
    queryString = `INSERT INTO products (name, product_name, number_of_products, lowest_price, highest_price, avg_star_rating, is_prime, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    values = [
      // OPTION TO HAVE TASK NAME CHANGE WE SHOULD DISCUSS MERITS OF THIS OPTION newTaskDetails.product_name || currentTask.name,
      currentTask.name,
      newTaskDetails.product_name || 'Unknown Product',
      newTaskDetails.number_of_products || 0,
      Math.round(newTaskDetails.lowest_price) || 0,
      Math.round(newTaskDetails.highest_price) || 0,
      newTaskDetails.avg_star_rating || 0,
      newTaskDetails.is_prime || false,
      currentTask.user_id,
    ];
  }

  try {
    // Insert the new task details into the new category table
    await client.query(queryString, values);
    console.log(`Task moved to ${newCategory}`); // Log the successful move
  } catch (err) {
    console.error(`Error inserting task into ${newCategory}: ${err.message}`); // Log any errors
  } finally {
    // Release the database client back to the pool
    client.release();
  }

  // Redirect to the todos page after the operation
  res.redirect('/todos');
});

module.exports = router;
