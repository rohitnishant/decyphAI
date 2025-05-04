
// This file imports the AI flows needed for local development and testing with Genkit tools.
// It ensures that the flows are registered when running `genkit start`.

import '@/ai/flows/analyze-product-label';
import '@/ai/flows/explain-prescription';
import '@/ai/flows/summarize-medical-report';

console.log('AI flows loaded for Genkit development environment.');
