# Deepfake Detection Platform - Frontend

React-based SaaS frontend for the Deepfake Detection Platform.

## Features

- **Authentication**: Secure user login and registration
- **Deepfake Detection**: Media upload and analysis interface
- **Compliance Management**: Regulatory compliance reporting
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Responsive Design**: Works on all device sizes
- **Real-time Updates**: Live status and notifications

## Tech Stack

- **React** (v18) with **Vite.js** for fast development
- **React Router** v6 for navigation
- **Redux Toolkit** for state management
- **Material-UI** and **TailwindCSS** for UI components
- **Axios** for API communication
- **Jest** and **React Testing Library** for testing
- **Storybook** for component documentation

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
├── layouts/         # Page layouts
├── pages/           # Page components
├── services/        # API service layer
├── store/           # Redux store and slices
├── styles/          # CSS and styling files
└── utils/           # Utility functions
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Run Storybook**:
   ```bash
   npm run storybook
   ```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Development Guidelines

- Follow the existing component structure and naming conventions
- Use functional components with hooks
- Write tests for new features
- Document components with Storybook
- Follow ESLint rules for code quality

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run storybook` - Run Storybook
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Folder Structure Details

### Components
Reusable UI components organized by feature:
- `common/` - Shared components (Header, Footer, etc.)
- `dashboard/` - Dashboard-specific components
- `detection/` - Deepfake detection components
- `compliance/` - Compliance-related components
- `reports/` - Reporting components

### Pages
Top-level page components that correspond to routes:
- `auth/` - Authentication pages (Login, Register)
- `dashboard/` - Main dashboard page
- `detection/` - Deepfake detection interface
- `compliance/` - Compliance management
- `reports/` - Analytics and reporting
- `settings/` - User settings

### Store
Redux store configuration and slices:
- `slices/` - Individual Redux slices for different features
- `index.js` - Store configuration

### Services
API service layer:
- `api.js` - Axios instance with interceptors

### Hooks
Custom React hooks:
- `useAuth.js` - Authentication hook

### Contexts
React contexts:
- `AuthContext.jsx` - Authentication context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

MIT License