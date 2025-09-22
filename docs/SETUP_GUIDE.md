# 🛠️ Setup Guide - Secret Counter Battle

This guide will walk you through setting up the Secret Counter Battle project step by step.

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js** (v18.x or v20.x LTS) - [Download here](https://nodejs.org/)
- [ ] **Git** installed - [Download here](https://git-scm.com/)
- [ ] **MetaMask** browser extension - [Install here](https://metamask.io/)
- [ ] Basic knowledge of **Solidity** and **React**

## 🚀 Quick Start (5 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/secret-counter-battle.git
cd secret-counter-battle

# Install backend dependencies
cd hardhat-backend
npm install  # or pnpm install

# Install frontend dependencies
cd ../frontend
npm install  # or pnpm install
```

### Step 2: Verify Installation

```bash
# Test backend
cd hardhat-backend
npm run compile

# Test frontend (in new terminal)
cd frontend
npm run dev
```

**Expected Results:**
- Backend: ✅ "Compiled X Solidity files successfully"
- Frontend: ✅ "Local: http://localhost:5173/"

## 🔧 Detailed Setup Instructions

### Backend Setup (Hardhat + FHEVM)

#### 1. Install Dependencies
```bash
cd hardhat-backend
npm install

# Key dependencies installed:
# - @fhevm/hardhat-plugin: FHEVM integration
# - @fhevm/solidity: FHEVM Solidity library
# - hardhat: Ethereum development environment
# - ethers: Ethereum library
```

#### 2. Compile Contracts
```bash
npm run compile
```

This will:
- Compile `SecretCounterBattle.sol`
- Generate TypeScript types
- Create artifacts for deployment

#### 3. Run Tests
```bash
npm test
```

All tests should pass! 🎉

### Frontend Setup (React + Vite + FHEVM)

#### 1. Install Dependencies
```bash
cd frontend
npm install

# Key dependencies installed:
# - @zama-fhe/relayer-sdk: FHEVM client-side encryption
# - ethers: Blockchain interaction
# - react + vite: Modern React setup
# - tailwindcss: Styling
```

#### 2. Start Development Server
```bash
npm run dev
```

Visit http://localhost:5173/ to see the app!

## 🌐 Network Configuration

### Local Development (Hardhat Network)

#### 1. Start Local Node
```bash
cd hardhat-backend
npx hardhat node
```

Keep this running in a separate terminal.

#### 2. Deploy Contract Locally
```bash
# In another terminal
cd hardhat-backend
npx hardhat deploy --network localhost
```

Note the deployed contract address!

#### 3. Configure MetaMask for Local Network

1. Open MetaMask
2. Click network dropdown → "Add network"
3. Add custom network:
   - **Network name**: Hardhat Local
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency symbol**: `ETH`
   - **Block explorer URL**: (leave empty)

#### 4. Import Test Account

The local Hardhat node provides test accounts with ETH. Import one:

1. In MetaMask: Account menu → "Import Account"
2. Use this private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. This gives you 10,000 test ETH!

### Sepolia Testnet (Real FHEVM)

#### 1. Get Sepolia ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Enter your MetaMask address
- Request test ETH

#### 2. Set Environment Variables
```bash
cd hardhat-backend

# Set your wallet mnemonic (12-word seed phrase)
npx hardhat vars set MNEMONIC

# Set Infura API key (get from https://infura.io)
npx hardhat vars set INFURA_API_KEY
```

#### 3. Deploy to Sepolia
```bash
npx hardhat compile --network sepolia
npx hardhat deploy --network sepolia
```

## 📁 Project Structure

```
secret-counter-battle/
├── hardhat-backend/          # Smart contract development
│   ├── contracts/
│   │   └── SecretCounterBattle.sol  # Main contract
│   ├── test/
│   │   └── SecretCounterBattle.ts   # Contract tests
│   ├── deploy/
│   │   └── deploy.ts               # Deployment script
│   └── hardhat.config.ts          # Hardhat configuration
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # App entry point
│   └── package.json
├── docs/                    # Documentation
├── TUTORIAL.md             # Main tutorial
└── README.md               # Project overview
```

## 🔍 Troubleshooting

### Common Issues

#### ❌ "Cannot find module '@fhevm/hardhat-plugin'"
**Solution:**
```bash
cd hardhat-backend
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Compilation failed" 
**Solution:**
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile
```

#### ❌ Frontend won't start
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### ❌ MetaMask connection issues
**Solutions:**
1. Make sure MetaMask is installed and unlocked
2. Check you're on the correct network (localhost or Sepolia)
3. Try refreshing the page
4. Clear browser cache

#### ❌ "Transaction reverted"
**Possible causes:**
1. Contract not deployed to current network
2. Insufficient gas/ETH
3. Invalid function parameters
4. Contract state doesn't allow operation

### Getting Help

If you're still stuck:

1. **Check the logs** - Browser console and terminal output
2. **Read error messages** - They usually point to the issue
3. **Ask for help**:
   - [Zama Discord](https://discord.gg/zama)
   - [Community Forum](https://community.zama.ai)
   - GitHub Issues on this repo

## ✅ Verification Checklist

Before proceeding with the tutorial, verify:

- [ ] Backend compiles without errors
- [ ] All tests pass
- [ ] Frontend starts and loads
- [ ] MetaMask is configured
- [ ] You can connect wallet to the app
- [ ] (Optional) Contract deployed to testnet

## 🎯 Next Steps

Once setup is complete:

1. **Read the [Main Tutorial](../TUTORIAL.md)**
2. **Follow along step-by-step**
3. **Experiment with the code**
4. **Build your own FHEVM dApp!**

---

**Need help?** Join our [Discord community](https://discord.gg/zama) for real-time support!
