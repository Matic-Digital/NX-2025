import { z } from 'zod';

// Agenda item schema for event pages
export const AgendaItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  time: z.string(), // Date field from Contentful comes as ISO string
  description: z.string(),
  __typename: z.string().optional()
});

export type AgendaItem = z.infer<typeof AgendaItemSchema>;

export interface AgendaItemResponse {
  items: AgendaItem[];
}
