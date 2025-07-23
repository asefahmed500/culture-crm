
import { z } from 'zod';

const QlooCorrelationResultSchema = z.object({
  category: z.string(),
  name: z.string(),
  id: z.string(),
  correlation_score: z.number(),
});

type QlooCorrelationResult = z.infer<typeof QlooCorrelationResultSchema>;

let qlooAccessToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getQlooToken(): Promise<string> {
  if (qlooAccessToken && tokenExpiry && new Date() < tokenExpiry) {
    return qlooAccessToken;
  }

  const clientId = process.env.QLOO_CLIENT_ID;
  const clientSecret = process.env.QLOO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Qloo client ID or secret is not set in environment variables.');
  }

  const response = await fetch('https://accounts.qloo.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Qloo access token: ${response.statusText}`);
  }

  const data = await response.json();
  qlooAccessToken = data.access_token;
  // Set expiry to 5 minutes before the actual expiry to be safe
  tokenExpiry = new Date(new Date().getTime() + (data.expires_in - 300) * 1000);

  return qlooAccessToken!;
}

async function searchQloo(keywords: string[]): Promise<string[]> {
  if (keywords.length === 0) return [];
  
  const token = await getQlooToken();
  const searchPromises = keywords.map(async (keyword) => {
    const response = await fetch(`https://api.qloo.com/v2/search?q=${encodeURIComponent(keyword)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.results?.[0]?.id; // Return the ID of the top result
  });

  const results = await Promise.all(searchPromises);
  return results.filter((id): id is string => id !== null);
}

export async function getCorrelationsForKeywords(keywords: string[]): Promise<QlooCorrelationResult[]> {
  const qlooIds = await searchQloo(keywords);

  if (qlooIds.length === 0) {
    return [];
  }
  
  const token = await getQlooToken();
  const idsQueryParam = qlooIds.join(',');

  const response = await fetch(`https://api.qloo.com/v2/correlations?ids=${idsQueryParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    console.error(`Qloo correlation API error: ${response.statusText}`);
    return [];
  }
  
  const data = await response.json();
  
  const parsedData = z.array(QlooCorrelationResultSchema).safeParse(data.results);
  
  if (!parsedData.success) {
      console.error("Failed to parse Qloo correlation results:", parsedData.error);
      return [];
  }

  return parsedData.data;
}
