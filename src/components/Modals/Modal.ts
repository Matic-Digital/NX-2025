import { z } from 'zod';
import { HubspotFormSchema } from '@/components/HubspotForm/HubspotFormSchema';

export const ModalSchema = z.object({
  sys: z
    .object({
      id: z.string()
    })
    .optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  form: HubspotFormSchema.optional()
});

export type Modal = z.infer<typeof ModalSchema>;
