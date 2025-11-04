 
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
