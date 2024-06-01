const express = require('express');
const path = require('path');
const csv = require('csv-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3 module
const APIfunctions = require('./JS_APIscript'); // Import APIfunctions module
const DB = require('./BuildDatabase'); // Import DB module
const QueryFunctions = require('./linkClassCode'); // Import QueryFunctions module
const WeekTimetable = require('./timetables'); // Import WeekTimetable module
const app = express();
const port = 3000;
const db = new sqlite3.Database(path.join(__dirname, '../src/public/database.db'))

async function onInit() {
    try {
        const date = new Date();
        const year = date.getFullYear();
    
        const folderPath = path.join(__dirname, "public")
        const dbFile = path.join("public", "database.db");
    
        await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups");
        await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff");
    
        await DB.importCSVsAsTables(folderPath, dbFile);
        
        console.log("Initialization completed successfully");
    } catch (error) {
        console.error('Error initializing server:', error);
        throw error; // Re-throw the error to indicate initialization failure
    }
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


// API endpoint to fetch teachers data
app.get('/api/teachers', (req, res) => {
    const teachers = [];
    fs.createReadStream(path.join(__dirname, 'public','staff.csv'))
        .pipe(csv())
        .on('data', (row) => {
            // Extract teacher names and push them to the array
            const fullName = row['PreferredFirstnames'] + ' ' + row['PreferredSurname'];
            if(QueryFunctions.hasGroups(db, fullName.split(" "))){
                teachers.push(fullName);
            }
        })
        .on('end', () => {
            res.json(teachers); // Send the array of teacher names as JSON response
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
            res.status(500).send('Server Error');
        });
});

// Function to generate timetable for a teacher
app.get('/api/timetable', async (req, res) => {
    try {
        const teacherName = req.query.name;
        const timetable = await generateTimetableForTeacher(teacherName);
        res.json(timetable);
    } catch (err) {
        console.error('Error generating timetable:', err);
        res.status(500).send('Server Error');
    }
});

// Function to generate timetable for a teacher
async function generateTimetableForTeacher(name) {

    const [PrimaryClasses, SecondaryClasses] = await QueryFunctions.outputClasses(db, name.split(" "));

    let PrimaryPeriods = [];
    PrimaryClasses.forEach(Class => {
        PrimaryPeriods.push(Class[2]);
    });

    const TeacherTimeTable = new WeekTimetable(0, PrimaryPeriods);
    const output = TeacherTimeTable.returnWeek(); // Return the whole week's timetable
    for(let n = 0; n < 5; n++){
        for(let i = 0; i < output[n].length; i++){
            for(let j = 0; j < PrimaryPeriods.length; j++){
                if(output[n][i][1] == PrimaryPeriods[j]){
                    output[n][i][1] = PrimaryClasses[j][1];
                    break;
                }
            }
        };
    }
    console.log('Timetable for ' + name)
    return output;
}
// Start the server after onInit() completes
(async () => {
    try {
        await onInit();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
})();