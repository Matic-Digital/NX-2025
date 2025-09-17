/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import z from 'zod';

export const PageLayoutSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  header: z.lazy(() => require('./Header').HeaderSchema).optional(),
  footer: z.lazy(() => require('./Footer').FooterSchema).optional(),
  __typename: z.string().optional()
});

export type PageLayout = z.infer<typeof PageLayoutSchema>;

export interface PageLayoutResponse {
  items: PageLayout[];
}
