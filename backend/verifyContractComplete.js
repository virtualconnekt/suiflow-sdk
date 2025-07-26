import { SuiClient } from '@mysten/sui.js/client';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_CONFIG = {
  packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
  processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882e52fd930cad1169d6feee',
  adminAddress: '0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd'
};

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

async function comprehensiveVerification() {
  console.log('🔍 SuiFlow Smart Contract Comprehensive Verification\n');
  
  let allChecksPass = true;

  try {
    // 1. Package Verification
    console.log('1️⃣ Package Verification...');
    try {
      const packageData = await suiClient.getObject({
        id: CONTRACT_CONFIG.packageId,
        options: { showContent: true, showType: true }
      });
      
      if (packageData.data) {
        console.log('✅ Package exists and is accessible');
        console.log(`   Package ID: ${CONTRACT_CONFIG.packageId}`);
        console.log(`   Version: ${packageData.data.version}`);
      } else {
        console.log('❌ Package not found');
        allChecksPass = false;
      }
    } catch (error) {
      console.log(`❌ Package error: ${error.message}`);
      allChecksPass = false;
    }

    // 2. Processor Object Verification
    console.log('\n2️⃣ Processor Object Verification...');
    try {
      const processorData = await suiClient.getObject({
        id: CONTRACT_CONFIG.processorObjectId,
        options: { showContent: true, showType: true, showOwner: true }
      });
      
      if (processorData.data) {
        console.log('✅ Processor object exists and is accessible');
        console.log(`   Object ID: ${CONTRACT_CONFIG.processorObjectId}`);
        console.log(`   Type: ${processorData.data.type}`);
        console.log(`   Owner: ${processorData.data.owner?.Shared ? 'Shared Object ✅' : 'Not Shared ❌'}`);
        console.log(`   Version: ${processorData.data.version}`);
        
        // Check if it's the correct type
        if (processorData.data.type?.includes('PaymentProcessor')) {
          console.log('✅ Correct PaymentProcessor type');
        } else {
          console.log('⚠️  Unexpected object type');
        }
      } else {
        console.log('❌ Processor object not found');
        allChecksPass = false;
      }
    } catch (error) {
      console.log(`❌ Processor object error: ${error.message}`);
      allChecksPass = false;
    }

    // 3. Admin Address Verification
    console.log('\n3️⃣ Admin Address Verification...');
    try {
      const adminBalance = await suiClient.getBalance({
        owner: CONTRACT_CONFIG.adminAddress,
        coinType: '0x2::sui::SUI'
      });
      
      const balance = parseFloat(adminBalance.totalBalance) / 1000000000;
      console.log('✅ Admin address is valid');
      console.log(`   Address: ${CONTRACT_CONFIG.adminAddress}`);
      console.log(`   Balance: ${balance} SUI`);
      
      if (balance > 0) {
        console.log('✅ Admin has SUI balance for gas');
      } else {
        console.log('⚠️  Admin has no SUI balance');
      }
    } catch (error) {
      console.log(`❌ Admin address error: ${error.message}`);
      allChecksPass = false;
    }

    // 4. Function Inspection
    console.log('\n4️⃣ Smart Contract Function Inspection...');
    try {
      // Get the normalized package structure
      const packageData = await suiClient.getNormalizedMoveModulesByPackage({
        package: CONTRACT_CONFIG.packageId
      });
      
      if (packageData && packageData.payment_processor) {
        const module = packageData.payment_processor;
        console.log('✅ Found payment_processor module');
        
        // Check for our expected functions
        const expectedFunctions = ['process_widget_payment', 'withdraw_admin_fees'];
        const availableFunctions = Object.keys(module.exposedFunctions || {});
        
        console.log(`   Available functions: ${availableFunctions.join(', ')}`);
        
        expectedFunctions.forEach(func => {
          if (availableFunctions.includes(func)) {
            console.log(`   ✅ Function '${func}' found`);
          } else {
            console.log(`   ❌ Function '${func}' missing`);
            allChecksPass = false;
          }
        });
      } else {
        console.log('❌ payment_processor module not found');
        allChecksPass = false;
      }
    } catch (error) {
      console.log(`❌ Function inspection error: ${error.message}`);
      allChecksPass = false;
    }

    // 5. Network and RPC Status
    console.log('\n5️⃣ Network Status...');
    try {
      const rpcVersion = await suiClient.getRpcApiVersion();
      const chainId = await suiClient.getChainIdentifier();
      
      console.log('✅ Network connection healthy');
      console.log(`   RPC Version: ${rpcVersion}`);
      console.log(`   Chain: ${chainId}`);
      console.log(`   Endpoint: https://fullnode.testnet.sui.io:443`);
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
      allChecksPass = false;
    }

    // 6. Recent Activity Check
    console.log('\n6️⃣ Contract Activity History...');
    try {
      const txs = await suiClient.queryTransactionBlocks({
        filter: {
          InputObject: CONTRACT_CONFIG.processorObjectId
        },
        limit: 10,
        order: 'descending'
      });

      if (txs.data && txs.data.length > 0) {
        console.log(`✅ Found ${txs.data.length} transactions using this contract`);
        console.log('   Recent activity:');
        
        for (let i = 0; i < Math.min(5, txs.data.length); i++) {
          const tx = txs.data[i];
          const date = new Date(parseInt(tx.timestampMs)).toLocaleString();
          console.log(`   • ${tx.digest.substring(0, 16)}... (${date})`);
        }
        
        console.log('\n💡 Your contract has been used! This is a great sign.');
      } else {
        console.log('📝 No transactions found yet (contract not used)');
        console.log('💡 This is normal for a newly deployed contract');
      }
    } catch (error) {
      console.log(`⚠️  Activity check failed: ${error.message}`);
      // Don't fail verification for this
    }

    // 7. Configuration Summary
    console.log('\n7️⃣ Configuration Summary...');
    console.log('📋 Smart Contract Configuration:');
    console.log(`   Package ID: ${CONTRACT_CONFIG.packageId}`);
    console.log(`   Processor Object: ${CONTRACT_CONFIG.processorObjectId}`);
    console.log(`   Admin Address: ${CONTRACT_CONFIG.adminAddress}`);
    console.log(`   Admin Fee: 0.01 SUI per transaction`);
    console.log(`   Network: Sui Testnet`);

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (allChecksPass) {
      console.log('🎉 VERIFICATION SUCCESSFUL!');
      console.log('✅ Your smart contract is fully operational and ready for testing');
      console.log('\n🚀 Next Steps:');
      console.log('   1. Install a Sui wallet (Suiet recommended)');
      console.log('   2. Switch wallet to testnet');
      console.log('   3. Get testnet SUI from faucet.sui.io');
      console.log('   4. Test at: http://localhost:5173/live-contract-test.html');
    } else {
      console.log('❌ VERIFICATION FAILED');
      console.log('⚠️  Some issues were detected. Please review the errors above.');
    }
    console.log('='.repeat(60));

    return allChecksPass;

  } catch (error) {
    console.error('\n❌ Verification process failed:', error);
    return false;
  }
}

// Run comprehensive verification
comprehensiveVerification().then(success => {
  process.exit(success ? 0 : 1);
});
