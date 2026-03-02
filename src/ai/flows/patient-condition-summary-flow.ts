'use server';
/**
 * @fileOverview A Genkit flow for generating a concise summary of an incoming patient's condition.
 * Includes fallback logic for API failures.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PatientConditionSummaryInputSchema = z.object({
  driverNotes: z
    .string()
    .describe("Free-text updates from the ambulance driver regarding the patient's condition."),
});

export type PatientConditionSummaryInput = z.infer<typeof PatientConditionSummaryInputSchema>;

const PatientConditionSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the patient's critical medical needs for hospital staff."),
});

export type PatientConditionSummaryOutput = z.infer<
  typeof PatientConditionSummaryOutputSchema
>;

const patientConditionSummaryPrompt = ai.definePrompt({
  name: 'patientConditionSummaryPrompt',
  input: {schema: PatientConditionSummaryInputSchema},
  output: {schema: PatientConditionSummaryOutputSchema},
  prompt: `As an expert medical summarizer for hospital staff, your task is to extract and summarize the critical medical needs from the following ambulance driver's notes. Focus on vital signs, injuries, symptoms, and any immediate actions or resources the hospital should prepare for. The summary should be concise and actionable.

Driver's Notes: {{{driverNotes}}}`,
});

const patientConditionSummaryFlow = ai.defineFlow(
  {
    name: 'patientConditionSummaryFlow',
    inputSchema: PatientConditionSummaryInputSchema,
    outputSchema: PatientConditionSummaryOutputSchema,
  },
  async input => {
    try {
      const {output} = await patientConditionSummaryPrompt(input);
      if (!output) throw new Error("No output from prompt");
      return output;
    } catch (error) {
      console.warn('Quota exceeded for patient summary. Falling back to raw notes.', error);
      return { 
        summary: input.driverNotes.length > 200 
          ? input.driverNotes.substring(0, 197) + '...' 
          : input.driverNotes 
      };
    }
  }
);

export async function getPatientConditionSummary(
  input: PatientConditionSummaryInput
): Promise<PatientConditionSummaryOutput> {
  return patientConditionSummaryFlow(input);
}
