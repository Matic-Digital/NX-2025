import { z } from 'zod';

export const ContentVariantEnum = z.enum(['ContentLeft', 'ContentCenter', 'ContentRight']);

export type ContentVariant = z.infer<typeof ContentVariantEnum>;
