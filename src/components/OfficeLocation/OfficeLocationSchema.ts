import { z } from 'zod';
import { ImageSchema } from '../Image/ImageSchema';

export const OfficeLocationSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  image: ImageSchema,
  country: z.string(),
  city: z.string(),
  state: z.string().optional(),
  address: z.string(),
  phone: z.string().optional(),
  __typename: z.string()
});

export type OfficeLocation = z.infer<typeof OfficeLocationSchema>;

export interface OfficeLocationResponse {
  items: OfficeLocation[];
}
