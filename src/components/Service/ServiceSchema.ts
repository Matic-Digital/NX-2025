import { z } from 'zod';

import { BannerHeroSchema } from '@/components/BannerHero/BannerHeroSchema';
import { ContentSchema } from '@/components/Content/ContentSchema';
import { ContentGridSchema } from '@/components/ContentGrid/ContentGridSchema';
import { CtaBannerSchema } from '@/components/CtaBanner/CtaBannerSchema';
import { ImageSchema } from '@/components/Image/ImageSchema';
import { PageLayoutSchema } from '@/components/PageLayout/PageLayoutSchema';

const ServiceContentUnion = z.union([
  BannerHeroSchema,
  ContentGridSchema,
  ContentSchema,
  CtaBannerSchema
]);

export type ServiceContent = z.infer<typeof ServiceContentUnion>;

export const ServiceSchema = z.object({
  sys: z.object({
    id: z.string()
  }),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  pageLayout: PageLayoutSchema.optional(),
  itemsCollection: z
    .object({
      items: z.array(ServiceContentUnion)
    })
    .optional(),
  __typename: z.string().optional(),
  cardImage: ImageSchema.optional(),
  cardTitle: z.string().optional(), // for backward compatibility
  cardTags: z.array(z.string()).optional(), // for backward compatibility
  cardButtonText: z.string().optional() // for backward compatibility
});

export type Service = z.infer<typeof ServiceSchema>;

export interface ServiceResponse {
  items: Service[];
}
