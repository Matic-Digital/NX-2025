import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';

export const HeaderSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  name: z.string(),
  logo: AssetSchema,
  menu: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.string()
    })
    .optional(),
  search: z.boolean().optional(),
  overflow: z
    .object({
      sys: z.object({
        id: z.string()
      }),
      __typename: z.string()
    })
    .optional(),
  __typename: z.string().optional()
});

export type Header = z.infer<typeof HeaderSchema>;

export interface HeaderResponse {
  items: Array<Header>;
  total: number;
}
