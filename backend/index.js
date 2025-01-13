// functions/index.js
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8082;

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' }));

// Route to process the image
app.post('/process-receipt', async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).send({ error: 'No image data provided' });
    }

    try {
        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
            {
                requests: [
                    {
                        image: { content: imageBase64 },
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                    },
                ],
            }
        );

        const text = response.data.responses[0]?.fullTextAnnotation?.text || '';  // Safe access
        console.log('Extracted text:', text);  // Log the extracted text

        if (text) {
            res.json({ text });
        } else {
            res.status(500).json({ error: 'No text detected' });
        }
    } catch (error) {
        console.error('Error processing receipt:', error);
        res.status(500).send({ error: 'Failed to process receipt' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

exports.processReceipt = app;