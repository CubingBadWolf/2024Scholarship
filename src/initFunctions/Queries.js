const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { StudentNums } = require('./APIcalls.js');

// Execute a query and return a promise
function executeQuery(database, query, params = []) {
    return new Promise((resolve, reject) => {
        database.all(query, params, (err, rows) => {
            if (err) {
                console.error('Error executing query:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Get group numbers from teacher code
async function returnGroupNoFromTeacher(database, teacherCode) {
    const query = `SELECT GroupNo FROM groups WHERE GroupName LIKE ?;`;
    try {
        const rows = await executeQuery(database, query, [`%.${teacherCode}%`]);
        return rows.map(row => row.GroupNo);
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

// Get period codes from group number
async function returnPeriodCodeFromGroupNo(database, groupNo) {
    const query = `SELECT GroupName FROM groups WHERE GroupNo = ? AND GroupName LIKE ?;`;
    try {
        const rows = await executeQuery(database, query, [groupNo, '%.%']);
        return rows.map(row => {
            const parts = row.GroupName.split('.');
            return [groupNo, row.GroupName, parts[parts.length - 1]];
        });
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

// Get staff code from name
async function getCode(database, name) {
    const query = `SELECT StaffCode FROM staff WHERE PreferredFirstnames = ? AND PreferredSurname = ?;`;
    try {
        const rows = await executeQuery(database, query, name);
        return rows[0]?.StaffCode || '';
    } catch (err) {
        console.error('Error:', err);
        return '';
    }
}

// Get group numbers from staff name
async function groupFromName(database, name) {
    const query = `SELECT StaffCode FROM staff WHERE PreferredFirstnames = ? AND PreferredSurname = ?;`;
    try {
        const rows = await executeQuery(database, query, name);
        const staffCode = rows[0]?.StaffCode;
        if (staffCode) {
            return await returnGroupNoFromTeacher(database, staffCode);
        }
        return [];
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}

// Process groups to include student numbers
async function processGroups(database, name) {
    try {
        const classes = await groupFromName(database, name);
        const periodCodesArray = [];

        for (const group of classes) {
            const periodCodes = await returnPeriodCodeFromGroupNo(database, group);
            periodCodesArray.push(...periodCodes);
        }

        const results = await Promise.all(periodCodesArray.map(async (Class) => {
            const amountOfStudents = await StudentNums(Class[0]);
            if (amountOfStudents > 0) {
                return [...Class, amountOfStudents];
            }
            return null;
        }));

        return results.filter(Boolean);
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Output classes, categorizing as primary or secondary
async function outputClasses(database, name) {
    try {
        const populatedClasses = await processGroups(database, name);
        const primaryClasses = [];
        const secondaryClasses = [];

        for (const Class of populatedClasses) {
            const teacherCode = await getCode(database, name);
            const isPrimary = Class[2] === teacherCode;

            if (isPrimary) {
                primaryClasses.push(Class);
            } else {
                const periodCode = Class[2];
                const existingClass = primaryClasses.find(c => c[2] === periodCode);

                if (existingClass) {
                    if (Class[3] > existingClass[3]) {
                        secondaryClasses.push(existingClass);
                        Object.assign(existingClass, Class); // Replace with new class
                    } else {
                        secondaryClasses.push(Class);
                    }
                } else {
                    primaryClasses.push(Class);
                }
            }
        }

        return [primaryClasses, secondaryClasses];
    } catch (error) {
        console.error('Error:', error);
        return [null, null];
    }
}

// Check if there are any groups for the given name
async function hasGroups(database, name) {
    try {
        const populatedClasses = await processGroups(database, name);
        return populatedClasses.length > 0;
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports = {
    outputClasses,
    returnGroupNoFromTeacher,
    returnPeriodCodeFromGroupNo,
    groupFromName,
    getCode,
    hasGroups
};
