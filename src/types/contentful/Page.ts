import type { CtaBanner } from './CtaBanner';
import type { Hero } from './Hero';
import type { Header } from './Header';
import type { Footer } from './Footer';

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
    items: (Hero | CtaBanner)[];
  };
  __typename?: string;
}

export interface PageResponse {
  items: Page[];
  total: number;
}
