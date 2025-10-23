import { z } from 'zod';

// TestimonialItem schema for linked entries
export const TestimonialItemSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.literal('TestimonialItem').optional(),
  title: z.string(),
  quote: z.string(),
  authorName: z.string().optional(),
  authorTitle: z.string().optional(),
  headshot: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.literal('Image').optional(),
      title: z.string().optional(),
      link: z.string().optional(),
      altText: z.string().nullable().optional()
    })
    .optional()
});

export const TestimonialsSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  __typename: z.literal('Testimonials').optional(),
  title: z.string(),
  itemsCollection: z.object({
    items: z.array(TestimonialItemSchema)
  })
});

export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;
export type Testimonials = z.infer<typeof TestimonialsSchema>;
