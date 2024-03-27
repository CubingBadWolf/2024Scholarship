const fs = require('fs').promises;
const axios = require('axios');
const json2csv = require('json2csv').parse;


const url = "https://edgeapi.edgelearning.co.nz/api/v1/school/groups/2024";
let data;

async function readConfigAsync() {
    try {
        const data = await fs.readFile('config.txt', 'utf8');
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

readConfigAsync()
    .then(config => {
        if (config) {
            return getURLTextContents(url, config.orgID, config.eAuthID, config.eAppID);
        }
    })
    .then(result => {
        data = result;
        outputDataToJsonFile(data, "output.json")
        convertJsonToCsv(data, "output.csv")
    })
    .catch(error => {
        console.error(error);
    });

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