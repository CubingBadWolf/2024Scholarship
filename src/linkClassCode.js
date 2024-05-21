const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
const { StudentNums } = require('./JS_APIscript');

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
    const query = `SELECT GroupNo FROM groups WHERE GroupName LIKE '%.${teacherCode}%';`; //Finds the groups where teacher code is assinged
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
            return [groupNo, entry, lastPart]; // Return an array containing the original entry and the last part
        });
        return newArray 
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return []; // Return an empty array or handle the error appropriately
    }
     
}

async function GetCode(database, name){
    const query = `SELECT StaffCode FROM staff WHERE PreferredFirstnames = '${name[0]}' AND PreferredSurname = '${name[1]}';`
    try{
        const rows = await ExecuteQuery(database, query); // Wait for the query to finish
        const output = rows.map(row => row.StaffCode);
        return output[0]; //As only one teacher code per teacher
    }
    catch (err) {
        console.error('Error :', err);
        return '';
    }
}

async function GroupFromName(database, name){
    const query = `SELECT StaffCode FROM staff WHERE PreferredFirstnames = '${name[0]}' AND PreferredSurname = '${name[1]}';`
    try {
        const rows = await ExecuteQuery(database, query); // Wait for the query to finish
        const output = rows.map(row => row.StaffCode);
        const code = output[0]; //As only one teacher code per teacher

        const groups =  await returnGroupNoFromTeacher(database, code)
        return groups
    } catch (err) {
        // Handle error
        console.error('Error:', err);
        return []; // Return an empty array or handle the error appropriately
    }
}

async function processGroups(database, name) {
    try {
        const classes = await GroupFromName(database, name);        
        const periodCodesArray = [];
        
        for (const group of classes) {
            const periodCodes = await returnPeriodCodeFromGroupNo(database, group);
            periodCodesArray.push(periodCodes[0]);
        }
        let newArray = [];
        for (const Class of periodCodesArray){
            amountOfStudents = await StudentNums(Class[0])
            if(amountOfStudents > 0){
                Class.push(amountOfStudents)
                newArray.push(Class);
            }
        }
        return newArray; 
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function outputClasses(database, name) {
    try {
        const populatedClasses = await processGroups(database, name);
        const PrimaryClasses = [];
        const SecondaryClasses = [];

        for (const Class of populatedClasses) {
            const teacherCode = await GetCode(database, name);
            if (Class[2] === teacherCode) {
                PrimaryClasses.push(Class);
                //TODO fix for Juniors later, 
            } else {
                const periodCode = Class[2]; // Assuming this gets the period code
                let isDuplicate = false;

                for (const existingClass of PrimaryClasses) {
                    if (existingClass[2] === periodCode) {
                        isDuplicate = true;
                        if (Class[3] > existingClass[3]) { // Compare the number of students to determine which class to keep
                            SecondaryClasses.push(existingClass);
                            PrimaryClasses[PrimaryClasses.indexOf(existingClass)] = Class; // Replace the existing class with the one having more students
                        } else {
                            SecondaryClasses.push(Class);
                        }
                        break; // Once a duplicate is found, no need to continue searching
                    }
                }
                if (!isDuplicate) {
                    PrimaryClasses.push(Class);
                }
            }
        }
        return [PrimaryClasses, SecondaryClasses];

    }catch (error) {
        console.error("Error:", error);
        // Handle error as needed
        return [null, null]; // Return null values or handle errors appropriately
    }
}

async function hasGroups(database, name) {
    try {
        const populatedClasses = await processGroups(database, name);
        return populatedClasses.length > 0;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/*const name  = ["Lydia", "Evans"];
outputClasses(db, name)
    .then(([PrimaryClasses, SecondaryClasses]) => {
        console.log("Primary Classes:", PrimaryClasses);
        console.log("Secondary Classes:", SecondaryClasses);
    })
    .catch(error => {
        console.error("Error:", error);
    });*/

module.exports = {outputClasses, returnGroupNoFromTeacher, returnPeriodCodeFromGroupNo,
        GroupFromName, GetCode, hasGroups}