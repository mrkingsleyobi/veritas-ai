describe('Application Navigation and Layout', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display main navigation sidebar', () => {
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="sidebar-dashboard"]').should('be.visible');
    cy.get('[data-testid="sidebar-detection"]').should('be.visible');
    cy.get('[data-testid="sidebar-compliance"]').should('be.visible');
    cy.get('[data-testid="sidebar-reports"]').should('be.visible');
    cy.get('[data-testid="sidebar-settings"]').should('be.visible');
  });

  it('should navigate between main sections', () => {
    // Navigate to Detection
    cy.get('[data-testid="sidebar-detection"]').click();
    cy.url().should('include', '/detection');
    cy.contains('Upload Media for Deepfake Detection').should('be.visible');

    // Navigate to Compliance
    cy.get('[data-testid="sidebar-compliance"]').click();
    cy.url().should('include', '/compliance');
    cy.contains('Compliance Dashboard').should('be.visible');

    // Navigate to Reports
    cy.get('[data-testid="sidebar-reports"]').click();
    cy.url().should('include', '/reports');
    cy.contains('Reports Dashboard').should('be.visible');

    // Navigate to Settings
    cy.get('[data-testid="sidebar-settings"]').click();
    cy.url().should('include', '/settings');
    cy.contains('Account Settings').should('be.visible');
  });

  it('should display user menu and allow logout', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="user-menu-dropdown"]').should('be.visible');
    cy.get('[data-testid="profile-link"]').should('be.visible');
    cy.get('[data-testid="settings-link"]').should('be.visible');
    cy.get('[data-testid="logout-button"]').should('be.visible');

    // Mock logout
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: {
        success: true
      }
    }).as('logout');

    cy.get('[data-testid="logout-button"]').click();
    cy.wait('@logout');
    cy.url().should('include', '/login');
  });

  it('should maintain navigation state on page refresh', () => {
    cy.get('[data-testid="sidebar-detection"]').click();
    cy.url().should('include', '/detection');

    cy.reload();
    cy.url().should('include', '/detection');
    cy.contains('Upload Media for Deepfake Detection').should('be.visible');
  });

  it('should display mobile navigation on small screens', () => {
    // Set viewport to mobile size
    cy.viewport(375, 667);

    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    cy.get('[data-testid="sidebar"]').should('not.be.visible');

    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
  });

  it('should display breadcrumbs for nested pages', () => {
    cy.get('[data-testid="sidebar-detection"]').click();
    cy.get('[data-testid="history-tab"]').click();
    cy.url().should('include', '/detection/history');

    cy.get('[data-testid="breadcrumbs"]').should('be.visible');
    cy.contains('Home').should('be.visible');
    cy.contains('Detection').should('be.visible');
    cy.contains('History').should('be.visible');
  });

  it('should have accessible navigation elements', () => {
    cy.get('[data-testid="sidebar"] a').each(($el) => {
      cy.wrap($el).should('have.attr', 'href');
      cy.wrap($el).should('be.visible');
    });

    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.get('[data-testid="user-menu"]').should('have.attr', 'aria-label', 'User menu');
  });
});