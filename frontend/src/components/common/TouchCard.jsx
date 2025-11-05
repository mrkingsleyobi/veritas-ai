import React from 'react'
import PropTypes from 'prop-types'

const TouchCard = ({
  children,
  title,
  onClick,
  href,
  disabled = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  // Card variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg dark:shadow-xl',
    outlined: 'bg-transparent border-2 border-indigo-500 dark:border-indigo-400',
    filled: 'bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800'
  }

  // Base classes for touch-friendly card
  const baseClasses = `
    touch-target
    rounded-xl
    p-6
    transition-all
    duration-200
    ease-in-out
    theme-transition
    focus-ring
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md active:scale-[0.98]'}
  `

  // Handle click or link behavior
  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} block no-underline ${className}`}
        aria-disabled={disabled}
        {...(disabled ? { tabIndex: -1 } : {})}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}
        {children}
      </a>
    )
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${className}`}
      aria-disabled={disabled}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      } : undefined}
      {...props}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

TouchCard.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'filled']),
  className: PropTypes.string
}

export default TouchCard