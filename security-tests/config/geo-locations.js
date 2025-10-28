// Geographic Location Simulation Data for Security Testing

export const geoLocations = {
  // Comprehensive global geographic regions for testing
  regions: {
    // North America
    usEast: { name: 'US East Coast', headers: { 'CF-IPCountry': 'US', 'X-Forwarded-For': '198.51.100.1', 'Accept-Language': 'en-US,en;q=0.9' }, timezone: 'America/New_York', latency: 50 },
    usWest: { name: 'US West Coast', headers: { 'CF-IPCountry': 'US', 'X-Forwarded-For': '203.0.113.1', 'Accept-Language': 'en-US,en;q=0.9' }, timezone: 'America/Los_Angeles', latency: 80 },
    usCentral: { name: 'US Central', headers: { 'CF-IPCountry': 'US', 'X-Forwarded-For': '192.0.2.10', 'Accept-Language': 'en-US,en;q=0.9' }, timezone: 'America/Chicago', latency: 60 },
    canada: { name: 'Canada', headers: { 'CF-IPCountry': 'CA', 'X-Forwarded-For': '198.51.100.20', 'Accept-Language': 'en-CA,en;q=0.9,fr;q=0.8' }, timezone: 'America/Toronto', latency: 55 },
    mexico: { name: 'Mexico', headers: { 'CF-IPCountry': 'MX', 'X-Forwarded-For': '203.0.113.30', 'Accept-Language': 'es-MX,es;q=0.9' }, timezone: 'America/Mexico_City', latency: 90 },

    // Europe
    uk: { name: 'United Kingdom', headers: { 'CF-IPCountry': 'GB', 'X-Forwarded-For': '192.0.2.1', 'Accept-Language': 'en-GB,en;q=0.9' }, timezone: 'Europe/London', latency: 120 },
    germany: { name: 'Germany', headers: { 'CF-IPCountry': 'DE', 'X-Forwarded-For': '198.51.100.40', 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' }, timezone: 'Europe/Berlin', latency: 130 },
    france: { name: 'France', headers: { 'CF-IPCountry': 'FR', 'X-Forwarded-For': '203.0.113.50', 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' }, timezone: 'Europe/Paris', latency: 125 },
    netherlands: { name: 'Netherlands', headers: { 'CF-IPCountry': 'NL', 'X-Forwarded-For': '192.0.2.60', 'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8' }, timezone: 'Europe/Amsterdam', latency: 115 },
    spain: { name: 'Spain', headers: { 'CF-IPCountry': 'ES', 'X-Forwarded-For': '198.51.100.70', 'Accept-Language': 'es-ES,es;q=0.9' }, timezone: 'Europe/Madrid', latency: 140 },
    italy: { name: 'Italy', headers: { 'CF-IPCountry': 'IT', 'X-Forwarded-For': '203.0.113.80', 'Accept-Language': 'it-IT,it;q=0.9' }, timezone: 'Europe/Rome', latency: 135 },
    sweden: { name: 'Sweden', headers: { 'CF-IPCountry': 'SE', 'X-Forwarded-For': '192.0.2.90', 'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8' }, timezone: 'Europe/Stockholm', latency: 145 },

    // Asia Pacific
    singapore: { name: 'Singapore', headers: { 'CF-IPCountry': 'SG', 'X-Forwarded-For': '198.51.100.100', 'Accept-Language': 'en-SG,en;q=0.9' }, timezone: 'Asia/Singapore', latency: 200 },
    japan: { name: 'Japan', headers: { 'CF-IPCountry': 'JP', 'X-Forwarded-For': '203.0.113.110', 'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8' }, timezone: 'Asia/Tokyo', latency: 180 },
    southKorea: { name: 'South Korea', headers: { 'CF-IPCountry': 'KR', 'X-Forwarded-For': '192.0.2.120', 'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8' }, timezone: 'Asia/Seoul', latency: 190 },
    china: { name: 'China', headers: { 'CF-IPCountry': 'CN', 'X-Forwarded-For': '198.51.100.130', 'Accept-Language': 'zh-CN,zh;q=0.9' }, timezone: 'Asia/Shanghai', latency: 220 },
    hongKong: { name: 'Hong Kong', headers: { 'CF-IPCountry': 'HK', 'X-Forwarded-For': '203.0.113.140', 'Accept-Language': 'zh-HK,zh;q=0.9,en;q=0.8' }, timezone: 'Asia/Hong_Kong', latency: 195 },
    taiwan: { name: 'Taiwan', headers: { 'CF-IPCountry': 'TW', 'X-Forwarded-For': '192.0.2.150', 'Accept-Language': 'zh-TW,zh;q=0.9' }, timezone: 'Asia/Taipei', latency: 205 },
    australia: { name: 'Australia', headers: { 'CF-IPCountry': 'AU', 'X-Forwarded-For': '198.51.100.160', 'Accept-Language': 'en-AU,en;q=0.9' }, timezone: 'Australia/Sydney', latency: 250 },
    newZealand: { name: 'New Zealand', headers: { 'CF-IPCountry': 'NZ', 'X-Forwarded-For': '203.0.113.170', 'Accept-Language': 'en-NZ,en;q=0.9' }, timezone: 'Pacific/Auckland', latency: 270 },
    india: { name: 'India', headers: { 'CF-IPCountry': 'IN', 'X-Forwarded-For': '192.0.2.180', 'Accept-Language': 'hi-IN,hi;q=0.9,en;q=0.8' }, timezone: 'Asia/Kolkata', latency: 210 },

    // Latin America
    brazil: { name: 'Brazil', headers: { 'CF-IPCountry': 'BR', 'X-Forwarded-For': '203.0.113.50', 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' }, timezone: 'America/Sao_Paulo', latency: 180 },
    argentina: { name: 'Argentina', headers: { 'CF-IPCountry': 'AR', 'X-Forwarded-For': '198.51.100.190', 'Accept-Language': 'es-AR,es;q=0.9' }, timezone: 'America/Argentina/Buenos_Aires', latency: 200 },
    chile: { name: 'Chile', headers: { 'CF-IPCountry': 'CL', 'X-Forwarded-For': '192.0.2.200', 'Accept-Language': 'es-CL,es;q=0.9' }, timezone: 'America/Santiago', latency: 220 },
    colombia: { name: 'Colombia', headers: { 'CF-IPCountry': 'CO', 'X-Forwarded-For': '203.0.113.210', 'Accept-Language': 'es-CO,es;q=0.9' }, timezone: 'America/Bogota', latency: 160 },

    // Middle East & Africa
    uae: { name: 'UAE', headers: { 'CF-IPCountry': 'AE', 'X-Forwarded-For': '192.0.2.200', 'Accept-Language': 'ar-AE,ar;q=0.9,en;q=0.8' }, timezone: 'Asia/Dubai', latency: 150 },
    israel: { name: 'Israel', headers: { 'CF-IPCountry': 'IL', 'X-Forwarded-For': '198.51.100.220', 'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8' }, timezone: 'Asia/Jerusalem', latency: 160 },
    southAfrica: { name: 'South Africa', headers: { 'CF-IPCountry': 'ZA', 'X-Forwarded-For': '203.0.113.230', 'Accept-Language': 'en-ZA,en;q=0.9,af;q=0.8' }, timezone: 'Africa/Johannesburg', latency: 280 },
    egypt: { name: 'Egypt', headers: { 'CF-IPCountry': 'EG', 'X-Forwarded-For': '192.0.2.240', 'Accept-Language': 'ar-EG,ar;q=0.9' }, timezone: 'Africa/Cairo', latency: 170 },

    // Additional regions
    russia: { name: 'Russia', headers: { 'CF-IPCountry': 'RU', 'X-Forwarded-For': '198.51.100.250', 'Accept-Language': 'ru-RU,ru;q=0.9' }, timezone: 'Europe/Moscow', latency: 180 },
    turkey: { name: 'Turkey', headers: { 'CF-IPCountry': 'TR', 'X-Forwarded-For': '203.0.113.255', 'Accept-Language': 'tr-TR,tr;q=0.9' }, timezone: 'Europe/Istanbul', latency: 155 },
    thailand: { name: 'Thailand', headers: { 'CF-IPCountry': 'TH', 'X-Forwarded-For': '192.0.2.254', 'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8' }, timezone: 'Asia/Bangkok', latency: 215 },
    vietnam: { name: 'Vietnam', headers: { 'CF-IPCountry': 'VN', 'X-Forwarded-For': '198.51.100.253', 'Accept-Language': 'vi-VN,vi;q=0.9' }, timezone: 'Asia/Ho_Chi_Minh', latency: 225 },
  },

  // Locale-specific testing data
  locales: {
    'en-US': {
      region: 'usEast',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
    },
    'en-GB': {
      region: 'europe',
      currency: 'GBP',
      dateFormat: 'DD/MM/YYYY',
    },
    'pt-BR': {
      region: 'latinAmerica',
      currency: 'BRL',
      dateFormat: 'DD/MM/YYYY',
    },
    'ar-AE': {
      region: 'middleEast',
      currency: 'AED',
      dateFormat: 'DD/MM/YYYY',
    },
  },

  // Security test scenarios by region
  securityScenarios: {
    // Test geo-blocking (if implemented)
    restrictedRegions: [
      {
        name: 'Sanctioned Country Test',
        headers: {
          'CF-IPCountry': 'XX', // Placeholder for restricted country
          'X-Forwarded-For': '10.0.0.1',
        },
        expectedBehavior: 'Should handle gracefully or block',
      },
    ],
    
    // Test VPN/Proxy detection
    suspiciousTraffic: [
      {
        name: 'VPN Detection Test',
        headers: {
          'CF-IPCountry': 'US',
          'X-Forwarded-For': '1.1.1.1', // Cloudflare DNS (suspicious)
          'X-Real-IP': '8.8.8.8', // Google DNS (suspicious)
        },
        expectedBehavior: 'Should not expose sensitive data',
      },
    ],
  },
};

// Helper functions for geographic testing
export const geoHelpers = {
  // Get random region
  getRandomRegion: () => {
    const regions = Object.keys(geoLocations.regions);
    const randomIndex = Math.floor(Math.random() * regions.length);
    return geoLocations.regions[regions[randomIndex]];
  },

  // Get headers for specific region
  getRegionHeaders: (regionName) => {
    return geoLocations.regions[regionName]?.headers || {};
  },

  // Simulate network latency
  simulateLatency: (regionName) => {
    const region = geoLocations.regions[regionName];
    if (region?.latency) {
      // In k6, we can use sleep() to simulate network delay
      return region.latency;
    }
    return 0;
  },

  // Get all region names
  getAllRegions: () => {
    return Object.keys(geoLocations.regions);
  },

  // Create request options with geo headers
  createGeoRequest: (regionName, additionalHeaders = {}) => {
    const region = geoLocations.regions[regionName];
    if (!region) {
      throw new Error(`Unknown region: ${regionName}`);
    }

    return {
      headers: {
        ...region.headers,
        ...additionalHeaders,
      },
      tags: {
        region: regionName,
        country: region.headers['CF-IPCountry'],
      },
    };
  },
};

export default geoLocations;
