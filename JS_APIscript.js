const fs = require('fs').promises;
const axios = require('axios');

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
            return getURLTextContents("https://edgeapi.edgelearning.co.nz/api/v1/school/groups/2024", config.orgID, config.eAuthID, config.eAppID);
        }
    })
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });
