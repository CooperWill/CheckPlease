// apiService.tsx
export const sendImageToBackend = async (base64Image: string): Promise<string> => {
    try {
        const response = await fetch('https://us-central1-checkplease-447702.cloudfunctions.net/processReceipt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: base64Image }),
        });

        // Get the full error response if status is not ok
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Full error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Success response:', responseText);

        const data = JSON.parse(responseText);
        if (!data.text) {
            throw new Error('No text detected in image');
        }

        return data.text;
    } catch (error) {
        console.error('Detailed error:', error);
        throw error;
    }
};