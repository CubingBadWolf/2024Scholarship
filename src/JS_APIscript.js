const fs = require('fs').promises;
const path = require('path')
const axios = require('axios');
const json2csv = require('json2csv').parse;
const date = new(Date)

let year = date.getFullYear()
let data;
function CallAPI(url, output) {
    return new Promise((resolve, reject) => {
        readConfigAsync()
            .then(config => {
                if (config) {
                    return getURLTextContents(url, config.orgID, config.eAuthID, config.eAppID);
                }
            })
            .then(result => {
                let data;
                if (output === "staff") {
                    data = filterKeysInArray(result, true);
                } else {
                    data = filterKeysInArray(result, false);
                }
                outputDataToJsonFile(data, `${output}.json`);
                convertJsonToCsv(data, `${output}.csv`);
                resolve(); // Resolve the promise after API call is complete
            })
            .catch(error => {
                console.error(error);
                reject(error); // Reject the promise if there's an error
            });
    });
}



// Function to filter out School and SchoolNo as data same in all entries. 
function filterKeysInArray(jsonArray, isStaff) {
    keysToFilter = ["SchoolNo", "School"]
    return jsonArray.map(function(entry) {
        keysToFilter.forEach(function(key) {
            delete entry[key];
        });
        if (isStaff){
            delete entry["Groups"]
        }
        return entry;
    });
  }

async function readConfigAsync() {
    try {
        const loc = path.join(__dirname, 'config.txt')
        const data = await fs.readFile(loc, 'utf8');
        const config = {};
        const lines = data.split('\n');
        lines.forEach(line => {
            const [key, value] = line.split('=');
            config[key.trim()] = value.trim();
        });
        return config;
    } catch (err) {
        console.error('Error reading config file:', err);
        return null;
    }
}

async function getURLTextContents(strURLtoGet, strSchoolNum, strEdgeBearerToken, strEdgeAppID) {
    try {
        const response = await axios.get(strURLtoGet, {
            headers: {
                'Authorization': strEdgeBearerToken,
                'appID': strEdgeAppID,
                'SchoolNo': strSchoolNum
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error:", error.response.status, error.response.statusText);
        return null;
    }
}


async function outputDataToJsonFile(data, filename) {
    try {
        // Convert data to JSON string
        const jsonData = JSON.stringify(data, null, 2); // The second argument (null) is for replacer function, and the third argument (2) is for indentation
        
        // Write JSON string to file
        await fs.writeFile(filename, jsonData);

        console.log(`Data has been successfully written to ${filename}`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

// Function to convert JSON data to CSV format
async function convertJsonToCsv(jsonData, filename) {
    try {
        // Convert JSON data to CSV string
        const csvData = json2csv(jsonData, { header: true });

        // Write CSV string to file
        await fs.writeFile(filename, csvData);

        console.log(`Data has been successfully written to ${filename}`);
    } catch (error) {
        console.error('Error writing CSV file:', error);
    }
}
function checkMembersGroup(url, num) {
    return readConfigAsync()
        .then(config => {
            if (config) {
                return getURLTextContents(url, config.orgID, config.eAuthID, config.eAppID);
            }
        })
        .then(result => {
            return result; // Return the result to pass it down the chain
        })
        .catch(error => {
            console.error(error);
            throw error; // Rethrow the error to propagate it further
        });
}

async function StudentNums(num) {
    const url = `https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}/${num}`;
    try {
        const jsonData = await checkMembersGroup(url, num);
        const key = "Students";
        return jsonData[key].length // returns the amount of students
    } catch (error) {
        console.error(error);
        return false; // Return false if there was an error
    }
}

//CallAPI(`https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}`, "groups")
//CallAPI(`https://edgeapi.edgelearning.co.nz/api/V2/school/staff/${year}`, "staff") //Tests.

module.exports = {CallAPI, StudentNums}