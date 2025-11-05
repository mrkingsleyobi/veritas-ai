# Audit Logging Components

This directory contains React components for a comprehensive audit logging system with the following features:

## Components Overview

1. **AuditDashboard** - Main dashboard component that orchestrates all other components
2. **AuditLogViewer** - Advanced audit log viewer with filtering and pagination
3. **RealTimeLogDisplay** - Real-time streaming display of log events
4. **EventCategorization** - Event type categorization and tagging system
5. **UserActivityDashboard** - User activity tracking with visualizations
6. **SecurityEventMonitor** - Security event monitoring and alerting
7. **ComplianceAuditView** - Compliance-related audit views and reporting
8. **LogExport** - Export functionality for audit logs (CSV, JSON, PDF)
9. **SearchInvestigation** - Search and investigation tools
10. **LogRetentionManager** - Log retention policy management
11. **AuditReportGenerator** - Audit report generation and scheduling

## Features

- Advanced filtering capabilities
- Real-time log streaming
- Event categorization and tagging
- User activity tracking with charts
- Security event monitoring
- Compliance reporting
- Log export in multiple formats
- Search and investigation tools
- Retention policy management
- Report generation and scheduling
- Responsive design
- Pagination for large datasets

## Usage

```javascript
import { AuditDashboard } from './components/audit';

function App() {
  return (
    <AuditDashboard />
  );
}
```

## Styling

The components use a consistent styling approach defined in `AuditStyles.css`. All components are designed to be responsive and work well on different screen sizes.

## Testing

Unit tests are available in the `tests/components/audit/` directory.