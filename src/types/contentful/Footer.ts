import { z } from 'zod';

import type { PageList } from './PageList';

export interface Footer {
  sys: {
    id: string;
  };
  title: string;
  description?: string;
  pageListsCollection?: {
    items: Array<PageList>;
  };
  copyright?: string;
  logo?: {
    url: string;
    title?: string;
    width?: number;
    height?: number;
  };
  __typename?: string;
}

export interface FooterResponse {
  items: Array<Footer>;
  total: number;
}
