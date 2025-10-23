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
  contentType
  __typename
`;

export const IMAGE_FIELDS = `
  ${SYS_FIELDS}
  link
  altText
  title
`;

// SEO-only fields for metadata generation (to avoid query complexity)
export const SEO_FIELDS = `
  seoTitle
  seoDescription
  openGraphTitle
  openGraphDescription
  openGraphImage {
    ${IMAGE_FIELDS}
  }
  canonicalUrl
  indexing
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

export const MENU_ITEM_FIELDS = `
  ${SYS_FIELDS}
  title
  text
  description
  internalLink {
    ... on Page {
      sys { id }
      slug
    }
    ... on PageList {
      sys { id }
      slug
    }
  }
  externalLink
  icon {
    ${ASSET_FIELDS}
  }
`;

export const MENU_ITEM_FIELDS_WITH_ASSOCIATED_IMAGE = `
  ${SYS_FIELDS}
  title
  text
  description
  internalLink {
    ... on Page {
      sys { id }
      slug
    }
    ... on PageList {
      sys { id }
      slug
    }
  }
  externalLink
  icon {
    ${ASSET_FIELDS}
  }
  associatedImage {
    ${IMAGE_FIELDS}
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

  PAGE_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    description
    ${SEO_FIELDS}
  `,

  HEADER_GRAPHQL_FIELDS: () => `
    ${SYS_FIELDS}
    name 
    logo { 
      ${ASSET_FIELDS} 
    } 
    menu {
      ${SYS_FIELDS}
    }
    search
    overflow {
      ${SYS_FIELDS}
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
    menusCollection(limit: 5) {
      items {
        ... on Menu {
          ${fragments.MENU_BASIC_FIELDS()}
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

  PRODUCT_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    ${SEO_FIELDS}
  `,

  SERVICE_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  SERVICE_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    ${SEO_FIELDS}
  `,

  SOLUTION_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  SOLUTION_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    ${SEO_FIELDS}
  `,

  POST_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  POST_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    ${SEO_FIELDS}
  `,

  PAGELIST_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
  `,

  PAGELIST_SEO_FIELDS: () => `
    ${SYS_FIELDS}
    title
    slug
    ${SEO_FIELDS}
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
  `,

  TESTIMONIALS_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    itemsCollection(limit: 3) {
      items {
        ${SYS_FIELDS}
        title
        quote
        authorName
        authorTitle
        headshot {
          ${SYS_FIELDS}
          title
          link
          altText
        }
      }
    }
  `,

  COLLECTION_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
  `,

  MENU_BASIC_FIELDS: () => `
    ${SYS_FIELDS}
    title
    itemsCollection(limit: 10) {
      items {
        ... on MenuItem {
          ${MENU_ITEM_FIELDS}
        }
      }
    }
  `
};

// Export getters to ensure proper initialization order
export const getPAGE_BASIC_FIELDS = () => fragments.PAGE_BASIC_FIELDS();
export const getPAGE_SEO_FIELDS = () => fragments.PAGE_SEO_FIELDS();
export const getPAGE_LAYOUT_GRAPHQL_FIELDS = () => fragments.PAGE_LAYOUT_GRAPHQL_FIELDS();
export const getPAGE_WITH_REFS_FIELDS = () => fragments.PAGE_WITH_REFS_FIELDS();

export const getHEADER_GRAPHQL_FIELDS = () => fragments.HEADER_GRAPHQL_FIELDS();
export const getFOOTER_GRAPHQL_FIELDS = () => fragments.FOOTER_GRAPHQL_FIELDS();

export const getPAGELIST_BASIC_FIELDS = () => fragments.PAGELIST_BASIC_FIELDS();
export const getPAGELIST_SEO_FIELDS = () => fragments.PAGELIST_SEO_FIELDS();
export const getPAGELIST_MINIMAL_FIELDS = () => fragments.PAGELIST_MINIMAL_FIELDS();
export const getPAGELIST_WITH_REFS_FIELDS = () => fragments.PAGELIST_WITH_REFS_FIELDS();

export const getPRODUCT_BASIC_FIELDS = () => fragments.PRODUCT_BASIC_FIELDS();
export const getPRODUCT_SEO_FIELDS = () => fragments.PRODUCT_SEO_FIELDS();
export const getSERVICE_BASIC_FIELDS = () => fragments.SERVICE_BASIC_FIELDS();
export const getSERVICE_SEO_FIELDS = () => fragments.SERVICE_SEO_FIELDS();
export const getSOLUTION_BASIC_FIELDS = () => fragments.SOLUTION_BASIC_FIELDS();
export const getSOLUTION_SEO_FIELDS = () => fragments.SOLUTION_SEO_FIELDS();
export const getPOST_BASIC_FIELDS = () => fragments.POST_BASIC_FIELDS();
export const getPOST_SEO_FIELDS = () => fragments.POST_SEO_FIELDS();
export const getEXTERNAL_PAGE_FIELDS = () => fragments.EXTERNAL_PAGE_FIELDS();
export const getTESTIMONIALS_BASIC_FIELDS = () => fragments.TESTIMONIALS_BASIC_FIELDS();
export const getCOLLECTION_BASIC_FIELDS = () => fragments.COLLECTION_BASIC_FIELDS();
export const getMENU_BASIC_FIELDS = () => fragments.MENU_BASIC_FIELDS();
