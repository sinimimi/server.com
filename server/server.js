// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage (replace with database in production)
const connections = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Input validation middleware
const validateSession = (req, res, next) => {
    const sessionId = req.query.session || req.body.sessionId;
    if (!sessionId) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Session ID is required'
        });
    }
    next();
};

const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Valid email is required'
        });
    }
    next();
};

const validateAddress = (req, res, next) => {
    const { address } = req.body;
    if (!address || !address.match(/^T[A-Za-z0-9]{33}$/)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Valid TRX address is required'
        });
    }
    next();
};

// Routes
app.post('/api/status', [validateSession, validateEmail, validateAddress], (req, res) => {
    try {
        const { sessionId, address, email } = req.body;
        
        // Store connection info
        connections.set(sessionId, {
            address,
            email,
            timestamp: new Date(),
            isConnected: true
        });

        // Clean up old sessions (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        for (const [key, value] of connections) {
            if (value.timestamp < oneHourAgo) {
                connections.delete(key);
            }
        }

        res.json({
            success: true,
            message: 'Connection status updated successfully'
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update connection status'
        });
    }
});

app.get('/api/status', validateSession, (req, res) => {
    try {
        const { session } = req.query;
        const connection = connections.get(session);

        if (!connection) {
            return res.json({
                isConnected: false,
                address: null
            });
        }

        // Check if connection is still valid (within last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (connection.timestamp < oneHourAgo) {
            connections.delete(session);
            return res.json({
                isConnected: false,
                address: null
            });
        }

        res.json({
            isConnected: connection.isConnected,
            address: connection.address
        });
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to get connection status'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Rate limiting (basic implementation)
const rateLimit = new Map();
app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const requestTimestamps = rateLimit.get(ip) || [];
    const windowRequests = requestTimestamps.filter(timestamp => timestamp > windowStart);
    
    if (windowRequests.length >= 60) { // 60 requests per minute
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Please try again later'
        });
    }
    
    windowRequests.push(now);
    rateLimit.set(ip, windowRequests);
    next();
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    app.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
