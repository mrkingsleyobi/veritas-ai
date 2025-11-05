import React from 'react'
import PropTypes from 'prop-types'

const ResponsiveGrid = ({
  children,
  columns = {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  gap = 'md',
  className = '',
  ...props
}) => {
  // Gap size mapping
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  // Column count classes for different breakpoints
  const getColumnClasses = () => {
    const classes = []

    // Base mobile-first grid
    classes.push(`grid-cols-${columns.xs}`)

    // Responsive breakpoints
    if (columns.sm && columns.sm !== columns.xs) {
      classes.push(`sm:grid-cols-${columns.sm}`)
    }

    if (columns.md && columns.md !== columns.sm) {
      classes.push(`md:grid-cols-${columns.md}`)
    }

    if (columns.lg && columns.lg !== columns.md) {
      classes.push(`lg:grid-cols-${columns.lg}`)
    }

    if (columns.xl && columns.xl !== columns.lg) {
      classes.push(`xl:grid-cols-${columns.xl}`)
    }

    return classes.join(' ')
  }

  return (
    <div
      className={`grid ${getColumnClasses()} ${gapClasses[gap] || gapClasses.md} ${className} theme-transition`}
      {...props}
    >
      {children}
    </div>
  )
}

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number
  }),
  gap: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
}

export default ResponsiveGrid