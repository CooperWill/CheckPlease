// functions/index.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON payload' });
            throw new Error('Invalid JSON');
        }
    }
}));

// Middleware to validate request body
const validateRequest = (req, res, next) => {
    if (!req.body.imageBase64) {
        return res.status(400).json({ error: 'No image data provided' });
    }

    // Basic base64 validation
    if (!req.body.imageBase64.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/)) {
        return res.status(400).json({ error: 'Invalid base64 image data' });
    }

    next();
};

// Main function handler
exports.processReceipt = async (req, res) => {
    // Add CORS headers
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }

    try {
        console.log('Processing receipt request received');

        // Check Google Vision API key
        if (!process.env.GOOGLE_VISION_API_KEY) {
            console.error('Google Vision API key not found');
            return res.status(500).json({ error: 'API configuration error' });
        }

        // Validate request body
        if (!req.body.imageBase64) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        // Call Google Vision API
        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
            {
                requests: [{
                    image: { content: req.body.imageBase64 },
                    features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
                }]
            },
            { timeout: 30000 }
        );

        // Validate response
        if (!response.data?.responses?.[0]) {
            console.error('Invalid response from Vision API');
            return res.status(500).json({ error: 'Invalid API response' });
        }

        const text = response.data.responses[0].fullTextAnnotation?.text;

        if (!text) {
            console.log('No text detected in image');
            return res.status(422).json({ error: 'No text detected in image' });
        }

        console.log('Successfully processed receipt');
        res.json({ text });

    } catch (error) {
        console.error('Error processing receipt:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        if (error.response?.status === 403) {
            return res.status(500).json({ error: 'API authentication error' });
        }

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ error: 'Request timeout' });
        }

        res.status(500).json({
            error: 'Failed to process receipt',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};