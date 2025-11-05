import React from 'react'
import { render, screen } from '@testing-library/react'
import ResponsiveGrid from '../../../src/components/common/ResponsiveGrid'

describe('ResponsiveGrid', () => {
  test('renders children correctly', () => {
    render(
      <ResponsiveGrid>
        <div>Child 1</div>
        <div>Child 2</div>
      </ResponsiveGrid>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  test('applies default classes', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Child</div>
      </ResponsiveGrid>
    )

    const grid = container.firstChild
    expect(grid).toHaveClass('grid')
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('gap-6')
  })

  test('applies custom column configuration', () => {
    const { container } = render(
      <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}>
        <div>Child</div>
      </ResponsiveGrid>
    )

    const grid = container.firstChild
    expect(grid).toHaveClass('grid-cols-1')
    expect(grid).toHaveClass('sm:grid-cols-2')
    expect(grid).toHaveClass('md:grid-cols-3')
    expect(grid).toHaveClass('lg:grid-cols-4')
    expect(grid).toHaveClass('xl:grid-cols-5')
  })

  test('applies custom gap size', () => {
    const { container } = render(
      <ResponsiveGrid gap="lg">
        <div>Child</div>
      </ResponsiveGrid>
    )

    const grid = container.firstChild
    expect(grid).toHaveClass('gap-8')
  })

  test('applies custom className', () => {
    const { container } = render(
      <ResponsiveGrid className="custom-class">
        <div>Child</div>
      </ResponsiveGrid>
    )

    const grid = container.firstChild
    expect(grid).toHaveClass('custom-class')
  })
})