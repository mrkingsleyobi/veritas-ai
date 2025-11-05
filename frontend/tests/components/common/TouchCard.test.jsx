import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TouchCard from '../../../src/components/common/TouchCard'

describe('TouchCard', () => {
  test('renders children correctly', () => {
    render(
      <TouchCard>
        <p>Card content</p>
      </TouchCard>
    )

    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  test('renders title when provided', () => {
    render(
      <TouchCard title="Card Title">
        <p>Card content</p>
      </TouchCard>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <TouchCard onClick={handleClick}>
        <p>Card content</p>
      </TouchCard>
    )

    const card = screen.getByRole('button')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('renders as link when href is provided', () => {
    render(
      <TouchCard href="/test" title="Link Card">
        <p>Card content</p>
      </TouchCard>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveTextContent('Link Card')
  })

  test('applies disabled state correctly', () => {
    const handleClick = jest.fn()
    render(
      <TouchCard onClick={handleClick} disabled>
        <p>Disabled card</p>
      </TouchCard>
    )

    const card = screen.getByRole('button')
    expect(card).toHaveClass('opacity-50')
    expect(card).toHaveClass('cursor-not-allowed')

    fireEvent.click(card)
    expect(handleClick).not.toHaveBeenCalled()
  })

  test('applies different variants correctly', () => {
    const { rerender, container } = render(
      <TouchCard variant="default">
        <p>Default card</p>
      </TouchCard>
    )

    let card = container.firstChild
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('dark:bg-gray-800')

    rerender(
      <TouchCard variant="elevated">
        <p>Elevated card</p>
      </TouchCard>
    )

    card = container.firstChild
    expect(card).toHaveClass('shadow-lg')
    expect(card).toHaveClass('dark:shadow-xl')

    rerender(
      <TouchCard variant="filled">
        <p>Filled card</p>
      </TouchCard>
    )

    card = container.firstChild
    expect(card).toHaveClass('bg-indigo-50')
    expect(card).toHaveClass('dark:bg-indigo-900')
  })

  test('applies custom className', () => {
    const { container } = render(
      <TouchCard className="custom-class">
        <p>Card content</p>
      </TouchCard>
    )

    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })
})