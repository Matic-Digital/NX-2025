import { Box } from '../global/matic-ds';
import { AirImage } from '../Image/AirImage';
import Link from 'next/link';

import { ArrowUpRight } from 'lucide-react';

interface MegaMenuCardProps {
  kicker: string;
  title: string;
  imageUrl: string;
  altText: string;
  link: string;
  fullHeight?: boolean;
}

export function MegaMenuCard({
  kicker,
  title,
  imageUrl,
  altText,
  link,
  fullHeight = false
}: MegaMenuCardProps) {
  return (
    <Link href={link} className="block group">
      <Box
        direction="col"
        className={`relative cursor-pointer ${fullHeight ? 'h-full' : 'h-[21.25rem]'}`}
      >
        <AirImage
          link={imageUrl}
          altText={altText}
          className="min-h-[16rem] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />
        <Box direction="col" gap={0} className="absolute inset-0 w-full h-full justify-between">
          <p className="text-[0.875rem] font-medium text-white leading-[120%] tracking-[0.00875rem] uppercase pl-[1.25rem] pt-[1.25rem]">
            {kicker}
          </p>
          <div className="relative">
            <div className="pl-[1.25rem] pr-[5rem] pb-[1rem]">
              <p className="text-[1.5rem] font-medium text-white leading-[120%] tracking-[0.015rem] line-clamp-3 overflow-hidden max-h-[5.4rem]">
                {title}
              </p>
            </div>
            <Box className="absolute bottom-0 right-0 bg-white group-hover:bg-primary p-[0.5rem] transition-colors">
              <ArrowUpRight className="size-14 stroke-1 text-black group-hover:text-white transition-colors" />
            </Box>
          </div>
        </Box>
      </Box>
    </Link>
  );
}
