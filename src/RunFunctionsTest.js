const sqlite3 = require('sqlite3').verbose();

const APIfunctions = require('./JS_APIscript');
const DB = require('./BuildDatabase');
const QueryFunctions = require('./linkClassCode');
const WeekTimetable = require('./timetables');

async function main() {
    const date = new(Date);
    const year = date.getFullYear();

    const folderPath = __dirname;
    const dbFile = "database.db";
        
    await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups"),
    await APIfunctions.CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff")

    await DB.importCSVsAsTables(folderPath, dbFile);

    const name = ["Tim", "Jones"];
    const db = new sqlite3.Database(dbFile);

    const [PrimaryClasses, SecondaryClasses] = await QueryFunctions.outputClasses(db, name);
    console.log("Primary Classes:", PrimaryClasses);
    console.log("Secondary Classes:", SecondaryClasses);
    console.log('\n');

    let PrimaryPeriods = [];
    PrimaryClasses.forEach(Class => {
        PrimaryPeriods.push(Class[2]);
    });
    
    const TeacherTimeTable = new WeekTimetable(0, PrimaryPeriods);
    TeacherTimeTable.PrintTimetable();
}

main().catch(err => console.error(err));
