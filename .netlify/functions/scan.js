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
      statusCode: 200, // Indicating the key has already been scanned
      body: JSON.stringify({ status: 'negative', message: 'API key has already been scanned.' }),
    };
  }

  // Mark the API key as scanned
  scannedKeys.add(apiKey);

  // Return positive response with success status
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'positive', message: 'API key scanned successfully.' }),
  };
};
