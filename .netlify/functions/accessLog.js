const fetch = require("node-fetch");
const fs = require("fs");
const netlifyStorageUrl = "https://marvelous-sundae-90da3d.netlify.app/public/apikeys.txt";

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

    try {
        // Append the API key to the Netlify-hosted file
        await fetch(netlifyStorageUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: `${apiKey}\n`
        });
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update API keys storage" }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ status: "positive", message: "QR Code scanned", time: scanLogs[apiKey].accessedAt }),
    };
};
