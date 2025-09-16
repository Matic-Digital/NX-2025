import { z } from 'zod';
import { ContentGridItemSchema } from '../../types/contentful/ContentGridItem';

export const AccordionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(ContentGridItemSchema)
  }),
  __typename: z.string().optional()
});

export type AccordionSchema = z.infer<typeof AccordionSchema>;
