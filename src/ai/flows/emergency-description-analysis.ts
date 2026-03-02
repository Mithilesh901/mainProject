'use server';

/**
 * Emergency Description Analysis Flow
 * Analyzes natural language emergency text
 * and returns emergency type + severity.
 * Includes a heuristic fallback for quota exhaustion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* -----------------------------
   SCHEMAS (NOT EXPORTED)
------------------------------*/
const EmergencyDescriptionAnalysisInputSchema = z.object({
  description: z
    .string()
    .min(3)
    .describe('Natural language description of the emergency'),
});

const EmergencyDescriptionAnalysisOutputSchema = z.object({
  emergencyType: z.enum([
    'Accident',
    'Cardiac',
    'Trauma',
    'Gas Leak',
  ]),
  severity: z.enum([
    'Critical',
    'High',
    'Medium',
    'Low',
  ]),
});

/* -----------------------------
   TYPES
------------------------------*/
export type EmergencyDescriptionAnalysisInput =
  z.infer<typeof EmergencyDescriptionAnalysisInputSchema>;

export type EmergencyDescriptionAnalysisOutput =
  z.infer<typeof EmergencyDescriptionAnalysisOutputSchema>;


/* -----------------------------
   PROMPT (PRIVATE)
------------------------------*/
const emergencyPrompt = ai.definePrompt({
  name: 'emergencyDescriptionAnalysisPrompt',
  input: {
    schema: EmergencyDescriptionAnalysisInputSchema,
  },
  output: {
    schema: EmergencyDescriptionAnalysisOutputSchema,
  },
  prompt: `
You are an emergency dispatch AI.

Analyze the emergency description and return:
1. Emergency Type
2. Severity Level

Emergency Types:
- Accident
- Cardiac
- Trauma
- Gas Leak

Severity Levels:
- Critical
- High
- Medium
- Low

Emergency Description:
{{description}}
`,
});


/* -----------------------------
   FLOW (PRIVATE)
------------------------------*/
const emergencyDescriptionAnalysisFlow = ai.defineFlow(
  {
    name: 'emergencyDescriptionAnalysisFlow',
    inputSchema: EmergencyDescriptionAnalysisInputSchema,
    outputSchema: EmergencyDescriptionAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const result = await emergencyPrompt(input);
      if (!result.output) {
        throw new Error('AI failed to generate emergency analysis');
      }
      return result.output;
    } catch (error) {
      console.warn('GenAI quota exhausted or error occurred. Using heuristic fallback.', error);
      
      const desc = input.description.toLowerCase();
      let type: EmergencyDescriptionAnalysisOutput['emergencyType'] = 'Accident';
      let severity: EmergencyDescriptionAnalysisOutput['severity'] = 'Medium';

      if (desc.includes('cardiac') || desc.includes('heart') || desc.includes('chest')) {
        type = 'Cardiac';
        severity = 'Critical';
      } else if (desc.includes('trauma') || desc.includes('bleeding') || desc.includes('injury')) {
        type = 'Trauma';
        severity = 'High';
      } else if (desc.includes('gas') || desc.includes('leak') || desc.includes('smell')) {
        type = 'Gas Leak';
        severity = 'High';
      } else if (desc.includes('accident') || desc.includes('crash') || desc.includes('hit')) {
        type = 'Accident';
        severity = 'High';
      }

      return { emergencyType: type, severity };
    }
  }
);


/* -----------------------------
   EXPORTED FUNCTION (PUBLIC)
------------------------------*/
export async function emergencyDescriptionAnalysis(
  input: EmergencyDescriptionAnalysisInput
): Promise<EmergencyDescriptionAnalysisOutput> {
  return emergencyDescriptionAnalysisFlow(input);
}