import { Box } from '@/components/global/matic-ds';

import { AirImage } from '@/components/Image/AirImage';

import type { ContentSliderItem as ContentSliderItemType } from '@/components/Slider/components/ContentSliderItemSchema';

interface ContentSliderItemProps {
  item: ContentSliderItemType;
  className?: string;
}

export function ContentSliderItem({ item, className }: ContentSliderItemProps) {
  console.log('ContentSliderItem', item);
  return (
    <Box direction="col">
      <AirImage link={item.image?.link} altText={item.image?.altText} className="h-full w-full" />
      <Box direction="col" gap={2}>
        <h3 className="text-text-body text-headline-sm">{item.title}</h3>
        <p className="text-text-subtle text-body-xs">{item.description}</p>
      </Box>
    </Box>
  );
}
