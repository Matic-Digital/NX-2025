import { z } from 'zod';

// Mobile Origin options for image alignment
export const MobileOriginSchema = z.enum(['Left', 'Center', 'Right']);

export const ImageSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  link: z.string(),
  altText: z.string().optional(),
  mobileOrigin: MobileOriginSchema.optional(),
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
  mobileOrigin: MobileOriginSchema.optional(),
  className: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  priority: z.boolean().optional(),
  __typename: z.string().optional()
});

export type Image = z.infer<typeof ImageSchema>;
export type AirImage = z.infer<typeof AirImageSchema>;
export type MobileOrigin = z.infer<typeof MobileOriginSchema>;

export interface ImageResponse {
  items: Image[];
}
