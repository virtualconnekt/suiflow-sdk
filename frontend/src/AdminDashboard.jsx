import React from 'react';
import SuiFlowDashboard from './components/SuiFlowDashboard.jsx';

// Legacy wrapper for AdminDashboard - redirects to the new SuiFlowDashboard
const AdminDashboard = () => {
  return <SuiFlowDashboard />;
};

export default AdminDashboard;
