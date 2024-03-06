#include <iostream>
#include <string>
#include <vector>
#include <map>


class Period{
public:
    std::string Status;
    char Status_Short; 
    Period(char code){
        Status_Short = code;
        switch(code){
            case 'P': Status = "Present";
            case 'U': Status = "Absent Unassigned";
            case 'F': Status = "Absent Assigned";
            case 'W': Status = "Work attatched";
            case 'X': Status = "Not Teaching";
            default: Status = "Undefined";
                //throw "Error";
        }
    }
};

class DayTimetable{
    private:
    int periodsInDay[5] = {5,5,5,6,5};

    protected:
        std::string Days[5] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        int Day;
        int teacherID;
    public:
        std::vector<Period> dayTimetable;

        DayTimetable(int day){
            Day = day;
            for(int i = 0; i < periodsInDay[day]; i++){
                dayTimetable.push_back(Period('P'));
            }
        }

        void PrintTimetable(){
            std::cout << Days[Day] << std::endl;
            for(int item=0; item < periodsInDay[Day]; item++){
                std::cout << "Period " << item << ": " << dayTimetable[item].Status_Short << std::endl;
            }
           
        }
};

class WeekTimetable{
    private:
    std::string Days[5] = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
    public:
    int WeekNumber;
    std::vector<DayTimetable> weekTimetable; //A week timetable is just a collection of 5 day timetables if you think about it.

    WeekTimetable(int weekNumber){
        WeekNumber = weekNumber;
        for(int i = 0; i < 5; i++){
            weekTimetable.push_back(DayTimetable(i));
        }
    }
    void PrintTimetable(){
        std::cout << "Week " << WeekNumber << ":" << std::endl;
        for(int i = 0; i < 5; i++){
            weekTimetable[i].PrintTimetable();
            std::cout << std::endl;
        }
    }
};

int main(){
    DayTimetable Monday(0);
    Monday.PrintTimetable();

    WeekTimetable WeekOne(1);
    WeekOne.PrintTimetable();

    char temp;
    std::cin >> temp; //Temp process to keep window open. 
    return 0;
}