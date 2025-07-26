import React from 'react';
import FlowXLinkGenerator from '../components/FlowXLinkGenerator';
import './FlowXDemo.css';

/**
 * FlowX Demo Page
 * 
 * This page demonstrates how to use the FlowX Link Generator and 
 * how to integrate FlowX swap widget directly into a checkout page.
 */
const FlowXDemo = () => {
  return (
    <div className="flowx-demo-page">
      <header className="demo-header">
        <h1>FlowX Integration Demo</h1>
        <p>Learn how to integrate FlowX swaps with your SuiFlow checkout process</p>
      </header>
      
      <div className="demo-container">
        <section className="demo-section">
          <h2>1. FlowX Link Generator</h2>
          <p>
            Generate custom FlowX swap links that you can share with your customers or 
            embed in your payment pages. These links will pre-fill swap parameters based 
            on your configuration.
          </p>
          
          <FlowXLinkGenerator 
            defaultAmount={10} 
            defaultFromToken="USDC" 
            defaultToToken="SUI" 
          />
          
          <div className="section-tips">
            <h3>Use Cases</h3>
            <ul>
              <li>
                <strong>Pre-checkout preparation:</strong> Send customers a link to swap tokens before they start the checkout process
              </li>
              <li>
                <strong>Email campaigns:</strong> Include swap links in your marketing emails
              </li>
              <li>
                <strong>Custom integration:</strong> Create your own UI around the FlowX swap functionality
              </li>
            </ul>
          </div>
        </section>
        
        <section className="demo-section">
          <h2>2. Embedded FlowX Widget</h2>
          <p>
            Embed the FlowX swap widget directly in your checkout page to provide 
            a seamless experience for your customers.
          </p>
          
          <div className="widget-demo">
            <div className="checkout-simulation">
              <div className="product-details">
                <h3>Product: Premium SUI NFT</h3>
                <div className="price">10 SUI</div>
              </div>
              
              <div className="widget-container">
                <div className="widget-header">
                  <h4>Need to swap tokens?</h4>
                  <p>Use the widget below to swap your tokens to SUI</p>
                </div>
                
                <div 
                  id="flowx-swap-widget" 
                  data-chainid="testnet" 
                  data-theme="light" 
                  data-primary-token="0x2::sui::SUI" 
                  data-default-amount="10"
                  className="flowx-widget"
                >
                  {/* FlowX Widget will be injected here by the script */}
                  <div className="widget-placeholder">
                    <p>FlowX Widget Preview</p>
                    <p className="small">(Actual widget will load when script is included)</p>
                  </div>
                </div>
                
                <div className="integration-code">
                  <h4>Integration Code</h4>
                  <pre className="code-block">{`<!-- HTML Markup -->
<div 
  id="flowx-swap-widget" 
  data-chainid="testnet" 
  data-theme="light" 
  data-primary-token="0x2::sui::SUI" 
  data-default-amount="10"
></div>

<!-- Include the FlowX Widget Script -->
<script src="https://unpkg.com/@flowx-swap/widget@latest/dist/flowx-widget.js"></script>`}</pre>
                </div>
              </div>
              
              <button className="payment-button">Continue to Payment</button>
            </div>
          </div>
          
          <div className="section-tips">
            <h3>Widget Configuration Options</h3>
            <table className="config-table">
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Description</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>data-chainid</td>
                  <td>Network to use (testnet or mainnet)</td>
                  <td>"testnet"</td>
                </tr>
                <tr>
                  <td>data-theme</td>
                  <td>Widget theme (light or dark)</td>
                  <td>"light"</td>
                </tr>
                <tr>
                  <td>data-primary-token</td>
                  <td>Default output token address</td>
                  <td>"0x2::sui::SUI"</td>
                </tr>
                <tr>
                  <td>data-default-amount</td>
                  <td>Default amount to swap</td>
                  <td>"10"</td>
                </tr>
                <tr>
                  <td>data-default-input-token</td>
                  <td>Default input token address (optional)</td>
                  <td>"0x5d4b...::coin::USDC"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        
        <section className="demo-section">
          <h2>3. Complete Integration Example</h2>
          <p>
            Here's how to create a complete checkout experience with FlowX integration
            using SuiFlow SDK.
          </p>
          
          <pre className="code-block">{`import React, { useState, useEffect } from 'react';
import SuiFlowSDK from 'suiflow-sdk';

const IntegratedCheckout = ({ productId, merchantId, amount }) => {
  const [sdk, setSdk] = useState(null);
  const [showSwapWidget, setShowSwapWidget] = useState(false);
  
  useEffect(() => {
    // Initialize SuiFlow SDK
    const suiFlowSdk = new SuiFlowSDK({
      baseUrl: 'https://api.suiflow.xyz',
      environment: 'production',
      useSmartContract: true
    });
    setSdk(suiFlowSdk);
    
    // Initialize FlowX Widget
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@flowx-swap/widget@latest/dist/flowx-widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const handlePayment = () => {
    if (!sdk) return;
    
    sdk.payWithWidget({
      merchantId: merchantId,
      amount: amount,
      productId: productId,
      onSuccess: (txHash, amount, details) => {
        console.log(\`Payment successful! Transaction: \${txHash}\`);
        // Handle success (redirect to confirmation page, etc.)
      },
      onError: (error) => {
        console.error(\`Payment failed: \${error}\`);
        // Show error message
      }
    });
  };
  
  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <div className="product-details">
        <h3>Product: {productId}</h3>
        <div className="price">{amount} SUI</div>
      </div>
      
      <div className="payment-options">
        <button 
          className="swap-button" 
          onClick={() => setShowSwapWidget(!showSwapWidget)}
        >
          {showSwapWidget ? 'Hide' : 'Show'} Token Swap Widget
        </button>
        
        {showSwapWidget && (
          <div className="flowx-widget-container">
            <div 
              id="flowx-swap-widget" 
              data-chainid="mainnet" 
              data-theme="light" 
              data-primary-token="0x2::sui::SUI" 
              data-default-amount={amount}
            />
          </div>
        )}
        
        <button 
          className="payment-button" 
          onClick={handlePayment}
        >
          Pay with SUI
        </button>
      </div>
    </div>
  );
};

export default IntegratedCheckout;`}</pre>
        </section>
      </div>
    </div>
  );
};

export default FlowXDemo;
