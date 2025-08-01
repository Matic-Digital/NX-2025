/**
 * Raw response structure from Contentful GraphQL API
 * @template T - The type of data in the response
 * @property data - Contains the response data if request succeeds
 * @property errors - Contains error details if request fails
 */
export interface GraphQLResponse<T> {
  data?: {
    bannerHeroCollection?: {
      items: T[];
      total: number;
    };
    ctaBannerCollection?: {
      items: T[];
      total: number;
    };
    pageCollection?: {
      items: T[];
      total: number;
    };
    pageListCollection?: {
      items: T[];
      total: number;
    };
    headerCollection?: {
      items: T[];
      total: number;
    };
    footerCollection?: {
      items: T[];
      total: number;
    };
  };
  errors?: Array<{
    message: string;
    locations: Array<{
      line: number;
      column: number;
    }>;
  }>;
}
