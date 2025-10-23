/**
 * Route Redirects Service
 *
 * Manages automatic redirects from standalone routes to their nested equivalents.
 * Uses pre-generated redirects from build time.
 */

// Try to import the generated redirects file
let generatedRedirects: Array<{ source: string; destination: string; permanent: boolean }> = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
  generatedRedirects = require('./route-redirects.json');
} catch {}

interface RedirectMapping {
  from: string;
  to: string;
  permanent: boolean;
}

class RouteRedirectsService {
  private redirects: RedirectMapping[] = [];
  private initialized = false;

  /**
   * Initialize redirect mappings from pre-generated file
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // Use generated redirects
    this.redirects = generatedRedirects.map((redirect) => ({
      from: redirect.source,
      to: redirect.destination,
      permanent: redirect.permanent
    }));

    this.initialized = true;

    if (this.redirects.length > 0) {
    }
  }

  /**
   * Get all redirect mappings
   */
  getRedirects(): RedirectMapping[] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.redirects;
  }

  /**
   * Get redirect destination for a given path
   */
  getRedirectFor(path: string): string | null {
    if (!this.initialized) {
      this.initialize();
    }

    const redirect = this.redirects.find((r) => r.from === path);
    return redirect ? redirect.to : null;
  }

  /**
   * Check if a path should be redirected
   */
  shouldRedirect(path: string): boolean {
    return this.getRedirectFor(path) !== null;
  }

  /**
   * Get Next.js compatible redirect configuration
   */
  getNextJsRedirects(): Array<{
    source: string;
    destination: string;
    permanent: boolean;
  }> {
    if (!this.initialized) {
      this.initialize();
    }

    return this.redirects.map((redirect) => ({
      source: redirect.from,
      destination: redirect.to,
      permanent: redirect.permanent
    }));
  }

  /**
   * Get redirect statistics
   */
  getStats() {
    if (!this.initialized) {
      this.initialize();
    }

    return {
      totalRedirects: this.redirects.length,
      permanentRedirects: this.redirects.filter((r) => r.permanent).length,
      temporaryRedirects: this.redirects.filter((r) => !r.permanent).length
    };
  }
}

// Create singleton instance
const routeRedirectsService = new RouteRedirectsService();

export { RouteRedirectsService, routeRedirectsService };
export type { RedirectMapping };
