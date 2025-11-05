import React from 'react';
import { createRoot } from 'react-dom/client';
import AuditDashboard from './src/components/audit/AuditDashboard';

// Create a simple test container
const container = document.createElement('div');
document.body.appendChild(container);

// Render the component
const root = createRoot(container);
root.render(<AuditDashboard />);

console.log('AuditDashboard component rendered successfully');

// Clean up
document.body.removeChild(container);