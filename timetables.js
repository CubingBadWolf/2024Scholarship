class Period {
    constructor(code) {
        this.Status_Short = code;
        switch (code) {
            case 'P':
                this.Status = "Present";
                break;
            case 'U':
                this.Status = "Absent Unassigned";
                break;
            case 'F':
                this.Status = "Absent Assigned";
                break;
            case 'W':
                this.Status = "Work attatched";
                break;
            case 'X':
                this.Status = "Not Teaching";
                break;
            default:
                this.Status = "Undefined";
                break;
        }
    }
    changeCode(newCode) {
        switch (newCode) {
            case 'P':
                this.Status = "Present";
                break;
            case 'U':
                this.Status = "Absent Unassigned";
                break;
            case 'F':
                this.Status = "Absent Assigned";
                break;
            case 'W':
                this.Status = "Work attatched";
                break;
            case 'X':
                this.Status = "Not Teaching";
                break;
            default:
                this.Status = "Undefined";
                break;
        }
        this.Status_Short = newCode;
    }
}

class DayTimetable {
    constructor(day) {
        this.Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        this.Day = day;
        this.periodsInDay = [5, 5, 5, 6, 5];
        this.dayTimetable = [];
        for (let i = 0; i < this.periodsInDay[day]; i++) {
            this.dayTimetable.push(new Period('P'));
        }
    }

    PrintTimetable() {
        console.log(this.Days[this.Day]);
        for (let item = 0; item < this.periodsInDay[this.Day]; item++) {
            console.log(`Period ${item}: ${this.dayTimetable[item].Status_Short}`);
        }
    }

    getDay() {
        return this.dayTimetable;
    }

    getPeriod(periodNum) {
        return this.dayTimetable[periodNum];
    }
}

class WeekTimetable {
    constructor(weekNumber) {
        this.Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        this.WeekNumber = weekNumber;
        this.weekTimetable = [];
        for (let i = 0; i < 5; i++) {
            this.weekTimetable.push(new DayTimetable(i));
        }
    }

    PrintTimetable() {
        console.log(`Week ${this.WeekNumber}:`);
        for (let i = 0; i < 5; i++) {
            this.weekTimetable[i].PrintTimetable();
            console.log();
        }
    }

    getWeek() {
        return this.weekTimetable;
    }

    getDay(day) {
        return this.weekTimetable[day];
    }
}

// Testing the code
const Monday = new DayTimetable(0);
Monday.PrintTimetable();

const WeekOne = new WeekTimetable(1);
WeekOne.PrintTimetable();

WeekOne.weekTimetable[4].dayTimetable[0].changeCode('U');
WeekOne.PrintTimetable();
