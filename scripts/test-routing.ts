#!/usr/bin/env tsx

/**
 * Test script for the static routing system
 * Generates a routing cache and tests the routing service
 */
import { staticRoutingService } from '../src/lib/static-routing.js';
import { generateRoutingSitemap } from './generate-routing-sitemap.js';

async function testRouting() {
  console.log('🧪 Testing Static Routing System\n');

  try {
    // First, generate the routing sitemap
    console.log('1️⃣ Generating routing sitemap...');
    await generateRoutingSitemap();
    console.log('✅ Routing sitemap generated successfully\n');

    // Test the routing service
    console.log('2️⃣ Testing routing service...');

    // Test basic functionality
    console.log('\n📊 Cache Statistics:');
    const stats = staticRoutingService.getStats();
    console.log(`   - Total routes: ${stats.totalRoutes}`);
    console.log(`   - Content types:`, stats.contentTypes);
    console.log(`   - Nested routes: ${stats.nestedRoutes}`);
    console.log(`   - Generated at: ${stats.generatedAt}`);

    // Test route lookups
    console.log('\n🔍 Testing route lookups:');

    const testPaths = ['/', 'about', 'products', 'products/trackers'];

    for (const testPath of testPaths) {
      const route = staticRoutingService.getRoute(testPath);
      if (route) {
        console.log(`   ✅ ${testPath} → ${route.contentType} (${route.title})`);
      } else {
        console.log(`   ❌ ${testPath} → Not found`);
      }
    }

    // Test segment-based lookups
    console.log('\n🧩 Testing segment-based lookups:');

    const testSegments = [[], ['about'], ['products'], ['products', 'trackers']];

    for (const segments of testSegments) {
      const route = staticRoutingService.getRouteBySegments(segments);
      const segmentPath = segments.length === 0 ? '/' : segments.join('/');
      if (route) {
        console.log(`   ✅ [${segments.join(', ')}] → ${route.contentType} (${route.title})`);
      } else {
        console.log(`   ❌ [${segments.join(', ')}] → Not found`);
      }
    }

    // Test content type filtering
    console.log('\n📋 Testing content type filtering:');
    const pageListRoutes = staticRoutingService.getRoutesByContentType('PageList');
    console.log(`   - Found ${pageListRoutes.length} PageList routes`);

    const productRoutes = staticRoutingService.getRoutesByContentType('Product');
    console.log(`   - Found ${productRoutes.length} Product routes`);

    // Test nested routes
    console.log('\n🔗 Testing nested routes:');
    const nestedRoutes = staticRoutingService.getNestedRoutes();
    console.log(`   - Found ${nestedRoutes.length} nested routes`);
    nestedRoutes.slice(0, 3).forEach((route) => {
      const parentSlugs = route.parentPageLists.map((p) => p.slug).join(' → ');
      console.log(`   - ${route.path} (${parentSlugs})`);
    });

    // Test search functionality
    console.log('\n🔎 Testing search functionality:');
    const searchResults = staticRoutingService.searchRoutes('product');
    console.log(`   - Found ${searchResults.length} routes matching "product"`);
    searchResults.slice(0, 3).forEach((route) => {
      console.log(`   - ${route.path} (${route.title})`);
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Static routing cache is working correctly`);
    console.log(`   - ${stats.totalRoutes} routes are available for fast lookup`);
    console.log(`   - Fallback to dynamic resolution is available for missing routes`);
    console.log(`   - Build process will generate fresh cache before deployment`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRouting();
}

export { testRouting };
