import { z } from 'zod';

export const ModalSchema = z.object({
  sys: z
    .object({
      id: z.string()
    })
    .optional(),
  title: z.string().optional(),
  description: z.string().optional()
});

export type Modal = z.infer<typeof ModalSchema>;
