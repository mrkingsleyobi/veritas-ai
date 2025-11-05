import React from 'react';

const ComplianceStatusCards = ({ complianceData }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return '✓';
      case 'non-compliant': return '✗';
      case 'at-risk': return '⚠';
      default: return '?';
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  return (
    <div className="compliance-status-cards">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* GDPR Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GDPR</h3>
              <p className="text-sm text-gray-500 mt-1">General Data Protection Regulation</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complianceData.gdpr.status)}`}>
              {getStatusIcon(complianceData.gdpr.status)} {complianceData.gdpr.status}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Compliance Progress</span>
              <span>{complianceData.gdpr.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${complianceData.gdpr.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 text-sm">
            <p className="text-gray-600">Last Updated: {formatDate(complianceData.gdpr.lastUpdated)}</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
              View Details →
            </button>
          </div>
        </div>

        {/* SOC2 Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SOC2</h3>
              <p className="text-sm text-gray-500 mt-1">Service Organization Control 2</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complianceData.soc2.status)}`}>
              {getStatusIcon(complianceData.soc2.status)} {complianceData.soc2.status}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Compliance Progress</span>
              <span>{complianceData.soc2.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${complianceData.soc2.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 text-sm">
            <p className="text-gray-600">Last Updated: {formatDate(complianceData.soc2.lastUpdated)}</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
              View Details →
            </button>
          </div>
        </div>

        {/* HIPAA Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">HIPAA</h3>
              <p className="text-sm text-gray-500 mt-1">Health Insurance Portability and Accountability Act</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complianceData.hipaa.status)}`}>
              {getStatusIcon(complianceData.hipaa.status)} {complianceData.hipaa.status}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Compliance Progress</span>
              <span>{complianceData.hipaa.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${complianceData.hipaa.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 text-sm">
            <p className="text-gray-600">Last Updated: {formatDate(complianceData.hipaa.lastUpdated)}</p>
            <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatusCards;