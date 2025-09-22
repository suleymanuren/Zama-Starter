# 🎮 Secret Counter Battle - Hello FHEVM Tutorial

> **The most beginner-friendly FHEVM tutorial** - Learn Fully Homomorphic Encryption by building a complete dApp!

## 🎯 What You'll Build

In this tutorial, you'll create **Secret Counter Battle** - a fun game where two players compete with secret numbers that remain encrypted throughout the entire process. You'll learn:

- ✅ **FHEVM Basics** - What is Fully Homomorphic Encryption and why it matters
- ✅ **Smart Contract Development** - Writing confidential contracts with encrypted data types
- ✅ **Frontend Integration** - Building a React app that encrypts/decrypts data
- ✅ **End-to-End Workflow** - Complete encryption → computation → decryption cycle

## ⏱️ Time Required
**~30 minutes** from zero to deployed dApp

## 📋 Prerequisites

- Basic **Solidity** knowledge (comfortable writing simple smart contracts)
- Basic **React/TypeScript** familiarity
- **Node.js** installed (LTS version recommended)
- **MetaMask** browser extension
- **No prior FHE or cryptography knowledge needed!**

---

## 📚 Table of Contents

1. [**Understanding FHEVM**](#1-understanding-fhevm) (5 min)
2. [**Setting Up Your Environment**](#2-setting-up-your-environment) (10 min)
3. [**Building the Smart Contract**](#3-building-the-smart-contract) (20 min)
4. [**Creating the Frontend**](#4-creating-the-frontend) (15 min)
5. [**Testing & Deployment**](#5-testing--deployment) (10 min)
6. [**Next Steps**](#6-next-steps) (5 min)

---

## 1. Understanding FHEVM

### 🤔 What is FHEVM?

**FHEVM (Fully Homomorphic Encryption Virtual Machine)** allows smart contracts to perform computations on encrypted data without ever decrypting it. This enables:

- **Privacy**: Your data stays encrypted on-chain
- **Computation**: Math operations work directly on encrypted values
- **Verification**: Results are cryptographically guaranteed

### 🎮 Our Game: Secret Counter Battle

Two players submit secret numbers (1-100). The smart contract:
1. Receives both encrypted numbers
2. Adds them together (still encrypted!)
3. Players can decrypt the sum to see who won

**The magic**: The blockchain never sees the actual numbers, only encrypted versions!

### 🔐 Key FHEVM Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **euint32** | Encrypted 32-bit integer | `euint32 secretNumber` |
| **externalEuint32** | Encrypted input from user | `externalEuint32 userInput` |
| **FHE.add()** | Addition on encrypted values | `FHE.add(secret1, secret2)` |
| **FHE.fromExternal()** | Convert user input to internal type | `FHE.fromExternal(input, proof)` |
| **ACL Permissions** | Control who can decrypt what | `FHE.allow(data, user)` |

---

## 2. Setting Up Your Environment

### Step 1: Install Prerequisites

```bash
# Check Node.js version (should be even-numbered LTS like v18.x or v20.x)
node -v
npm -v

# Install pnpm (faster package manager)
npm install -g pnpm
```

### Step 2: Clone the Starter Template

```bash
# Clone our prepared template
git clone https://github.com/your-username/secret-counter-battle.git
cd secret-counter-battle

# Install backend dependencies
cd hardhat-backend
pnpm install

# Install frontend dependencies  
cd ../frontend
pnpm install
```

### Step 3: Verify Setup

```bash
# Test backend compilation
cd hardhat-backend
pnpm compile

# Test frontend development server
cd ../frontend
pnpm dev
```

You should see:
- ✅ Backend: "Compiled 1 Solidity file successfully"
- ✅ Frontend: "Local: http://localhost:5173/"

---

## 3. Building the Smart Contract

### Step 1: Understanding the Contract Structure

Let's examine our `SecretCounterBattle.sol` contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecretCounterBattle is SepoliaConfig {
    // Game state structure
    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        euint32 secret1;      // 🔐 Encrypted secret 1
        euint32 secret2;      // 🔐 Encrypted secret 2
        euint32 encryptedSum; // 🔐 Encrypted sum
        bool gameActive;
        bool gameFinished;
        // ... other fields
    }
}
```

**Key Points:**
- `euint32` = encrypted 32-bit integer
- `SepoliaConfig` = FHEVM configuration for Sepolia testnet
- All sensitive data is encrypted!

### Step 2: Core Game Functions

#### Creating a Game
```solidity
function createGame() external returns (uint256 gameId) {
    gameId = ++gameCounter;
    
    games[gameId] = Game({
        gameId: gameId,
        player1: msg.sender,
        player2: address(0),
        secret1: FHE.asEuint32(0),    // Initialize encrypted 0
        secret2: FHE.asEuint32(0),
        encryptedSum: FHE.asEuint32(0),
        gameActive: true,
        gameFinished: false,
        // ...
    });
    
    // Grant contract permission to use encrypted values
    FHE.allowThis(games[gameId].secret1);
    FHE.allowThis(games[gameId].secret2);
    
    emit GameCreated(gameId, msg.sender);
}
```

#### Submitting Secret Numbers
```solidity
function submitSecret(
    uint256 gameId,
    externalEuint32 encryptedSecret,  // 🔐 User's encrypted input
    bytes calldata inputProof         // Zero-knowledge proof
) external {
    Game storage game = games[gameId];
    
    // Convert external encrypted input to internal type
    euint32 secret = FHE.fromExternal(encryptedSecret, inputProof);
    
    // Store based on which player is submitting
    if (msg.sender == game.player1) {
        game.secret1 = secret;
        game.player1Submitted = true;
    } else {
        game.secret2 = secret;
        game.player2Submitted = true;
    }
    
    // Grant permissions
    FHE.allowThis(secret);
    FHE.allow(secret, msg.sender);
    
    // If both submitted, calculate result
    if (game.player1Submitted && game.player2Submitted) {
        _calculateGameResult(gameId);
    }
}
```

#### Calculating Results (The Magic! ✨)
```solidity
function _calculateGameResult(uint256 gameId) internal {
    Game storage game = games[gameId];
    
    // 🎯 This is the FHE magic - adding encrypted numbers!
    game.encryptedSum = FHE.add(game.secret1, game.secret2);
    
    // Grant permissions for decryption
    FHE.allowThis(game.encryptedSum);
    FHE.allow(game.encryptedSum, game.player1);
    FHE.allow(game.encryptedSum, game.player2);
    
    game.gameFinished = true;
    game.gameActive = false;
    
    emit GameFinished(gameId, address(0), 0);
}
```

### Step 3: Test the Contract

```bash
cd hardhat-backend
pnpm test test/SecretCounterBattle.ts
```

You should see all tests passing! 🎉

---

## 4. Creating the Frontend

### Step 1: Understanding the App Structure

Our React app has three main components:

```
src/
├── App.tsx           # Main app with wallet connection
├── components/
│   ├── ConnectWallet.tsx  # Wallet connection button
│   ├── GameLobby.tsx      # List of active games
│   └── GameRoom.tsx       # Individual game interface
```

### Step 2: Wallet Integration

```typescript
// App.tsx - Wallet connection logic
const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    setAccount(address)
    setProvider(provider)
  } else {
    alert('Please install MetaMask!')
  }
}
```

### Step 3: FHEVM Integration (The Secret Sauce! 🔐)

```typescript
// GameRoom.tsx - Encrypting user input
import { createEncryptedInput } from '@zama-fhe/relayer-sdk'

const submitSecret = async () => {
  const num = Number(secretNumber)
  
  // 🔐 This is where the encryption magic happens!
  const input = createEncryptedInput(contractAddress, account)
  input.add32(num)  // Add our secret number
  const encryptedInput = await input.encrypt()
  
  // Submit to smart contract
  const tx = await contract.submitSecret(
    gameId,
    encryptedInput.handles[0],  // Encrypted number
    encryptedInput.inputProof   // Zero-knowledge proof
  )
  await tx.wait()
}
```

### Step 4: Decrypting Results

```typescript
// GameRoom.tsx - Decrypting the sum
const decryptResults = async () => {
  // Get encrypted sum from contract
  const encryptedSum = await contract.getEncryptedSum(gameId)
  
  // 🔓 Decrypt using user's private key
  const decryptedSum = await userDecryptEuint(
    'euint32',
    encryptedSum,
    contractAddress,
    signer
  )
  
  setDecryptedSum(decryptedSum)
}
```

---

## 5. Testing & Deployment

### Step 1: Local Testing

```bash
# Terminal 1: Start local Hardhat node
cd hardhat-backend
pnpm hardhat node

# Terminal 2: Deploy contract
pnpm deploy --network localhost

# Terminal 3: Start frontend
cd frontend
pnpm dev
```

### Step 2: Connect MetaMask to Local Network

1. Open MetaMask
2. Add Network → Custom RPC
3. Enter details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency**: ETH

### Step 3: Test the Complete Flow

1. **Connect Wallet** in the app
2. **Create a Game** 
3. **Open in Incognito** (second player)
4. **Join the Game**
5. **Submit Secret Numbers** from both players
6. **Decrypt Results** and see the winner!

### Step 4: Deploy to Sepolia Testnet

```bash
# Set up environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY

# Deploy to Sepolia
pnpm compile --network sepolia
pnpm deploy --network sepolia
```

---

## 6. Next Steps

### 🎉 Congratulations!

You've just built your first FHEVM dApp! You now understand:

- ✅ **Encrypted Data Types** (`euint32`, `externalEuint32`)
- ✅ **FHE Operations** (`FHE.add`, `FHE.fromExternal`)
- ✅ **Access Control** (`FHE.allow`, `FHE.allowThis`)
- ✅ **Frontend Integration** (encryption/decryption)
- ✅ **Complete dApp Development** (contract + frontend)

### 🚀 Advanced Topics to Explore

1. **Oracle Integration** - Async decryption for complex logic
2. **Gas Optimization** - HCU (Homomorphic Complexity Units) management
3. **Security Best Practices** - ACL patterns and attack prevention
4. **Advanced Operations** - `FHE.select`, conditional logic
5. **Production Deployment** - Mainnet considerations

### 📚 Additional Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Community Forum](https://community.zama.ai)
- [Example Projects](https://github.com/zama-ai/fhevm-examples)
- [Discord Community](https://discord.gg/zama)

### 💡 Project Ideas

Now that you understand FHEVM, try building:

- **Private Voting System** - Anonymous elections
- **Confidential Auctions** - Sealed-bid auctions
- **Private DeFi** - Encrypted token balances
- **Secret Leaderboards** - Gaming with hidden scores

---

## 🏆 You Did It!

You've successfully completed the **Hello FHEVM** tutorial and built a complete confidential dApp! 

**Share your success:**
- Tweet about your experience with `#FHEVM #ZamaProtocol`
- Join the [Zama Discord](https://discord.gg/zama) community
- Contribute to the [FHEVM ecosystem](https://github.com/zama-ai)

**Questions?** Open an issue in this repository or ask in the Zama community forums.

---

*Built with ❤️ for the Zama Bounty Season 10*
