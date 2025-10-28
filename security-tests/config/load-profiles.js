// K6 Load Testing Profiles
// Different load scenarios for comprehensive testing

export const loadProfiles = {
  // No Load - Functional testing only (1 user)
  noLoad: {
    stages: [
      { duration: '30s', target: 1 },   // Single user
      { duration: '1m', target: 1 },    // Maintain single user
      { duration: '10s', target: 0 },   // Quick ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'], // Very strict - 95% under 1s
      http_req_failed: ['rate<0.01'],    // Less than 1% failures
      checks: ['rate>0.99'],             // 99% of checks must pass
    },
    description: 'Functional testing with minimal load - validates security without performance stress'
  },

  // Base Load - Normal production traffic simulation
  baseLoad: {
    stages: [
      { duration: '1m', target: 5 },    // Gentle ramp up
      { duration: '3m', target: 10 },   // Normal traffic
      { duration: '2m', target: 15 },   // Slightly elevated
      { duration: '1m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'], // 95% under 2s
      http_req_failed: ['rate<0.05'],    // Less than 5% failures
      http_reqs: ['rate>5'],             // At least 5 req/s
      checks: ['rate>0.95'],             // 95% of checks must pass
    },
    description: 'Simulates normal production load - typical user traffic patterns'
  },

  // Peak Load - High traffic stress testing
  peakLoad: {
    stages: [
      { duration: '5m', target: 1000 },   // Gradual ramp up
      { duration: '5m', target: 5000 },   // High load
      { duration: '5m', target: 15000 },  // Very high load
      { duration: '3m', target: 25000 },  // Peak traffic
      { duration: '2m', target: 30000 },  // Stress test
      { duration: '5m', target: 0 },      // Cool down
    ],
    thresholds: {
      http_req_duration: ['p(95)<10000'], // 95% under 10s (very lenient for high load)
      http_req_failed: ['rate<0.30'],     // Less than 30% failures (expect some under extreme load)
      http_reqs: ['rate>1000'],           // At least 1000 req/s
      checks: ['rate>0.70'],              // 70% of checks must pass (lower due to extreme load)
    },
    description: 'Extreme high-traffic stress testing - validates system under 25k+ concurrent users'
  },

  // Spike Load - Sudden traffic bursts
  spikeLoad: {
    stages: [
      { duration: '30s', target: 5 },   // Normal baseline
      { duration: '30s', target: 100 }, // Sudden spike
      { duration: '1m', target: 100 },  // Maintain spike
      { duration: '30s', target: 5 },   // Return to baseline
      { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<8000'], // Very lenient during spikes
      http_req_failed: ['rate<0.25'],    // Allow higher failure rate
      checks: ['rate>0.75'],             // 75% of checks must pass
    },
    description: 'Sudden traffic spike simulation - tests system resilience'
  },

  // Soak Load - Extended duration testing
  soakLoad: {
    stages: [
      { duration: '2m', target: 10 },   // Ramp up
      { duration: '10m', target: 20 },  // Extended steady state
      { duration: '1m', target: 0 },    // Ramp down
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000'], // 95% under 3s
      http_req_failed: ['rate<0.08'],    // Less than 8% failures
      http_reqs: ['rate>10'],            // At least 10 req/s
      checks: ['rate>0.90'],             // 90% of checks must pass
    },
    description: 'Extended duration testing - validates system stability over time'
  },

  // Extreme Load - Ultra-high traffic testing (50k+ users)
  extremeLoad: {
    stages: [
      { duration: '10m', target: 5000 },   // Gradual ramp up
      { duration: '10m', target: 15000 },  // High load
      { duration: '10m', target: 35000 },  // Very high load
      { duration: '5m', target: 50000 },   // Extreme peak
      { duration: '3m', target: 75000 },   // Maximum stress
      { duration: '10m', target: 0 },      // Extended cool down
    ],
    thresholds: {
      http_req_duration: ['p(95)<15000'], // 95% under 15s (very lenient)
      http_req_failed: ['rate<0.50'],     // Less than 50% failures (expect high failure rate)
      http_reqs: ['rate>2000'],           // At least 2000 req/s
      checks: ['rate>0.50'],              // 50% of checks must pass (survival mode)
    },
    description: 'Extreme load testing - 50k+ users to test absolute system limits'
  }
};

// Helper function to get load profile by name
export function getLoadProfile(profileName) {
  const profile = loadProfiles[profileName];
  if (!profile) {
    throw new Error(`Unknown load profile: ${profileName}. Available profiles: ${Object.keys(loadProfiles).join(', ')}`);
  }
  return profile;
}

// Environment variable support for profile selection
export function getSelectedProfile() {
  const profileName = __ENV.LOAD_PROFILE || 'baseLoad';
  return getLoadProfile(profileName);
}

// Display available profiles
export function listProfiles() {
  console.log('📊 Available Load Profiles:');
  Object.entries(loadProfiles).forEach(([name, profile]) => {
    const maxUsers = Math.max(...profile.stages.map(stage => stage.target));
    const totalDuration = profile.stages.reduce((sum, stage) => {
      const duration = stage.duration;
      const minutes = duration.includes('m') ? parseInt(duration) : 0;
      const seconds = duration.includes('s') ? parseInt(duration.split('s')[0].split('m')[1] || duration) : 0;
      return sum + minutes * 60 + seconds;
    }, 0);
    
    console.log(`  🎯 ${name}: ${maxUsers} max users, ${Math.floor(totalDuration/60)}m${totalDuration%60}s duration`);
    console.log(`     ${profile.description}`);
  });
}
