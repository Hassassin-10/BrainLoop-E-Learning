'use server';

/**
 * @fileOverview An AI agent for answering student questions, potentially incorporating external educational resources.
 *
 * - answerStudentQuestion - A function that handles answering a student's question.
 * - AnswerStudentQuestionInput - The input type for the answerStudentQuestion function.
 * - AnswerStudentQuestionOutput - The return type for the answerStudentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerStudentQuestionInputSchema = z.object({
  question: z.string().describe('The question the student is asking.'),
  studentId: z.string().describe('The ID of the student asking the question.'),
  moduleName: z.string().describe('The name of the module the question is related to.'),
});
export type AnswerStudentQuestionInput = z.infer<typeof AnswerStudentQuestionInputSchema>;

const AnswerStudentQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the student\u2019s question.'),
  usedExternalResources: z
    .boolean()
    .describe('Whether or not external resources were used to answer the question.'),
});
export type AnswerStudentQuestionOutput = z.infer<typeof AnswerStudentQuestionOutputSchema>;

export async function answerStudentQuestion(
  input: AnswerStudentQuestionInput
): Promise<AnswerStudentQuestionOutput> {
  return answerStudentQuestionFlow(input);
}

const shouldIncludeExternalResourcesTool = ai.defineTool({
  name: 'shouldIncludeExternalResources',
  description: 'Determines whether to include external educational resources in the answer to the question.',
  inputSchema: z.object({
    question: z.string().describe('The question the student is asking.'),
  }),
  outputSchema: z.boolean(),
  async fn(input) {
    // Implement logic to determine if external resources are needed based on the question.
    // For simplicity, let's assume external resources are needed for complex questions.
    return input.question.length > 100;
  },
});

const getExternalResourceTool = ai.defineTool({
  name: 'getExternalResource',
  description: 'Retrieves an external educational resource related to the question.',
  inputSchema: z.object({
    question: z.string().describe('The question the student is asking.'),
  }),
  outputSchema: z.string().describe('An external educational resource related to the question.'),
  async fn(input) {
    // Implement logic to retrieve an external educational resource based on the question.
    // This could involve calling an external API or querying a database.
    return `External resource related to the question: ${input.question}`;
  },
});

const prompt = ai.definePrompt({
  name: 'answerStudentQuestionPrompt',
  input: {schema: AnswerStudentQuestionInputSchema},
  output: {schema: AnswerStudentQuestionOutputSchema},
  tools: [shouldIncludeExternalResourcesTool, getExternalResourceTool],
  prompt: `You are an AI assistant helping a student with their question.

  Student Question: {{{question}}}

  Answer the question clearly and concisely. If the shouldIncludeExternalResources tool returns true, use the getExternalResource tool to include an external educational resource in your answer.
  studentId: {{{studentId}}}
  moduleName: {{{moduleName}}}
  `,
  system: `You are an expert in all fields of education.  You are able to answer any question a student asks.

  If the student's question is unclear, ask clarifying questions before answering.

  If the shouldIncludeExternalResources tool returns true, you MUST use the getExternalResource tool to include an external educational resource in your answer.

  Make sure that your answer is tailored to the student id: {{{studentId}}}, taking into account their progress in module: {{{moduleName}}}, by using the getStudentProgress service in src/services/lms.ts

  You must return the answer in markdown format.
  `,
});

const answerStudentQuestionFlow = ai.defineFlow(
  {
    name: 'answerStudentQuestionFlow',
    inputSchema: AnswerStudentQuestionInputSchema,
    outputSchema: AnswerStudentQuestionOutputSchema,
  },
  async input => {
    const response = await prompt(input); // response is GenerateResponse<AnswerStudentQuestionOutput>
    const llmOutput = response.output; // llmOutput is AnswerStudentQuestionOutput | undefined
    const responseMetadata = response.metadata;

    if (!llmOutput || typeof llmOutput.answer !== 'string') {
      // Ensure answer is present and is a string, as per schema.
      // This check helps prevent schema validation errors downstream.
      throw new Error('LLM did not provide a valid answer string.');
    }

    const calculatedUsedExternalResources = responseMetadata?.toolCalls?.some(
      toolCall => toolCall.name === 'getExternalResource'
    );

    return {
      answer: llmOutput.answer,
      usedExternalResources: calculatedUsedExternalResources ?? false,
    };
  }
);
