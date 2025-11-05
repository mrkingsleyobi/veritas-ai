import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './TenantSettings.css';

const TenantSettings = () => {
  const { currentTenant, updateTenant } = useTenant();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    name: currentTenant?.name || '',
    slug: currentTenant?.slug || '',
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    ipWhitelist: '',
    suspiciousActivityAlerts: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackNotifications: false,
    inAppNotifications: true,
    weeklyReports: true,
    billingAlerts: true
  });

  const [apiSettings, setApiSettings] = useState({
    apiKey: 'sk_************abcd',
    apiAccess: true,
    rateLimit: 1000,
    corsOrigins: '',
    webhookUrl: ''
  });

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'api', label: 'API' }
  ];

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, type, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : e.target.value
    }));
  };

  const handleApiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // In a real app, this would save to an API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update tenant in context
    if (currentTenant) {
      updateTenant(currentTenant.id, {
        name: generalSettings.name,
        slug: generalSettings.slug
      });
    }

    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  if (!currentTenant) {
    return <div className="settings-placeholder">Select a tenant to manage settings</div>;
  }

  return (
    <div className="tenant-settings">
      <div className="panel-header">
        <h2>Tenant Settings</h2>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3>General Information</h3>
            <div className="form-group">
              <label htmlFor="name">Tenant Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={generalSettings.name}
                onChange={handleGeneralChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Tenant Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={generalSettings.slug}
                onChange={handleGeneralChange}
              />
              <div className="help-text">
                Used in URLs and API endpoints
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={generalSettings.timezone}
                onChange={handleGeneralChange}
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={generalSettings.language}
                  onChange={handleGeneralChange}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={generalSettings.currency}
                  onChange={handleGeneralChange}
                >
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onChange={handleSecurityChange}
                />
                <span>Enable Two-Factor Authentication</span>
              </label>
              <div className="help-text">
                Require 2FA for all users in this tenant
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={securitySettings.sessionTimeout}
                onChange={handleSecurityChange}
                min="1"
                max="1440"
              />
            </div>

            <div className="form-group">
              <label htmlFor="passwordPolicy">Password Policy</label>
              <select
                id="passwordPolicy"
                name="passwordPolicy"
                value={securitySettings.passwordPolicy}
                onChange={handleSecurityChange}
              >
                <option value="low">Low (minimum 6 characters)</option>
                <option value="medium">Medium (8+ chars, number & letter)</option>
                <option value="high">High (10+ chars, special char required)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ipWhitelist">IP Whitelist</label>
              <textarea
                id="ipWhitelist"
                name="ipWhitelist"
                value={securitySettings.ipWhitelist}
                onChange={handleSecurityChange}
                placeholder="Enter IP addresses, one per line"
                rows="4"
              />
              <div className="help-text">
                Only allow access from these IP addresses (leave blank for no restrictions)
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="suspiciousActivityAlerts"
                  checked={securitySettings.suspiciousActivityAlerts}
                  onChange={handleSecurityChange}
                />
                <span>Enable Suspicious Activity Alerts</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                />
                <span>Email Notifications</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="slackNotifications"
                  checked={notificationSettings.slackNotifications}
                  onChange={handleNotificationChange}
                />
                <span>Slack Notifications</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inAppNotifications"
                  checked={notificationSettings.inAppNotifications}
                  onChange={handleNotificationChange}
                />
                <span>In-App Notifications</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="weeklyReports"
                  checked={notificationSettings.weeklyReports}
                  onChange={handleNotificationChange}
                />
                <span>Weekly Reports</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="billingAlerts"
                  checked={notificationSettings.billingAlerts}
                  onChange={handleNotificationChange}
                />
                <span>Billing Alerts</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="settings-section">
            <h3>API Settings</h3>
            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <div className="api-key-display">
                <input
                  type="text"
                  id="apiKey"
                  name="apiKey"
                  value={apiSettings.apiKey}
                  readOnly
                />
                <button className="regenerate-btn">Regenerate</button>
              </div>
              <div className="help-text">
                Use this key to authenticate API requests
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="apiAccess"
                  checked={apiSettings.apiAccess}
                  onChange={handleApiChange}
                />
                <span>Enable API Access</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="rateLimit">Rate Limit (requests/hour)</label>
              <input
                type="number"
                id="rateLimit"
                name="rateLimit"
                value={apiSettings.rateLimit}
                onChange={handleApiChange}
                min="1"
                max="100000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="corsOrigins">CORS Origins</label>
              <textarea
                id="corsOrigins"
                name="corsOrigins"
                value={apiSettings.corsOrigins}
                onChange={handleApiChange}
                placeholder="Enter allowed origins, one per line"
                rows="4"
              />
              <div className="help-text">
                Specify which domains can make requests to your API
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="webhookUrl">Webhook URL</label>
              <input
                type="url"
                id="webhookUrl"
                name="webhookUrl"
                value={apiSettings.webhookUrl}
                onChange={handleApiChange}
                placeholder="https://your-domain.com/webhook"
              />
              <div className="help-text">
                Receive real-time notifications for events
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantSettings;