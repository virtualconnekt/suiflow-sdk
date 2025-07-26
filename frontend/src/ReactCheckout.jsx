import React from 'react';
import SuiFlowCheckout from './components/SuiFlowCheckout.jsx';

// Legacy wrapper for ReactCheckout - redirects to the new SuiFlowCheckout
const ReactCheckout = ({ productId }) => {
  return <SuiFlowCheckout productId={productId} />;
};

export default ReactCheckout;
