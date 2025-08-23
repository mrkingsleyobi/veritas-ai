// Simple authentication service for demo purposes
class AuthService {
  // Mock user database
  users = [
    { id: 1, email: 'user@example.com', password: 'password123', name: 'Demo User' },
    { id: 2, email: 'admin@example.com', password: 'admin123', name: 'Admin User' }
  ];

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  // Login user
  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      // In a real app, this would be a JWT token from the server
      const token = btoa(JSON.stringify({ id: user.id, email: user.email, name: user.name }));
      localStorage.setItem('authToken', token);
      return { success: true, user: { id: user.id, email: user.email, name: user.name } };
    }
    return { success: false, message: 'Invalid email or password' };
  }

  // Register new user
  register(name, email, password) {
    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
      password // In a real app, this would be hashed
    };
    
    this.users.push(newUser);
    
    // Automatically log in the new user
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name }));
    localStorage.setItem('authToken', token);
    
    return { success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } };
  }

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
  }

  // Get current user
  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const user = JSON.parse(atob(token));
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

// Export singleton instance
export default new AuthService();