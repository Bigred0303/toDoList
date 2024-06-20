/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
// THIS PATTERN

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  host: 'localhost',
  database: 'midterm',
  password: 'labber',
  port: 5432
});

// Structure to access database entries, category is required to make going from DB to backend much much easier
// This has changed some of our routes but I felt like it was worth changing the plan slightly and 
// Should not have major side effects other than changing what you type your redirects to
let todos = {
  categories: {

  }

};

const fetchTodos = async () => {
    // Establishes a connection to the database using the pool object
    const client = await pool.connect();
  
    try {
      // Defines an array of category names to fetch data for
      const categories = ['movies', 'books', 'foods', 'products'];
  
      // Maps over the categories array, creating an array of promises for fetching data from each category table
      const categoryPromises = categories.map(async (category) => {
        // Executes a query to select the id and name from the current category table
        const res = await client.query(`SELECT id, name FROM ${category}`);
        // Returns an object with the category name as the key and the query result rows as the value
        return {
          [category]: res.rows
        };
      });
  
      // Waits for all category promises to resolve, resulting in an array of category data objects
      const categoryData = await Promise.all(categoryPromises);
  
      // Reduces the array of category data objects into a single object, merging each category's data
      todos.categories = categoryData.reduce((acc, category) => {
        return { ...acc, ...category };
      }, {});
    } catch (err) {
      // Logs an error message if there is an issue fetching the data
      console.error(`Error fetching todos: ${err.message}`);
    } finally {
      // Releases the database client back to the pool
      client.release();
    }
  };
  
  // Calls the fetchTodos function to execute the data fetching process
  fetchTodos();
  
// Main page, list of all items in 4 boxes
router.get('/', async (req, res) => {
  await fetchTodos();
  console.log('GET /todos');
  res.render('todos', { todos });
});

// Form on main page that allows users to enter items in toDoList
router.post('/', async (req, res) => {
  // This is where you're going to need to get the info from the API, I have added name to every entry in the database so we can track the name.
  // It can be set by whatever the api returns and then they should be able to change it with edit
  const obj = { name: "TEST", release_date: "29 OCT 2019", rating: 7, genre: "testy", imdb_score: 8, user_id: 3 };
  const category = "movies";

  // Sorry for doing some of your part, I needed to so I could make sure that my section was working properly.
  // I have left all of the API backend unfinished, if you no longer want this task and would like one of mine I will swap no problem
  // All of this works so you jsut need to feed in the info from the API
  if (todos.categories[category]) {
    const client = await pool.connect();
    try {
      await client.query(`INSERT INTO ${category} (name, release_date, rating, genre, imdb_score, user_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        Object.values(obj));
      await fetchTodos(); // Update the todos object after adding a new todo
    } finally {
      client.release();
    }
  } else {
    console.log(`Category ${category} not found`);
  }
  res.redirect('/todos');
});

// Show metadata of item on another page
router.get('/:category/:id', async (req, res) => {

});

// Category allows us to have the same id numbers in different tables
// Brings up the edit page for an item
router.get('/:category/:id/edit', async (req, res) => {

});

// Category allows us to have the same id numbers in different tables
// Edit the data of an item as the user wishes
router.post('/:category/:id', async (req, res) => {

});

// Category allows us to have the same id numbers in different tables
// Remove item from list
router.post('/:category/:id/delete', async (req, res) => {

});

// Removes an item from one list, API call for metadata for new list, error message if API cannot find, Adds it to the list selected by the user
router.post('/:id/:category', async (req, res) => {

});



module.exports = router;
