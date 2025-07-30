export interface Hero {
  sys: {
    id: string;
  };
  name?: string;
  heroHeader?: string;
  description?: string;
  __typename?: string;
}

export interface HeroResponse {
  items: Hero[];
  total: number;
}
