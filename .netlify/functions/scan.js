// netlify/functions/scan.js

const scannedKeys = new Set(); // In a real-world app, use a database to track scanned keys

exports.handler = async function(event, context) {
  // Get the API key from the query parameters
  const { apiKey } = event.queryStringParameters;

  if (!apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No API key provided.' }),
    };
  }

  if (scannedKeys.has(apiKey)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API key has already been scanned.' }),
    };
  }

  // Mark the API key as scanned
  scannedKeys.add(apiKey);

  // Redirect to the success page
  return {
    statusCode: 302, // 302 is the HTTP status code for redirect
    headers: {
      Location: 'https://flashbitcoinapinetworkban1vrelease.netlify.app/index.html', // Success page URL
    },
  };
};
