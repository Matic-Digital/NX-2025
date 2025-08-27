#!/usr/bin/env node

/**
 * Dynamic sitemap generator for Pa11y accessibility testing
 * Fetches all pages from Contentful and generates URLs for testing
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Contentful configuration
const CONTENTFUL_SPACE_ID = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'staging';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_ACCESS_TOKEN) {
  console.error('Missing required Contentful environment variables:');
  console.error('NEXT_PUBLIC_CONTENTFUL_SPACE_ID:', CONTENTFUL_SPACE_ID ? 'Set' : 'Missing');
  console.error(
    'NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN:',
    CONTENTFUL_ACCESS_TOKEN ? 'Set' : 'Missing'
  );
  console.error('NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT:', CONTENTFUL_ENVIRONMENT);
  process.exit(1);
}

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

/**
 * Fetch data from Contentful GraphQL API
 */
async function fetchGraphQL(query, variables = {}) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GraphQL request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error(`GraphQL query failed: ${JSON.stringify(data.errors)}`);
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Get all standalone pages (not in any PageList)
 */
async function getStandalonePages() {
  const query = `
    query GetStandalonePages {
      pageCollection(limit: 100) {
        items {
          sys { id }
          title
          slug
        }
      }
    }
  `;

  const response = await fetchGraphQL(query);
  return response.data.pageCollection.items.filter((page) => page.slug);
}

/**
 * Get all PageLists and their nested pages
 */
async function getPageListsWithPages() {
  const query = `
    query GetPageListsWithPages {
      pageListCollection(limit: 100) {
        items {
          sys { id }
          title
          slug
          pagesCollection(limit: 100) {
            items {
              __typename
              ... on Page {
                sys { id }
                title
                slug
              }
              ... on ExternalPage {
                sys { id }
                title
                link
              }
              ... on Product {
                sys { id }
                title
                slug
              }
              ... on Service {
                sys { id }
                title
                slug
              }
              ... on Solution {
                sys { id }
                title
                slug
              }
              ... on Post {
                sys { id }
                title
                slug
              }
              ... on PageList {
                sys { id }
                title
                slug
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetchGraphQL(query);
  return response.data.pageListCollection.items;
}

/**
 * Generate URLs from pages and page lists
 */
function generateUrls(standalonePages, pageLists) {
  const urls = new Set();

  // Add homepage
  urls.add(BASE_URL);

  // Add standalone pages
  standalonePages.forEach((page) => {
    if (page.slug) {
      urls.add(`${BASE_URL}/${page.slug}`);
    }
  });

  // Add PageList pages
  pageLists.forEach((pageList) => {
    // Add PageList itself if it has a slug
    if (pageList.slug) {
      urls.add(`${BASE_URL}/${pageList.slug}`);
    }

    // Add pages within the PageList
    if (pageList.pagesCollection?.items) {
      pageList.pagesCollection.items.forEach((page) => {
        if (!page) return;

        // Skip external pages for Pa11y testing
        if (page.__typename === 'ExternalPage') {
          return;
        }

        if (page.slug) {
          if (pageList.slug) {
            // Nested page: /pageListSlug/pageSlug
            urls.add(`${BASE_URL}/${pageList.slug}/${page.slug}`);
          } else {
            // Standalone page in PageList without slug
            urls.add(`${BASE_URL}/${page.slug}`);
          }
        }
      });
    }
  });

  return Array.from(urls).sort();
}

/**
 * Main function to generate sitemap
 */
async function generateSitemap() {
  try {
    console.log('Fetching pages from Contentful...');
    console.log('Using environment:', CONTENTFUL_ENVIRONMENT);

    const [standalonePages, pageLists] = await Promise.all([
      getStandalonePages(),
      getPageListsWithPages()
    ]);

    console.log(`Found ${standalonePages.length} standalone pages`);
    console.log(`Found ${pageLists.length} page lists`);

    const urls = generateUrls(standalonePages, pageLists);

    console.log(`Generated ${urls.length} URLs for testing:`);
    urls.forEach((url) => console.log(`  - ${url}`));

    // Write URLs to a file for Pa11y
    const outputPath = path.join(__dirname, '..', 'pa11y-urls.json');
    fs.writeFileSync(outputPath, JSON.stringify(urls, null, 2));

    console.log(`\nSitemap written to: ${outputPath}`);

    return urls;
  } catch (error) {
    console.error(
      'Error generating sitemap:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace available'
    );
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };
