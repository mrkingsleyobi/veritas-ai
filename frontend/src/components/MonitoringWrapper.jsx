import React, { useEffect } from 'react';
import { initSentry, initLogRocket } from '../utils/monitoring';

const MonitoringWrapper = ({ children }) => {
  useEffect(() => {
    // Initialize monitoring tools
    initSentry();
    initLogRocket();
  }, []);

  return <>{children}</>;
};

export default MonitoringWrapper;