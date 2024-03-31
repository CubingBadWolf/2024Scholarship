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

// Function to create a SQLite database and import data from CSV files
function importCSVsAsTables(folderPath) {
    const dbFilePath = 'database.db';
    const db = new sqlite3.Database(dbFilePath);

    // Read the files in the folder
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        // Filter out CSV files
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        let processedFilesCount = 0;

        // Iterate through each CSV file
        csvFiles.forEach((csvFile, index) => {
            const tableName = path.parse(csvFile).name;
            const csvFilePath = path.join(folderPath, csvFile);
            
            let isFirstLine = true;
            let columnTypes = {};

            // Read data from the CSV file and infer column types
            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    if (isFirstLine) {
                        columnTypes = inferColumnTypes(row);
                        isFirstLine = false;
                    }
                })
                .on('end', () => {
                    // Create a table in the database based on the inferred column types
                    const columns = Object.entries(columnTypes).map(([columnName, columnType]) => {
                        if (index === 0 && columnType === 'INTEGER') {
                            return `${columnName} INTEGER PRIMARY KEY`;
                        } else {
                            return `${columnName} ${columnType}`;
                        }
                    }).join(', ');
                    
                    db.serialize(() => {
                        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`);
                    });
                    

                    // Import data into the table
                    fs.createReadStream(csvFilePath)
                        .pipe(csv())
                        .on('data', (row) => {
                            db.serialize(() => {
                                const columnNames = Object.keys(row).join(', ');
                                const placeholders = Object.keys(row).map(() => '?').join(', ');
                                const values = Object.values(row);
                                const stmt = db.prepare(`INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`);
                                stmt.run(values);
                                stmt.finalize();
                            });
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
                        });
                });
        });
    });
}

// Get the folder path where the script is located
const folderPath = __dirname;

// Import CSV files as tables into the SQLite database
importCSVsAsTables(folderPath);
