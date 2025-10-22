import { z } from 'zod';

import { ImageSchema } from '@/components/Image/ImageSchema';

// Profile schema for embedded profile content
export const ProfileSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  asset: ImageSchema.optional(),
  name: z.string().optional(),
  profileLocation: z.string().optional(),
  description: z.string().optional(),
  __typename: z.string().optional()
});

export type Profile = z.infer<typeof ProfileSchema>;

export interface ProfileResponse {
  items: Profile[];
}
