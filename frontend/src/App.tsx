import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

// Components
import GameLobby from './components/GameLobby'
import GameRoom from './components/GameRoom'
import ConnectWallet from './components/ConnectWallet'
import Tutorial from './components/Tutorial'
import { useToast } from './components/Toast'

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [currentGame, setCurrentGame] = useState<number | null>(null)
  const [networkWarning, setNetworkWarning] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'tutorial' | 'game'>('tutorial')
  const toast = useToast()

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          // Check network
          const network = await provider.getNetwork()
          if (network.chainId !== 11155111n) {
            setNetworkWarning(true)
            setAccount(null)
            setProvider(null)
            return
          }
          
          setNetworkWarning(false)
          setAccount(accounts[0].address)
          setProvider(provider)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        
        // Request account access
        await provider.send('eth_requestAccounts', [])
        
        // Check if we're on Sepolia network
        const network = await provider.getNetwork()
        if (network.chainId !== 11155111n) {
          try {
            // Try to switch to Sepolia
            await provider.send('wallet_switchEthereumChain', [
              { chainId: '0xaa36a7' } // 11155111 in hex
            ])
          } catch (switchError: any) {
            // If Sepolia network doesn't exist, add it
            if (switchError.code === 4902) {
              await provider.send('wallet_addEthereumChain', [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/62ae9c75c5d94a0486c8c35a1a50b076'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }])
            }
          }
        }
        
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setNetworkWarning(false)
        setAccount(address)
        setProvider(provider)
        
        // Connected successfully
      } catch (error) {
        console.error('Error connecting wallet:', error)
        setNetworkWarning(true)
        toast.error('Network Error', 'Please switch to Sepolia Testnet to use this dApp!')
      }
    } else {
      toast.error('Wallet Required', 'Please install MetaMask to continue!')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setCurrentGame(null)
    setNetworkWarning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <header className="relative bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <span className="text-2xl">⚔️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Hello FHEVM Tutorial
                  </h1>
                  <p className="text-sm text-purple-200 font-medium">🔐 Learn Confidential Computing</p>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center space-x-2 bg-black/30 rounded-xl p-1">
                <button
                  onClick={() => setCurrentView('tutorial')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'tutorial' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📚 Tutorial
                </button>
                <button
                  onClick={() => setCurrentView('game')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'game' 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg' 
                      : 'text-purple-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  🎮 Demo Game
                </button>
              </div>
            </div>
            
            {account ? (
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  🟢 {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-red-300 hover:text-red-200 text-sm font-medium transition-colors"
                >
                  ⚡ Disconnect
                </button>
              </div>
            ) : (
              <ConnectWallet onConnect={connectWallet} />
            )}
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Warning */}
        {networkWarning && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold">Wrong Network!</h3>
                <p className="text-sm">Please switch to Sepolia Testnet to play the game.</p>
              </div>
              <button 
                onClick={connectWallet}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Switch Network
              </button>
            </div>
          </div>
        )}

        {currentView === 'tutorial' ? (
          <Tutorial 
            onStartDemo={() => setCurrentView('game')} 
            provider={provider}
            account={account}
            toast={toast}
          />
        ) : !account ? (
          <div className="text-center py-12">
            <div className="bg-black/30 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md mx-auto">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">🎮</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  🚀 Connect Wallet to Play!
                </h2>
                <p className="text-purple-100 text-lg">
                  Ready to try the <span className="text-yellow-400 font-bold">Secret Counter Battle</span> demo?
                </p>
                <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <p className="text-blue-200 text-sm">
                    🌐 <strong>Sepolia Testnet Required</strong><br/>
                    Get free test ETH from <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-300 underline">Sepolia Faucet</a>
                  </p>
                </div>
              </div>
              <ConnectWallet onConnect={connectWallet} />
            </div>
          </div>
        ) : currentGame ? (
          <GameRoom 
            gameId={currentGame} 
            provider={provider!}
            account={account}
            onLeaveGame={() => setCurrentGame(null)}
          />
        ) : (
          <GameLobby 
            provider={provider!}
            account={account}
            onJoinGame={setCurrentGame}
          />
        )}
      </main>

      <footer className="relative bg-black/20 backdrop-blur-sm border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-purple-200 text-sm">
            <p>🏆 Built for <span className="text-yellow-400 font-bold">Zama Bounty Season 10</span> • ⚡ Powered by FHEVM • 🎮 Made with ❤️</p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <toast.ToastContainer />
    </div>
  )
}

export default App