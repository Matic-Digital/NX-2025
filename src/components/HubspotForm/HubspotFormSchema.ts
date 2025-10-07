import { z } from 'zod';

export const HubspotFormSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string().optional(),
  formId: z.string(),
  __typename: z.string().optional()
});

export type HubspotForm = z.infer<typeof HubspotFormSchema>;

export interface HubspotFormResponse {
  items: HubspotForm[];
}

// Helper function to get form ID from HubspotForm
export function getFormIdFromHubspotForm(hubspotForm: HubspotForm): string {
  return hubspotForm.formId;
}
