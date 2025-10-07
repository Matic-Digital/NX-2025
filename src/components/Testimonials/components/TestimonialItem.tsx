import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';

import type { TestimonialItem as TestimonialItemType } from '@/components/Testimonials/TestimonialsSchema';

interface TestimonialItemProps {
  item: TestimonialItemType;
}

/**
 * Individual testimonial item component
 */
export const TestimonialItem = ({ item }: TestimonialItemProps) => {
  return (
    <Box key={item.sys?.id} direction="row" className="w-full">
      <Box className="bg-blue relative overflow-hidden aspect-square w-20 flex-shrink-0 sm:w-24 md:w-28">
        <AirImage
          {...item.headshot}
          altText={item.headshot?.altText ?? undefined}
          className="w-full h-full object-cover"
        />
      </Box>
      <Box direction="col" className="bg-subtle h-full justify-between p-[1.5rem]">
        <blockquote className="text-body-sm">{item.quote}</blockquote>
        <Box direction="col">
          <p className="text-body-sm text-black">{item.authorName}</p>
          <p className="text-body-xs text-black opacity-80">{item.authorTitle}</p>
        </Box>
      </Box>
    </Box>
  );
};
