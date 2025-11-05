module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173',
        'http://localhost:5173/login',
        'http://localhost:5173/register',
        'http://localhost:5173/dashboard',
        'http://localhost:5173/detection',
        'http://localhost:5173/compliance',
        'http://localhost:5173/reports',
        'http://localhost:5173/settings'
      ],
      startServerCommand: 'npm run preview -- --port 5173',
      numberOfRuns: 3,
      settings: {
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        disableStorageReset: true,
        chromeFlags: '--no-sandbox --headless'
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 250 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001
    }
  }
};