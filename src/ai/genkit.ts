import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Note: "as any" is used here to bypass a potential type mismatch
// between different versions of the plugin. This is a temporary
// workaround to ensure compatibility.
export const ai = genkit({
  plugins: [googleAI()],
});
