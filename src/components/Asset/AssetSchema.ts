import { z } from 'zod';

// an image from Contentful Media
export const AssetSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  description: z.string(),
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional()
});

export type Asset = z.infer<typeof AssetSchema>;
