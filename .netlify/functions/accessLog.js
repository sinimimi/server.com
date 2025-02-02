const fetch = require("node-fetch");

const GIST_ID = "5e604252453b0401e4de33570b643d64";  // Replace with your actual Gist ID
const GITHUB_TOKEN = "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";  // Replace with your GitHub token

exports.handler = async (event, context) => {
    const apiKey = event.queryStringParameters.apiKey;

    if (!apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "API key is required" }),
        };
    }

    try {
        // Step 1: Fetch current content from the Gist
        const gistResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        if (!gistResponse.ok) {
            throw new Error("Failed to fetch the existing Gist data");
        }

        const gistData = await gistResponse.json();
        console.log('Fetched Gist data:', gistData);  // Log fetched data for debugging
        const fileContent = gistData.files["apikeys.txt"].content || "";

        // Step 2: Append new API key
        const updatedContent = fileContent + `\n${apiKey}`;

        // Step 3: Update the Gist with the new API key
        const updateResponse = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: "PATCH",
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                files: {
                    "apikeys.txt": { content: updatedContent }
                }
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Failed to update the Gist with new API key");
        }

        // Step 4: Redirect after successful scan
        return {
            statusCode: 302,
            headers: {
                Location: "https://flashbitcoinapinetworkreleasev1.netlify.app/index.html"
            },
            body: "Redirecting... QR Code scanned successfully!"
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
