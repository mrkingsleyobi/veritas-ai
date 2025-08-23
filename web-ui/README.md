# Web UI Enhancement

This directory contains the enhanced web user interface for VeritasAI, built with React and TypeScript.

## Directory Structure
```
web-ui/
├── public/               # Static assets
├── src/                  # React source code
│   ├── components/       # UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── styles/           # CSS/SCSS files
├── package.json          # Web UI dependencies
└── webpack.config.js     # Build configuration
```

## Development Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation
```bash
cd web-ui
npm install
```

### Running the App
```bash
# Start the development server
npm start

# Build for production
npm run build
```

## Architecture
- **Framework**: React with TypeScript
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Charting**: Chart.js
- **Build Tool**: Webpack
- **Testing**: Jest, React Testing Library

## Features
- Modern dashboard with interactive visualizations
- Responsive design for all device sizes
- Accessibility features (WCAG 2.1 compliance)
- Customization options for dashboards and preferences
- Real-time data updates

## Testing
- Unit tests with Jest and React Testing Library
- End-to-end tests with Cypress
- Accessibility testing with axe-core
- Performance testing with Lighthouse