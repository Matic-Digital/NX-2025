import { z } from 'zod';

export const EventSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  dateTime: z.string(),
  link: z.string(),
  __typename: z.string()
});

export type Event = z.infer<typeof EventSchema>;

export interface EventResponse {
  items: Event[];
}
