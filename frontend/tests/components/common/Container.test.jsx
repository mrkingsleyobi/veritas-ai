import React from 'react'
import { render, screen } from '@testing-library/react'
import Container from '../../../src/components/common/Container'

describe('Container', () => {
  test('renders children correctly', () => {
    render(
      <Container>
        <div>Container content</div>
      </Container>
    )

    expect(screen.getByText('Container content')).toBeInTheDocument()
  })

  test('applies default classes', () => {
    const { container } = render(
      <Container>
        <div>Content</div>
      </Container>
    )

    const div = container.firstChild
    expect(div).toHaveClass('mx-auto')
    expect(div).toHaveClass('max-w-5xl')
    expect(div).toHaveClass('px-4')
    expect(div).toHaveClass('sm:px-6')
    expect(div).toHaveClass('lg:px-8')
    expect(div).toHaveClass('py-8')
    expect(div).toHaveClass('sm:py-12')
  })

  test('applies different sizes correctly', () => {
    const { rerender, container } = render(
      <Container size="xs">
        <div>Content</div>
      </Container>
    )

    let div = container.firstChild
    expect(div).toHaveClass('max-w-2xl')

    rerender(
      <Container size="sm">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('max-w-3xl')

    rerender(
      <Container size="lg">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('max-w-6xl')

    rerender(
      <Container size="xl">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('max-w-7xl')

    rerender(
      <Container size="full">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('max-w-full')
  })

  test('applies different padding sizes correctly', () => {
    const { rerender, container } = render(
      <Container padding="xs">
        <div>Content</div>
      </Container>
    )

    let div = container.firstChild
    expect(div).toHaveClass('px-4')
    expect(div).toHaveClass('py-4')

    rerender(
      <Container padding="sm">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('px-6')
    expect(div).toHaveClass('py-6')

    rerender(
      <Container padding="lg">
        <div>Content</div>
      </Container>
    )

    div = container.firstChild
    expect(div).toHaveClass('px-8')
    expect(div).toHaveClass('sm:px-12')
    expect(div).toHaveClass('lg:px-16')
    expect(div).toHaveClass('py-12')
    expect(div).toHaveClass('sm:py-16')
  })

  test('applies custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Content</div>
      </Container>
    )

    const div = container.firstChild
    expect(div).toHaveClass('custom-class')
  })
})