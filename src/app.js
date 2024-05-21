const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// API endpoint to fetch teachers data
app.get('/api/teachers', (req, res) => {
    const teachers = [];
    fs.createReadStream(path.join(__dirname, 'staff.csv'))
        .pipe(csv())
        .on('data', (row) => {
            // Extract teacher names and push them to the array
            const fullName = row['PreferredFirstnames'] + ' ' + row['PreferredSurname'];
            teachers.push(fullName);
        })
        .on('end', () => {
            res.json(teachers); // Send the array of teacher names as JSON response
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Server Error');
        });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
