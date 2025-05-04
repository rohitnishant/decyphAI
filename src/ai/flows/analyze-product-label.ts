
'use server';

/**
 * @fileOverview Analyzes a product label image using AI to extract ingredients and provide detailed information.
 *
 * - analyzeProductLabel - Analyzes the product label image using AI.
 * - AnalyzeProductLabelInput - The input type for the analyzeProductLabel function.
 * - AnalyzeProductLabelOutput - The return type for the analyzeProductLabel function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input Schema: Takes the product label image as a data URI
const AnalyzeProductLabelInputSchema = z.object({
  productLabelImage: z
    .string()
    .describe(
      'A photo of a product label, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:image/<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AnalyzeProductLabelInput = z.infer<typeof AnalyzeProductLabelInputSchema>;

// Output Schema: Defines the expected structure of the analysis result
const AnalyzeProductLabelOutputSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe('The name of the ingredient identified.'),
      description: z.string().optional().describe('A brief description of the ingredient.'),
      commonUses: z.string().optional().describe('Common uses or functions of the ingredient in products.'),
      prosCons: z.string().optional().describe('Potential benefits and drawbacks or considerations.'),
      sideEffectsAllergens: z.string().optional().describe('Known potential side effects or allergen information.'),
      warningsRegulatory: z.string().optional().describe('Any specific warnings, safety notes, or regulatory status.'),
    })
  ).describe('A list of ingredients identified from the product label, along with detailed information for each.'),
});
export type AnalyzeProductLabelOutput = z.infer<typeof AnalyzeProductLabelOutputSchema>;

// Public function to invoke the flow
export async function analyzeProductLabel(input: AnalyzeProductLabelInput): Promise<AnalyzeProductLabelOutput> {
  // Basic validation before calling the flow
  if (!input.productLabelImage || !input.productLabelImage.startsWith('data:image/')) {
     throw new Error('Invalid or missing product label image data URI.');
  }
  return analyzeProductLabelFlow(input);
}

// Genkit Prompt: Defines the AI task
const productLabelAnalysisPrompt = ai.definePrompt({
  name: 'productLabelAnalysisPrompt',
  // Use the same input schema as the flow
  input: { schema: AnalyzeProductLabelInputSchema },
  // Use the same output schema as the flow
  output: { schema: AnalyzeProductLabelOutputSchema },
  // Prompt instructions for the AI model
  prompt: `You are an expert product analyst specializing in ingredient labels.
Analyze the provided product label image: {{media url=productLabelImage}}

1.  Identify all ingredients listed on the label. Ignore marketing text, instructions, barcodes, or company information.
2.  For each identified ingredient, provide the following details based on your knowledge:
    *   name: The ingredient name as accurately as possible from the label.
    *   description: A brief description of what the ingredient is.
    *   commonUses: Common applications or functions of this ingredient in consumer products.
    *   prosCons: Potential benefits and drawbacks or things to consider about this ingredient.
    *   sideEffectsAllergens: Any known potential side effects or common allergen concerns.
    *   warningsRegulatory: Any notable warnings, safety guidelines, or regulatory status (like FDA GRAS).

Return the results strictly in the specified JSON output format. If information for a field isn't available, omit the field or provide a brief note like "Information not readily available.". Ensure the 'name' field always contains the ingredient name found on the label.
`,
 // Specify a model potentially better suited for vision tasks if needed, otherwise uses default from ai-instance
 // model: 'googleai/gemini-1.5-flash', // Example: Can uncomment/change if default struggles
});

// Genkit Flow: Orchestrates the AI call
const analyzeProductLabelFlow = ai.defineFlow<
  typeof AnalyzeProductLabelInputSchema,
  typeof AnalyzeProductLabelOutputSchema
>({
  name: 'analyzeProductLabelFlow',
  inputSchema: AnalyzeProductLabelInputSchema,
  outputSchema: AnalyzeProductLabelOutputSchema,
}, async input => {
  console.log("Calling AI for product label analysis...");
  try {
    const {output} = await productLabelAnalysisPrompt(input);

    if (!output) {
      console.error("AI analysis returned no output.");
      throw new Error("AI analysis failed to produce a result.");
    }

    console.log("AI analysis successful.");
    // Ensure the output has the ingredients array, even if empty
    return { ingredients: output.ingredients || [] };

  } catch (error) {
     console.error("Error during AI product label analysis:", error);
     // Re-throw a more user-friendly error or handle specific AI errors
     if (error instanceof Error) {
        throw new Error(`AI analysis failed: ${error.message}`);
     }
     throw new Error("An unknown error occurred during AI analysis.");
  }
});
