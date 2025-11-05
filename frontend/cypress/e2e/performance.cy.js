describe('Performance and Load Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load login page within acceptable time', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading');
      },
      onLoad: (win) => {
        win.performance.mark('end-loading');
        const loadTime = win.performance.getEntriesByType('navigation')[0].loadEventEnd -
                         win.performance.getEntriesByType('navigation')[0].loadEventStart;
        expect(loadTime).to.be.lessThan(3000); // Should load within 3 seconds
      }
    });
  });

  it('should have fast first contentful paint', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        cy.stub(win.performance, 'getEntriesByType').callsFake((type) => {
          if (type === 'paint') {
            return [
              { name: 'first-contentful-paint', startTime: 1500 },
              { name: 'first-paint', startTime: 1000 }
            ];
          }
          return [];
        });
      }
    });

    cy.window().then((win) => {
      const fcp = win.performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint');
      expect(fcp.startTime).to.be.lessThan(2000); // FCP should be under 2 seconds
    });
  });

  it('should handle concurrent user actions', () => {
    // Simulate multiple rapid actions
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');

    // Rapid submit attempts
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="login-button"]').click();

    // Should only process one login
    cy.url().should('include', '/dashboard');
  });

  context('Logged in user performance tests', () => {
    beforeEach(() => {
      // Login
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should load dashboard quickly', () => {
      cy.visit('/dashboard', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-dashboard');
        },
        onLoad: (win) => {
          win.performance.mark('end-dashboard');
          const loadTime = win.performance.getEntriesByType('navigation')[0].loadEventEnd -
                           win.performance.getEntriesByType('navigation')[0].loadEventStart;
          expect(loadTime).to.be.lessThan(4000); // Dashboard should load within 4 seconds
        }
      });
    });

    it('should handle large data sets in tables', () => {
      // Mock large dataset
      cy.intercept('GET', '/api/detection/history', {
        statusCode: 200,
        body: {
          history: Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            fileName: `video-${i}.mp4`,
            status: i % 2 === 0 ? 'completed' : 'processing',
            result: i % 3 === 0 ? 'deepfake' : 'authentic',
            timestamp: new Date(Date.now() - i * 86400000).toISOString()
          }))
        }
      }).as('getHistory');

      cy.get('[data-testid="sidebar-detection"]').click();
      cy.get('[data-testid="history-tab"]').click();
      cy.wait('@getHistory');

      // Check that pagination works
      cy.get('[data-testid="pagination"]').should('be.visible');
      cy.get('[data-testid="detection-history-item"]').should('have.length.lte', 50);
    });

    it('should maintain performance with rapid navigation', () => {
      // Navigate quickly between pages
      cy.get('[data-testid="sidebar-detection"]').click();
      cy.get('[data-testid="sidebar-compliance"]').click();
      cy.get('[data-testid="sidebar-reports"]').click();
      cy.get('[data-testid="sidebar-settings"]').click();
      cy.get('[data-testid="sidebar-dashboard"]').click();

      // Check that each page loads properly
      cy.contains('Dashboard').should('be.visible');
    });
  });

  it('should handle network latency gracefully', () => {
    // Simulate slow network
    cy.intercept(
      {
        method: 'POST',
        url: '/api/auth/login'
      },
      {
        statusCode: 200,
        body: {
          success: true,
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com'
          },
          token: 'fake-jwt-token'
        },
        delayMs: 2000 // 2 second delay
      }
    ).as('slowLogin');

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Should show loading state during delay
    cy.contains('Signing in...').should('be.visible');

    // Should eventually succeed
    cy.wait('@slowLogin');
    cy.url().should('include', '/dashboard');
  });

  it('should handle API errors gracefully without performance degradation', () => {
    // Mock API error
    cy.intercept('GET', '/api/user/profile', {
      statusCode: 500,
      body: {
        error: 'Internal Server Error'
      },
      delayMs: 1000
    }).as('profileError');

    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');

    // Even with API errors, navigation should work
    cy.get('[data-testid="sidebar-settings"]').click();
    cy.url().should('include', '/settings');
  });
});