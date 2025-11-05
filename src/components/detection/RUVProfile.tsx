import React, { useState } from 'react';
import './RUVProfile.css';

interface RUVProfileProps {
  onProfileUpdate: (profile: RUVProfileData) => void;
}

export interface RUVProfileData {
  userId: string;
  credits: number;
  subscriptionLevel: 'free' | 'pro' | 'enterprise';
  usageHistory: Array<{
    date: string;
    creditsUsed: number;
    filesProcessed: number;
  }>;
  preferences: {
    defaultSensitivity: 'low' | 'medium' | 'high';
    notifications: boolean;
    autoExport: boolean;
  };
}

const RUVProfile: React.FC<RUVProfileProps> = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState<RUVProfileData>({
    userId: 'user-123',
    credits: 950,
    subscriptionLevel: 'pro',
    usageHistory: [
      { date: '2023-06-01', creditsUsed: 25, filesProcessed: 5 },
      { date: '2023-06-02', creditsUsed: 15, filesProcessed: 3 },
      { date: '2023-06-03', creditsUsed: 30, filesProcessed: 7 },
    ],
    preferences: {
      defaultSensitivity: 'medium',
      notifications: true,
      autoExport: false,
    }
  });

  const handlePreferenceChange = (preference: keyof RUVProfileData['preferences'], value: any) => {
    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [preference]: value
      }
    };
    setProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
  };

  const getSubscriptionColor = () => {
    switch (profile.subscriptionLevel) {
      case 'pro': return '#3b82f6';
      case 'enterprise': return '#8b5cf6';
      default: return '#94a3b8';
    }
  };

  const getTotalFilesProcessed = () => {
    return profile.usageHistory.reduce((total, entry) => total + entry.filesProcessed, 0);
  };

  const getTotalCreditsUsed = () => {
    return profile.usageHistory.reduce((total, entry) => total + entry.creditsUsed, 0);
  };

  return (
    <div className="ruv-profile">
      <div className="profile-header">
        <div className="profile-info">
          <div className="user-avatar">
            <span>👤</span>
          </div>
          <div className="user-details">
            <h3>User Profile</h3>
            <p className="user-id">ID: {profile.userId}</p>
          </div>
        </div>
        <div className="subscription-badge" style={{ backgroundColor: getSubscriptionColor() }}>
          {profile.subscriptionLevel.charAt(0).toUpperCase() + profile.subscriptionLevel.slice(1)}
        </div>
      </div>

      <div className="credits-section">
        <div className="credits-info">
          <h4>Credits Balance</h4>
          <div className="credits-display">
            <span className="credits-amount">{profile.credits}</span>
            <span className="credits-label">credits</span>
          </div>
        </div>
        <button className="credits-purchase-btn">
          Purchase More
        </button>
      </div>

      <div className="usage-section">
        <h4>Usage Statistics</h4>
        <div className="usage-stats">
          <div className="stat-card">
            <span className="stat-value">{getTotalFilesProcessed()}</span>
            <span className="stat-label">Files Processed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{getTotalCreditsUsed()}</span>
            <span className="stat-label">Credits Used</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{profile.usageHistory.length}</span>
            <span className="stat-label">Days Active</span>
          </div>
        </div>
      </div>

      <div className="preferences-section">
        <h4>Preferences</h4>
        <div className="preference-item">
          <label>Default Sensitivity</label>
          <select
            value={profile.preferences.defaultSensitivity}
            onChange={(e) => handlePreferenceChange('defaultSensitivity', e.target.value as any)}
            className="preference-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="preference-item">
          <label>Email Notifications</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={profile.preferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <label>Auto Export Results</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={profile.preferences.autoExport}
              onChange={(e) => handlePreferenceChange('autoExport', e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default RUVProfile;