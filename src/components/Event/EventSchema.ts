/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, import/no-dynamic-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { z } from 'zod';

import { AssetSchema } from '@/components/Asset/AssetSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { PageLayoutSchema } from '@/components/PageLayout/PageLayoutSchema';
import { AgendaItemSchema } from '@/components/AgendaItem/AgendaItemSchema';
import { HubspotFormSchema } from '@/components/Forms/HubspotForm/HubspotFormSchema';
import { PostSchema } from '@/components/Post/PostSchema';
import { ButtonSchema } from '@/components/Button/ButtonSchema';
import { VideoSchema } from '@/components/Video/VideoSchema';
import { OfficeLocationSchema } from '@/components/OfficeLocation/OfficeLocationSchema';
import { ContactCardSchema } from '@/components/ContactCard/ContactCardSchema';
import { SliderSysSchema } from '@/components/Slider/SliderSchema';

// Event template options as defined in the content model
const EventTemplateSchema = z.enum(['Landing 1', 'Landing 2', 'Landing 3', 'Agenda']);


export const EventSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  dateIcon: AssetSchema.optional(),
  dateTime: z.string(),
  endDateTime: z.string().optional(),
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
  mainImage: ImageSchema.optional(),
  mainImageCaption: z.string().optional(),
  formCta: HubspotFormSchema.optional(),
  referencedPostsCollection: z.object({
    items: z.array(PostSchema)
  }).optional(),
  sectionHeadingTitle: z.string().optional(),
  sectionHeadingDescription: z.string().optional(),
  sectionHeadingButton: ButtonSchema.optional(),
  landing1Asset: z.union([ImageSchema, VideoSchema]).optional(),
  sectionRichContent: z.object({
    json: z.unknown()
  }).optional(),
  contactHeadline: z.string().optional(),
  officeLocation: OfficeLocationSchema.optional(),
  contactCardsCollection: z.object({
    items: z.array(ContactCardSchema)
  }).optional(),
  slider: SliderSysSchema.optional(),
  __typename: z.string().optional()
});

export type Event = z.infer<typeof EventSchema>;
export type EventTemplate = z.infer<typeof EventTemplateSchema>;

export interface EventResponse {
  items: Event[];
}
