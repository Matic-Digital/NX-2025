import type { CtaBanner } from './CtaBanner';
import type { ContentGrid } from './ContentGrid';
import type { Footer } from './Footer';
import type { Header } from './Header';
import type { Hero } from './Hero';
import type { Page } from './Page';
import type { SectionHeading } from './SectionHeading';

export interface PageList {
  sys: {
    id: string;
  };
  name?: string;
  slug?: string;
  pagesCollection?: {
    items: Array<Page>;
  };
  header?: Header;
  pageContentCollection?: {
    items: (CtaBanner | ContentGrid | Hero | SectionHeading)[];
  };
  footer?: Footer;
  __typename?: string;
}

export interface PageListResponse {
  items: Array<PageList>;
  total: number;
}
