export const sendImageToBackend = async (base64Image: string) => {
    try {
        const response = await fetch('https://us-central1-checkplease-447702.cloudfunctions.net/processReceipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64Image }),
        });

        // Log the raw response text
        const responseText = await response.text();
        console.log('Raw response:', responseText);  // Log the raw response

        // Try to parse the response if it's valid JSON
        const data = JSON.parse(responseText);
        return data.text;  // Processed text from Google Vision API
    } catch (error) {
        console.error('Error sending image to backend:', error);
        return '';
    }
};
