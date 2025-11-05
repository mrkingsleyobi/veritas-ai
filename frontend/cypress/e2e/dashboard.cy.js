describe('Dashboard Analytics', () => {
  beforeEach(() => {
    // Login and visit dashboard
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display user statistics', () => {
    cy.contains('Total Analyses').should('be.visible');
    cy.contains('Authentic Videos').should('be.visible');
    cy.contains('Deepfake Videos').should('be.visible');
  });

  it('should display recent analysis history', () => {
    cy.get('[data-testid="recent-analyses"]').should('be.visible');
    cy.get('[data-testid="analysis-item"]').should('have.length.gte', 0);
  });

  it('should display analytics charts', () => {
    cy.get('[data-testid="analytics-chart"]').should('be.visible');
  });

  it('should allow navigation to analysis details', () => {
    cy.get('[data-testid="analysis-item"]').first().click();
    cy.url().should('include', '/analysis');
  });

  it('should allow user to start new analysis', () => {
    cy.get('[data-testid="upload-button"]').click();
    cy.url().should('include', '/upload');
  });
});