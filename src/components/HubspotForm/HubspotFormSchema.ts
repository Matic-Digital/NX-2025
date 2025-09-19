import { z } from 'zod';

export const HubspotFormSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  formLink: z.string(),
  __typename: z.string().optional()
});

export type HubspotForm = z.infer<typeof HubspotFormSchema>;

export interface HubspotFormResponse {
  items: HubspotForm[];
}
