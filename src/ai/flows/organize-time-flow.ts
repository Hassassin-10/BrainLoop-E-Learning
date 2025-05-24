
'use server';
/**
 * @fileOverview An AI agent for providing time organization suggestions.
 *
 * - organizeTime - A function that analyzes a schedule and provides suggestions.
 * - OrganizeTimeInput - The input type for the organizeTime function.
 * - OrganizeTimeOutput - The return type for the organizeTime function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { OrganizeTimeInput, OrganizeTimeOutput, OrganizeTimeEventInput } from '@/types/timetable';

const OrganizeTimeEventSchema = z.object({
  title: z.string().describe('The title of the event.'),
  dayOfWeek: z.string().describe('The day of the week for the event (e.g., Monday, Tuesday).'),
  startTime: z.string().describe('The start time of the event (HH:MM format).'),
  endTime: z.string().describe('The end time of the event (HH:MM format).'),
  description: z.string().optional().describe('A brief description of the event.'),
});

const OrganizeTimeInputSchema = z.object({
  events: z.array(OrganizeTimeEventSchema).describe('A list of events in the user schedule.'),
  userGoals: z.string().optional().describe('Optional user-defined goals or priorities for their time management (e.g., "Study more for Math", "Find time for exercise").'),
});

const OrganizeTimeOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of actionable suggestions to help organize or optimize the provided schedule.'),
});

export async function organizeTime(input: OrganizeTimeInput): Promise<OrganizeTimeOutput> {
  return organizeTimeFlow(input);
}

function formatEventsForPrompt(events: OrganizeTimeEventInput[]): string {
  if (events.length === 0) {
    return "The user has no scheduled events.";
  }
  // Group events by day
  const eventsByDay: Record<string, OrganizeTimeEventInput[]> = events.reduce((acc, event) => {
    (acc[event.dayOfWeek] = acc[event.dayOfWeek] || []).push(event);
    return acc;
  }, {});

  let promptString = "Here is the current schedule:\n";
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  for (const day of daysOrder) {
    if (eventsByDay[day] && eventsByDay[day].length > 0) {
      promptString += `\n${day}:\n`;
      // Sort events by start time within each day
      eventsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (const event of eventsByDay[day]) {
        promptString += `  - ${event.title} (${event.startTime} - ${event.endTime})${event.description ? `: ${event.description}` : ''}\n`;
      }
    }
  }
  return promptString;
}

const prompt = ai.definePrompt({
  name: 'organizeTimePrompt',
  input: { schema: OrganizeTimeInputSchema },
  output: { schema: OrganizeTimeOutputSchema },
  prompt: `You are an expert time management assistant and productivity coach.
Your goal is to help the user organize their time more effectively based on their current schedule and (if provided) their goals.

Current Schedule:
{{{formatEventsForPrompt events}}}

{{#if userGoals}}
User's Goals/Priorities:
{{userGoals}}
{{else}}
The user has not specified any particular goals. Focus on general time management best practices, identifying potential conflicts, suggesting breaks, or grouping similar tasks.
{{/if}}

Based on this information, provide a list of 3-5 actionable and concise suggestions to help the user optimize their schedule, improve productivity, or better align with their goals.
If the schedule is very empty, suggest ways to structure it. If it's very packed, suggest ways to manage workload or find efficiencies.
Focus on practical advice. For example, suggest specific times for new activities if relevant, or point out potential overload on certain days.

Suggestions:
`,
  // Register the custom Handlebars helper
  handlebars: {
    helpers: {
      formatEventsForPrompt: formatEventsForPrompt
    }
  }
});

const organizeTimeFlow = ai.defineFlow(
  {
    name: 'organizeTimeFlow',
    inputSchema: OrganizeTimeInputSchema,
    outputSchema: OrganizeTimeOutputSchema,
  },
  async (input) => {
    // The formatEventsForPrompt helper will be automatically used by Handlebars
    // due to its registration in ai.definePrompt.
    // So, we directly pass the input to the prompt.
    const { output } = await prompt(input);

    if (!output || !output.suggestions || output.suggestions.length === 0) {
      return { suggestions: ["I couldn't generate specific suggestions right now. Try to ensure your schedule has some entries, or clarify your goals." ] };
    }
    return output;
  }
);
