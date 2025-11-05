import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon
} from '@mui/icons-material'

const SettingsPage = () => {
  const { currentUser } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', name: 'Profile', icon: PersonIcon },
    { id: 'security', name: 'Security', icon: SecurityIcon },
    { id: 'notifications', name: 'Notifications', icon: NotificationsIcon },
    { id: 'appearance', name: 'Appearance', icon: PaletteIcon },
    { id: 'data', name: 'Data & Storage', icon: StorageIcon },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="lg:flex lg:space-x-6">
        <div className="lg:w-1/4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Settings
              </h3>
            </div>
            <nav>
              <ul className="divide-y divide-gray-200">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full px-4 py-3 text-left flex items-center space-x-3 text-sm font-medium ${
                          activeSection === section.id
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{section.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-6 lg:mt-0 lg:w-3/4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {sections.find(s => s.id === activeSection)?.name}
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {activeSection === 'profile' && <ProfileSettings user={currentUser} />}
              {activeSection === 'security' && <SecuritySettings />}
              {activeSection === 'notifications' && <NotificationSettings />}
              {activeSection === 'appearance' && <AppearanceSettings />}
              {activeSection === 'data' && <DataSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileSettings = ({ user }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  })

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle profile update
    console.log('Profile updated:', profile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={profile.name}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="email"
              id="email"
              value={profile.email}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="organization"
              id="organization"
              value={profile.organization}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="phone"
              id="phone"
              value={profile.phone}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <div className="mt-1">
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={profile.bio}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Brief description for your profile.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle password update
    console.log('Password updated')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="currentPassword"
              id="currentPassword"
              value={security.currentPassword}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              value={security.newPassword}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <div className="mt-1">
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={security.confirmPassword}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Password
        </button>
      </div>
    </form>
  )
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailReports: true,
    emailAlerts: true,
    inAppAlerts: true,
    smsAlerts: false
  })

  const handleChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle notification settings update
    console.log('Notification settings updated:', notifications)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Email Reports</p>
            <p className="text-sm text-gray-500">
              Receive periodic reports via email.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailReports"
              checked={notifications.emailReports}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Email Alerts</p>
            <p className="text-sm text-gray-500">
              Receive alerts for important events.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailAlerts"
              checked={notifications.emailAlerts}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">In-App Alerts</p>
            <p className="text-sm text-gray-500">
              Show alerts within the application.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="inAppAlerts"
              checked={notifications.inAppAlerts}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">SMS Alerts</p>
            <p className="text-sm text-gray-500">
              Receive critical alerts via SMS.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="smsAlerts"
              checked={notifications.smsAlerts}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Preferences
        </button>
      </div>
    </form>
  )
}

const AppearanceSettings = () => {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'en'
  })

  const handleChange = (e) => {
    setAppearance({
      ...appearance,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle appearance settings update
    console.log('Appearance settings updated:', appearance)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
            Theme
          </label>
          <div className="mt-1">
            <select
              id="theme"
              name="theme"
              value={appearance.theme}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <div className="mt-1">
            <select
              id="fontSize"
              name="fontSize"
              value={appearance.fontSize}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <div className="mt-1">
            <select
              id="language"
              name="language"
              value={appearance.language}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Preferences
        </button>
      </div>
    </form>
  )
}

const DataSettings = () => {
  const [data, setData] = useState({
    autoDelete: false,
    retentionPeriod: '12',
    exportFormat: 'json'
  })

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    })
  }

  const handleExport = () => {
    // Handle data export
    console.log('Exporting data')
  }

  const handleDeleteAccount = () => {
    // Handle account deletion
    console.log('Deleting account')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Data Export</h3>
        <p className="mt-1 text-sm text-gray-500">
          Export your data in various formats.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                <button className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  JSON Format
                </button>
              </h3>
              <p className="mt-1 text-sm text-gray-500">Structured data export</p>
            </div>
            <div className="mt-4 flex">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export
              </button>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                <button className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  CSV Data
                </button>
              </h3>
              <p className="mt-1 text-sm text-gray-500">Spreadsheet format</p>
            </div>
            <div className="mt-4 flex">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export
              </button>
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                <button className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  PDF Report
                </button>
              </h3>
              <p className="mt-1 text-sm text-gray-500">Document format</p>
            </div>
            <div className="mt-4 flex">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
        <p className="mt-1 text-sm text-gray-500">
          Manage how long your data is stored.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              id="autoDelete"
              name="autoDelete"
              type="checkbox"
              checked={data.autoDelete}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="autoDelete" className="ml-3 block text-sm font-medium text-gray-700">
              Automatically delete data after a period of time
            </label>
          </div>

          {data.autoDelete && (
            <div className="ml-7">
              <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700">
                Retention Period (months)
              </label>
              <div className="mt-1">
                <select
                  id="retentionPeriod"
                  name="retentionPeriod"
                  value={data.retentionPeriod}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
        <p className="mt-1 text-sm text-gray-500">
          Permanently delete your account and all associated data.
        </p>
        <div className="mt-4">
          <button
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage