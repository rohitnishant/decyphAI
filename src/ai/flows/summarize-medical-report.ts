
'use server';

/**
 * @fileOverview An AI agent for summarizing medical reports from images or PDFs using multimodal capabilities.
 *
 * - summarizeMedicalReport - A function that handles the medical report summarization process using AI.
 * - SummarizeMedicalReportInput - The input type for the summarizeMedicalReport function.
 * - SummarizeMedicalReportOutput - The return type for the summarizeMedicalReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input Schema: Takes the report file (image or PDF) as a data URI and the report type
const SummarizeMedicalReportInputSchema = z.object({
  reportImage: z // Accepts data URI for image OR PDF
    .string()
    .describe(
      "A photo or PDF of a medical report, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  reportType: z.enum(['blood', 'ecg', 'xray', 'mri', 'other']).describe('The type of medical report (select "other" if unsure).'),
});
export type SummarizeMedicalReportInput = z.infer<typeof SummarizeMedicalReportInputSchema>;

// Output Schema: Defines the expected structure of the summarized report
const SummarizeMedicalReportOutputSchema = z.object({
  summary: z.string().describe('A clear, concise, human-readable summary of the key findings in the medical report.'),
  keyFindings: z.array(z.string()).optional().describe('A list of the most important specific findings or measurements extracted from the report.'),
  abnormalResults: z.array(z.string()).optional().describe('A list highlighting any results explicitly identified as abnormal or outside normal ranges, with context if possible.'),
  recommendations: z.array(z.string()).optional().describe('Any recommendations or next steps mentioned in the report itself (not AI suggestions).'),
  // Fields specifically for blood reports
  possibleCauses: z.array(z.string()).optional().describe('[Blood Reports Only] General potential causes related to the key findings or abnormal results (informational only).'),
  dietaryRecommendations: z.array(z.string()).optional().describe('[Blood Reports Only] General dietary suggestions based on the findings (informational only, not medical advice).'),
  commonMedications: z.array(z.string()).optional().describe('[Blood Reports Only] Examples of medications sometimes used for related conditions (informational only, not prescription advice).'),
  disclaimer: z.string().describe('A mandatory disclaimer stating this is AI-generated information and not a substitute for professional medical advice.'),
});
export type SummarizeMedicalReportOutput = z.infer<typeof SummarizeMedicalReportOutputSchema>;

// Public function to invoke the flow
export async function summarizeMedicalReport(input: SummarizeMedicalReportInput): Promise<SummarizeMedicalReportOutput> {
   // Basic validation before calling the flow
   if (!input.reportImage || !input.reportImage.includes(',')) { // Simple check for data URI format
       throw new Error('Invalid or missing medical report data URI.');
   }
   if (!input.reportType) {
        throw new Error('Medical report type is required.');
   }
  return summarizeMedicalReportFlow(input);
}

// Genkit Prompt: Defines the AI task for summarization
const medicalReportSummarizationPrompt = ai.definePrompt({
  name: 'medicalReportSummarizationPrompt',
  // Use the same input schema as the flow
  input: { schema: SummarizeMedicalReportInputSchema },
  // Use the same output schema as the flow
  output: { schema: SummarizeMedicalReportOutputSchema },
  // Prompt instructions for the AI model
  prompt: `You are an expert medical assistant skilled at interpreting and summarizing various medical reports.
Analyze the provided medical report ({{media url=reportImage}}), which is stated to be a '{{{reportType}}}' report.

Your tasks are:
1.  **Summarize:** Generate a clear, concise summary of the overall report in simple terms. Focus on the main conclusions or status.
2.  **Extract Key Findings:** Identify and list the most important specific measurements, observations, or findings mentioned.
3.  **Highlight Abnormal Results:** List any results explicitly flagged as abnormal, high, low, or outside the normal range. Include the value and reference range if available in the report.
4.  **Extract Recommendations:** List any specific recommendations, follow-up actions, or next steps mentioned within the report text. Do not add your own suggestions.

**IF AND ONLY IF the 'reportType' is 'blood', perform the following additional tasks (5-7):**
5.  **Provide Possible Causes:** Based on the abnormal results or key findings, list some *general potential causes*. Preface with "General potential causes could include..." and keep it informational, not diagnostic.
6.  **Suggest Dietary Recommendations:** Based on the findings, provide *general dietary suggestions* that might be relevant (e.g., "Increasing iron-rich foods like spinach..." or "Reducing sodium intake..."). State clearly these are general suggestions, not personalized advice.
7.  **Mention Common Medications:** Briefly mention *examples of types of medications* that are *sometimes* used for conditions related to the findings (e.g., "Statins for high cholesterol", "Iron supplements for anemia"). Use phrases like "Examples of medications sometimes used include...". **Crucially, state this is informational only and NOT a prescription or medical advice.**
If the 'reportType' is NOT 'blood', leave the 'possibleCauses', 'dietaryRecommendations', and 'commonMedications' fields as empty arrays.

8.  **Add Disclaimer:** ALWAYS include the following disclaimer in the 'disclaimer' field: "This analysis is AI-generated and for informational purposes only. It is NOT a substitute for professional medical advice. Consult with a qualified healthcare provider for any health concerns, diagnosis, or treatment decisions."

**Important:**
*   Analyze both the text and any visual elements (like graphs in an ECG or images in X-ray/MRI if applicable, though focus primarily on textual information if present).
*   Be objective. Report only what is present in the document for tasks 1-4. For tasks 5-7 (blood reports only), base suggestions on general medical knowledge related to the findings but keep them clearly informational and non-specific to the individual.
*   Prioritize accuracy and clarity.
*   If the report type is 'other' or seems different from the provided type, use your best judgment based on the content, but only provide tasks 5-7 if it's clearly a blood/lab report.
*   Ignore headers, footers, patient/doctor identifiers unless crucial for context.

Return the results strictly in the specified JSON output format. If a section (e.g., abnormalResults, recommendations, possibleCauses, dietaryRecommendations, commonMedications) has no relevant information in the report or isn't applicable, return an empty array for that field. The 'summary' and 'disclaimer' fields must always be populated.
`,
  // Use a model capable of handling multi-modal input (text and image/PDF)
  model: 'googleai/gemini-1.5-flash', // Gemini 1.5 Flash is generally good for multi-modal
});

// Genkit Flow: Orchestrates the AI call
const summarizeMedicalReportFlow = ai.defineFlow<
  typeof SummarizeMedicalReportInputSchema,
  typeof SummarizeMedicalReportOutputSchema
>({
  name: 'summarizeMedicalReportFlow',
  inputSchema: SummarizeMedicalReportInputSchema,
  outputSchema: SummarizeMedicalReportOutputSchema,
},
async input => {
   console.log(`Calling AI for medical report summarization (Type: ${input.reportType})...`);
   try {
        // Directly call the multimodal prompt with the input data URI
        const {output} = await medicalReportSummarizationPrompt(input);

        if (!output || !output.summary || !output.disclaimer) { // Ensure summary and disclaimer are present
            console.error("AI analysis returned no output, summary, or disclaimer for medical report.");
            throw new Error("AI analysis failed to produce a valid summary and disclaimer.");
        }

        console.log("AI medical report summarization successful.");
        // Ensure all arrays exist even if empty
        return {
            summary: output.summary,
            keyFindings: output.keyFindings || [],
            abnormalResults: output.abnormalResults || [],
            recommendations: output.recommendations || [],
            possibleCauses: output.possibleCauses || [], // Added
            dietaryRecommendations: output.dietaryRecommendations || [], // Added
            commonMedications: output.commonMedications || [], // Added
            disclaimer: output.disclaimer, // Added
        };

   } catch (error) {
       console.error("Error during AI medical report summarization:", error);
       if (error instanceof Error) {
            throw new Error(`AI analysis failed: ${error.message}`);
       }
       throw new Error("An unknown error occurred during AI medical report summarization.");
   }
});
