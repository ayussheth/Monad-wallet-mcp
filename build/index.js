import { createPublicClient, http, createWalletClient, parseEther, formatEther } from 'viem';
import { monad } from './chains.js';
import { privateKeyToAccount } from 'viem/accounts';
// ASCII Art Banner with dark purple color
const monadBanner = `\x1b[95m
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  ███╗   ███╗ ██████╗ ███╗   ██╗ █████╗ ██████╗       ║
║  ████╗ ████║██╔═══██╗████╗  ██║██╔══██╗██╔══██╗      ║
║  ██╔████╔██║██║   ██║██╔██╗ ██║███████║██║  ██║      ║
║  ██║╚██╔╝██║██║   ██║██║╚██╗██║██╔══██║██║  ██║      ║
║  ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██║  ██║██████╔╝      ║
║  ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝\x1b[0m

🔷 Monad MCP - Modular Content Provider

📋 Available Commands:

  check    <address>                     - Check MONAD balance of an address
  transfer <private-key> <to> <amount>   - Send MONAD tokens
  history  <tx-hash>                     - View transaction details
  info                                   - Display Monad network information
  gas                                    - Show current gas price
  serve    <tx-hash>                     - Serve stored transaction data

💡 Examples:
  $ node build/index.js check 0x123...   - Check balance
  $ node build/index.js transfer <key> 0x456... 1.5  - Send 1.5 MONAD
  $ node build/index.js history <tx-hash> - View transaction details
  $ node build/index.js serve <tx-hash>  - Serve transaction data

Note: All amounts are in MONAD tokens`;

const client = createPublicClient({
    chain: monad,
    transport: http()
});

// Simple in-memory data store for transaction data
const transactionStore = new Map();

async function storeTransactionData(txHash, data) {
    transactionStore.set(txHash, {
        data,
        timestamp: Date.now(),
        servingCount: 0
    });
    console.log(`\n📦 Transaction data stored and available for network`);
    console.log(`Transaction: ${txHash}`);
}

async function serveTransactionData(txHash) {
    const txData = transactionStore.get(txHash);
    if (txData) {
        txData.servingCount++;
        console.log(`\n🔍 Serving stored transaction data`);
        console.log(`Transaction: ${txHash}`);
        console.log(`Times served: ${txData.servingCount}`);
        console.log(`Stored at: ${new Date(txData.timestamp).toLocaleString()}`);
        return txData.data;
    }
    return null;
}

async function getFormattedBalance(address) {
    try {
        const balance = await client.getBalance({ address: address });
        return Number(formatEther(balance)).toFixed(4);
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        return '0.0000';
    }
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    // Show banner only once
    console.log(monadBanner);
    
    if (!command || command === 'help') {
        return;
    }
    
    try {
        switch (command) {
            case 'check':
                if (args.length < 2) {
                    console.error('Please provide an address');
                    process.exit(1);
                }
                const address = args[1].startsWith('0x') ? args[1] : `0x${args[1]}`;
                const balance = await getFormattedBalance(address);
                console.log(`\n💰 Account Balance`);
                console.log(`Address: ${address}`);
                console.log(`Balance: ${balance} MONAD\n`);
                break;
            case 'transfer':
                if (args.length < 4) {
                    console.error('Please provide private key, to address, and amount');
                    process.exit(1);
                }
                const [privateKey, toAddress, amount] = args.slice(1);
                const account = privateKeyToAccount(privateKey);
                const walletClient = createWalletClient({
                    account,
                    chain: monad,
                    transport: http()
                });
                try {
                    // Get initial balances
                    const senderInitialBalance = await getFormattedBalance(account.address);
                    const receiverInitialBalance = await getFormattedBalance(toAddress);
                    console.log('\n📊 Initial Balances');
                    console.log(`From: ${account.address}`);
                    console.log(`Balance: ${senderInitialBalance} MONAD`);
                    console.log(`\nTo: ${toAddress}`);
                    console.log(`Balance: ${receiverInitialBalance} MONAD`);
                    // Send transaction
                    console.log('\n🚀 Sending transaction...');
                    const hash = await walletClient.sendTransaction({
                        to: toAddress,
                        value: parseEther(amount)
                    });
                    // Wait for transaction to be mined
                    console.log('⏳ Waiting for confirmation...');
                    await client.waitForTransactionReceipt({ hash });
                    // Get final balances
                    const senderFinalBalance = await getFormattedBalance(account.address);
                    const receiverFinalBalance = await getFormattedBalance(toAddress);
                    console.log('\n✅ Transaction Complete!');
                    console.log(`Hash: ${hash}`);
                    
                    // Store transaction data for MCP functionality
                    const txData = await client.getTransaction({ hash });
                    await storeTransactionData(hash, txData);
                    
                    console.log('\n📊 Updated Balances');
                    console.log(`From: ${account.address}`);
                    console.log(`New Balance: ${senderFinalBalance} MONAD`);
                    console.log(`\nTo: ${toAddress}`);
                    console.log(`New Balance: ${receiverFinalBalance} MONAD\n`);
                }
                catch (error) {
                    console.error('\n❌ Failed to send transaction:', error);
                }
                break;
            case 'history':
                if (args.length < 2) {
                    console.error('Please provide a transaction hash');
                    process.exit(1);
                }
                const txHash = args[1];
                console.log('\n🔍 Fetching transaction details...');
                try {
                    const receipt = await client.getTransactionReceipt({ hash: txHash });
                    console.log('\n📝 Transaction Details');
                    console.log(`Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);
                    console.log(`Block Number: ${receipt.blockNumber}`);
                    console.log(`From: ${receipt.from}`);
                    console.log(`To: ${receipt.to}`);
                    console.log(`Gas Used: ${receipt.gasUsed} wei\n`);
                }
                catch (error) {
                    console.error('\n❌ Failed to fetch transaction:', error);
                }
                break;
            case 'info':
                const currentBlockNumber = await client.getBlockNumber();
                console.log('\n🌐 Monad Network Information');
                console.log(`Network: ${monad.name}`);
                console.log(`Chain ID: ${monad.id}`);
                console.log(`Current Block: ${currentBlockNumber}`);
                console.log(`RPC URL: ${monad.rpcUrls.default.http[0]}\n`);
                break;
            case 'gas':
                const gasPrice = await client.getGasPrice();
                console.log('\n⛽ Gas Information');
                console.log(`Current price: ${formatEther(gasPrice)} MONAD\n`);
                break;
            case 'serve':
                if (args.length < 2) {
                    console.error('Please provide a transaction hash');
                    process.exit(1);
                }
                const serveHash = args[1];
                const data = await serveTransactionData(serveHash);
                if (!data) {
                    console.log('\n❌ No stored data found for this transaction');
                }
                break;
            default:
                break;
        }
    }
    catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

main().catch(console.error);
