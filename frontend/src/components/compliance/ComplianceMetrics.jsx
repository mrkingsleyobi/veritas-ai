import React from 'react';
import { LineChart, BarChart, PieChart } from '../../components/common/Chart';

const ComplianceMetrics = ({ metrics }) => {
  // Sample data - in real implementation this would come from props
  const complianceTrendData = metrics.complianceTrend || [
    { month: 'Jan', score: 75 },
    { month: 'Feb', score: 78 },
    { month: 'Mar', score: 82 },
    { month: 'Apr', score: 85 },
    { month: 'May', score: 87 },
    { month: 'Jun', score: 89 }
  ];

  const riskDistributionData = metrics.riskDistribution || [
    { category: 'High', value: 12 },
    { category: 'Medium', value: 25 },
    { category: 'Low', value: 45 }
  ];

  const controlCategoriesData = metrics.controlCategories || [
    { name: 'Data Protection', value: 92 },
    { name: 'Access Control', value: 88 },
    { name: 'Audit Trail', value: 95 },
    { name: 'Incident Response', value: 85 },
    { name: 'Training', value: 78 }
  ];

  return (
    <div className="compliance-metrics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Compliance Score Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Score Trend</h3>
          <LineChart
            data={complianceTrendData}
            xKey="month"
            yKey="score"
            color="#4f46e5"
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>Current compliance score: 89%</p>
            <p className="text-green-600">↑ 2% from last month</p>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <PieChart
            data={riskDistributionData}
            dataKey="value"
            nameKey="category"
            colors={['#ef4444', '#f59e0b', '#10b981']}
          />
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <p className="font-medium text-red-500">12</p>
              <p className="text-gray-600">High Risk</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-yellow-500">25</p>
              <p className="text-gray-600">Medium Risk</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-500">45</p>
              <p className="text-gray-600">Low Risk</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Categories Performance */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Categories Performance</h3>
        <BarChart
          data={controlCategoriesData}
          xKey="name"
          yKey="value"
          color="#8b5cf6"
        />
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>Control Performance Score</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">89%</div>
          <div className="text-sm text-gray-600">Overall Compliance</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">24</div>
          <div className="text-sm text-gray-600">Days Without Violation</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <div className="text-sm text-gray-600">Controls Implemented</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">8</div>
          <div className="text-sm text-gray-600">Pending Audits</div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceMetrics;