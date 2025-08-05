import { z } from 'zod';
import { ImageSchema } from './Image';

export const SolutionSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

// a video from Mux
export const SolutionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  cardHeading: z.string(),
  cardSubheading: z.string(),
  cardTitle: z.string(),
  cardDescription: z.string(),
  cardBackgroundImage: ImageSchema,
  __typename: z.string().optional()
});

export type Solution = z.infer<typeof SolutionSchema>;
export type SolutionSys = z.infer<typeof SolutionSysSchema>;

export interface SolutionResponse {
  items: Solution[];
}
