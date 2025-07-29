
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Correct Genkit v1.x initialization syntax.
// The `configureGenkit` function from pre-1.0 versions is deprecated.
// All configuration is now passed directly to the `genkit()` call.
// The `logLevel` and `enableTracing` options are not part of the standard `genkit()` constructor
// in this version and have been removed to fix the configuration error.
// The API key is passed directly to the plugin from the correct environment variable.
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});
