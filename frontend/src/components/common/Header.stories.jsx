import React from 'react'
import Header from './Header'

export default {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
}

export const Default = {
  render: () => <Header />,
}

export const WithUserLoggedIn = {
  render: () => <Header />,
  parameters: {
    mockAuth: true,
  },
}