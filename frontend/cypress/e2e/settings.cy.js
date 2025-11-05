describe('User Settings and Profile Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to settings page', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();
    cy.url().should('include', '/settings');
    cy.contains('Account Settings').should('be.visible');
  });

  it('should display user profile information', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    cy.get('[data-testid="profile-name"]').should('be.visible');
    cy.get('[data-testid="profile-email"]').should('be.visible');
    cy.get('[data-testid="profile-joined-date"]').should('be.visible');
  });

  it('should allow updating profile information', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    // Mock profile update
    cy.intercept('PUT', '/api/user/profile', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: '1',
          name: 'Updated User Name',
          email: 'test@example.com'
        }
      }
    }).as('updateProfile');

    cy.get('[data-testid="name-input"]').clear().type('Updated User Name');
    cy.get('[data-testid="save-profile-button"]').click();

    cy.wait('@updateProfile');
    cy.contains('Profile updated successfully').should('be.visible');
  });

  it('should allow changing password', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    cy.get('[data-testid="change-password-tab"]').click();

    // Mock password change
    cy.intercept('POST', '/api/user/password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Password updated successfully'
      }
    }).as('changePassword');

    cy.get('[data-testid="current-password-input"]').type('password123');
    cy.get('[data-testid="new-password-input"]').type('newpassword123');
    cy.get('[data-testid="confirm-password-input"]').type('newpassword123');
    cy.get('[data-testid="change-password-button"]').click();

    cy.wait('@changePassword');
    cy.contains('Password updated successfully').should('be.visible');
  });

  it('should show validation errors for password change', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    cy.get('[data-testid="change-password-tab"]').click();

    cy.get('[data-testid="current-password-input"]').type('password123');
    cy.get('[data-testid="new-password-input"]').type('short');
    cy.get('[data-testid="confirm-password-input"]').type('different');
    cy.get('[data-testid="change-password-button"]').click();

    cy.contains('Password must be at least 8 characters').should('be.visible');
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should display account security information', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    cy.get('[data-testid="security-tab"]').click();
    cy.get('[data-testid="two-factor-status"]').should('be.visible');
    cy.get('[data-testid="login-history"]').should('be.visible');
  });

  it('should allow enabling two-factor authentication', () => {
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="settings-link"]').click();

    cy.get('[data-testid="security-tab"]').click();

    // Mock 2FA setup
    cy.intercept('POST', '/api/user/2fa/setup', {
      statusCode: 200,
      body: {
        success: true,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        secret: 'ABC123XYZ'
      }
    }).as('setup2FA');

    cy.get('[data-testid="enable-2fa-button"]').click();
    cy.wait('@setup2FA');

    cy.get('[data-testid="qr-code"]').should('be.visible');
    cy.get('[data-testid="2fa-secret"]').should('be.visible');
  });
});