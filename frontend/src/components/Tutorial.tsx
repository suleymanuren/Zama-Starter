import { useState } from 'react'
import CodePlayground from './CodePlayground'
import ContractDeployer from './ContractDeployer'
import { ethers } from 'ethers'

interface TutorialProps {
  onStartDemo: () => void
  provider?: ethers.BrowserProvider | null
  account?: string | null
  toast: any
}

const Tutorial: React.FC<TutorialProps> = ({ onStartDemo, provider, account, toast }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
  }

  const steps = [
    {
      id: 1,
      title: "What is FHEVM?",
      icon: "🔐",
      content: (
        <div className="space-y-4">
          <p className="text-purple-100 text-lg leading-relaxed">
            <strong className="text-yellow-400">FHEVM (Fully Homomorphic Encryption Virtual Machine)</strong> allows you to perform computations on encrypted data without ever decrypting it.
          </p>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-400/30">
            <h4 className="text-blue-300 font-bold mb-3">🎯 Why This Matters:</h4>
            <ul className="space-y-2 text-blue-100">
              <li>• <strong>Privacy:</strong> Your data stays encrypted on-chain</li>
              <li>• <strong>Computation:</strong> Smart contracts can process encrypted values</li>
              <li>• <strong>Decryption:</strong> Only authorized parties can see results</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30">
            <h4 className="text-green-300 font-bold mb-3">💡 Real-World Examples:</h4>
            <ul className="space-y-2 text-green-100">
              <li>• <strong>Private Voting:</strong> Vote without revealing your choice</li>
              <li>• <strong>Sealed Auctions:</strong> Bid without showing your amount</li>
              <li>• <strong>Confidential DeFi:</strong> Trade without exposing positions</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Encryption → Computation → Decryption",
      icon: "🔄",
      content: (
        <div className="space-y-6">
          <p className="text-purple-100 text-lg">
            Let's see how the <strong className="text-yellow-400">complete FHEVM workflow</strong> works in our Secret Counter Battle:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Encryption */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 rounded-xl border border-red-400/30">
              <div className="text-center mb-4">
                <div className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                  1
                </div>
                <h4 className="text-red-300 font-bold">🔐 Encryption</h4>
              </div>
              <ul className="text-red-100 text-sm space-y-2">
                <li>• Player enters secret number (e.g., 42)</li>
                <li>• Frontend encrypts it using FHEVM</li>
                <li>• Becomes encrypted <code className="bg-black/30 px-2 py-1 rounded">euint32</code></li>
                <li>• Nobody can see the original value</li>
              </ul>
            </div>

            {/* Step 2: Computation */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-400/30">
              <div className="text-center mb-4">
                <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                  2
                </div>
                <h4 className="text-blue-300 font-bold">⚙️ Computation</h4>
              </div>
              <ul className="text-blue-100 text-sm space-y-2">
                <li>• Smart contract receives encrypted numbers</li>
                <li>• Uses <code className="bg-black/30 px-2 py-1 rounded">FHE.add()</code> to sum them</li>
                <li>• Computation happens on encrypted data</li>
                <li>• Result is also encrypted</li>
              </ul>
            </div>

            {/* Step 3: Decryption */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30">
              <div className="text-center mb-4">
                <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">
                  3
                </div>
                <h4 className="text-green-300 font-bold">🔓 Decryption</h4>
              </div>
              <ul className="text-green-100 text-sm space-y-2">
                <li>• Only authorized users can decrypt</li>
                <li>• Access Control List (ACL) manages permissions</li>
                <li>• Results revealed to allowed parties</li>
                <li>• Individual secrets stay private</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-400/30">
            <h4 className="text-purple-300 font-bold mb-3">🔍 In Our Game:</h4>
            <div className="text-purple-100 space-y-2">
              <p>• <strong>Player 1:</strong> Encrypts secret number (e.g., 42)</p>
              <p>• <strong>Player 2:</strong> Encrypts secret number (e.g., 37)</p>
              <p>• <strong>Smart Contract:</strong> Adds encrypted values → encrypted sum (79)</p>
              <p>• <strong>Decryption:</strong> Players can see the total (79) but not each other's individual numbers</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Smart Contract Code",
      icon: "📝",
      content: (
        <div className="space-y-4">
          <p className="text-purple-100 text-lg">
            Let's examine the key parts of our <strong className="text-yellow-400">SecretCounterBattle.sol</strong> contract:
          </p>

          <div className="space-y-6">
            <p className="text-purple-100">
              Let's build a simple FHEVM contract step by step. Try the coding challenges below:
            </p>

            {/* Challenge 1: Basic Contract Setup */}
            <CodePlayground
              title="Challenge 1: Create Basic Counter Contract"
              instructions={[
                "Create a simple Counter contract with a private uint32 _count variable",
                "Add a getCount() function that returns the current count",
                "Add an increment() function that increases count by a given value"
              ]}
              initialCode={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    // TODO: Add private _count variable
    
    // TODO: Add getCount() function
    
    // TODO: Add increment() function
}`}
              expectedCode={`uint32 private _count;

function getCount() external view returns (uint32) {
    return _count;
}

function increment(uint32 value) external {
    _count += value;
}`}
              toast={toast}
            />

            {/* Challenge 2: Convert to FHEVM */}
            <CodePlayground
              title="Challenge 2: Convert to FHEVM Contract"
              instructions={[
                "Import FHE library and SepoliaConfig",
                "Change uint32 to euint32 for encrypted storage",
                "Make contract inherit from SepoliaConfig",
                "Update function signatures to use encrypted types"
              ]}
              initialCode={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// TODO: Add FHEVM imports

contract Counter {
    uint32 private _count;  // TODO: Change to encrypted type
    
    function getCount() external view returns (uint32) {  // TODO: Update return type
        return _count;
    }
}`}
              expectedCode={`import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHECounter is SepoliaConfig {
    euint32 private _count;
    
    function getCount() external view returns (euint32) {
        return _count;
    }
}`}
              toast={toast}
            />

            {/* Challenge 3: FHE Operations */}
            <CodePlayground
              title="Challenge 3: Add FHE Operations"
              instructions={[
                "Create increment function with externalEuint32 input and proof",
                "Convert external input to internal euint32 using FHE.fromExternal()",
                "Use FHE.add() for encrypted addition",
                "Set proper ACL permissions with FHE.allowThis() and FHE.allow()"
              ]}
              initialCode={`function increment(/* TODO: Add parameters */) external {
    // TODO: Convert external input to euint32
    
    // TODO: Add encrypted values using FHE.add()
    
    // TODO: Set ACL permissions
}`}
              expectedCode={`function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 evalue = FHE.fromExternal(inputEuint32, inputProof);
    _count = FHE.add(_count, evalue);
    
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
}`}
              toast={toast}
            />

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30">
              <h4 className="text-green-300 font-bold mb-3">🎯 Key Concepts You Just Learned:</h4>
              <ul className="space-y-2 text-green-100">
                <li>• <strong>euint32:</strong> Encrypted 32-bit integer stored on-chain</li>
                <li>• <strong>externalEuint32:</strong> Encrypted input from client-side</li>
                <li>• <strong>FHE.fromExternal():</strong> Converts external encrypted input with proof verification</li>
                <li>• <strong>FHE.add():</strong> Performs homomorphic addition on encrypted values</li>
                <li>• <strong>ACL Permissions:</strong> Controls who can decrypt encrypted data</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Access Control (ACL)",
      icon: "🛡️",
      content: (
        <div className="space-y-4">
          <p className="text-purple-100 text-lg">
            <strong className="text-yellow-400">Access Control Lists (ACL)</strong> determine who can decrypt encrypted data:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-400/30">
              <h4 className="text-orange-300 font-bold mb-4 flex items-center">
                <span className="mr-2">🔐</span> Permission Types
              </h4>
              <ul className="space-y-3 text-orange-100">
                <li>
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">FHE.allowThis()</code>
                  <p className="text-xs mt-1">Contract can decrypt this value</p>
                </li>
                <li>
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">FHE.allow(value, address)</code>
                  <p className="text-xs mt-1">Specific address can decrypt</p>
                </li>
                <li>
                  <code className="bg-black/30 px-2 py-1 rounded text-xs">FHE.allowTransient()</code>
                  <p className="text-xs mt-1">Temporary permission for computation</p>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 rounded-xl border border-cyan-400/30">
              <h4 className="text-cyan-300 font-bold mb-4 flex items-center">
                <span className="mr-2">🎯</span> In Our Game
              </h4>
              <ul className="space-y-3 text-cyan-100">
                <li>
                  <strong>Individual Secrets:</strong>
                  <p className="text-xs">Only the player who submitted can decrypt</p>
                </li>
                <li>
                  <strong>Sum Result:</strong>
                  <p className="text-xs">Both players can decrypt the total</p>
                </li>
                <li>
                  <strong>Contract Access:</strong>
                  <p className="text-xs">Contract can perform computations</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-gray-600">
            <h4 className="text-green-400 font-bold mb-2">💡 Example: Setting Permissions</h4>
            <pre className="text-green-300 text-sm overflow-x-auto">
{`// When player submits secret
FHE.allowThis(encryptedSecret);        // Contract can use it
FHE.allow(encryptedSecret, msg.sender); // Player can decrypt it

// When creating sum
FHE.allow(encryptedSum, game.player1);  // Player 1 can see sum
FHE.allow(encryptedSum, game.player2);  // Player 2 can see sum`}
            </pre>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-400/30">
            <p className="text-green-100">
              <strong className="text-green-300">🔒 Security Benefit:</strong> Even if someone gains access to the blockchain data, they can only decrypt values they're explicitly allowed to see!
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Hands-On: Write Your Own Contract",
      icon: "👨‍💻",
      content: (
        <div className="space-y-6">
          <p className="text-purple-100 text-lg">
            Time to get your hands dirty! Let's <strong className="text-yellow-400">build your first FHEVM contract</strong> from scratch.
          </p>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-400/30">
            <h4 className="text-orange-300 font-bold mb-4">🛠️ What You'll Build:</h4>
            <ul className="space-y-2 text-orange-100">
              <li>📝 <strong>Simple Counter Contract</strong> - Start with basic Solidity</li>
              <li>🔐 <strong>FHE Counter Contract</strong> - Convert to encrypted version</li>
              <li>🚀 <strong>Deploy to Sepolia</strong> - Make it live on testnet</li>
              <li>🧪 <strong>Test Your Contract</strong> - Verify it works correctly</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/40 p-6 rounded-xl border border-gray-600">
              <h4 className="text-blue-400 font-bold mb-4">📋 Step 1: Setup Environment</h4>
              <div className="space-y-2 text-sm text-blue-100">
                <p>1. Clone FHEVM Hardhat template</p>
                <p>2. Install dependencies</p>
                <p>3. Configure Sepolia network</p>
              </div>
              <pre className="text-green-300 text-xs mt-3 bg-black/30 p-2 rounded overflow-x-auto">
{`git clone template
npm install
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY`}
              </pre>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-gray-600">
              <h4 className="text-purple-400 font-bold mb-4">🔧 Step 2: Write Contract</h4>
              <div className="space-y-2 text-sm text-purple-100">
                <p>1. Create Counter.sol (basic)</p>
                <p>2. Convert to FHECounter.sol</p>
                <p>3. Add encrypted types & operations</p>
              </div>
              <pre className="text-green-300 text-xs mt-3 bg-black/30 p-2 rounded overflow-x-auto">
{`// From uint32 to euint32
euint32 private _count;
FHE.add(_count, encryptedValue)`}
              </pre>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30">
            <h4 className="text-green-300 font-bold mb-4">📚 Follow Along Resources:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-200 font-medium">📖 Documentation</p>
                <p className="text-green-100">Step-by-step guide with code samples</p>
              </div>
              <div>
                <p className="text-green-200 font-medium">🎥 Video Walkthrough</p>
                <p className="text-green-100">Screen recording of the entire process</p>
              </div>
              <div>
                <p className="text-green-200 font-medium">💬 Community Support</p>
                <p className="text-green-100">Discord channel for help & questions</p>
              </div>
            </div>
          </div>

          {/* Contract Deployer */}
          {provider && account ? (
            <ContractDeployer provider={provider} account={account} toast={toast} />
          ) : (
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-400/30">
              <div className="text-center">
                <div className="text-3xl mb-3">🔌</div>
                <h4 className="text-orange-300 font-bold mb-2">Connect Wallet to Deploy</h4>
                <p className="text-orange-100 text-sm mb-4">
                  Connect your MetaMask wallet to deploy contracts directly from the tutorial
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://github.com/zama-ai/fhevm-hardhat-template"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    📂 Get Template
                  </a>
                  
                  <button
                    onClick={onStartDemo}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-8 py-3 rounded-xl text-lg font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    🎮 Try Live Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 6,
      title: "Test the Demo Game",
      icon: "🎮",
      content: (
        <div className="space-y-6">
          <p className="text-purple-100 text-lg">
            Now let's experience the <strong className="text-yellow-400">Secret Counter Battle</strong> demo to see FHEVM in action!
          </p>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-400/30">
            <h4 className="text-purple-300 font-bold mb-4">🎯 Demo Experience:</h4>
            <ul className="space-y-2 text-purple-100">
              <li>✅ <strong>Create a game</strong> - Deploy your encrypted battle</li>
              <li>✅ <strong>Submit secret numbers</strong> - Experience client-side encryption</li>
              <li>✅ <strong>Watch computation</strong> - See encrypted addition on-chain</li>
              <li>✅ <strong>Decrypt results</strong> - View authorized data only</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-400/30">
            <h4 className="text-blue-300 font-bold mb-4">🔍 What to Observe:</h4>
            <ul className="space-y-2 text-blue-100">
              <li>• Numbers are encrypted before blockchain submission</li>
              <li>• Smart contract computes on encrypted data</li>
              <li>• ACL permissions control who can decrypt what</li>
              <li>• Individual secrets stay private, only sum is revealed</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-400/30">
            <h4 className="text-green-300 font-bold mb-4">💡 Pro Tips:</h4>
            <ul className="space-y-2 text-green-100">
              <li>• Use two different wallets to play against yourself</li>
              <li>• Check browser console for encryption/decryption logs</li>
              <li>• View transactions on Sepolia Etherscan</li>
              <li>• Notice encrypted data in transaction details</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={onStartDemo}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 animate-pulse"
            >
              🚀 Start Demo Game!
            </button>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 bg-black/30 p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">📚 FHEVM Tutorial Progress</h2>
          <span className="text-purple-200 text-sm">
            {completedSteps.length}/{steps.length} completed
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep === step.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                    : completedSteps.includes(step.id)
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {completedSteps.includes(step.id) ? '✓' : step.id}
              </button>
              {step.id < steps.length && (
                <div className={`w-8 h-1 mx-1 rounded ${
                  completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{steps[currentStep - 1].icon}</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Step {currentStep}: {steps[currentStep - 1].title}
          </h2>
        </div>

        <div className="mb-8">
          {steps[currentStep - 1].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={() => {
              markStepComplete(currentStep)
              if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1)
              } else {
                // Tutorial completed - show completion message
                toast.success('Tutorial Complete! 🎉', 'Congratulations! You completed the FHEVM tutorial. Ready to build your own confidential dApps!')
              }
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {currentStep === steps.length ? '🎉 Complete Tutorial!' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Tutorial
