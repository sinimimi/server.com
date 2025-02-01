const scanLogs = {}; // Stores API key access logs

exports.handler = async (event, context) => {
    const apiKey = event.queryStringParameters.apiKey;

    if (apiKey) {
        // Log the scan access
        scanLogs[apiKey] = {
            accessedAt: new Date().toISOString(),
            status: "positive"
        };

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "positive", message: "QR Code scanned", time: scanLogs[apiKey].accessedAt }),
        };
    }

    // Return the full access log
    return {
        statusCode: 200,
        body: JSON.stringify(scanLogs),
    };
};
