const fs = require('fs').promises;
const path = require('path')
const axios = require('axios');
const json2csv = require('json2csv').parse;
const date = new(Date)
const config = require('../../settings/config.js');

let year = date.getFullYear()
const filesDir = path.resolve(__dirname, '../../src/files/');

async function CallAPI(url, output) {
    try {
        const result = await getURLTextContents(url, config.orgID, config.eAuthID, config.eAppID);

        let data;
        if (output === "staff") {
            data = filterKeysInArray(result, true);
        } else {
            data = filterKeysInArray(result, false);
        }
        
        await outputDataToJsonFile(data, `${output}.json`);
        await convertJsonToCsv(data, `${output}.csv`);
        
    } catch (error) {
        console.error(`Error processing API call for ${output}:`, error);
        throw error; // Ensure to propagate the error
    }
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
    const filePath = path.join(filesDir, filename);
    try {
        await deleteFileIfExists(filePath); // Delete existing file if present
        const jsonData = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, jsonData);
        console.log(`Data has been successfully written to ${filename}`);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}


async function deleteFileIfExists(filePath) {
    try {
        await fs.access(filePath); // Check if the file exists
        await fs.unlink(filePath); // Delete the file
    } catch (error) {
        if (error.code === 'ENOENT') {
            // File does not exist, no action needed
        } else {
            // Other errors (e.g., permission issues)
            console.error(`Error deleting file: ${filePath}`, error);
            throw error;
        }
    }
}


// Function to convert JSON data to CSV format
async function convertJsonToCsv(jsonData, filename) {
    const filePath = path.join(filesDir, filename);
    try {
        await deleteFileIfExists(filePath); // Delete existing file if present
        const csvData = json2csv(jsonData, { header: true });
        await fs.writeFile(filePath, csvData);
        console.log(`Data has been successfully written to ${filename}`);
    } catch (error) {
        console.error('Error writing CSV file:', error);
    }
}

async function StudentNums(num) {
    const url = `https://edgeapi.edgelearning.co.nz/api/v1/school/groups/${year}/${num}`;
    try {
        const jsonData = await getURLTextContents(url, config.orgID, config.eAuthID, config.eAppID);
        const key = "Students";
        return jsonData[key].length // returns the amount of students
    } catch (error) {
        console.error(error);
        return false; // Return false if there was an error
    }
}

module.exports = {CallAPI, StudentNums}