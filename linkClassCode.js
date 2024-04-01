const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');


function returnGroupNoFromTeacher(database, teacherCode){
    const query = `SELECT GroupNo FROM groups WHERE GroupName LIKE '%${teacherCode}%'`; //Finds the groups where teacher code is assinged
    //NOTE does not include house group rooms eg 4/2. Hard code?

    // Execute the query
    database.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        const output = rows.map(row => row.GroupNo);
        console.log(output);
        return output
    });
}

function returnPeriodCodeFromGroupNo(database, groupNo){
    const query = `SELECT GroupName FROM groups WHERE GroupNo = ${groupNo} AND GroupName LIKE '%.%'`;
    //NOTE does not include house group rooms eg 4/2. Hard code?

    // Execute the query
    database.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        const output = rows.map(row => row.GroupName);

        const newArray = output.map(entry => {
            const parts = entry.split('.'); // Split the entry by '.'
            const lastPart = parts[parts.length - 1]; // Get the last part of the array
            return [entry, lastPart]; // Return an array containing the original entry and the last part
        });      
        console.log(newArray)
        return newArray  
    });
}

returnGroupNoFromTeacher(db, "TEJ")
returnPeriodCodeFromGroupNo(db, 459282)