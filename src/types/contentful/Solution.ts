import { z } from 'zod';
import { ImageSchema } from './Image';
import { ButtonSchema } from './Button';

export const SolutionSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export type SolutionSys = z.infer<typeof SolutionSysSchema>;

// a video from Mux
export const SolutionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  heading: z.string(),
  subheading: z.string(),
  cardTitle: z.string(),
  description: z.string(),
  backgroundImage: ImageSchema,
  cta: ButtonSchema,
  variant: z.string(),
  __typename: z.string().optional()
});

export type Solution = z.infer<typeof SolutionSchema>;

export interface SolutionResponse {
  items: Solution[];
}
