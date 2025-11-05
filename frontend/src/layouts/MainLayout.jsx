import React from 'react'
import PropTypes from 'prop-types'
import { Outlet } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  )
}

MainLayout.propTypes = {
  children: PropTypes.node
}

export default MainLayout