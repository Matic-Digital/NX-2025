/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { PageLayoutSchema } from '@/components/PageLayout/PageLayoutSchema';
import { AgendaItemSchema } from '@/components/AgendaItem/AgendaItemSchema';

// Event template options as defined in the content model
const EventTemplateSchema = z.enum(['Landing 1', 'Landing 2', 'Landing 3', 'Agenda']);

// Contact location options
const ContactLocationSchema = z.enum([
  'Americas',
  'Europe', 
  'Latin America',
  'Australian Pacific',
  'Middle East, India, & North Africa'
]);

export const EventSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  dateIcon: AssetSchema.optional(),
  dateTime: z.string(),
  endDateTime: z.string().optional(),
  link: z.object({
    sys: z.object({
      id: z.string()
    }),
    slug: z.string().optional(),
    __typename: z.string().optional()
  }).optional(),
  addressIcon: AssetSchema.optional(),
  address: z.string().optional(),
  addressSubline: z.string().optional(),
  agendaHeadline: z.string().optional(),
  agendaItemsCollection: z.object({
    items: z.array(AgendaItemSchema)
  }).optional(),
  agendaFooter: z.string().optional(),
  layout: PageLayoutSchema.optional(),
  template: EventTemplateSchema.default('Landing 1'),
  bannerImage: ImageSchema.optional(),
  mainImage: ImageSchema,
  mainImageCaption: z.string().optional(),
  contactLocation: ContactLocationSchema.optional(),
  __typename: z.string().optional()
});

export type Event = z.infer<typeof EventSchema>;
export type EventTemplate = z.infer<typeof EventTemplateSchema>;
export type ContactLocation = z.infer<typeof ContactLocationSchema>;

export interface EventResponse {
  items: Event[];
}
