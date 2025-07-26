import dotenv from 'dotenv';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

dotenv.config();

// Sui client configuration
const suiClient = new SuiClient({ 
  url: process.env.SUI_RPC_URL || getFullnodeUrl('testnet') 
});

// Original demo payment verifier (for backward compatibility)
const PaymentVerifier = {
    verifyPayment: (transactionId) => {
        console.log('Verifying payment with transaction ID:', transactionId);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    transactionId: transactionId,
                    status: 'verified',
                    timestamp: new Date(),
                });
            }, 1000);
        });
    }
}

// Smart Contract Configuration
const SMART_CONTRACT_CONFIG = {
  packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
  processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
  adminAddress: '0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd',
  adminFee: 0.01 // 0.01 SUI admin fee
};

// Verify smart contract payment
const verifySmartContractPayment = async (txn, expectedAmountSui, merchantAddress) => {
  try {
    console.log('🔍 Verifying smart contract payment...');
    
    // Check if transaction called our smart contract
    const moveCall = txn.transaction?.data?.transaction?.kind?.ProgrammableTransaction?.transactions?.find(
      tx => tx.MoveCall?.package === SMART_CONTRACT_CONFIG.packageId
    );
    
    if (!moveCall) {
      console.log('❌ Transaction did not call our smart contract');
      return false;
    }
    
    console.log('✅ Transaction called our smart contract');
    
    // Check events for payment processing
    const events = txn.events || [];
    console.log(`Found ${events.length} events in transaction`);
    
    // Look for a payment processed event or balance changes
    const balanceChanges = txn.balanceChanges || [];
    console.log('Balance changes:', balanceChanges.length);
    
    // Verify merchant received the correct amount (total - admin fee)
    const expectedMerchantAmount = parseFloat(expectedAmountSui) - SMART_CONTRACT_CONFIG.adminFee;
    const expectedMerchantAmountMist = Math.floor(expectedMerchantAmount * 1_000_000_000);
    
    // Find merchant balance change
    const merchantBalanceChange = balanceChanges.find(change => 
      (change.owner?.AddressOwner === merchantAddress || change.owner === merchantAddress) && 
      change.coinType === '0x2::sui::SUI' &&
      parseInt(change.amount) > 0
    );
    
    if (!merchantBalanceChange) {
      console.log('❌ No positive balance change found for merchant');
      return false;
    }
    
    const receivedAmount = parseInt(merchantBalanceChange.amount);
    console.log(`✅ Merchant received: ${receivedAmount} MIST (${receivedAmount / 1_000_000_000} SUI)`);
    console.log(`Expected merchant amount: ${expectedMerchantAmountMist} MIST (${expectedMerchantAmount} SUI)`);
    
    // Allow for small differences due to gas costs
    const tolerance = 1_000_000; // 0.001 SUI tolerance
    const amountDifference = Math.abs(receivedAmount - expectedMerchantAmountMist);
    
    if (amountDifference > tolerance) {
      console.log(`❌ Amount mismatch: expected ${expectedMerchantAmountMist}, received ${receivedAmount}`);
      return false;
    }
    
    // Verify admin received the fee
    const adminBalanceChange = balanceChanges.find(change => 
      (change.owner?.AddressOwner === SMART_CONTRACT_CONFIG.adminAddress || change.owner === SMART_CONTRACT_CONFIG.adminAddress) && 
      change.coinType === '0x2::sui::SUI' &&
      parseInt(change.amount) > 0
    );
    
    if (adminBalanceChange) {
      const adminReceived = parseInt(adminBalanceChange.amount);
      console.log(`✅ Admin received fee: ${adminReceived} MIST (${adminReceived / 1_000_000_000} SUI)`);
    } else {
      console.log('⚠️ Admin fee not found in balance changes (may be handled differently)');
    }
    
    console.log('✅ Smart contract payment verification successful');
    return true;
    
  } catch (error) {
    console.error('❌ Smart contract verification error:', error);
    return false;
  }
};

// Verify traditional payment
const verifyTraditionalPayment = async (txn, expectedAmountSui, merchantAddress) => {
  try {
    console.log('🔍 Verifying traditional payment...');
    
    // Convert expected amount to MIST for comparison
    const expectedAmountMist = Math.floor(parseFloat(expectedAmountSui) * 1_000_000_000);
    
    // Check balance changes to verify the payment
    const balanceChanges = txn.balanceChanges || [];
    console.log('Balance changes found:', balanceChanges.length);
    
    // Look for a positive balance change for the merchant address
    console.log('Looking for merchant address:', merchantAddress);
    console.log('Balance changes:', balanceChanges.map(bc => ({
      owner: bc.owner,
      ownerType: typeof bc.owner,
      coinType: bc.coinType,
      amount: bc.amount
    })));
    
    const merchantBalanceChange = balanceChanges.find(change => 
      (change.owner?.AddressOwner === merchantAddress || change.owner === merchantAddress) && 
      change.coinType === '0x2::sui::SUI' &&
      parseInt(change.amount) > 0
    );
    
    if (!merchantBalanceChange) {
      console.log('No positive balance change found for merchant');
      console.log('Available balance changes:', balanceChanges.map(bc => ({
        owner: bc.owner,
        coinType: bc.coinType,
        amount: bc.amount
      })));
      
      // Fallback: Check transaction effects for transfers
      console.log('Trying fallback verification using transaction effects...');
      const effects = txn.effects;
      
      if (effects && effects.events) {
        const transferEvents = effects.events.filter(event => 
          event.type === 'transfer' && 
          event.recipient && 
          (event.recipient.AddressOwner === merchantAddress || event.recipient === merchantAddress)
        );
        
        if (transferEvents.length > 0) {
          console.log('Found transfer events to merchant:', transferEvents.length);
          console.log('Traditional payment verification successful (via fallback)');
          return true;
        }
      }
      
      return false;
    }
    
    const receivedAmount = parseInt(merchantBalanceChange.amount);
    console.log(`Received amount: ${receivedAmount} MIST (${receivedAmount / 1_000_000_000} SUI)`);
    
    // Allow for small differences due to gas costs
    const tolerance = 1_000_000; // 0.001 SUI tolerance
    const amountDifference = Math.abs(receivedAmount - expectedAmountMist);
    
    if (amountDifference > tolerance) {
      console.log(`Amount mismatch: expected ${expectedAmountMist}, received ${receivedAmount}`);
      return false;
    }
    
    console.log('✅ Traditional payment verification successful');
    return true;
    
  } catch (error) {
    console.error('❌ Traditional payment verification error:', error);
    return false;
  }
};

// Enhanced payment verification that supports both traditional and smart contract payments
export const verifySuiPayment = async (txnHash, expectedAmountSui, merchantAddress, paymentType = 'traditional') => {
  try {
    console.log(`Verifying ${paymentType} transaction: ${txnHash}`);
    console.log(`Expected amount: ${expectedAmountSui} SUI`);
    console.log(`Expected recipient: ${merchantAddress}`);
    console.log(`Using RPC URL: ${process.env.SUI_RPC_URL}`);
    
    // Test RPC connection first
    try {
      await suiClient.getRpcApiVersion();
      console.log('SUI RPC connection successful');
    } catch (rpcError) {
      console.error('SUI RPC connection failed:', rpcError);
      return false;
    }
    
    const txn = await suiClient.getTransactionBlock({ 
      digest: txnHash,
      options: { showBalanceChanges: true, showEffects: true, showEvents: true, showInput: true }
    });
    
    console.log('Transaction retrieved:', txn ? 'Yes' : 'No');
    console.log('Transaction effects:', txn?.effects?.status);
    
    // Check if transaction exists and was successful
    if (!txn || txn.effects.status.status !== 'success') {
      console.log('Transaction not found or failed');
      return false;
    }

    // Handle smart contract transactions differently
    if (paymentType === 'smart_contract') {
      return await verifySmartContractPayment(txn, expectedAmountSui, merchantAddress);
    } else {
      return await verifyTraditionalPayment(txn, expectedAmountSui, merchantAddress);
    }
  } catch (error) {
    console.error('Sui verification error:', error);
    return false;
  }
};

// SuiPaymentVerifier object that includes all verification methods
const SuiPaymentVerifier = {
  verifySuiPayment: verifySuiPayment,
  verifyPayment: PaymentVerifier.verifyPayment,
  verifySmartContractPayment: verifySmartContractPayment,
  verifyTraditionalPayment: verifyTraditionalPayment
};

export default SuiPaymentVerifier;