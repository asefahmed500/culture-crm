
const QLOO_API_URL = process.env.QLOO_API_URL;
const QLOO_API_KEY = process.env.QLOO_API_KEY;

if (!QLOO_API_URL || !QLOO_API_KEY) {
  throw new Error(
    'Please define the QLOO_API_URL and QLOO_API_KEY environment variables.'
  );
}

/**
 * Fetches taste correlations from the Qloo API.
 * @param interests An array of strings representing user interests (e.g., purchase categories).
 * @returns A promise that resolves to the correlation data from the Qloo API.
 */
export async function getCorrelations(interests: string[]): Promise<any> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

        const response = await fetch(`${QLOO_API_URL}/v2/users/tastes/correlations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': QLOO_API_KEY,
            },
            body: JSON.stringify({
                "q": interests,
                "domain": [
                  "music",
                  "film",
                  "tv",
                  "podcasts",
                  "books",
                  "fashion",
                  "dining",
                  "travel"
                ],
                "results_per_domain": 10
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Qloo API Error (Status: ${response.status}):`, errorBody);
            // Provide a more specific error message
            throw new Error(`Qloo API responded with status ${response.status}. This may be due to an invalid API key or an issue with the service.`);
        }

        const data = await response.json();
        return data.data;

    } catch (error: any) {
        if (error.name === 'AbortError') {
             console.error('Qloo API request timed out.');
             throw new Error('The request to the Qloo API timed out. Please try again later.');
        }
        console.error('Failed to fetch correlations from Qloo API:', error);
        // Allow the flow to continue gracefully by returning null, which is handled in the calling flow.
        return null;
    }
}
