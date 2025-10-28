// API Endpoints Configuration for Security Testing

export const endpoints = {
  // Public pages
  pages: {
    home: '/',
    company: '/company',
    companyLatinAmerica: '/company/latin-america',
    companyEurope: '/company/europe',
    companyAmericas: '/company/americas',
    companyAsiaPacific: '/company/asia-pacific',
    companyMiddleEast: '/company/middle-east-africa-and-india',
  },

  // API endpoints for security testing
  api: {
    revalidate: '/api/revalidate',
    hubspotForm: '/api/hubspot/form',
    hubspotSubmit: '/api/hubspot/form/{formId}/submit',
    checkPageParent: '/api/check-page-parent',
    locales: '/api/locales',
    localizedRoute: '/api/localized-route',
    preview: '/api/preview',
    enableDraft: '/api/enable-draft',
    exitPreview: '/api/exit-preview',
  },

  // Dynamic routes for testing
  dynamic: {
    hubspotFormById: (formId) => `/api/hubspot/form/${formId}`,
    hubspotSubmitById: (formId) => `/api/hubspot/form/${formId}/submit`,
    enableDraftByType: (contentType) => `/api/enable-draft/${contentType}`,
    pageBySlug: (slug) => `/${slug}`,
    nestedPage: (...segments) => `/${segments.join('/')}`,
  },

  // Test-specific endpoints
  test: {
    // Non-existent endpoints for 404 testing
    notFound: [
      '/non-existent-page',
      '/api/non-existent-endpoint',
      '/admin',
      '/wp-admin',
      '/.env',
      '/config.json',
    ],
    
    // Potentially sensitive paths
    sensitive: [
      '/.git',
      '/.env',
      '/package.json',
      '/next.config.js',
      '/vercel.json',
      '/_next/static',
    ],
  },
};

// Helper functions for endpoint manipulation
export const endpointHelpers = {
  // Add query parameters
  withQuery: (endpoint, params) => {
    const url = new URL(endpoint, 'http://localhost:3000');
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.pathname + url.search;
  },

  // Add path parameters
  withParams: (endpoint, params) => {
    let result = endpoint;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(`{${key}}`, value);
    });
    return result;
  },

  // Get all API endpoints as array
  getAllApiEndpoints: () => {
    return Object.values(endpoints.api);
  },

  // Get all page endpoints as array
  getAllPageEndpoints: () => {
    return Object.values(endpoints.pages);
  },
};

export default endpoints;
