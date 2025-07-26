import React, { useState, useEffect } from 'react';
import './FlowXLinkGenerator.css';

/**
 * FlowX Link Generator Component
 * 
 * This component allows merchants to generate custom FlowX swap links
 * that can be shared with customers or embedded in payment pages.
 * Now with customer form support!
 */
const FlowXLinkGenerator = ({ defaultAmount = 1, defaultFromToken = 'USDC', defaultToToken = 'SUI', orderId = '' }) => {
  // State for form inputs
  const [amount, setAmount] = useState(defaultAmount);
  const [fromToken, setFromToken] = useState(defaultFromToken);
  const [toToken, setToToken] = useState(defaultToToken);
  const [slippage, setSlippage] = useState(0.5);
  const [chainId, setChainId] = useState('testnet');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Customer form options
  const [includeCustomerForm, setIncludeCustomerForm] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [requiredFields, setRequiredFields] = useState({
    email: true,
    name: true,
    shipping: false,
    phone: false
  });
  
  const [availableTokens, setAvailableTokens] = useState([
    { symbol: 'SUI', name: 'Sui', address: '0x2::sui::SUI' },
    { symbol: 'USDC', name: 'USD Coin', address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN' },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN' },
    { symbol: 'WETH', name: 'Wrapped Ether', address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::WETH' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::WBTC' }
  ]);

  // Set up redirect URL when component mounts or orderId changes
  useEffect(() => {
    // Only set redirect URL if it's not already set
    if (!redirectUrl && orderId) {
      setRedirectUrl(`${window.location.origin}/checkout/complete?orderId=${orderId}`);
    } else if (!redirectUrl && window.location.origin) {
      setRedirectUrl(`${window.location.origin}/checkout/complete`);
    }
  }, [orderId, redirectUrl]);

  // Generate link when form inputs change
  useEffect(() => {
    generateLink();
  }, [amount, fromToken, toToken, slippage, chainId, includeCustomerForm, redirectUrl, requiredFields]);

  // Function to generate FlowX swap link
  const generateLink = () => {
    const baseUrl = 'https://app.flowx.finance/swap';
    
    // Get token addresses
    const fromTokenObj = availableTokens.find(token => token.symbol === fromToken);
    const toTokenObj = availableTokens.find(token => token.symbol === toToken);
    
    if (!fromTokenObj || !toTokenObj) return;
    
    const params = new URLSearchParams({
      inputAmount: amount.toString(),
      inputToken: fromTokenObj.address,
      outputToken: toTokenObj.address,
      slippage: slippage.toString(),
      network: chainId,
      referrer: 'suiflow' // Your app name as referrer
    });
    
    // Add customer form parameters if enabled
    if (includeCustomerForm) {
      params.append('showForm', 'true');
      params.append('formTitle', 'Complete your information');
      
      // Add required fields
      const fieldsList = Object.entries(requiredFields)
        .filter(([_, isRequired]) => isRequired)
        .map(([field]) => field)
        .join(',');
      
      params.append('requiredFields', fieldsList);
      
      // Add redirect URL without pre-filled data
      if (redirectUrl) {
        params.append('redirectUrl', redirectUrl);
        // Specify that no fields should be pre-filled
        params.append('allowPrefill', 'false');
      }
    }
    
    const link = `${baseUrl}?${params.toString()}`;
    setGeneratedLink(link);
  };

  // Toggle field in required fields
  const toggleField = (field) => {
    setRequiredFields({
      ...requiredFields,
      [field]: !requiredFields[field]
    });
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flowx-link-generator">
      <h3>FlowX Swap Link Generator</h3>
      <p className="generator-description">
        Create custom links to the FlowX swap interface for your customers.
        These links will pre-fill swap parameters based on your configuration.
      </p>
      
      <div className="generator-form">
        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input 
            id="amount"
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            min="0.000001"
            step="0.1"
            className="amount-input"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fromToken">From Token:</label>
            <select 
              id="fromToken"
              value={fromToken} 
              onChange={(e) => {
                setFromToken(e.target.value);
                // Avoid same token in both fields
                if (e.target.value === toToken) {
                  setToToken(fromToken);
                }
              }}
              className="token-select"
            >
              {availableTokens.map(token => (
                <option key={`from-${token.symbol}`} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="swap-icon" onClick={() => {
            const temp = fromToken;
            setFromToken(toToken);
            setToToken(temp);
          }}>
            ⇄
          </div>
          
          <div className="form-group">
            <label htmlFor="toToken">To Token:</label>
            <select 
              id="toToken"
              value={toToken} 
              onChange={(e) => setToToken(e.target.value)}
              className="token-select"
            >
              {availableTokens.map(token => (
                <option key={`to-${token.symbol}`} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="slippage">Slippage Tolerance (%):</label>
          <input 
            id="slippage"
            type="number" 
            value={slippage} 
            onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
            min="0.1"
            max="5"
            step="0.1"
            className="slippage-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="chainId">Network:</label>
          <select 
            id="chainId"
            value={chainId} 
            onChange={(e) => setChainId(e.target.value)}
            className="network-select"
          >
            <option value="testnet">Testnet</option>
            <option value="mainnet">Mainnet</option>
          </select>
        </div>
        
        {/* Customer Form Section */}
        <div className="form-section customer-form-section">
          <div className="form-header">
            <h4>Customer Form Options</h4>
            <div className="toggle-container">
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={includeCustomerForm}
                  onChange={() => setIncludeCustomerForm(!includeCustomerForm)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Include customer form</span>
            </div>
          </div>
          
          {includeCustomerForm && (
            <>
              <div className="form-info-message">
                <p>The customer will fill out this form after completing their swap. No information will be pre-filled.</p>
              </div>
              <div className="form-fields">
                <h5>Required Fields:</h5>
                <div className="checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={requiredFields.email}
                      onChange={() => toggleField('email')}
                    />
                    Email
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      checked={requiredFields.name}
                      onChange={() => toggleField('name')}
                    />
                    Name
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      checked={requiredFields.shipping}
                      onChange={() => toggleField('shipping')}
                    />
                    Shipping Address
                  </label>
                  
                  <label>
                    <input 
                      type="checkbox" 
                      checked={requiredFields.phone}
                      onChange={() => toggleField('phone')}
                    />
                    Phone Number
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="redirectUrl">Redirect URL after completion:</label>
                <input 
                  id="redirectUrl"
                  type="text" 
                  value={redirectUrl} 
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://yoursite.com/checkout/complete"
                  className="redirect-input"
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="generated-link-container">
        <div className="link-preview">
          <div className="preview-label">Preview:</div>
          <div className="preview-content">
            Swap {amount} {fromToken} to {toToken} on FlowX ({chainId})
            {includeCustomerForm && (
              <span className="form-badge">with customer form</span>
            )}
          </div>
        </div>
        
        <div className="link-field">
          <input 
            type="text" 
            value={generatedLink} 
            readOnly 
            className="link-input"
            onClick={(e) => e.target.select()}
          />
          <button 
            onClick={copyToClipboard}
            className={`copy-button ${copied ? 'copied' : ''}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="open-link">
          <a 
            href={generatedLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="open-button"
          >
            Open in FlowX
          </a>
        </div>
        
        {includeCustomerForm && (
          <div className="form-details">
            <h5>Form Details:</h5>
            <ul>
              <li>
                <strong>Fields to Complete:</strong> {Object.entries(requiredFields)
                  .filter(([_, isRequired]) => isRequired)
                  .map(([field]) => field)
                  .join(', ')}
              </li>
              <li>
                <strong>Redirect URL:</strong> {redirectUrl || 'Not set'}
              </li>
              <li>
                <strong>Pre-filled Data:</strong> None (customer will enter all information)
              </li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="integration-examples">
        <h4>Integration Examples</h4>
        <div className="tabs">
          <div className="tab">
            <h5>HTML Link</h5>
            <pre className="code-block">{`<a href="${generatedLink}" target="_blank">
  Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}
</a>`}</pre>
            <button onClick={() => navigator.clipboard.writeText(`<a href="${generatedLink}" target="_blank">\n  Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}\n</a>`)}>
              Copy Code
            </button>
          </div>
          
          <div className="tab">
            <h5>Button with JavaScript</h5>
            <pre className="code-block">{`<button onclick="window.open('${generatedLink}', '_blank')">
  Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}
</button>`}</pre>
            <button onClick={() => navigator.clipboard.writeText(`<button onclick="window.open('${generatedLink}', '_blank')">\n  Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}\n</button>`)}>
              Copy Code
            </button>
          </div>
          
          <div className="tab">
            <h5>React Component</h5>
            <pre className="code-block">{`import React from 'react';

const SwapButton = () => {
  return (
    <button 
      onClick={() => window.open('${generatedLink}', '_blank')}
      className="swap-button"
    >
      Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}
    </button>
  );
};

export default SwapButton;`}</pre>
            <button onClick={() => navigator.clipboard.writeText(`import React from 'react';\n\nconst SwapButton = () => {\n  return (\n    <button \n      onClick={() => window.open('${generatedLink}', '_blank')}\n      className="swap-button"\n    >\n      Swap ${amount} ${fromToken} to ${toToken}${includeCustomerForm ? ' (with customer form)' : ''}\n    </button>\n  );\n};\n\nexport default SwapButton;`)}>
              Copy Code
            </button>
          </div>
          
          {includeCustomerForm && (
            <div className="tab">
              <h5>Process Form Data (Server-side)</h5>
              <pre className="code-block">{`// Example Express.js route to handle form submission
app.get('/checkout/complete', (req, res) => {
  // Get form data from query parameters (all filled by customer)
  const { 
    email, 
    name, 
    shipping, 
    phone,
    orderId
  } = req.query;
  
  // Process the customer-entered data
  console.log('Customer data received:', { 
    email, name, shipping, phone, orderId 
  });
  
  // Save customer information to database
  saveCustomerData(email, name, shipping, phone);
  
  // Complete the order
  // ...
  
  // Show success page
  res.send('Order completed successfully!');
});`}</pre>
              <button onClick={() => navigator.clipboard.writeText(`// Example Express.js route to handle form submission\napp.get('/checkout/complete', (req, res) => {\n  // Get form data from query parameters\n  const { \n    email, \n    name, \n    shipping, \n    phone,\n    orderId\n  } = req.query;\n  \n  // Process the form data\n  console.log('Customer data received:', { \n    email, name, shipping, phone, orderId \n  });\n  \n  // Complete the order\n  // ...\n  \n  // Show success page\n  res.send('Order completed successfully!');\n});`)}>
                Copy Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowXLinkGenerator;
