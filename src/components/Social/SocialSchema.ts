import { z } from 'zod';

export const SocialSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  link: z.string(),
  icon: z.object({
    url: z.string(),
    title: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional()
  }),
  __typename: z.string().optional()
});

export type Social = z.infer<typeof SocialSchema>;

export interface SocialResponse {
  items: Array<Social>;
  total: number;
}
