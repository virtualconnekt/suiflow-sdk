import { SuiClient } from '@mysten/sui.js/client';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACT_CONFIG = {
  packageId: '0x2a0eeb98d575a07fe472e02e3872fd5fabc960e0350c19e084aaff7535235fa6',
  processorObjectId: '0xd1a10185b58c7501bd23aedb5e7d1942bca97e0b882ee52fd930cad1169d6feee',
  adminAddress: '0x6b3bd536eb26182cfb83b921d2a2216e3275583298beeb1d736fc94dc29669cd'
};

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });

async function checkTransaction(txHash) {
  console.log(`🔍 Analyzing Transaction: ${txHash}\n`);
  
  try {
    // Get transaction details
    const txData = await suiClient.getTransactionBlock({
      digest: txHash,
      options: {
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
        showInput: true
      }
    });

    if (!txData) {
      console.log('❌ Transaction not found');
      return false;
    }

    console.log('📋 Transaction Analysis:');
    console.log(`   Status: ${txData.effects?.status?.status || 'Unknown'}`);
    console.log(`   Timestamp: ${new Date(parseInt(txData.timestampMs)).toLocaleString()}`);

    // Check if it's our smart contract
    let isOurContract = false;
    if (txData.transaction?.data?.transaction?.kind?.ProgrammableTransaction) {
      const transactions = txData.transaction.data.transaction.kind.ProgrammableTransaction.transactions;
      
      for (const tx of transactions) {
        if (tx.MoveCall?.package === CONTRACT_CONFIG.packageId) {
          isOurContract = true;
          console.log('✅ This is a SuiFlow smart contract transaction');
          console.log(`   Function: ${tx.MoveCall.function}`);
          console.log(`   Module: ${tx.MoveCall.module}`);
          break;
        }
      }
    }

    if (!isOurContract) {
      console.log('⚠️  This is not a SuiFlow smart contract transaction');
    }

    // Analyze balance changes
    if (txData.balanceChanges && txData.balanceChanges.length > 0) {
      console.log('\n💰 Balance Changes:');
      
      let merchantReceived = 0;
      let adminReceived = 0;
      let customerPaid = 0;
      
      txData.balanceChanges.forEach(change => {
        const amount = parseInt(change.amount) / 1000000000;
        const owner = change.owner?.AddressOwner || change.owner;
        
        console.log(`   ${owner}: ${amount > 0 ? '+' : ''}${amount} SUI`);
        
        // Track specific amounts
        if (amount > 0 && owner === CONTRACT_CONFIG.adminAddress) {
          adminReceived += amount;
        } else if (amount > 0) {
          merchantReceived += amount;
        } else if (amount < 0) {
          customerPaid += Math.abs(amount);
        }
      });

      // Verify fee structure
      console.log('\n🧮 Fee Analysis:');
      if (adminReceived > 0) {
        console.log(`✅ Admin fee collected: ${adminReceived} SUI`);
      } else {
        console.log('⚠️  No admin fee detected in balance changes');
      }
      
      if (merchantReceived > 0) {
        console.log(`✅ Merchant received: ${merchantReceived} SUI`);
      }
      
      if (customerPaid > 0) {
        console.log(`📊 Customer paid: ${customerPaid} SUI (including gas)`);
      }
      
      // Check if fee structure is correct
      if (adminReceived === 0.01) {
        console.log('✅ Admin fee is correct (0.01 SUI)');
      } else if (adminReceived > 0) {
        console.log(`⚠️  Admin fee unexpected: ${adminReceived} SUI (expected 0.01 SUI)`);
      }
    }

    // Check events
    if (txData.events && txData.events.length > 0) {
      console.log(`\n📡 Events Emitted: ${txData.events.length}`);
      txData.events.forEach((event, index) => {
        console.log(`   ${index + 1}. Type: ${event.type}`);
        if (event.parsedJson) {
          console.log(`      Data: ${JSON.stringify(event.parsedJson, null, 8)}`);
        }
      });
    }

    // Gas analysis
    if (txData.effects?.gasUsed) {
      const gasUsed = txData.effects.gasUsed;
      const totalGas = (parseInt(gasUsed.computationCost) + parseInt(gasUsed.storageCost)) / 1000000000;
      console.log(`\n⛽ Gas Usage: ${totalGas.toFixed(4)} SUI`);
      console.log(`   Computation: ${parseInt(gasUsed.computationCost) / 1000000000} SUI`);
      console.log(`   Storage: ${parseInt(gasUsed.storageCost) / 1000000000} SUI`);
    }

    // Explorer link
    console.log(`\n🔗 View on Explorer:`);
    console.log(`   https://testnet.suivision.xyz/txblock/${txHash}`);

    return true;

  } catch (error) {
    console.error('❌ Error analyzing transaction:', error.message);
    return false;
  }
}

// Get transaction hash from command line or use example
const txHash = process.argv[2];

if (!txHash) {
  console.log('📋 Usage: node checkTransaction.js <transaction_hash>');
  console.log('\n💡 Example:');
  console.log('   node checkTransaction.js FTUPeNBFCWUFnqNWypBpU51DGY2KA7sL5npyYZtpTw1B');
  console.log('\n🔍 Or get a transaction hash by:');
  console.log('   1. Making a test payment on the live test page');
  console.log('   2. Copying the transaction hash from the success message');
  console.log('   3. Running this script with that hash');
  process.exit(1);
}

checkTransaction(txHash).then(success => {
  process.exit(success ? 0 : 1);
});
