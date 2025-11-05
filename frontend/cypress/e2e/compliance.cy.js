describe('Compliance Management Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to compliance dashboard', () => {
    cy.get('[data-testid="sidebar-compliance"]').click();
    cy.url().should('include', '/compliance');
    cy.contains('Compliance Dashboard').should('be.visible');
  });

  it('should display compliance status', () => {
    cy.get('[data-testid="sidebar-compliance"]').click();
    cy.get('[data-testid="compliance-status-cards"]').should('be.visible');
    cy.get('[data-testid="compliance-status"]').should('be.visible');
  });

  it('should display compliance metrics', () => {
    cy.get('[data-testid="sidebar-compliance"]').click();
    cy.get('[data-testid="compliance-metrics"]').should('be.visible');
    cy.get('[data-testid="regulation-card"]').should('have.length.gte', 1);
  });

  it('should allow generating compliance reports', () => {
    cy.get('[data-testid="sidebar-compliance"]').click();

    // Mock report generation
    cy.intercept('POST', '/api/compliance/report', {
      statusCode: 200,
      body: {
        id: 'report-123',
        status: 'generated',
        downloadUrl: '/reports/compliance-123.pdf'
      }
    }).as('generateReport');

    cy.get('[data-testid="generate-report-button"]').click();
    cy.wait('@generateReport');
    cy.contains('Report generated successfully').should('be.visible');
  });

  it('should display compliance regulations overview', () => {
    cy.get('[data-testid="sidebar-compliance"]').click();
    cy.get('[data-testid="regulations-overview"]').should('be.visible');
    cy.contains('GDPR').should('be.visible');
    cy.contains('CCPA').should('be.visible');
  });
});