# Monad MCP Wallet

A terminal-based Modular Content Provider (MCP) wallet for the Monad Network with transaction data availability features.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run a command
node build/index.js
```

## Available Commands

### Basic Wallet Features
1. Check Balance
```bash
node build/index.js check <address>
```

2. Send MONAD
```bash
node build/index.js transfer <private-key> <to-address> <amount>
```

3. View Transaction History
```bash
node build/index.js history <tx-hash>
```

4. Check Network Info
```bash
node build/index.js info
```

5. Check Gas Price
```bash
node build/index.js gas
```

### MCP Features
6. Serve Transaction Data
```bash
node build/index.js serve <tx-hash>
```
When you make a transfer, the transaction data is automatically stored in the MCP layer and can be served to other network participants.

## Security Tips
- Never share your private key
- Double-check addresses before sending
- Start with small amounts when testing

## MCP Implementation
This wallet implements basic MCP features:
- Transaction data storage layer
- Data availability service
- Request serving and tracking
- Network participation through data provision 