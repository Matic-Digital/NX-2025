import { z } from 'zod';
import { ImageSchema } from '../../components/Image/ImageSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';

export const SolutionSysSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  __typename: z.string().optional()
});

export type SolutionSys = z.infer<typeof SolutionSysSchema>;

export const SolutionSchema = z.object({
  sys: z.object({
    id: z.string(),
    contentType: z
      .object({
        sys: z.object({
          id: z.string()
        })
      })
      .optional(),
    updatedAt: z.string().optional()
  }),
  title: z.string(),
  slug: z.string(),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  cardTitle: z.string().optional(),
  description: z.string(),
  backgroundImage: ImageSchema.optional(),
  cta: ButtonSchema.optional(),
  pageLayout: z.unknown().optional(),
  itemsCollection: z
    .object({
      items: z.array(z.unknown())
    })
    .optional(),
  variant: z.string().optional(),
  __typename: z.string().optional()
});

export type Solution = z.infer<typeof SolutionSchema>;

export interface SolutionResponse {
  items: Solution[];
}
