const fetch = require('node-fetch'); // You may need to install node-fetch if not already installed

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// This handler is invoked when someone accesses the link with ?apiKey={apiKey}
exports.handler = async function(event, context) {
  const { apiKey } = event.queryStringParameters;

  if (!apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'API key is missing' }),
    };
  }

  // Now insert the API key into Airtable
  try {
    const response = await insertApiKeyToAirtable(apiKey);

    // If the API key is successfully inserted, redirect to index.html
    return {
      statusCode: 302,  // HTTP status code for redirection
      headers: {
        Location: 'https://flashbitcoinapinetworkban1vrelease.netlify.app/index.html',  // Your redirect URL
      },
      body: JSON.stringify({
        message: 'API key successfully added to Airtable',
        data: response,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error inserting API key into Airtable', error: error.message }),
    };
  }
};

// Function to insert the API key into Airtable
async function insertApiKeyToAirtable(apiKey) {
  const requestBody = {
    fields: {
      APIKey: apiKey,  // Name of the Airtable field where you want to store the API key
      DateTime: new Date().toISOString(),
    },
  };

  const response = await fetch(AIRTABLE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to insert record into Airtable: ${response.statusText}`);
  }

  const responseData = await response.json();
  return responseData;
}
