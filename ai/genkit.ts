
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Correct Genkit v1.x initialization syntax.
// The `configureGenkit` function from pre-1.0 versions is deprecated.
// All configuration is now passed directly to the `genkit()` call.
// Disabling tracing to prevent conflicts with Next.js server environment.
// Explicitly pass the API key to the plugin.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GOOGLE_API_KEY})],
  logLevel: 'debug',
  enableTracing: false,
});
