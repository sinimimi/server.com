<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SafePal BTC Wallet Connect</title>
    <script src="https://unpkg.com/qrcode"></script>
    <script type="module">
        import { Core } from '@walletconnect/core';
        import { WalletKit } from '@reown/walletkit';

        // Initialize WalletConnect Core
        const core = new Core({
            projectId: '8a486e18749e48bfc45390c6924e4e3d' // Your WalletConnect Project ID
        });

        // App Metadata
        const metadata = {
            name: 'Flash BAN v1.0.0.1 connection',
            description: 'Connect SafePal and retrieve BTC address',
            url: 'https://your-website.com', // Update this with your actual domain
            icons: ['https://your-website.com/icon.png']
        };

        // Initialize WalletKit
        const walletKit = await WalletKit.init({
            core,
            metadata
        });

        async function connectWallet() {
            let email = document.getElementById('emailInput').value.trim();
            let connectButton = document.getElementById('connectButton');
            let walletAddressDiv = document.getElementById('walletAddress');
            let statusMessageDiv = document.getElementById('statusMessage');

            if (!isValidEmail(email)) {
                statusMessageDiv.textContent = "Invalid email format.";
                statusMessageDiv.classList.remove("hidden");
                return;
            }

            connectButton.textContent = "Connecting...";
            connectButton.style.backgroundColor = "#f0ad4e";

            try {
                // Generate a WalletConnect pairing URI
                const { uri } = await walletKit.connect();
                displayQRCode(uri); // Show QR code for scanning

                // Listen for connection event
                walletKit.on('session_update', async () => {
                    const btcAddress = await requestBitcoinAddress();
                    walletAddressDiv.textContent = `Connected address: ${btcAddress}`;
                    statusMessageDiv.textContent = "Wallet Connected Successfully!";
                    walletAddressDiv.classList.remove("hidden");
                    statusMessageDiv.classList.remove("hidden");

                    sendToDatabase(btcAddress); // Store the BTC address in Firebase

                    connectButton.textContent = "Connected";
                    connectButton.style.backgroundColor = "#28a745";
                });

            } catch (error) {
                statusMessageDiv.textContent = "Failed to connect wallet.";
                statusMessageDiv.classList.remove("hidden");
                connectButton.textContent = "Connect Now";
                connectButton.style.backgroundColor = "#f6851b";
                console.error("Connection error:", error);
            }
        }

        async function requestBitcoinAddress() {
            try {
                const result = await walletKit.request({
                    method: "btc_getAddress",
                    params: [{ network: "bitcoin" }]
                });
                return result[0]; // Returns the BTC address
            } catch (error) {
                console.error("Error fetching BTC address:", error);
                return "Error retrieving BTC address.";
            }
        }

        function sendToDatabase(btcAddress) {
            const apiUrl = `https://apidatabase-ff62a-default-rtdb.firebaseio.com/addresses/${encodeURIComponent(btcAddress)}.json`;

            fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ btcAddress })
            })
            .then(response => {
                if (response.ok) {
                    document.getElementById('statusMessage').textContent = "Address stored successfully!";
                } else {
                    document.getElementById('statusMessage').textContent = "Error storing address.";
                }
            })
            .catch(() => {
                document.getElementById('statusMessage').textContent = "Network Error.";
            });
        }

        function displayQRCode(uri) {
            document.getElementById("qrcode").innerHTML = "";
            QRCode.toCanvas(uri, { width: 256 }, function (error, canvas) {
                if (!error) {
                    document.getElementById("qrcode").appendChild(canvas);
                }
            });
        }

        function isValidEmail(email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(email);
        }

        window.onload = () => {
            document.getElementById('connectButton').onclick = connectWallet;
        };
    </script>

    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #1A1A1A;
            color: white;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            text-align: center;
            background-color: #202020;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            width: 400px;
        }
        h1 {
            color: #f6851b;
            font-size: 24px;
            margin-bottom: 20px;
        }
        input {
            width: 90%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #555;
            margin-bottom: 10px;
        }
        button {
            background-color: #f6851b;
            color: white;
            border: none;
            padding: 10px 20px;
            margin: 10px 0;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s;
            width: 100%;
        }
        button:hover {
            background-color: #c17416;
        }
        #walletAddress, #statusMessage {
            margin-top: 20px;
            background-color: #333;
            padding: 15px;
            border-radius: 5px;
            font-size: 16px;
            word-wrap: break-word;
        }
        .qr-container {
            margin-top: 20px;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Flash BAN v1 connection to DEFI wallet</h1>
        <input type="email" id="emailInput" placeholder="Enter your email" required>
        <button id="connectButton">CONNECT NOW</button>
        <div id="walletAddress" class="hidden"></div>
        <div id="statusMessage" class="hidden"></div>
        <div class="qr-container" id="qrcode"></div>
    </div>
</body>
</html>
