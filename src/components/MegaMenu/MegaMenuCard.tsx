import { Box } from '../global/matic-ds';
import AirImage from '../Image/AirImage';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface MegaMenuCardProps {
  kicker: string;
  title: string;
  imageUrl: string;
  altText: string;
  link: string;
  fullHeight?: boolean;
}

export function MegaMenuCard({ kicker, title, imageUrl, altText, link, fullHeight = false }: MegaMenuCardProps) {
  return (
    <Link href={link} className="block group">
      <Box direction="col" className={`relative cursor-pointer ${fullHeight ? 'h-full' : 'h-[21.25rem]'}`}>
        <AirImage 
          link={imageUrl}
          altText={altText}
          className="min-h-[16rem] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />
        <Box direction="col" gap={0} className="absolute pl-[1.25rem] pt-[1.25rem] w-full h-full justify-between">
          <p className="text-[0.875rem] font-medium text-white leading-[120%] tracking-[0.00875rem] uppercase">{kicker}</p>
          <Box className="flex justify-between items-center">
              <p className="text-[1.75rem] font-medium text-white leading-[120%] tracking-[0.0175rem]">{title}</p>
              <Box className="bg-white group-hover:bg-primary p-[0.5rem] transition-colors">
                  <ArrowUpRight className="size-14 stroke-1 text-black group-hover:text-white transition-colors" />
              </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}