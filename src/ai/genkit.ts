
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Correct Genkit v1.x initialization syntax.
// The `logLevel` and `enableTracing` options are not part of the standard `genkit()` constructor
// in this version, but are necessary to prevent issues with optional tracing dependencies in a Next.js environment.
// The API key is passed directly to the plugin from the correct environment variable.
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  enableTracing: false,
  logLevel: 'silent',
});
