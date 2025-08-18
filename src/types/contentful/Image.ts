import { z } from 'zod';

// an image from AIR DAM
export const ImageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  link: z.string(),
  altText: z.string().optional(),
  __typename: z.string().optional()
});

export const AirImageSchema = z.object({
  sys: z
    .object({
      id: z.string()
    })
    .optional(),
  title: z.string().optional(),
  link: z.string().optional(),
  altText: z.string().optional(),
  className: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  priority: z.boolean().optional(),
  __typename: z.string().optional()
});

export type Image = z.infer<typeof ImageSchema>;
export type AirImage = z.infer<typeof AirImageSchema>;

export interface ImageResponse {
  items: Image[];
}
