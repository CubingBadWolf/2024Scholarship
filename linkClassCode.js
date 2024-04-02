const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

function ExecuteQuery(database, query){
    return new Promise((resolve, reject) => {
        // Execute the query
        database.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error executing query:', err);
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(rows); // Resolve the promise with the result rows
            }
        });
    });
}

async function returnGroupNoFromTeacher(database, teacherCode){
    const query = `SELECT GroupNo FROM groups WHERE GroupName LIKE '%${teacherCode}%';`; //Finds the groups where teacher code is assinged
    try {
        const rows = await ExecuteQuery(database, query); // Wait for the query to finish
        const output = rows.map(row => row.GroupNo);
        return output;
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return []; // Return an empty array or handle the error appropriately
    }
}


async function returnPeriodCodeFromGroupNo(database, groupNo){
    const query = `SELECT GroupName FROM groups WHERE GroupNo = ${groupNo} AND GroupName LIKE '%.%';`;
    //NOTE does not include house group rooms eg 4/2. Hard code?
    try {
        const rows = await ExecuteQuery(database, query); // Wait for the query to finish
        const output = rows.map(row => row.GroupName);

        const newArray = output.map(entry => {
            const parts = entry.split('.'); // Split the entry by '.'
            const lastPart = parts[parts.length - 1]; // Get the last part of the array
            return [entry, lastPart]; // Return an array containing the original entry and the last part
        });
        return newArray 
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return []; // Return an empty array or handle the error appropriately
    }
     
}

async function GroupFromName(database, name){
    const query = `SELECT StaffCode FROM staff WHERE PreferredFirstnames = '${name[0]}' AND PreferredSurname = '${name[1]}';`
    try {
        const rows = await ExecuteQuery(database, query); // Wait for the query to finish
        const output = rows.map(row => row.StaffCode);
        const code = output[0]; //As only on teacher code per teacher

        const groups =  await returnGroupNoFromTeacher(database, code)
        return groups
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return []; // Return an empty array or handle the error appropriately
    }
}

const name  = ["Tim", "Jones"];
async function processGroups(database, name) {
    try {
        const classes = await GroupFromName(database, name);        
        const periodCodesArray = [];
        
        for (const group of classes) {
            const periodCodes = await returnPeriodCodeFromGroupNo(database, group);
            periodCodesArray.push(periodCodes[0]);
        }
        return periodCodesArray;
    } catch (error) {
        console.error(error);
        return [];
    }
}

processGroups(db, name)
    .then(periodCodesArray => {
        console.log("Period Codes Array:", periodCodesArray);
    })
    .catch(error => {
        console.error("Error:", error);
    });