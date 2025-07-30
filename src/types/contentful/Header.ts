import type { Asset } from './Asset';
import type { Page } from './Page';
import type { PageList } from './PageList';

export interface Header {
  sys: {
    id: string;
  };
  name?: string;
  logo?: Asset;
  navLinksCollection?: {
    items: Array<Page | PageList>;
  };
  __typename?: string;
}

export interface HeaderResponse {
  items: Array<Header>;
  total: number;
}
