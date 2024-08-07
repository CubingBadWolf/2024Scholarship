const { CallAPI } = require("./initFunctions/APIcalls");
const queries = require("./initFunctions/Queries");
const { importCSVsAsTables } = require("./initFunctions/BuildDB");
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


const express = require('express');
const router = express.Router();

// Main page route
router.get('/', (req, res) => {
  res.send(`Main Page: ${req.user.role}!`);
});

// User profile route
router.get('/profile', (req, res) => {
  res.send(`User profile for ${req.user.oauth_id}`);
});

// Add more routes as needed for your main site functionality

module.exports = router;
async function onInit() {
    try {
        const date = new Date();
        const year = date.getFullYear();

        await CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups");
        await CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff");

        await importCSVsAsTables(path.join(__dirname, '/files')); 

    } catch (error) {
        console.error('Error initialising server:', error);
        throw error; // Ensure to propagate the error
    }
}


async function executeQueries() {
    try {
        await onInit();
        const dbFilePath = path.join(__dirname,'/files/', 'database.db');
        const db = new sqlite3.Database(dbFilePath);

        const name = ['Tim', 'Jones'];
        const [PrimaryClasses, SecondaryClasses] = await queries.outputClasses(db, name);
        console.log("Primary Classes:", PrimaryClasses);
        console.log("Secondary Classes:", SecondaryClasses);
    } catch (error) {
        console.error("Error querying database:", error);
    }
}

executeQueries();

// Initialize and then execute queries
