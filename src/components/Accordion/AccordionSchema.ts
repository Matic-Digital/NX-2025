import { z } from 'zod';

import { ButtonSchema } from '@/components/Button/ButtonSchema';

export const AccordionVariantEnum = z.enum([
  'ContentTop',
  'ContentRigh',
  'ContentBottom',
  'ContentLeft'
]);
export type AccordionVariant = z.infer<typeof AccordionVariantEnum>;

export const AccordionItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  overline: z.string().optional(),
  title: z.string(),
  description: z.string(),
  variant: z.string(),
  tags: z.array(z.string()).optional(),
  image: z.object({
    sys: z.object({
      id: z.string()
    })
  }),
  backgroundImage: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      link: z.string()
    })
    .optional(),
  cta: ButtonSchema.optional(),
  __typename: z.string()
});

export type AccordionItem = z.infer<typeof AccordionItemSchema>;

// Schema for accordion item references (only sys fields)
export const AccordionItemReferenceSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string()
});

export type AccordionItemReference = z.infer<typeof AccordionItemReferenceSchema>;

export const AccordionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(AccordionItemReferenceSchema)
  }),
  __typename: z.string()
});

export type Accordion = z.infer<typeof AccordionSchema>;

export interface AccordionResponse {
  items: Array<Accordion>;
  total: number;
}
