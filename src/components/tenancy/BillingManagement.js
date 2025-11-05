import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './BillingManagement.css';

const BillingManagement = () => {
  const { currentTenant } = useTenant();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(currentTenant?.plan || 'free');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        'Up to 5 users',
        '10 GB storage',
        '5 resources',
        'Basic support',
        'Community access'
      ],
      limitations: [
        'No custom domains',
        'Limited integrations',
        'No priority support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      period: 'per user/month',
      features: [
        'Up to 25 users',
        '50 GB storage',
        '25 resources',
        'Priority support',
        'Custom domains',
        'API access',
        'Advanced analytics'
      ],
      limitations: []
    },
    {
      id: 'business',
      name: 'Business',
      price: 79,
      period: 'per user/month',
      features: [
        'Up to 100 users',
        '200 GB storage',
        '50 resources',
        '24/7 dedicated support',
        'Custom domains',
        'Unlimited integrations',
        'Advanced analytics',
        'SSO integration',
        'Custom reporting'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      period: 'custom pricing',
      features: [
        'Unlimited users',
        '1 TB storage',
        'Unlimited resources',
        '24/7 dedicated support',
        'Custom domains',
        'Unlimited integrations',
        'Advanced analytics',
        'SSO integration',
        'Custom reporting',
        'Dedicated account manager',
        'Custom SLA',
        'On-premise options'
      ],
      limitations: []
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      date: '2023-06-01',
      amount: 145.00,
      status: 'paid',
      description: 'Professional Plan (5 users)'
    },
    {
      id: 'INV-002',
      date: '2023-05-01',
      amount: 145.00,
      status: 'paid',
      description: 'Professional Plan (5 users)'
    },
    {
      id: 'INV-003',
      date: '2023-04-01',
      amount: 145.00,
      status: 'paid',
      description: 'Professional Plan (5 users)'
    }
  ];

  const paymentMethods = [
    {
      id: 'pm-1',
      type: 'visa',
      last4: '4242',
      expiry: '12/2025',
      isDefault: true
    },
    {
      id: 'pm-2',
      type: 'mastercard',
      last4: '1234',
      expiry: '08/2024',
      isDefault: false
    }
  ];

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleConfirmUpgrade = () => {
    // In a real app, this would process the upgrade
    alert(`Plan upgraded to ${plans.find(p => p.id === selectedPlan)?.name}!`);
    handleCloseModal();
  };

  if (!currentTenant) {
    return <div className="billing-placeholder">Select a tenant to manage billing</div>;
  }

  const currentPlan = plans.find(plan => plan.id === currentTenant.plan);

  return (
    <div className="billing-management">
      <div className="panel-header">
        <h2>Billing & Subscription</h2>
        <button className="upgrade-btn" onClick={handleUpgrade}>
          Upgrade Plan
        </button>
      </div>

      <div className="billing-overview">
        <div className="current-plan">
          <h3>Current Plan</h3>
          <div className="plan-details">
            <div className="plan-name">
              <span className={`plan-badge plan-${currentTenant.plan}`}>
                {currentPlan?.name}
              </span>
            </div>
            <div className="plan-price">
              {currentPlan?.price === 0 ? (
                'Free'
              ) : currentPlan?.price === null ? (
                'Custom Pricing'
              ) : (
                `$${currentPlan?.price}/${currentPlan?.period}`
              )}
            </div>
          </div>
          <div className="plan-expires">
            Next billing date: July 1, 2023
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Methods</h3>
          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div key={method.id} className="payment-method">
                <div className="payment-method-info">
                  <div className="payment-type">
                    {method.type === 'visa' ? '💳' : '💳'} •••• {method.last4}
                  </div>
                  <div className="payment-expiry">
                    Expires {method.expiry}
                  </div>
                </div>
                {method.isDefault && (
                  <span className="default-badge">Default</span>
                )}
              </div>
            ))}
          </div>
          <button className="add-payment-btn">
            + Add Payment Method
          </button>
        </div>
      </div>

      <div className="invoices-section">
        <h3>Billing History</h3>
        <div className="invoices-table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.date}</td>
                  <td>{invoice.description}</td>
                  <td>${invoice.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <button className="download-btn">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isUpgradeModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upgrade Your Plan</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="plans-grid">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  <div className="plan-header">
                    <h4>{plan.name}</h4>
                    <div className="plan-price">
                      {plan.price === 0 ? (
                        'Free'
                      ) : plan.price === null ? (
                        'Custom'
                      ) : (
                        `$${plan.price}`
                      )}
                      {plan.price !== 0 && plan.price !== null && (
                        <span className="period">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="feature">
                        <span className="check">✓</span>
                        {feature}
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={`limit-${index}`} className="limitation">
                        <span className="cross">✗</span>
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmUpgrade}>
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;