import { z } from 'zod';

// an image from AIR DAM - handle broken references gracefully
export const ImageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  link: z.string().optional(),
  altText: z.string().optional(),
  __typename: z.string().optional()
});

export type Image = z.infer<typeof ImageSchema>;

export interface ImageResponse {
  items: Image[];
}
