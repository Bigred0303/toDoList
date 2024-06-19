/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into /users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
// THIS PATTERN

const express = require('express');
const router = express.Router();

let todos = [];

// Main page, list of all items in 4 boxes
router.get('/todos', (req, res) => {
    res.send(todos);
});

// Form on main page that allows users to enter items in toDoList
router.post('/todos', (req, res) => {

});

// Show metadata of item on another page
router.get('/todos/:id', (req, res) => {

});

// Brings up the edit page for an item
router.get('/todos/:id/edit', (req, res) => {

});

// Edit the data of an item as the user wishes
router.post('/todos/:id', (req, res) => {

});

// Remove item from list
router.post('/todos/:id/delete', (req, res) => {

});

// Removes an item from one list, API call for metadata for new list, error message if API cannot find, Adds it to the list selected by the user
router.post('/todos/:id/:category', (req, res) => {

});



module.exports = router;
