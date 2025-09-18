import { z } from 'zod';

export type AccordionVariant = 'ContentLeft' | 'ContentRight';

export const AccordionItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  overline: z.string().optional(),
  title: z.string(),
  description: z.string(),
  image: z.object({
    sys: z.object({
      id: z.string()
    })
  }),
  tags: z.array(z.string()).optional(),
  variant: z.string(),
  __typename: z.string().optional()
});

export type AccordionItem = z.infer<typeof AccordionItemSchema>;

// Schema for accordion item references (only sys fields)
export const AccordionItemReferenceSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.string().optional()
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
  __typename: z.string().optional()
});

export type Accordion = z.infer<typeof AccordionSchema>;

export interface AccordionResponse {
  items: Array<Accordion>;
  total: number;
}
