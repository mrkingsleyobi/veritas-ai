import React from 'react'
import PropTypes from 'prop-types'
import {
  Gavel as GavelIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'

const RegulationsOverview = ({ regulations, loading }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Regulatory Compliance Overview
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Overview of regulations relevant to deepfake detection and content verification.
        </p>
      </div>
      <div className="px-4 py-5 sm:px-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : regulations.length === 0 ? (
          <div className="text-center py-8">
            <GavelIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No regulations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Regulations information will be displayed here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {regulations.map((regulation) => (
              <div key={regulation.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <GavelIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{regulation.name}</h4>
                    <p className="text-sm text-gray-500">{regulation.jurisdiction}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">{regulation.description}</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <InfoIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>Effective: {new Date(regulation.effective_date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <CheckCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" />
                    <span>Status: {regulation.status}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    View details<span aria-hidden="true"> &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

RegulationsOverview.propTypes = {
  regulations: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
}

export default RegulationsOverview