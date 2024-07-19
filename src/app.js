const { CallAPI } = require("./initFunctions/APIcalls");
const queries = require("./initFunctions/Queries");
const { importCSVsAsTables } = require("./initFunctions/BuildDB");
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


async function onInit() {
    try {
        const date = new Date();
        const year = date.getFullYear();

        await CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups");
        await CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff");

        return importCSVsAsTables(path.join(__dirname, '/files')); //Return the database created for future usage

    } catch (error) {
        console.error('Error initialising server:', error);
        throw error; // Ensure to propagate the error
    }
}


async function executeQueries() {
    try {
        const dbFilePath = path.join(__dirname,'/files/', 'database.db');
        const db = new sqlite3.Database(dbFilePath);
        await onInit();
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
