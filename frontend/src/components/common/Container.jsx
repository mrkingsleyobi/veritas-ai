import React from 'react'
import PropTypes from 'prop-types'

const Container = ({
  children,
  size = 'default',
  padding = 'default',
  className = '',
  ...props
}) => {
  // Container size classes
  const sizeClasses = {
    xs: 'max-w-2xl',
    sm: 'max-w-3xl',
    default: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  // Padding classes
  const paddingClasses = {
    none: '',
    xs: 'px-4',
    sm: 'px-6',
    default: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-8 sm:px-12 lg:px-16',
    xl: 'px-12 sm:px-16 lg:px-24'
  }

  // Responsive padding for vertical spacing
  const verticalPaddingClasses = {
    none: '',
    xs: 'py-4',
    sm: 'py-6',
    default: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-16',
    xl: 'py-16 sm:py-24'
  }

  return (
    <div
      className={`
        mx-auto
        ${sizeClasses[size]}
        ${paddingClasses[padding]}
        ${verticalPaddingClasses[padding]}
        w-full
        theme-transition
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'default', 'lg', 'xl', 'full']),
  padding: PropTypes.oneOf(['none', 'xs', 'sm', 'default', 'lg', 'xl']),
  className: PropTypes.string
}

export default Container