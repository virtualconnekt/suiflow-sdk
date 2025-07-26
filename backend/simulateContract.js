import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_CONFIG = {
  packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
  processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
  adminAddress: '0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd'
};

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

async function simulateSmartContract() {
  console.log('🧪 SuiFlow Smart Contract Simulation\n');
  
  try {
    // Test data
    const testMerchantAddress = '0x742e7a91c2e6b30c8c1e7ce5b4d9c8f7a5b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9';
    const testMerchantId = '68764e309fcf5da6c3f17f6d';
    const testProductId = 'test-widget';
    const testAmount = 0.1; // 0.1 SUI

    console.log('📋 Test Parameters:');
    console.log(`   Merchant: ${testMerchantAddress}`);
    console.log(`   Amount: ${testAmount} SUI`);
    console.log(`   Expected merchant receives: ${testAmount - 0.01} SUI`);
    console.log(`   Expected admin fee: 0.01 SUI\n`);

    // Create transaction block to simulate
    const txb = new TransactionBlock();
    
    // Add the smart contract call
    txb.moveCall({
      target: `${CONTRACT_CONFIG.packageId}::payment::process_widget_payment`,
      arguments: [
        txb.object(CONTRACT_CONFIG.processorObjectId),
        txb.pure(testMerchantAddress),
        txb.pure(Array.from(new TextEncoder().encode(testMerchantId))),
        txb.pure(Array.from(new TextEncoder().encode(testProductId)))
      ]
    });

    // Set gas budget
    txb.setGasBudget(30000000); // 0.03 SUI

    console.log('🔍 Simulating transaction (dry run)...');

    try {
      // Perform dry run to check if transaction would succeed
      const dryRunResult = await suiClient.dryRunTransactionBlock({
        transactionBlock: await txb.build({ client: suiClient })
      });

      console.log('\n📊 Simulation Results:');
      console.log(`   Status: ${dryRunResult.effects.status.status}`);
      
      if (dryRunResult.effects.status.status === 'success') {
        console.log('✅ Transaction would succeed!');
        
        // Analyze balance changes
        if (dryRunResult.balanceChanges && dryRunResult.balanceChanges.length > 0) {
          console.log('\n💰 Expected Balance Changes:');
          dryRunResult.balanceChanges.forEach(change => {
            const amount = parseInt(change.amount) / 1000000000;
            const owner = change.owner?.AddressOwner || change.owner;
            console.log(`   ${owner}: ${amount > 0 ? '+' : ''}${amount} SUI`);
          });
        }

        // Check gas usage
        if (dryRunResult.effects.gasUsed) {
          const gasUsed = dryRunResult.effects.gasUsed;
          const totalGas = (parseInt(gasUsed.computationCost) + parseInt(gasUsed.storageCost)) / 1000000000;
          console.log(`\n⛽ Estimated Gas: ${totalGas.toFixed(4)} SUI`);
        }

        // Check events
        if (dryRunResult.events && dryRunResult.events.length > 0) {
          console.log(`\n📡 Events: ${dryRunResult.events.length} event(s) would be emitted`);
        }

      } else {
        console.log('❌ Transaction would fail!');
        if (dryRunResult.effects.status.error) {
          console.log(`   Error: ${dryRunResult.effects.status.error}`);
        }
      }

    } catch (simulationError) {
      console.log('❌ Simulation failed:', simulationError.message);
      
      // Common error analysis
      if (simulationError.message.includes('Insufficient')) {
        console.log('💡 Likely cause: Insufficient balance for gas or payment');
      } else if (simulationError.message.includes('not found')) {
        console.log('💡 Likely cause: Contract object not found or not shared');
      } else if (simulationError.message.includes('function')) {
        console.log('💡 Likely cause: Function signature mismatch');
      }
      
      return false;
    }

    console.log('\n🎉 Smart Contract Simulation Complete!');
    return true;

  } catch (error) {
    console.error('\n❌ Simulation setup failed:', error);
    return false;
  }
}

// Run simulation
simulateSmartContract().then(success => {
  if (success) {
    console.log('\n✅ Contract simulation successful - ready for real testing!');
  } else {
    console.log('\n❌ Contract simulation failed - please check configuration');
  }
  process.exit(success ? 0 : 1);
});
