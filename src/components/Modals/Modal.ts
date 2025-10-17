import { z } from 'zod';

import { HubspotFormSchema } from '@/components/Forms/HubspotForm/HubspotFormSchema';

export const ModalSchema = z.object({
  sys: z
    .object({
      id: z.string()
    })
    .optional(),
  title: z.string(),
  description: z.string(),
  form: HubspotFormSchema.optional()
});

export type Modal = z.infer<typeof ModalSchema>;
