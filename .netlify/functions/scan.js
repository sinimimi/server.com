const fetch = require("node-fetch");

let scanStatus = {}; // Temporary store (or use Redis/Database for persistence)

exports.handler = async (event) => {
    const { apiKey } = event.queryStringParameters;

    if (!apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ status: "error", message: "Missing API key" }),
        };
    }

    // Mark this API key as "scanned"
    scanStatus[apiKey] = { status: "positive", timestamp: Date.now() };

    return {
        statusCode: 200,
        body: JSON.stringify({ status: "positive", message: "QR Code Scanned Successfully" }),
    };
};

// New function to check the scan status
exports.checkScanStatus = async (event) => {
    const { apiKey } = event.queryStringParameters;

    if (!apiKey || !scanStatus[apiKey]) {
        return {
            statusCode: 200,
            body: JSON.stringify({ status: "negative", message: "Not scanned yet" }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ status: "positive", message: "Scanned" }),
    };
};
