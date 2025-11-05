// Test script to verify all audit components can be imported
console.log('Testing audit component imports...');

try {
  const auditComponents = require('./src/components/audit');
  console.log('✅ Audit components imported successfully');
  console.log('Available components:', Object.keys(auditComponents));

  // Test individual component imports
  const componentNames = [
    'AuditLogViewer',
    'RealTimeLogDisplay',
    'EventCategorization',
    'UserActivityDashboard',
    'SecurityEventMonitor',
    'ComplianceAuditView',
    'LogExport',
    'SearchInvestigation',
    'LogRetentionManager',
    'AuditReportGenerator',
    'AuditDashboard'
  ];

  componentNames.forEach(componentName => {
    try {
      const component = require(`./src/components/audit/${componentName}`);
      console.log(`✅ ${componentName} imported successfully`);
    } catch (error) {
      console.log(`❌ Failed to import ${componentName}:`, error.message);
    }
  });

  console.log('✅ All audit components verified');
} catch (error) {
  console.log('❌ Error importing audit components:', error.message);
}