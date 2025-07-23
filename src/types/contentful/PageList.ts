import type { Page } from './Page';
import type { Header } from './Header';
import type { Footer } from './Footer';
import type { Hero } from './Hero';
import type { CtaBanner } from './CtaBanner';

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
    items: (Hero | CtaBanner)[];
  };
  footer?: Footer;
  __typename?: string;
}

export interface PageListResponse {
  items: Array<PageList>;
  total: number;
}
