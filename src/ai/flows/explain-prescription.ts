
'use server';
/**
 * @fileOverview Analyzes a prescription image using AI to identify medicines, their descriptions, side effects, and precautions.
 *
 * - analyzePrescriptionImage - Analyzes a prescription image using AI.
 * - AnalyzePrescriptionImageInput - The input type for the analyzePrescriptionImage function.
 * - AnalyzePrescriptionImageOutput - The return type for the analyzePrescriptionImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input Schema: Takes the prescription image as a data URI
const AnalyzePrescriptionImageInputSchema = z.object({
  prescriptionImageDataUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePrescriptionImageInput = z.infer<typeof AnalyzePrescriptionImageInputSchema>;

// Output Schema: Defines the expected structure for each medicine found
const MedicineInfoSchema = z.object({
    name: z.string().describe('The full name of the medicine, including dosage if available (e.g., "Lisinopril 10mg").'),
    description: z.string().describe('What the medicine is typically used for (its purpose or drug class).'),
    sideEffects: z.string().describe('Common and potentially serious side effects associated with the medicine.'),
    precautions: z.string().describe('Important precautions, warnings, or contraindications for taking the medicine.'),
});

const AnalyzePrescriptionImageOutputSchema = z.object({
  medicines: z
    .array(MedicineInfoSchema)
    .describe('An array containing information about each medicine identified in the prescription image.'),
});
export type AnalyzePrescriptionImageOutput = z.infer<typeof AnalyzePrescriptionImageOutputSchema>;

// Public function to invoke the flow
export async function analyzePrescriptionImage(
  input: AnalyzePrescriptionImageInput
): Promise<AnalyzePrescriptionImageOutput> {
   // Basic validation before calling the flow
  if (!input.prescriptionImageDataUri || !input.prescriptionImageDataUri.startsWith('data:image/')) {
     throw new Error('Invalid or missing prescription image data URI.');
  }
  return analyzePrescriptionImageFlow(input);
}

// Genkit Prompt: Defines the AI task
const explainPrescriptionPrompt = ai.definePrompt({
    name: 'explainPrescriptionPrompt',
    // Use the same input schema as the flow
    input: { schema: AnalyzePrescriptionImageInputSchema },
    // Use the same output schema as the flow
    output: { schema: AnalyzePrescriptionImageOutputSchema },
    // Prompt instructions for the AI model
    prompt: `You are a helpful assistant knowledgeable about medications.
Analyze the provided prescription image: {{media url=prescriptionImageDataUri}}

1.  Identify each distinct medicine listed on the prescription. Include the dosage (e.g., 10mg, 500mg) if specified.
2.  For each identified medicine, provide the following information based on your knowledge:
    *   name: The full name of the medicine, including dosage (e.g., "Lisinopril 10mg", "Amoxicillin 500mg").
    *   description: Briefly explain what the medicine is used for or its drug class (e.g., "Treats high blood pressure", "Antibiotic").
    *   sideEffects: List common and important potential side effects.
    *   precautions: Mention key warnings, precautions, or things to be aware of when taking this medication (e.g., interactions, pregnancy warnings, monitoring needed).

Focus solely on extracting medication information. Ignore patient names, doctor names, dates, pharmacy details unless part of the medication instruction itself.

Return the results strictly in the specified JSON output format. If multiple medicines are found, include each as an object in the 'medicines' array. If no medicines can be clearly identified, return an empty 'medicines' array.
`,
 // Specify a model potentially better suited for vision tasks if needed
 // model: 'googleai/gemini-1.5-flash',
});


// Genkit Flow: Orchestrates the AI call
const analyzePrescriptionImageFlow = ai.defineFlow<
  typeof AnalyzePrescriptionImageInputSchema,
  typeof AnalyzePrescriptionImageOutputSchema
>({
  name: 'analyzePrescriptionImageFlow',
  inputSchema: AnalyzePrescriptionImageInputSchema,
  outputSchema: AnalyzePrescriptionImageOutputSchema,
}, async input => {
  console.log("Calling AI for prescription image analysis...");
   try {
      const {output} = await explainPrescriptionPrompt(input);

      if (!output) {
          console.error("AI analysis returned no output for prescription.");
          // Return empty array if AI gives nothing back, rather than erroring
          return { medicines: [] };
          // throw new Error("AI analysis failed to produce a result.");
      }

      console.log("AI prescription analysis successful.");
      // Ensure the output has the medicines array, even if empty
      return { medicines: output.medicines || [] };

   } catch (error) {
      console.error("Error during AI prescription analysis:", error);
      if (error instanceof Error) {
          throw new Error(`AI analysis failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during AI prescription analysis.");
   }
});
