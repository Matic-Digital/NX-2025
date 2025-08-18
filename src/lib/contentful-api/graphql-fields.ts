// Base fields
export const SYS_FIELDS = `
  sys {
    id
  }
  __typename
`;

export const ASSET_FIELDS = `
  title
  description
  url
  width
  height
  __typename
`;

export const INTERNAL_LINK_FIELDS = `
  ... on Page {
    sys { id }
    slug
  }
  ... on PageList {
    sys { id }
    slug
  }
  ... on Product {
    sys { id }
    slug
    __typename
  }
`;

// Define all fragments using lazy initialization pattern
const fragments = {
  PAGE_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    description
  `,

  HEADER_GRAPHQL_FIELDS: () => `
    ${SYS_FIELDS}
    name 
    logo { 
      ${ASSET_FIELDS} 
    } 
    navLinksCollection {
      items {
        ... on Page {
          ${fragments.PAGE_BASIC_FIELDS()}
        }
        ... on PageList {
          ${fragments.PAGELIST_BASIC_FIELDS()}
          pagesCollection {
            items {
              ... on Page {
                ${fragments.PAGE_BASIC_FIELDS()}
              }
            }
          }
        }
      }
    }
  `,

  FOOTER_GRAPHQL_FIELDS: () => `
    ${SYS_FIELDS}
    title
    logo { 
      ${ASSET_FIELDS} 
    } 
    description
    pageListsCollection(limit: 5) {
      items {
        ... on PageList {
          ${fragments.PAGELIST_BASIC_FIELDS()}
          pagesCollection(limit: 10) {
            items {
              ... on Page {
                ${fragments.PAGE_BASIC_FIELDS()}
              }
              ... on ExternalPage {
                ${fragments.EXTERNAL_PAGE_FIELDS()}
              }
              ... on Product {
                ${fragments.PRODUCT_BASIC_FIELDS()}
              }
              ... on Service {
                ${fragments.SERVICE_BASIC_FIELDS()}
              }
              ... on Solution {
                ${fragments.SOLUTION_BASIC_FIELDS()}
              }
              ... on Post {
                ${fragments.POST_BASIC_FIELDS()}
              }
            }
          }
        }
      }
    }
    copyright
    legalPageListsCollection(limit: 5) {
      items {
        ... on PageList {
          ${fragments.PAGELIST_BASIC_FIELDS()}
          pagesCollection(limit: 10) {
            items {
              ... on Page {
                ${fragments.PAGE_BASIC_FIELDS()}
              }
              ... on ExternalPage {
                ${fragments.EXTERNAL_PAGE_FIELDS()}
              }
              ... on Product {
                ${fragments.PRODUCT_BASIC_FIELDS()}
              }
              ... on Service {
                ${fragments.SERVICE_BASIC_FIELDS()}
              }
              ... on Solution {
                ${fragments.SOLUTION_BASIC_FIELDS()}
              }
              ... on Post {
                ${fragments.POST_BASIC_FIELDS()}
              }
            }
          }
        }
      }
    }
    socialNetworksCollection(limit: 5) {
      items {
        ... on Social {
          ${fragments.SOCIAL_BASIC_FIELDS()}
        }
      }
    }
  `,

  EXTERNAL_PAGE_FIELDS: () => `
    ${SYS_FIELDS}
    title
    link
  `,

  SOCIAL_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    link
    icon { 
      ${ASSET_FIELDS} 
    }
  `,

  PRODUCT_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  SERVICE_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  SOLUTION_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  POST_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  PAGELIST_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  PAGE_LAYOUT_GRAPHQL_FIELDS: () => `
    ${SYS_FIELDS}
    title
    pageLayout {
      header {
        ${SYS_FIELDS}
      }
      footer {
        ${SYS_FIELDS}
      }
    }
  `,

  PAGELIST_MINIMAL_FIELDS: () => `
    ${fragments.PAGELIST_BASIC_FIELDS()}
    pagesCollection(limit: 10) {
      items {
        ... on Page {
          ${fragments.PAGE_BASIC_FIELDS()}
        }
        ... on ExternalPage {
          ${fragments.EXTERNAL_PAGE_FIELDS()}
        }
        ... on Product {
          ${fragments.PRODUCT_BASIC_FIELDS()}
        }
        ... on Service {
          ${fragments.SERVICE_BASIC_FIELDS()}
        }
        ... on Solution {
          ${fragments.SOLUTION_BASIC_FIELDS()}
        }
        ... on Post {
          ${fragments.POST_BASIC_FIELDS()}
        }
      }
    }
  `,

  PAGELIST_WITH_REFS_FIELDS: () => `
    ${fragments.PAGELIST_MINIMAL_FIELDS()}
    ${fragments.PAGE_LAYOUT_GRAPHQL_FIELDS()}
  `,

  PAGE_WITH_REFS_FIELDS: () => `
    ${fragments.PAGE_BASIC_FIELDS()}
    ${fragments.PAGE_LAYOUT_GRAPHQL_FIELDS()}
  `
};

// Export getters to ensure proper initialization order
export const getPAGE_BASIC_FIELDS = () => fragments.PAGE_BASIC_FIELDS();
export const getPAGE_LAYOUT_GRAPHQL_FIELDS = () => fragments.PAGE_LAYOUT_GRAPHQL_FIELDS();
export const getPAGE_WITH_REFS_FIELDS = () => fragments.PAGE_WITH_REFS_FIELDS();

export const getPAGELIST_BASIC_FIELDS = () => fragments.PAGELIST_BASIC_FIELDS();
export const getPAGELIST_MINIMAL_FIELDS = () => fragments.PAGELIST_MINIMAL_FIELDS();
export const getPAGELIST_WITH_REFS_FIELDS = () => fragments.PAGELIST_WITH_REFS_FIELDS();

export const getHEADER_GRAPHQL_FIELDS = () => fragments.HEADER_GRAPHQL_FIELDS();
export const getFOOTER_GRAPHQL_FIELDS = () => fragments.FOOTER_GRAPHQL_FIELDS();
export const getEXTERNAL_PAGE_FIELDS = () => fragments.EXTERNAL_PAGE_FIELDS();
export const getSOCIAL_BASIC_FIELDS = () => fragments.SOCIAL_BASIC_FIELDS();
export const getPRODUCT_BASIC_FIELDS = () => fragments.PRODUCT_BASIC_FIELDS();
export const getSERVICE_BASIC_FIELDS = () => fragments.SERVICE_BASIC_FIELDS();
export const getSOLUTION_BASIC_FIELDS = () => fragments.SOLUTION_BASIC_FIELDS();
export const getPOST_BASIC_FIELDS = () => fragments.POST_BASIC_FIELDS();
