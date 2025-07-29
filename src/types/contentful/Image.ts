import { z } from 'zod';

// an image from AIR DAM
export const ImageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  internalName: z.string(),
  link: z.string(),
  altText: z.string().optional(),
  __typename: z.string().optional()
});

export type Image = z.infer<typeof ImageSchema>;

export interface ImageResponse {
  items: Image[];
}
