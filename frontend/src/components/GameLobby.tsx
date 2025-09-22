import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractConfig from '../contract-config.json';

interface GameLobbyProps {
  provider: ethers.BrowserProvider;
  account: string;
  onJoinGame: (gameId: number) => void;
}

interface Game {
  gameId: number;
  player1: string;
  player2: string;
  gameActive: boolean;
  gameFinished: boolean;
  createdAt: bigint;
}

const GameLobby = ({ provider, account, onJoinGame }: GameLobbyProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Real contract configuration
  const CONTRACT_ADDRESS = contractConfig.address;
  const CONTRACT_ABI = contractConfig.abi;

  useEffect(() => {
    if (provider) {
      loadGames();
      loadFinishedGames();
    }
  }, [provider]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('🔍 Loading games from contract:', CONTRACT_ADDRESS);
      
      // Get total game counter first
      const gameCounter = await contract.gameCounter();
      console.log('🎮 Total games created:', gameCounter.toString());
      
      if (gameCounter === 0n) {
        setGames([]);
        return;
      }
      
      // Contract bug: gameExists modifier uses gameId < gameCounter instead of <=
      // So if gameCounter = 1, we can only access game ID 0 (not 1)
      // Workaround: try both 0-based and 1-based indexing
      
      const activeGames = [];
      const maxId = Number(gameCounter);
      
          // Try 1-based indexing first (1 to gameCounter) - correct approach
          for (let i = 1; i <= maxId; i++) {
        try {
          const gameData = await contract.getGame(i);
          const game = {
            gameId: i,
            player1: gameData[1],
            player2: gameData[2],
            gameActive: gameData[6],
            gameFinished: gameData[7],
            createdAt: gameData[12]
          };
          
          // Only add active, unfinished games with real players
          if (game.gameActive && !game.gameFinished && game.player1 !== '0x0000000000000000000000000000000000000000') {
            activeGames.push(game);
          }
          
          console.log(`🎯 Game ${i} (1-based):`, game);
        } catch (gameError) {
          console.log(`⚠️ Game ${i} (1-based) not found:`, gameError.message);
        }
      }
      
      // Note: We're using 1-based indexing because games start from ID 1
      
      console.log('✅ Active games found:', activeGames);
      setGames(activeGames);
    } catch (error) {
      console.error('❌ Error loading games:', error);
      // Fallback to empty array
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    try {
      setCreating(true);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('🎯 Creating new game...');
      const tx = await contract.createGame();
      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed:', receipt);
      
      // Wait for blockchain to update and reload multiple times
      setTimeout(async () => {
        await loadGames();
      }, 1000);
      
      setTimeout(async () => {
        await loadGames();
      }, 3000);
      
      // Game creation success will be shown through UI updates
    } catch (error: any) {
      console.error('❌ Error creating game:', error);
      
      if (error.message.includes('Player already has an active game')) {
        console.error('⚠️ Player already has an active game');
      } else if (error.message.includes('insufficient funds')) {
        console.error('💰 Insufficient ETH for gas fees');
      } else {
        console.error('❌ Error creating game:', error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const joinGame = async (gameId: number) => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('🎯 Joining game:', gameId);
      const tx = await contract.joinGame(gameId);
      console.log('📝 Join transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Join transaction confirmed:', receipt);
      
      // Navigate to game room
      onJoinGame(gameId);
      
      // Join success will be shown by navigating to game room
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const cancelGame = async (gameId: number) => {
    if (!confirm('Are you sure you want to cancel this game?')) {
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      console.log('🗑️ Canceling game:', gameId);
      const tx = await contract.cancelGame(gameId);
      console.log('📝 Cancel transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Cancel transaction confirmed:', receipt);
      
      // Reload games after cancellation
      setTimeout(async () => {
        await loadGames();
      }, 1000);
      
      alert('🗑️ Game cancelled successfully!');
      
    } catch (error: any) {
      console.error('Error canceling game:', error);
      
      if (error.message.includes('Only game creator can cancel')) {
        alert('❌ Only the game creator can cancel this game.');
      } else if (error.message.includes('Cannot cancel game with 2 players')) {
        alert('❌ Cannot cancel game - another player has already joined.');
      } else {
        alert('❌ Error canceling game: ' + error.message);
      }
    }
  };

  // Separate games into different categories
  const myGames = games.filter(game => game.player1.toLowerCase() === account.toLowerCase());
  const otherGames = games.filter(game => game.player1.toLowerCase() !== account.toLowerCase());
  const [finishedGames, setFinishedGames] = useState<Game[]>([]);

  // Load finished games
  const loadFinishedGames = async () => {
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const gameCounter = await contract.gameCounter();
      const finished = [];
      
      for (let i = 1; i <= Number(gameCounter); i++) {
        try {
          const gameData = await contract.getGame(i);
          if (gameData[7]) { // gameFinished = true
            const game = {
              gameId: i,
              player1: gameData[1],
              player2: gameData[2],
              gameActive: gameData[6],
              gameFinished: gameData[7],
              createdAt: gameData[12]
            };
            finished.push(game);
          }
        } catch (error) {
          // Skip non-existent games
        }
      }
      
      setFinishedGames(finished.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading finished games:', error);
    }
  };
  
  // Game filtering for display

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Game Lobby</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create a new game or join an existing one. Players compete by submitting secret numbers, 
          and the winner is determined by encrypted computation!
        </p>
      </div>

      {/* Create Game Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Start a New Game</h3>
            <p className="text-gray-600 mb-6">
              Create a new Secret Counter Battle and wait for another player to join.
            </p>
            <div className="space-y-4">
              <button
                onClick={createGame}
                disabled={creating}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
              >
                {creating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  '🎮 Create New Game'
                )}
              </button>
              
            </div>
          </div>
      </div>

      {/* My Waiting Games */}
      {myGames.length > 0 && (
        <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-blue-900">🎮 My Waiting Games ({myGames.length})</h3>
            <button
              onClick={loadGames}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-4">
            {myGames.map((game) => (
              <div key={game.gameId} className="border-2 border-blue-300 bg-blue-100 rounded-xl p-4 hover:border-blue-400 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        🎯 Game #{game.gameId}
                      </span>
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Your Game
                      </span>
                    </div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><span className="font-bold">Status:</span> Waiting for opponent...</p>
                      <p><span className="font-bold">Created:</span> {new Date(Number(game.createdAt) * 1000).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => onJoinGame(game.gameId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Enter Game
                    </button>
                    <button
                      onClick={() => cancelGame(game.gameId)}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                      title="Cancel Game"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Players' Games */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">🌟 Available Games ({otherGames.length})</h3>
          <button
            onClick={loadGames}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading games...</p>
          </div>
        ) : otherGames.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              🎮
            </div>
            <p className="text-gray-600 mb-4">No games available to join</p>
            <p className="text-sm text-gray-500">Create a game or wait for others to create one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otherGames.map((game) => (
              <div key={game.gameId} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Game #{game.gameId}
                      </span>
                      <span className="text-green-600 text-xs font-medium">
                        • Active
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Player 1:</span>{' '}
                        {game.player1 === account 
                          ? 'You' 
                          : `${game.player1.slice(0, 6)}...${game.player1.slice(-4)}`
                        }
                      </p>
                      {game.player2 !== "0x0000000000000000000000000000000000000000" ? (
                        <p>
                          <span className="font-medium">Player 2:</span>{' '}
                          {game.player2 === account 
                            ? 'You' 
                            : `${game.player2.slice(0, 6)}...${game.player2.slice(-4)}`
                          }
                        </p>
                      ) : (
                        <p className="text-orange-600">
                          <span className="font-medium">Waiting for Player 2...</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    {game.player1 === account ? (
                      // If this is your game
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onJoinGame(game.gameId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                          Enter Game
                        </button>
                        {game.player2 === "0x0000000000000000000000000000000000000000" && (
                          <button
                            onClick={() => cancelGame(game.gameId)}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                            title="Cancel Game"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ) : game.player2 === account ? (
                      // If you're player 2
                      <button
                        onClick={() => onJoinGame(game.gameId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Enter Game
                      </button>
                    ) : game.player2 === "0x0000000000000000000000000000000000000000" ? (
                      // If game is open for joining
                      <button
                        onClick={() => joinGame(game.gameId)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                      >
                        Join Game
                      </button>
                    ) : (
                      // If game is full
                      <span className="bg-gray-100 text-gray-500 font-medium py-2 px-4 rounded-lg text-sm">
                        Full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Finished Games */}
      <div className="bg-gray-50 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">🏆 Finished Games ({finishedGames.length})</h3>
          <button
            onClick={loadFinishedGames}
            className="text-gray-600 hover:text-gray-700 font-medium text-sm flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {finishedGames.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-200 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              🏁
            </div>
            <p className="text-gray-600 mb-4">No finished games yet</p>
            <p className="text-sm text-gray-500">Complete some games to see results here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {finishedGames.map((game) => (
              <div key={game.gameId} className="border border-gray-300 bg-white rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-gray-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Game #{game.gameId}
                      </span>
                      <span className="text-green-600 text-xs font-medium">
                        ✓ Completed
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Player 1:</span>{' '}
                        {game.player1 === account 
                          ? 'You' 
                          : `${game.player1.slice(0, 6)}...${game.player1.slice(-4)}`
                        }
                      </p>
                      <p>
                        <span className="font-medium">Player 2:</span>{' '}
                        {game.player2 === account 
                          ? 'You' 
                          : `${game.player2.slice(0, 6)}...${game.player2.slice(-4)}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        Finished: {new Date(Number(game.createdAt) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => onJoinGame(game.gameId)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      View Results
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tutorial Info */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <p className="font-medium text-gray-900">Create or Join</p>
              <p className="text-gray-600">Start a new game or join an existing one</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <p className="font-medium text-gray-900">Submit Secret</p>
              <p className="text-gray-600">Enter your secret number (1-100) encrypted</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <p className="font-medium text-gray-900">See Results</p>
              <p className="text-gray-600">View encrypted sum and determine winner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
