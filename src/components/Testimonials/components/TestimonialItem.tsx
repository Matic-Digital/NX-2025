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
    <Box key={item.sys?.id} direction="row" className="w-full bg-subtle h-full min-h-[320px] flex items-stretch">
        {item.headshot && (
      <Box className="bg-blue relative overflow-hidden aspect-square min-w-[7.125rem] w-20 flex-shrink-0 sm:w-24 md:w-28">
          <AirImage
            {...item.headshot}
            altText={item.headshot?.altText ?? undefined}
            className="w-full h-full object-cover"
          />
      </Box>
        )}
      <Box direction="col" className="h-full justify-between p-[1.5rem] flex-1 flex flex-col">
        <blockquote className="text-body-sm flex-1">{item.quote}</blockquote>
        <Box direction="col" className="mt-4">
          <p className="text-body-sm text-black">{item.authorName}</p>
          <p className="text-body-xs text-black opacity-80">{item.authorTitle}</p>
        </Box>
      </Box>
    </Box>
  );
};
