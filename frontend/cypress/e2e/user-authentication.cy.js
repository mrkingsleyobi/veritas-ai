describe('User Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page for unauthenticated users', () => {
    cy.contains('Sign In').should('be.visible');
    cy.contains('Email').should('be.visible');
    cy.contains('Password').should('be.visible');
  });

  it('should allow user to login with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should allow user to register', () => {
    cy.contains('Sign Up').click();
    cy.get('[data-testid="name-input"]').type('Test User');
    cy.get('[data-testid="email-input"]').type('newuser@example.com');
    cy.get('[data-testid="password-input"]').type('securepassword123');
    cy.get('[data-testid="register-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Test User').should('be.visible');
  });
});