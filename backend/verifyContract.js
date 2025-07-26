import { SuiClient } from '@mysten/sui.js/client';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_CONFIG = {
  packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
  processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
  adminAddress: '0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd'
};

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

async function verifySmartContract() {
  console.log('🔍 SuiFlow Smart Contract Verification\n');
  
  try {
    // 1. Verify Package Exists
    console.log('1️⃣ Checking Package Existence...');
    try {
      const packageData = await suiClient.getObject({
        id: CONTRACT_CONFIG.packageId,
        options: { showContent: true, showType: true }
      });
      
      if (packageData.data) {
        console.log('✅ Package found and accessible');
        console.log(`   Package ID: ${CONTRACT_CONFIG.packageId}`);
      } else {
        console.log('❌ Package not found');
        return false;
      }
    } catch (error) {
      console.log(`❌ Package check failed: ${error.message}`);
      return false;
    }

    // 2. Verify Processor Object
    console.log('\n2️⃣ Checking Processor Object...');
    try {
      const processorData = await suiClient.getObject({
        id: CONTRACT_CONFIG.processorObjectId,
        options: { showContent: true, showType: true, showOwner: true }
      });
      
      if (processorData.data) {
        console.log('✅ Processor object found and accessible');
        console.log(`   Object ID: ${CONTRACT_CONFIG.processorObjectId}`);
        console.log(`   Type: ${processorData.data.type}`);
        console.log(`   Owner Type: ${processorData.data.owner?.ObjectOwner ? 'Shared Object' : 'Other'}`);
      } else {
        console.log('❌ Processor object not found');
        return false;
      }
    } catch (error) {
      console.log(`❌ Processor object check failed: ${error.message}`);
      return false;
    }

    // 3. Verify Admin Address
    console.log('\n3️⃣ Checking Admin Address...');
    try {
      const adminBalance = await suiClient.getBalance({
        owner: CONTRACT_CONFIG.adminAddress,
        coinType: '0x2::sui::SUI'
      });
      
      console.log('✅ Admin address is valid');
      console.log(`   Address: ${CONTRACT_CONFIG.adminAddress}`);
      console.log(`   Balance: ${parseFloat(adminBalance.totalBalance) / 1000000000} SUI`);
    } catch (error) {
      console.log(`❌ Admin address check failed: ${error.message}`);
      return false;
    }

    // 4. Check Recent Transactions
    console.log('\n4️⃣ Looking for Recent Contract Activity...');
    try {
      // Get transactions involving the processor object
      const txs = await suiClient.queryTransactionBlocks({
        filter: {
          InputObject: CONTRACT_CONFIG.processorObjectId
        },
        limit: 5,
        order: 'descending'
      });

      if (txs.data && txs.data.length > 0) {
        console.log(`✅ Found ${txs.data.length} recent transactions`);
        console.log('   Recent activity:');
        
        for (let i = 0; i < Math.min(3, txs.data.length); i++) {
          const tx = txs.data[i];
          const date = new Date(parseInt(tx.timestampMs)).toLocaleString();
          console.log(`   • ${tx.digest.substring(0, 12)}... (${date})`);
        }
      } else {
        console.log('⚠️  No recent transactions found (contract not used yet)');
      }
    } catch (error) {
      console.log(`⚠️  Could not fetch transaction history: ${error.message}`);
    }

    // 5. Network Status
    console.log('\n5️⃣ Network Status...');
    try {
      const networkInfo = await suiClient.getRpcApiVersion();
      console.log(`✅ Connected to Sui Testnet`);
      console.log(`   RPC Version: ${networkInfo}`);
    } catch (error) {
      console.log(`❌ Network connection failed: ${error.message}`);
      return false;
    }

    console.log('\n🎉 Smart Contract Verification Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Package deployed and accessible');
    console.log('✅ Processor object ready for transactions');
    console.log('✅ Admin address configured');
    console.log('✅ Network connection healthy');
    console.log('\n🚀 Your smart contract is ready for testing!');
    
    return true;

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    return false;
  }
}

// Run verification
verifySmartContract().then(success => {
  if (success) {
    console.log('\n✅ All systems operational - proceed with testing!');
  } else {
    console.log('\n❌ Issues detected - please review the errors above');
  }
  process.exit(success ? 0 : 1);
});
