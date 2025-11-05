# API Documentation Components

This directory contains all the React components for the Veritas AI API documentation portal.

## Components Overview

### Main Components

1. **DocumentationPortal.js** - Main documentation portal container with navigation
2. **DocumentationPage.js** - Top-level documentation page wrapper

### Feature Components

1. **SwaggerUI.js** - Interactive API reference documentation
2. **EndpointExplorer.js** - Try-it-out interface for API endpoints
3. **AuthGuide.js** - Authentication methods and best practices
4. **SDKDocumentation.js** - Client library documentation and examples
5. **RateLimiting.js** - Rate limit policies and handling guidance
6. **ErrorReference.js** - Comprehensive error code reference
7. **WebhookDocumentation.js** - Webhook setup and security guide
8. **Changelog.js** - API version history and release notes
9. **ClientLibraries.js** - Downloadable client libraries
10. **SandboxEnvironment.js** - Interactive API testing environment

## Usage

```jsx
import { DocumentationPortal } from './components/documentation';

function App() {
  return (
    <DocumentationPortal />
  );
}
```

## Features

- **Interactive API Documentation** - Try endpoints directly in the browser
- **Code Examples** - Multiple language SDK examples
- **Authentication Guide** - Comprehensive auth documentation
- **Rate Limiting** - Clear policies and best practices
- **Error Handling** - Detailed error code reference
- **Webhooks** - Real-time notification setup guide
- **Changelog** - Version history and migration guides
- **Sandbox Environment** - Test API calls in-browser
- **Responsive Design** - Works on all device sizes

## Styling

Each component has its own CSS file following the naming convention:
- ComponentName.css

All styles are scoped to their respective components to prevent conflicts.