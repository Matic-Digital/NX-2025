import { z } from 'zod';

/**
 * Contentful Locale Schema
 */
export const LocaleSchema = z.object({
  code: z.string(),
  name: z.string(),
  default: z.boolean().optional(),
  fallbackCode: z.string().optional()
});

/**
 * LocaleDropdown Component Schema
 */
export const LocaleDropdownSchema = z.object({
  currentLocale: z.string().optional(),
  className: z.string().optional()
});

export type Locale = z.infer<typeof LocaleSchema>;
export type LocaleDropdownProps = z.infer<typeof LocaleDropdownSchema>;
