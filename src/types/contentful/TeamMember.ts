import { z } from 'zod';
import { ImageSchema } from './Image';

// Team member schema (referenced by authors)
export const TeamMemberSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string(),
  jobTitle: z.string(),
  image: ImageSchema,
  bio: z
    .object({
      json: z.any()
    })
    .optional(),
  email: z.string().optional(),
  linkedIn: z.string().optional(),
  __typename: z.string().optional()
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export interface TeamMemberResponse {
  items: TeamMember[];
}
