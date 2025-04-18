# Monad Wallet CLI

A simple command-line wallet for the Monad Network.

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
node build/index.js history
```

4. Check Network Info
```bash
node build/index.js info
```

5. Check Gas Price
```bash
node build/index.js gas
```

## Security Tips
- Never share your private key
- Double-check addresses before sending
- Start with small amounts when testing 