/**
 * Critical CSS optimization utilities
 * Helps inline critical styles and defer non-critical CSS for better LCP
 */

/**
 * Critical CSS that should be inlined in the document head
 * This includes styles needed for above-the-fold content
 */
export const CRITICAL_CSS = `
  /* Reset and base styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #ffffff;
  }
  
  /* Critical layout styles - prevent layout shifts */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Header critical styles - fixed positioning */
  .header-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 80px; /* Fixed height to prevent shifts */
  }
  
  header {
    position: relative;
    z-index: 100;
    height: 80px; /* Fixed height to prevent shifts */
  }
  
  /* Hero section critical styles - stable layout */
  .hero {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  /* Main content positioning for fixed header */
  main {
    position: relative;
    z-index: 1;
    /* No top margin needed since header is fixed and overlays content */
  }
  
  /* Reserve space for content to prevent shifts */
  .content-area {
    min-height: 400px;
    position: relative;
  }
  
  /* Icon containers - prevent font loading shifts */
  .icon-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
  
  /* Social media icons - stable sizing */
  a[aria-label*="Visit our"] > div,
  div[aria-label*="Facebook"],
  div[aria-label*="Twitter"],
  div[aria-label*="LinkedIn"],
  div[aria-label*="Instagram"] {
    width: 24px !important;
    height: 24px !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  /* Page layout stability */
  .page-layout {
    position: relative;
    min-height: 100vh;
  }
  
  /* Header overlay positioning */
  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }
  
  /* BannerHero stability - prevent layout shifts without changing design */
  section[class*="h-[789px]"] {
    height: 789px !important;
    position: relative;
    overflow: hidden;
  }
  
  /* Prevent layout shifts in BannerHero overlay without changing positioning */
  .relative.z-10.w-full.flex.justify-center {
    min-height: 0;
  }
  
  /* Ensure container stability */
  .container {
    contain: layout;
  }
  
  /* Image loading optimization */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  /* Loading states */
  .loading-placeholder {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Critical responsive utilities */
  @media (max-width: 768px) {
    .container { padding: 0 0.75rem; }
    .hero { min-height: 50vh; }
  }
`;

/**
 * Preload critical resources
 * @param resources Array of critical resource URLs
 */
export const preloadCriticalResources = (resources: string[]) => {
  if (typeof window === 'undefined') return;
  
  resources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = url.endsWith('.css') ? 'style' : 'script';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Defer non-critical CSS loading
 * @param href CSS file URL
 * @param media Media query for the CSS (optional)
 */
export const deferCSS = (href: string, media = 'all') => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  link.onload = () => {
    link.rel = 'stylesheet';
    link.media = media;
  };
  document.head.appendChild(link);
  
  // Fallback for browsers that don't support preload
  const noscript = document.createElement('noscript');
  const fallbackLink = document.createElement('link');
  fallbackLink.rel = 'stylesheet';
  fallbackLink.href = href;
  fallbackLink.media = media;
  noscript.appendChild(fallbackLink);
  document.head.appendChild(noscript);
};

/**
 * Load CSS asynchronously without blocking render
 * @param href CSS file URL
 * @param media Media query (optional)
 * @returns Promise that resolves when CSS is loaded
 */
export const loadCSSAsync = (href: string, media = 'all'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print'; // Load as print media first (non-blocking)
    
    link.onload = () => {
      link.media = media; // Switch to actual media query
      resolve();
    };
    
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

/**
 * Critical resource hints for better performance
 */
export const CRITICAL_RESOURCE_HINTS = [
  // Preconnect to external domains
  { rel: 'preconnect', href: 'https://air-prod.imgix.net' },
  { rel: 'preconnect', href: 'https://images.ctfassets.net' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  
  // DNS prefetch for other domains
  { rel: 'dns-prefetch', href: 'https://api.contentful.com' },
  { rel: 'dns-prefetch', href: 'https://cdn.contentful.com' },
];
