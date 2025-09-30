import { z } from 'zod';

// Content type options as defined in the content model
const ContentTypeSchema = z.enum(['Post', 'Page', 'Product', 'Solution', 'Service']);

// Pagination options as defined in the content model
const PaginationSchema = z.enum(['Default']);

export const CollectionSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  contentType: z.array(ContentTypeSchema).optional(),
  itemsPerPage: z.number().optional(),
  searchBar: z.boolean().optional(),
  pagination: z.array(PaginationSchema).optional(),
  contentfulMetadata: z
    .object({
      tags: z.array(
        z.object({
          id: z.string(),
          name: z.string()
        })
      )
    })
    .optional(),
  __typename: z.string().optional()
});

export interface CollectionResponse {
  items: Collection[];
}

export type Collection = z.infer<typeof CollectionSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type PaginationType = z.infer<typeof PaginationSchema>;
