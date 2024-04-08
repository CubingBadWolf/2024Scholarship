class Period {
    constructor(code, PeriodCode) {
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
        this.PeriodIdentifier = PeriodCode;

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
    constructor(day, SeniorSlots) {
        this.Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        this.Day = day;
        this.periodsInDay = [5, 5, 5, 6, 5];
        this.dayTimetable = [];
        this.PeriodArray = [['D', 'B', 'C', 'A', 'E'],['C', 'X', 'B', 'D', 'F'],
                            ['E', 'F', 'D', 'C', 'A'],['B', 'A', 'F', 'Y', 'E', 'C'],['A', 'E', 'D', 'F', 'B']]; 
        //Assuming constant across years, if updated needs manually changing
        
        for (let i = 0; i < this.periodsInDay[day]; i++) {
            let base = 'P';
            let pCode = this.PeriodArray[day][i];
            if(SeniorSlots.indexOf(this.PeriodArray[day][i]) === -1){
                base = 'X'; //Select not teaching. 
                pCode = null;
            }
            this.dayTimetable.push(new Period(base, pCode));
        }
    }

    PrintTimetable() {
        console.log(this.Days[this.Day]);
        for (let item = 0; item < this.periodsInDay[this.Day]; item++) {
            console.log(`Period ${item}: Status: ${this.dayTimetable[item].Status_Short}, PeriodCode: ${this.dayTimetable[item].PeriodIdentifier}`);
        }
    }

    getDay() {
        return this.dayTimetable;
    }

    getPeriod(periodNum) {
        return this.dayTimetable[periodNum];
    }

    getPeriodCode(periodNum){
        return this.dayTimetable[periodNum].PeriodIdentifier;
    }
}

class WeekTimetable {
    constructor(weekNumber, SeniorSlots) {
        this.Days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        this.WeekNumber = weekNumber;
        this.weekTimetable = [];
        for (let i = 0; i < 5; i++) {
            this.weekTimetable.push(new DayTimetable(i, SeniorSlots));
        }
    }

    PrintTimetable(){
        console.log(` Week ${this.WeekNumber}:`);
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

const basePeriodCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y']
// Testing the code
const Monday = new DayTimetable(0, basePeriodCodes);
Monday.PrintTimetable();

const WeekOne = new WeekTimetable(1, basePeriodCodes);
WeekOne.PrintTimetable();

WeekOne.weekTimetable[4].dayTimetable[0].changeCode('U');
WeekOne.PrintTimetable();
