const fetch = require("node-fetch");

let scanLogs = {};  // Store API logs in memory (temporary)

exports.handler = async (event, context) => {
    const apiKey = event.queryStringParameters.apiKey;
    
    if (!apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "API key is required" }),
        };
    }

    // Log the time the API key was accessed
    scanLogs[apiKey] = {
        accessedAt: new Date().toISOString(),
        status: "positive"  // Mark as scanned when accessed
    };

    return {
        statusCode: 200,
        body: JSON.stringify({ status: "positive", message: "QR Code scanned", time: scanLogs[apiKey].accessedAt }),
    };
};
