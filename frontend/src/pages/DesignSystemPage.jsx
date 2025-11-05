import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import Container from '../components/common/Container'
import ResponsiveGrid from '../components/common/ResponsiveGrid'
import TouchCard from '../components/common/TouchCard'
import ThemeToggle from '../components/common/ThemeToggle'

const DesignSystemPage = () => {
  const { theme } = useTheme()

  const featureItems = [
    {
      title: 'Responsive Grid System',
      description: 'Adaptive grid layouts that work across all device sizes',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      title: 'Touch-Friendly Components',
      description: 'Optimized for mobile interactions with proper touch targets',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Dark/Light Theme',
      description: 'Automatic theme switching with system preference detection',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14zm-8-4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      )
    },
    {
      title: 'Accessibility Focused',
      description: 'WCAG 2.1 AA compliant with proper ARIA attributes',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: 'Cross-Browser Compatible',
      description: 'Works consistently across all modern browsers',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    {
      title: 'Print Optimized',
      description: 'Professional print styles for reports and documentation',
      icon: (
        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <Container padding="sm">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Design System
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {theme === 'system'
                  ? `System (${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'})`
                  : theme.charAt(0).toUpperCase() + theme.slice(1)}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </div>

      <Container padding="lg">
        <div className="py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Responsive Design System
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A comprehensive design system built with TailwindCSS, featuring responsive components,
              accessibility compliance, and theme support.
            </p>
          </div>

          <ResponsiveGrid
            columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
            gap="lg"
            className="mb-16"
          >
            {featureItems.map((item, index) => (
              <TouchCard
                key={index}
                title={item.title}
                variant="elevated"
                className="h-full"
              >
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    {item.icon}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </TouchCard>
            ))}
          </ResponsiveGrid>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Responsive Grid Examples
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  1 Column (Mobile)
                </h4>
                <ResponsiveGrid columns={{ xs: 1 }} gap="md">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                      <p className="text-gray-800 dark:text-gray-200">Item {item}</p>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  2 Columns (Tablet)
                </h4>
                <ResponsiveGrid columns={{ xs: 1, md: 2 }} gap="md">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                      <p className="text-gray-800 dark:text-gray-200">Item {item}</p>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  3 Columns (Desktop)
                </h4>
                <ResponsiveGrid columns={{ xs: 1, sm: 2, lg: 3 }} gap="md">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                      <p className="text-gray-800 dark:text-gray-200">Item {item}</p>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Touch-Friendly Components
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TouchCard
                title="Default Card"
                variant="default"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  A standard card with subtle border and background.
                </p>
              </TouchCard>

              <TouchCard
                title="Elevated Card"
                variant="elevated"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  A card with shadow for depth and visual hierarchy.
                </p>
              </TouchCard>

              <TouchCard
                title="Filled Card"
                variant="filled"
              >
                <p className="text-gray-600 dark:text-gray-300">
                  A card with a colored background for emphasis.
                </p>
              </TouchCard>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default DesignSystemPage