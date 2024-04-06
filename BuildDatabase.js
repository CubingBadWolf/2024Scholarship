const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// Function to infer column types based on the first entry in each column
function inferColumnTypes(data) {
    const columnTypes = {};

    // Iterate through each column
    Object.keys(data).forEach(column => {
        const value = data[column];

        // Infer data type based on the value
        if (!isNaN(value) && Number.isInteger(parseFloat(value))) {
            columnTypes[column] = 'INTEGER'; // Integer data
        } else if (typeof value === 'string') {
            columnTypes[column] = 'TEXT'; // Text data
        } else {
            columnTypes[column] = 'TEXT'; // Fallback to text if type cannot be inferred
        }
    });

    return columnTypes;
}

// Function to insert data into the table, ignoring duplicates
async function insertDataIgnoringDuplicates(db, tableName, rowData) {
    const columnNames = Object.keys(rowData).join(', ');
    const placeholders = Object.keys(rowData).map(() => '?').join(', ');
    const values = Object.values(rowData);

    // Check if the data already exists in the table
    const existingData = await new Promise((resolve, reject) => {
    const columnComparison = Object.keys(rowData).map(columnName => `${columnName} = ?`).join(' AND ');
    const values = Object.values(rowData);

    db.get(`SELECT * FROM ${tableName} WHERE ${columnComparison}`, values, (err, row) => {
        if (err) {
            reject(err);
        } else {
            resolve(row);
        }
    });
});


    // If data doesn't exist, insert it into the table
    if (!existingData) {
        await new Promise((resolve, reject) => {
            const stmt = db.prepare(`INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`);
            stmt.run(values, (err) => {
                if (err) reject(err);
                stmt.finalize();
                resolve();
            });
        });
    }
}

// Function to create a SQLite database and import data from CSV files
async function importCSVsAsTables(folderPath) {
    return new Promise(async (resolve, reject) => {
        const dbFilePath = 'database.db';
        const db = new sqlite3.Database(dbFilePath);

        // Read the files in the folder
        const files = await fs.promises.readdir(folderPath);

        // Filter out CSV files
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        let processedFilesCount = 0;

        // Iterate through each CSV file sequentially
        for (const csvFile of csvFiles) {
            const tableName = path.parse(csvFile).name;
            const csvFilePath = path.join(folderPath, csvFile);

            let isFirstLine = true;
            let columnTypes = {};

            // Read data from the CSV file and infer column types
            await new Promise((resolve, reject) => {
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        if (isFirstLine) {
                            columnTypes = inferColumnTypes(row);
                            isFirstLine = false;
                        }
                    })
                    .on('end', () => {
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            });

            // Create a table in the database based on the inferred column types
            const columns = Object.entries(columnTypes).map(([columnName, columnType]) => {
                return `${columnName} ${columnType}`;
            }).join(', ');

            await new Promise((resolve, reject) => {
                db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });

            // Import data into the table, ignoring duplicates
            await new Promise((resolve, reject) => {
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', async (row) => {
                        await insertDataIgnoringDuplicates(db, tableName, row);
                    })
                    .on('end', () => {
                        processedFilesCount++;
                        console.log(`CSV file '${csvFile}' successfully imported as table '${tableName}'.`);

                        // Check if all files have been processed
                        if (processedFilesCount === csvFiles.length) {
                            // Close the database connection
                            db.close();
                            console.log('Database connection closed.');
                        }
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            });
        }
        resolve(); // Resolve the outer promise after all CSV files are processed
    });
}

module.exports = {importCSVsAsTables}