# 🔧 Troubleshooting Guide

Having issues with Secret Counter Battle? This guide covers the most common problems and their solutions.

## 🚨 Quick Fixes

### "Nothing is working!"
1. **Restart everything**: Close all terminals, restart your code editor
2. **Clear caches**: Delete `node_modules` and reinstall dependencies
3. **Check the basics**: Node.js version, MetaMask installed, correct network

### "I'm getting weird errors!"
1. **Read the error message** - it usually tells you exactly what's wrong
2. **Check the browser console** (F12) for frontend errors
3. **Look at terminal output** for backend errors

---

## 🖥️ Backend Issues (Hardhat/Smart Contract)

### ❌ "Cannot find module '@fhevm/hardhat-plugin'"

**Cause**: Missing or corrupted dependencies

**Solution**:
```bash
cd hardhat-backend
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

### ❌ "Compilation failed" / "Solidity compilation errors"

**Cause**: Contract syntax errors or missing imports

**Solutions**:
```bash
# Clean and recompile
npx hardhat clean
npx hardhat compile

# Check for syntax errors in SecretCounterBattle.sol
# Make sure all imports are correct
```

**Common fixes**:
- Check import paths: `@fhevm/solidity/lib/FHE.sol`
- Verify pragma version: `pragma solidity ^0.8.24;`
- Ensure contract inherits from `SepoliaConfig`

### ❌ "Network connection failed" / "Cannot connect to network"

**Cause**: Network configuration issues

**Solutions**:
1. **Local network**: Make sure `npx hardhat node` is running
2. **Sepolia**: Check your `INFURA_API_KEY` is set correctly
3. **Internet**: Verify your internet connection

```bash
# Check environment variables
npx hardhat vars list

# Test network connection
npx hardhat compile --network localhost
# or
npx hardhat compile --network sepolia
```

### ❌ Tests failing

**Cause**: Contract logic errors or test environment issues

**Solutions**:
```bash
# Run tests with more verbose output
npx hardhat test --verbose

# Run specific test file
npx hardhat test test/SecretCounterBattle.ts

# Check test network is clean
npx hardhat clean
npx hardhat compile
npx hardhat test
```

### ❌ "HH600: Compilation failed"

**Cause**: Solidity version mismatch or syntax errors

**Solution**:
1. Check `hardhat.config.ts` solidity version matches contract pragma
2. Verify all FHEVM imports are correct
3. Make sure you have the latest `@fhevm/solidity` package

---

## 🌐 Frontend Issues (React/Vite)

### ❌ "Failed to resolve import" / "Module not found"

**Cause**: Missing dependencies or incorrect import paths

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

**Check these imports**:
```typescript
// ✅ Correct
import { ethers } from 'ethers'
import { createEncryptedInput } from '@zama-fhe/relayer-sdk'

// ❌ Wrong (old package)
import { fhevm } from 'fhevmjs'
```

### ❌ "Tailwind CSS not working" / Styles not loading

**Cause**: PostCSS configuration issues

**Solution**:
```bash
# Install correct Tailwind PostCSS plugin
cd frontend
pnpm add -D @tailwindcss/postcss

# Verify postcss.config.js
# Should use '@tailwindcss/postcss' not 'tailwindcss'
```

### ❌ "Vite dev server won't start"

**Cause**: Port conflicts or configuration issues

**Solutions**:
```bash
# Try different port
npm run dev -- --port 3000

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev

# Check for port conflicts
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows
```

### ❌ "White screen" / App not rendering

**Cause**: JavaScript errors preventing React from mounting

**Solutions**:
1. **Open browser console** (F12) and check for errors
2. **Check network tab** for failed resource loading
3. **Verify imports** in `App.tsx` and components

Common fixes:
```typescript
// Make sure all components are properly exported
export default ConnectWallet  // ✅
export ConnectWallet          // ❌ (default import won't work)
```

---

## 🦊 MetaMask Issues

### ❌ "MetaMask not detected" / "window.ethereum is undefined"

**Cause**: MetaMask not installed or not accessible

**Solutions**:
1. **Install MetaMask** from [metamask.io](https://metamask.io)
2. **Refresh the page** after installing
3. **Enable MetaMask** for the site
4. **Try in incognito mode** to rule out extension conflicts

### ❌ "Wrong network" / "Switch to correct network"

**Cause**: MetaMask connected to wrong network

**Solutions**:
1. **Manual switch**: Open MetaMask → Network dropdown → Select correct network
2. **Add local network**:
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

### ❌ "Insufficient funds" / "Not enough ETH"

**Cause**: No ETH in wallet for gas fees

**Solutions**:
1. **Local network**: Import test account with private key:
   `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
2. **Sepolia**: Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

### ❌ "Transaction failed" / "User rejected transaction"

**Cause**: Various transaction issues

**Solutions**:
1. **Check gas limits** - increase if needed
2. **Verify contract address** is correct
3. **Make sure wallet is unlocked**
4. **Try again** - sometimes it's just a temporary issue

---

## 🔐 FHEVM-Specific Issues

### ❌ "FHE operations not working" / Encryption errors

**Cause**: FHEVM SDK issues or incorrect usage

**Solutions**:
```typescript
// ✅ Correct FHEVM usage
const input = createEncryptedInput(contractAddress, userAddress)
input.add32(secretNumber)
const encrypted = await input.encrypt()

// ❌ Common mistakes
// - Wrong contract address
// - Missing user address
// - Incorrect data type (add32 for uint32)
```

### ❌ "Permission denied" / ACL errors

**Cause**: Missing FHE permissions in smart contract

**Solution**: Verify contract grants proper permissions:
```solidity
// ✅ Grant permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, msg.sender);

// ❌ Missing permissions will cause decryption to fail
```

### ❌ "Decryption failed" / "Cannot decrypt value"

**Cause**: Missing permissions or wrong parameters

**Solutions**:
1. **Check ACL permissions** in contract
2. **Verify contract address** matches deployed contract
3. **Ensure user has permission** to decrypt the value
4. **Check network** - make sure you're on the same network as contract

---

## 🧪 Development Environment Issues

### ❌ "Port already in use"

**Cause**: Another service using the same port

**Solutions**:
```bash
# Find and kill process using port 8545 (Hardhat)
lsof -ti:8545 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8545   # Windows (find PID, then kill)

# Use different port
npx hardhat node --port 8546
```

### ❌ "Git issues" / Repository problems

**Cause**: Git configuration or repository state issues

**Solutions**:
```bash
# Reset to clean state
git stash
git clean -fd
git reset --hard HEAD

# Or start fresh
cd ..
rm -rf secret-counter-battle
git clone <repo-url>
```

### ❌ "Node.js version issues"

**Cause**: Wrong Node.js version

**Solution**:
```bash
# Check version (should be 18.x or 20.x)
node -v

# Install correct version from nodejs.org
# Or use nvm:
nvm install 18
nvm use 18
```

---

## 🆘 Getting Help

### Before Asking for Help

1. **Read the error message carefully**
2. **Check this troubleshooting guide**
3. **Try the basic fixes** (restart, reinstall, clear cache)
4. **Search existing issues** on GitHub

### Where to Get Help

1. **GitHub Issues**: [Create an issue](https://github.com/your-username/secret-counter-battle/issues)
2. **Zama Discord**: [Join the community](https://discord.gg/zama)
3. **Zama Forum**: [Community discussions](https://community.zama.ai)
4. **Stack Overflow**: Tag with `fhevm` and `zama`

### When Asking for Help, Include:

1. **Your operating system** (Windows/Mac/Linux)
2. **Node.js version** (`node -v`)
3. **Complete error message** (copy-paste, don't screenshot)
4. **What you were trying to do**
5. **What you've already tried**
6. **Browser console output** (if frontend issue)

### Example Good Help Request:

```
**Problem**: Frontend won't connect to MetaMask

**Environment**: 
- Windows 11
- Node.js v18.17.0
- Chrome with MetaMask v10.25.0

**Error**: 
Console shows: "TypeError: Cannot read properties of undefined (reading 'request')"

**Steps to reproduce**:
1. Started frontend with `npm run dev`
2. Clicked "Connect Wallet"
3. Error appears in console

**What I've tried**:
- Refreshed page
- Reinstalled MetaMask
- Tried in incognito mode

**Additional info**: 
Local Hardhat node is running on port 8545
```

---

## ✅ Prevention Tips

### Avoid Common Issues:

1. **Use LTS Node.js versions** (18.x, 20.x)
2. **Keep dependencies updated** but be careful with major version changes
3. **Always read error messages** before asking for help
4. **Use version control** - commit working states
5. **Test in clean environment** occasionally
6. **Keep backups** of working configurations

### Good Development Practices:

1. **One terminal per service** (backend, frontend, etc.)
2. **Use consistent package managers** (npm vs pnpm vs yarn)
3. **Clear caches regularly** when weird things happen
4. **Test on different browsers** if frontend issues persist
5. **Keep MetaMask updated**

---

**Still stuck?** Don't hesitate to ask for help in our [Discord community](https://discord.gg/zama)! 🤝
