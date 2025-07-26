// SuiFlow Admin Fee Checker
// Use this to check and withdraw your collected fees

const PROCESSOR_OBJECT_ID = '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee';
const RPC_URL = 'https://fullnode.testnet.sui.io:443';

// Check fees collected in your smart contract
async function checkAdminFees() {
    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'sui_getObject',
                params: [PROCESSOR_OBJECT_ID, { showContent: true }]
            })
        });

        const data = await response.json();
        
        if (data.result && data.result.data) {
            const content = data.result.data.content;
            const fields = content.fields;
            
            const feesCollected = parseInt(fields.total_fees_collected) / 1000000000; // Convert MIST to SUI
            const paymentsProcessed = fields.total_payments_processed;
            
            console.log('💰 SuiFlow Admin Dashboard:');
            console.log(`📊 Total Payments Processed: ${paymentsProcessed}`);
            console.log(`💳 Total Fees Collected: ${feesCollected} SUI`);
            console.log(`💸 Revenue: ${feesCollected * getCurrentSuiPrice()} USD (estimated)`);
            
            return {
                feesCollected,
                paymentsProcessed,
                revenue: feesCollected * getCurrentSuiPrice()
            };
        }
    } catch (error) {
        console.error('❌ Error checking fees:', error);
    }
}

// Estimate USD value (you can replace with real price API)
function getCurrentSuiPrice() {
    return 1.50; // Estimated SUI price in USD
}

// To withdraw fees, run this command in terminal:
const WITHDRAWAL_COMMAND = `
sui client call \\
  --package 0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6 \\
  --module payment_processor \\
  --function withdraw_admin_fees \\
  --args ${PROCESSOR_OBJECT_ID} \\
  --gas-budget 10000000
`;

console.log('🔧 To withdraw collected fees, run this command:');
console.log(WITHDRAWAL_COMMAND);

// Auto-check fees every 30 seconds
setInterval(checkAdminFees, 30000);

// Initial check
checkAdminFees();
