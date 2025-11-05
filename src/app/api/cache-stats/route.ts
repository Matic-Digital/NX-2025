import { NextResponse } from 'next/server';
import { getEnhancedApiCacheStats } from '@/lib/enhanced-api-cache';

/**
 * API route to monitor cache and memory usage
 * GET /api/cache-stats
 */
export async function GET() {
  try {
    const cacheStats = getEnhancedApiCacheStats();
    
    // Get Node.js memory usage
    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    };

    // Get system uptime
    const uptime = process.uptime();
    const uptimeFormatted = {
      hours: Math.floor(uptime / 3600),
      minutes: Math.floor((uptime % 3600) / 60),
      seconds: Math.floor(uptime % 60),
    };

    return NextResponse.json({
      cache: cacheStats,
      memory: memoryStats,
      uptime: uptimeFormatted,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(cacheStats, memoryStats),
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

/**
 * Generate performance recommendations based on current stats
 */
function generateRecommendations(
  cacheStats: any,
  memoryStats: any
): string[] {
  const recommendations: string[] = [];

  // Cache size recommendations
  if (cacheStats.size > cacheStats.maxSize * 0.8) {
    recommendations.push('Cache is near capacity. Consider increasing maxSize or reducing TTL.');
  }

  // Memory usage recommendations
  if (memoryStats.heapUsed > 500) {
    recommendations.push('High heap usage detected. Consider restarting the server or reducing cache size.');
  }

  if (cacheStats.memoryUsageMB > cacheStats.maxMemoryMB * 0.8) {
    recommendations.push('Cache memory usage is high. Consider reducing cache size or TTL.');
  }

  // Expired entries recommendations
  if (cacheStats.expiredEntries > cacheStats.size * 0.2) {
    recommendations.push('Many expired entries detected. Consider reducing TTL or increasing cleanup frequency.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Cache performance is optimal.');
  }

  return recommendations;
}
