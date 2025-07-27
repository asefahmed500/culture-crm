
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
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Qloo API Error:', errorBody);
            throw new Error(`Qloo API responded with status ${response.status}`);
        }

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error('Failed to fetch correlations from Qloo API:', error);
        // Return null or an empty array to allow the flow to continue gracefully
        return null;
    }
}
