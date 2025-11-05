import React, { useState } from 'react';
import { useTenant } from './TenantContext';
import './TenantOnboarding.css';

const TenantOnboarding = () => {
  const { addTenant, setCurrentTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Tenant Information
    tenantName: '',
    tenantSlug: '',

    // Step 2: Admin User
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',

    // Step 3: Plan Selection
    plan: 'free',

    // Step 4: Company Information
    companyName: '',
    companySize: '',
    industry: '',

    // Step 5: Preferences
    timezone: 'America/New_York',
    language: 'en',
    notifications: true,

    // Step 6: Review
    agreeToTerms: false
  });

  const totalSteps = 6;

  const steps = [
    { id: 1, title: 'Tenant Info', description: 'Basic tenant information' },
    { id: 2, title: 'Admin User', description: 'Create your admin account' },
    { id: 3, title: 'Plan', description: 'Select your plan' },
    { id: 4, title: 'Company', description: 'Company details' },
    { id: 5, title: 'Preferences', description: 'Your preferences' },
    { id: 6, title: 'Review', description: 'Review and confirm' }
  ];

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
        'Basic support'
      ],
      limitations: [
        'No custom domains',
        'Limited integrations'
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
        'API access'
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
        'Advanced analytics'
      ],
      limitations: []
    }
  ];

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'E-commerce',
    'Manufacturing',
    'Media & Entertainment',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create the new tenant
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: formData.tenantName,
      slug: formData.tenantSlug,
      role: 'owner',
      plan: formData.plan,
      usage: {
        storage: 0,
        users: 1,
        resources: 0
      },
      limits: {
        storage: formData.plan === 'free' ? 10 :
                  formData.plan === 'professional' ? 50 : 200,
        users: formData.plan === 'free' ? 5 :
               formData.plan === 'professional' ? 25 : 100,
        resources: formData.plan === 'free' ? 5 :
                   formData.plan === 'professional' ? 25 : 50
      }
    };

    addTenant(newTenant);
    setCurrentTenant(newTenant);

    setIsSubmitting(false);
    alert('Tenant created successfully! Welcome to your new workspace.');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.tenantName.trim() !== '' && formData.tenantSlug.trim() !== '';
      case 2:
        return (
          formData.adminName.trim() !== '' &&
          formData.adminEmail.trim() !== '' &&
          formData.adminPassword.length >= 6 &&
          formData.adminPassword === formData.confirmPassword
        );
      case 3:
        return true; // Plan selection is optional
      case 4:
        return (
          formData.companyName.trim() !== '' &&
          formData.companySize !== '' &&
          formData.industry !== ''
        );
      case 5:
        return true; // Preferences are optional
      case 6:
        return formData.agreeToTerms;
      default:
        return true;
    }
  };

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === formData.plan);
  };

  return (
    <div className="tenant-onboarding">
      <div className="onboarding-header">
        <h1>Create Your Workspace</h1>
        <p>Set up your tenant account in just a few steps</p>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicator">
          Step {currentStep} of {totalSteps}
        </div>
      </div>

      <div className="steps-container">
        {steps.map(step => (
          <div
            key={step.id}
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-number">
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <div className="step-info">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="onboarding-content">
        {currentStep === 1 && (
          <div className="step-content">
            <h2>Tenant Information</h2>
            <p>Let's start by setting up your tenant workspace</p>

            <div className="form-group">
              <label htmlFor="tenantName">Workspace Name *</label>
              <input
                type="text"
                id="tenantName"
                name="tenantName"
                value={formData.tenantName}
                onChange={handleInputChange}
                placeholder="e.g., Acme Corporation"
                required
              />
              <div className="help-text">
                This is the name that will appear in your dashboard
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tenantSlug">Workspace URL *</label>
              <div className="input-with-prefix">
                <span className="prefix">app.yourapp.com/</span>
                <input
                  type="text"
                  id="tenantSlug"
                  name="tenantSlug"
                  value={formData.tenantSlug}
                  onChange={handleInputChange}
                  placeholder="acme-corp"
                  required
                />
              </div>
              <div className="help-text">
                This will be your unique workspace URL
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-content">
            <h2>Admin User Account</h2>
            <p>Create your administrator account for this workspace</p>

            <div className="form-group">
              <label htmlFor="adminName">Full Name *</label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminEmail">Email Address *</label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleInputChange}
                placeholder="john@acme.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adminPassword">Password *</label>
                <input
                  type="password"
                  id="adminPassword"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
                <div className="help-text">
                  At least 6 characters
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-content">
            <h2>Choose Your Plan</h2>
            <p>Select the plan that best fits your needs</p>

            <div className="plans-grid">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`plan-card ${formData.plan === plan.id ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                >
                  {plan.id === 'professional' && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <div className="plan-header">
                    <h3>{plan.name}</h3>
                    <div className="plan-price">
                      {plan.price === 0 ? (
                        'Free'
                      ) : (
                        <>
                          <span className="amount">${plan.price}</span>
                          <span className="period">/{plan.period}</span>
                        </>
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
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-content">
            <h2>Company Information</h2>
            <p>Tell us about your organization</p>

            <div className="form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Acme Corporation"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companySize">Company Size *</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select size</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="industry">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="step-content">
            <h2>Preferences</h2>
            <p>Configure your default settings</p>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={formData.notifications}
                  onChange={handleInputChange}
                />
                <span>Enable email notifications</span>
              </label>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="step-content">
            <h2>Review Your Information</h2>
            <p>Please review and confirm your details</p>

            <div className="review-section">
              <h3>Workspace Details</h3>
              <div className="review-item">
                <span className="label">Workspace Name:</span>
                <span className="value">{formData.tenantName}</span>
              </div>
              <div className="review-item">
                <span className="label">Workspace URL:</span>
                <span className="value">app.yourapp.com/{formData.tenantSlug}</span>
              </div>
            </div>

            <div className="review-section">
              <h3>Admin User</h3>
              <div className="review-item">
                <span className="label">Name:</span>
                <span className="value">{formData.adminName}</span>
              </div>
              <div className="review-item">
                <span className="label">Email:</span>
                <span className="value">{formData.adminEmail}</span>
              </div>
            </div>

            <div className="review-section">
              <h3>Selected Plan</h3>
              <div className="review-item">
                <span className="label">Plan:</span>
                <span className="value">{getSelectedPlan()?.name}</span>
              </div>
              <div className="review-item">
                <span className="label">Price:</span>
                <span className="value">
                  {getSelectedPlan()?.price === 0
                    ? 'Free'
                    : `$${getSelectedPlan()?.price}/${getSelectedPlan()?.period}`}
                </span>
              </div>
            </div>

            <div className="review-section">
              <h3>Company Information</h3>
              <div className="review-item">
                <span className="label">Company:</span>
                <span className="value">{formData.companyName}</span>
              </div>
              <div className="review-item">
                <span className="label">Size:</span>
                <span className="value">{formData.companySize}</span>
              </div>
              <div className="review-item">
                <span className="label">Industry:</span>
                <span className="value">{formData.industry}</span>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                />
                <span>
                  I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="navigation-buttons">
          <button
            className="prev-btn"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Back
          </button>

          {currentStep < totalSteps ? (
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Continue
            </button>
          ) : (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantOnboarding;