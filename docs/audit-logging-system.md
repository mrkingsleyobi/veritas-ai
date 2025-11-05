# Audit Logging System

## Overview
This system provides a comprehensive audit logging interface with real-time monitoring, advanced filtering, and compliance features. All components are built with React and designed for scalability and performance.

## Components

### 1. AuditDashboard
Main dashboard component that orchestrates all other components with tabbed navigation.

### 2. AuditLogViewer
Advanced audit log viewer with:
- Pagination for large datasets
- Advanced filtering by date, event type, user, IP, and severity
- Sorting capabilities
- Real-time log streaming integration

### 3. RealTimeLogDisplay
Real-time streaming display with:
- Start/stop streaming controls
- Configurable log limits
- Auto-scrolling to latest events
- Severity-based color coding

### 4. EventCategorization
Event type categorization and tagging system with:
- Expandable category list
- Quick filter tags
- Color-coded categories
- Event count indicators

### 5. UserActivityDashboard
User activity tracking with visualizations:
- Time range selection (7d, 30d, 90d)
- Statistical cards for key metrics
- Activity trend charts
- User distribution pie charts
- Top active users list

### 6. SecurityEventMonitor
Security event monitoring and alerting:
- Active security alerts display
- Severity-based filtering
- Real-time event monitoring
- Action tracking (BLOCKED, MONITORED, etc.)

### 7. ComplianceAuditView
Compliance-related audit views:
- Regulatory compliance status (GDPR, HIPAA, SOC2, PCI)
- Compliance progress tracking
- Open issues management
- Report generation capabilities

### 8. LogExport
Export functionality for audit logs:
- Multiple formats (CSV, JSON, PDF, XLSX)
- Configurable export options
- Date range and filter support
- Progress status indicators

### 9. SearchInvestigation
Search and investigation tools:
- Keyword search with history
- Advanced filtering options
- Investigation tools (timeline, IP analysis)
- Export capabilities

### 10. LogRetentionManager
Log retention policy management:
- Policy creation and editing
- Storage statistics overview
- Compliance requirement tracking
- Retention schedule visualization

### 11. AuditReportGenerator
Audit report generation and scheduling:
- Multiple report types (summary, detailed, compliance, etc.)
- Format selection (PDF, CSV, XLSX, JSON)
- Scheduling options (immediate, daily, weekly, monthly)
- Report history management

## Usage

### Basic Implementation
```jsx
import { AuditDashboard } from './components/audit';
import './components/audit/AuditStyles.css';

function App() {
  return (
    <div className="App">
      <AuditDashboard />
    </div>
  );
}
```

### Individual Component Usage
```jsx
import { AuditLogViewer, SecurityEventMonitor } from './components/audit';

function CustomAuditView() {
  return (
    <div>
      <AuditLogViewer />
      <SecurityEventMonitor />
    </div>
  );
}
```

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live streaming of log events
- **Advanced Filtering**: Multi-dimensional filtering capabilities
- **Compliance Ready**: Built-in support for major regulations
- **Export Capabilities**: Multiple export formats supported
- **Retention Policies**: Configurable data retention management
- **Report Generation**: Automated report creation and scheduling
- **Investigation Tools**: Advanced search and analysis capabilities

## Styling

All components use a consistent styling approach defined in `AuditStyles.css`. The design follows modern UI principles with:
- Clean, professional appearance
- Color-coded severity indicators
- Intuitive navigation
- Responsive layouts
- Accessible color schemes

## Testing

Unit tests are available in the `tests/components/audit/` directory. The components are designed to be easily testable with Jest and React Testing Library.