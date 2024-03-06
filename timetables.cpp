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
        int Day;
        int teacherID;
    public:
        std::vector<Period> DayTimetable;

        void BuildDayTimetable(int day){
            Day = day;
            for(int i=0; i < periodsInDay[day]; i++){
                DayTimetable.push_back(Period('P'));
            }
        }

        void PrintTimetable(){
            for(int item=0; item < periodsInDay[Day]; item++){
                std::cout << "Period " << item << ": " << DayTimetable[item].Status_Short << std::endl;
            }
           
        }
};

int main(){
    DayTimetable Monday;
    Monday.BuildDayTimetable(0);
    Monday.PrintTimetable();
    char temp;
    std::cin >> temp; //Temp process to keep window open. 
    return 0;
}