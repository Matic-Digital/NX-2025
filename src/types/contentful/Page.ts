import type { CtaBanner } from './CtaBanner';
import type { FeaturesGrid } from './FeaturesGrid';
import type { Footer } from './Footer';
import type { Header } from './Header';
import type { Hero } from './Hero';
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
    items: (CtaBanner | FeaturesGrid | Hero | SectionHeading)[];
  };
  __typename?: string;
}

export interface PageResponse {
  items: Page[];
  total: number;
}
