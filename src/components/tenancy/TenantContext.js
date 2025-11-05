import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('member');

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call to fetch tenant data
    const fetchTenants = async () => {
      try {
        // Mock tenant data
        const mockTenants = [
          {
            id: 'tenant-1',
            name: 'Acme Corporation',
            slug: 'acme-corp',
            role: 'admin',
            plan: 'enterprise',
            usage: {
              storage: 45,
              users: 12,
              resources: 8
            },
            limits: {
              storage: 100,
              users: 50,
              resources: 20
            }
          },
          {
            id: 'tenant-2',
            name: 'Globex Inc',
            slug: 'globex',
            role: 'member',
            plan: 'professional',
            usage: {
              storage: 22,
              users: 5,
              resources: 15
            },
            limits: {
              storage: 50,
              users: 25,
              resources: 25
            }
          },
          {
            id: 'tenant-3',
            name: 'Wayne Enterprises',
            slug: 'wayne-ent',
            role: 'owner',
            plan: 'business',
            usage: {
              storage: 78,
              users: 30,
              resources: 42
            },
            limits: {
              storage: 200,
              users: 100,
              resources: 50
            }
          }
        ];

        setTenants(mockTenants);
        if (mockTenants.length > 0) {
          setCurrentTenant(mockTenants[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const switchTenant = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      setUserRole(tenant.role);
    }
  };

  const addTenant = (tenant) => {
    setTenants(prev => [...prev, tenant]);
  };

  const updateTenant = (tenantId, updates) => {
    setTenants(prev =>
      prev.map(tenant =>
        tenant.id === tenantId ? { ...tenant, ...updates } : tenant
      )
    );

    if (currentTenant && currentTenant.id === tenantId) {
      setCurrentTenant(prev => ({ ...prev, ...updates }));
    }
  };

  const removeTenant = (tenantId) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    if (currentTenant && currentTenant.id === tenantId) {
      setCurrentTenant(tenants.length > 1 ? tenants[0] : null);
    }
  };

  const value = {
    currentTenant,
    tenants,
    loading,
    userRole,
    switchTenant,
    addTenant,
    updateTenant,
    removeTenant,
    setCurrentTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};