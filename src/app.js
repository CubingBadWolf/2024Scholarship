const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const APIfunctions = require('./JS_APIscript');
const DB = require('./BuildDatabase');
const QueryFunctions = require('./linkClassCode');
const WeekTimetable = require('./timetables');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/timetable', async (req, res) => {
    try {
        const date = new Date();
        const year = date.getFullYear();

        const folderPath = path.join(__dirname, '..'); // Adjusted path
        const dbFile = path.join(folderPath, "database.db");

        await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups");
        await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff");

        await DB.importCSVsAsTables(folderPath, dbFile);

        const name = req.query.name.split(',');
        const db = new sqlite3.Database(dbFile);

        const [PrimaryClasses, SecondaryClasses] = await QueryFunctions.outputClasses(db, name);

        let PrimaryPeriods = [];
        PrimaryClasses.forEach(Class => {
            PrimaryPeriods.push(Class[2]);
        });

        const TeacherTimeTable = new WeekTimetable(0, PrimaryPeriods);
        const timetable = TeacherTimeTable.GetTimetable(); // Modify to get the timetable in a JSON format

        res.json(timetable);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
