const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');


function returnGroupFromTeacher(database, teacherCode){
    const query = `SELECT GroupNo FROM groups WHERE GroupName LIKE '%${teacherCode}%'`; //Finds the groups where teacher code is assinged
    //NOTE does not include house group rooms eg 4/2. Hard code?

    // Execute the query
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }
        const output = rows.map(row => row.GroupNo);
        console.log(output);
        return output
    });
}

returnGroupFromTeacher(db, "TEJ")