
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Correct Genkit v1.x initialization syntax.
// The `configureGenkit` function from pre-1.0 versions is deprecated.
// All configuration is now passed directly to the `genkit()` call.
export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracing: false,
});
