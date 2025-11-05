describe('File Upload and Analysis Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should allow user to upload a video file', () => {
    cy.contains('Upload Video').click();

    // Test drag and drop
    cy.get('[data-testid="dropzone"]').attachFile('test-video.mp4', {
      subjectType: 'drag-n-drop'
    });

    cy.contains('Uploading...').should('be.visible');
  });

  it('should display upload progress', () => {
    cy.contains('Upload Video').click();

    // Mock upload progress
    cy.intercept('POST', '/api/upload', {
      statusCode: 200,
      body: { id: 1, status: 'processing' }
    }).as('upload');

    cy.get('[data-testid="file-input"]').attachFile('test-video.mp4');

    cy.wait('@upload');
    cy.contains('Processing').should('be.visible');
  });

  it('should display analysis results after processing', () => {
    // Mock completed analysis
    cy.intercept('GET', '/api/analysis/1', {
      statusCode: 200,
      body: {
        id: 1,
        fileName: 'test-video.mp4',
        status: 'completed',
        result: 'authentic',
        confidence: 0.95,
        timestamp: new Date().toISOString()
      }
    }).as('getResults');

    cy.visit('/analysis/1');
    cy.wait('@getResults');

    cy.contains('Authentic').should('be.visible');
    cy.contains('95%').should('be.visible');
  });

  it('should show error for invalid file types', () => {
    cy.contains('Upload Video').click();

    cy.get('[data-testid="file-input"]').attachFile('document.pdf');

    cy.contains('Please upload video files only').should('be.visible');
  });
});