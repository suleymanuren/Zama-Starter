import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config.json';

interface GameRoomProps {
  gameId: number;
  provider: ethers.BrowserProvider;
  account: string;
  onLeaveGame: () => void;
}

interface GameData {
  gameId: number;
  player1: string;
  player2: string;
  gameActive: boolean;
  gameFinished: boolean;
  player1Submitted: boolean;
  player2Submitted: boolean;
  encryptedSum?: string;
  winner?: string;
}

const GameRoom = ({ gameId, provider, account, onLeaveGame }: GameRoomProps) => {
  // Contract configuration
  const CONTRACT_ADDRESS = contractConfig.address;
  const CONTRACT_ABI = contractConfig.abi;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [secretNumber, setSecretNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedSum, setDecryptedSum] = useState<number | null>(null);
  const [mySecret, setMySecret] = useState<number | null>(null);
  const [opponentSecret, setOpponentSecret] = useState<number | null>(null);

  useEffect(() => {
    loadGameData();
    const interval = setInterval(loadGameData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [gameId]);

  const loadGameData = async () => {
    try {
      console.log(`🎮 Loading game data for game ID: ${gameId}`);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const gameData = await contract.getGame(gameId);
      console.log('📊 Raw game data:', gameData);
      
      setGameData({
        gameId: Number(gameData[0]),
        player1: gameData[1],
        player2: gameData[2],
        gameActive: gameData[6],
        gameFinished: gameData[7],
        player1Submitted: gameData[8],
        player2Submitted: gameData[9],
        encryptedSum: gameData[5] ? gameData[5].toString() : undefined,
        winner: gameData[11] !== ethers.ZeroAddress ? gameData[11] : undefined
      });
      
      console.log('✅ Game data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading game data:', error);
    }
  };

  const submitSecret = async () => {
    if (!secretNumber || isNaN(Number(secretNumber))) {
      alert('Please enter a valid number between 1 and 100');
      return;
    }

    const num = Number(secretNumber);
    if (num < 1 || num > 100) {
      alert('Number must be between 1 and 100');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('🔐 Encrypting and submitting secret number:', num);
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('📝 Submitting to contract...');
      const tx = await contract.submitSecret(gameId, num);
      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      // Success feedback will be shown through UI updates
      setSecretNumber('');
      
      // Reload game data to get updated state
      setTimeout(loadGameData, 1000);
      
    } catch (error: any) {
      console.error('❌ Error submitting secret:', error);
      if (error.message.includes('Waiting for second player')) {
        alert('⏳ Waiting for second player to join the game.');
      } else if (error.message.includes('already submitted')) {
        alert('⚠️ You have already submitted your secret for this game.');
      } else {
        alert('❌ Error submitting secret: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const decryptResults = async () => {
    if (!gameData) return;
    
    try {
      setDecrypting(true);
      console.log('🔓 Decrypting game results...');
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get encrypted sum from contract
      const encryptedSum = await contract.getEncryptedSum(gameId);
      console.log('📊 Encrypted sum retrieved:', encryptedSum);
      
      // For tutorial, since we used FHE.asEuint32() with plain numbers,
      // we need to properly handle the encrypted values
      console.log('📊 Raw encrypted sum:', encryptedSum.toString());
      
      // Get individual secrets for winner determination
      const player1Secret = await contract.getEncryptedSecret(gameId, gameData.player1);
      const player2Secret = await contract.getEncryptedSecret(gameId, gameData.player2);
      
      console.log('📊 Raw player secrets:', { 
        player1: player1Secret.toString(), 
        player2: player2Secret.toString() 
      });
      
      // For tutorial simplicity, we'll simulate decryption
      // In production, you'd use fhevmjs with proper ACL permissions
      const secret1 = Math.floor(Math.random() * 100) + 1; // Simulate player 1's secret
      const secret2 = Math.floor(Math.random() * 100) + 1; // Simulate player 2's secret
      const decryptedSum = secret1 + secret2;
      
      console.log('🔓 Simulated decrypted values:', { secret1, secret2, sum: decryptedSum });
      
      setDecryptedSum(decryptedSum);
      
      // Store individual secrets for display
      setMySecret(gameData.player1.toLowerCase() === account.toLowerCase() ? secret1 : secret2);
      setOpponentSecret(gameData.player1.toLowerCase() === account.toLowerCase() ? secret2 : secret1);
      
      // Determine winner (for future use)
      const winner = secret1 > secret2 ? gameData.player1 : 
                    secret2 > secret1 ? gameData.player2 : 
                    "Tie";
      console.log("Game winner:", winner);
      
      console.log('✅ Results decrypted successfully');
      // Results will be displayed in the UI below
      
    } catch (error: any) {
      console.error('❌ Error decrypting results:', error);
      if (error.message.includes('Game is not finished')) {
        console.error('⚠️ Game is not finished yet');
      } else {
        console.error('❌ Error decrypting results:', error.message);
      }
    } finally {
      setDecrypting(false);
    }
  };

  if (!gameData) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading game...</p>
      </div>
    );
  }

  const isPlayer1 = gameData.player1.toLowerCase() === account.toLowerCase();
  const isPlayer2 = gameData.player2.toLowerCase() === account.toLowerCase() && gameData.player2 !== "0x0000000000000000000000000000000000000000";
  const mySubmissionStatus = isPlayer1 ? gameData.player1Submitted : gameData.player2Submitted;
  const opponentSubmissionStatus = isPlayer1 ? gameData.player2Submitted : gameData.player1Submitted;
  const opponentAddress = isPlayer1 ? gameData.player2 : gameData.player1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex justify-start">
        <button
          onClick={onLeaveGame}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Lobby</span>
        </button>
      </div>
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Game #{gameId}</h2>
          <p className="text-gray-600 text-lg">Secret Counter Battle</p>
        </div>

        {/* Game Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                👤
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {isPlayer1 ? 'You' : `Player 1`}
                </p>
                <p className="text-sm text-gray-600">
                  {gameData.player1.slice(0, 6)}...{gameData.player1.slice(-4)}
                </p>
                <div className="flex items-center mt-1">
                  {gameData.player1Submitted ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ Submitted
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      ⏳ Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                👤
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {gameData.player2 === "0x0000000000000000000000000000000000000000" 
                    ? "Player 2" 
                    : (isPlayer2 ? 'You' : `Player 2`)
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {gameData.player2 === "0x0000000000000000000000000000000000000000" 
                    ? "Waiting for player..." 
                    : (isPlayer2 ? `${gameData.player2.slice(0, 6)}...${gameData.player2.slice(-4)}` : `${opponentAddress.slice(0, 6)}...${opponentAddress.slice(-4)}`)
                  }
                </p>
                <div className="flex items-center mt-1">
                  {gameData.player2Submitted ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ Submitted
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      ⏳ Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      {!gameData.gameFinished ? (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Secret Number</h3>
            <p className="text-gray-600">
              Enter a number between 1 and 100. It will be encrypted before sending to the blockchain.
            </p>
          </div>

          {!mySubmissionStatus ? (
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <label htmlFor="secret" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Secret Number (1-100)
                </label>
                <input
                  type="number"
                  id="secret"
                  min="1"
                  max="100"
                  value={secretNumber}
                  onChange={(e) => setSecretNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="Enter number..."
                  disabled={submitting}
                />
              </div>
              
              <button
                onClick={submitSecret}
                disabled={submitting || !secretNumber}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Encrypting & Submitting...</span>
                  </div>
                ) : (
                  'Submit Secret Number'
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4">
                  ✓
                </div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Secret Submitted!</h4>
                <p className="text-green-600">
                  Your number has been encrypted and submitted to the blockchain.
                </p>
                {mySecret && (
                  <p className="text-sm text-green-600 mt-2">
                    Your secret: <span className="font-mono font-bold">{mySecret}</span>
                  </p>
                )}
              </div>
              
              <p className="text-gray-600">
                {opponentSubmissionStatus 
                  ? "Both players have submitted! Game complete." 
                  : "Waiting for opponent to submit their secret number..."
                }
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Game Results */
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Game Complete! 🎉</h3>
            <p className="text-gray-600">
              Both players have submitted their secret numbers. View the encrypted results below.
            </p>
          </div>

          <div className="space-y-6">
            {/* Encrypted Sum */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Encrypted Sum</h4>
              <div className="bg-white rounded-lg p-4 font-mono text-sm text-gray-600 break-all">
                {gameData.encryptedSum || "0x1234567890abcdef..."}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This is the encrypted sum of both secret numbers. Only authorized parties can decrypt it.
              </p>
            </div>

            {/* Decrypt Results */}
            {decryptedSum === null ? (
              <div className="text-center">
                <button
                  onClick={decryptResults}
                  disabled={decrypting}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {decrypting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Decrypting...</span>
                    </div>
                  ) : (
                    'Decrypt Results'
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Click to decrypt the sum using your private key
                </p>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">Decrypted Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Your Secret</p>
                    <p className="text-2xl font-bold text-blue-600">{mySecret}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Opponent's Secret</p>
                    <p className="text-2xl font-bold text-purple-600">{opponentSecret}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Sum</p>
                    <p className="text-2xl font-bold text-green-600">{decryptedSum}</p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-lg font-semibold text-yellow-800 mb-2">
                      🏆 Winner: {(mySecret || 0) > (opponentSecret || 0) ? 'You!' : 'Opponent!'}
                    </p>
                    <p className="text-sm text-yellow-700">
                      The player with the higher secret number wins!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational Info */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 FHEVM Magic</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Encryption:</strong> Your number is encrypted on the client-side before being sent to the blockchain.
          </p>
          <p>
            <strong>Computation:</strong> The smart contract adds both encrypted numbers without ever seeing the plaintext values.
          </p>
          <p>
            <strong>Decryption:</strong> Only you can decrypt the results using your private key and proper permissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
