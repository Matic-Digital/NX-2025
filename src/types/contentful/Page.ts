import type { CtaBanner } from './CtaBanner';
import type { ContentGrid } from './ContentGrid';
import type { Footer } from './Footer';
import type { Header } from './Header';
import type { BannerHero } from './BannerHero';
import type { SectionHeading } from './SectionHeading';

export interface Page {
  sys: {
    id: string;
  };
  name: string;
  slug: string;
  description?: string;
  header?: Header;
  footer?: Footer;
  pageContentCollection?: {
    items: (CtaBanner | ContentGrid | BannerHero | SectionHeading)[];
  };
  __typename?: string;
}

export interface PageResponse {
  items: Page[];
  total: number;
}
