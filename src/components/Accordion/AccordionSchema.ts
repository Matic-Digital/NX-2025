import { z } from 'zod';

import { ButtonSchema } from '@/components/Button/ButtonSchema';

export const AccordionVariantEnum = z.enum(['FullWidth', 'ThreeColumn']);
export type AccordionVariant = z.infer<typeof AccordionVariantEnum>;

export const AccordionItemVariantEnum = z.enum([
  'ContentTop',
  'ContentRight',
  'ContentBottom',
  'ContentLeft'
]);
export type AccordionItemVariant = z.infer<typeof AccordionItemVariantEnum>;

export const AccordionItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  overline: z.string().optional(),
  title: z.string(),
  description: z.string(),
  variant: AccordionItemVariantEnum,
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
  gridVariant: AccordionVariantEnum,
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
