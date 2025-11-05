describe('Reports and Analytics Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to reports dashboard', () => {
    cy.get('[data-testid="sidebar-reports"]').click();
    cy.url().should('include', '/reports');
    cy.contains('Reports Dashboard').should('be.visible');
  });

  it('should display detection reports', () => {
    cy.get('[data-testid="sidebar-reports"]').click();
    cy.get('[data-testid="detection-reports"]').should('be.visible');
    cy.get('[data-testid="detection-report-item"]').should('have.length.gte', 0);
  });

  it('should display compliance reports', () => {
    cy.get('[data-testid="sidebar-reports"]').click();
    cy.get('[data-testid="compliance-reports"]').should('be.visible');
    cy.get('[data-testid="compliance-report-item"]').should('have.length.gte', 0);
  });

  it('should allow filtering reports by date range', () => {
    cy.get('[data-testid="sidebar-reports"]').click();

    // Set date range
    cy.get('[data-testid="date-range-start"]').type('2023-01-01');
    cy.get('[data-testid="date-range-end"]').type('2023-12-31');
    cy.get('[data-testid="apply-filters-button"]').click();

    // Verify filters are applied
    cy.get('[data-testid="date-range-start"]').should('have.value', '2023-01-01');
    cy.get('[data-testid="date-range-end"]').should('have.value', '2023-12-31');
  });

  it('should allow downloading reports', () => {
    cy.get('[data-testid="sidebar-reports"]').click();

    // Mock report download
    cy.intercept('GET', '/api/reports/detection/1/download', {
      statusCode: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="detection-report-1.pdf"'
      }
    }).as('downloadReport');

    cy.get('[data-testid="download-report-button"]').first().click();
    cy.wait('@downloadReport');
  });

  it('should display report generation status', () => {
    cy.get('[data-testid="sidebar-reports"]').click();

    // Mock report in progress
    cy.intercept('GET', '/api/reports/status', {
      statusCode: 200,
      body: {
        reports: [
          {
            id: '1',
            type: 'detection',
            status: 'generating',
            progress: 75
          }
        ]
      }
    }).as('reportStatus');

    cy.wait('@reportStatus');
    cy.get('[data-testid="report-status-generating"]').should('be.visible');
    cy.contains('75%').should('be.visible');
  });
});