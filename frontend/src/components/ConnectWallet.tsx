interface ConnectWalletProps {
  onConnect: () => void;
}

const ConnectWallet = ({ onConnect }: ConnectWalletProps) => {
  return (
    <button
      onClick={onConnect}
      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 border-2 border-yellow-400 hover:border-yellow-300"
    >
      <span className="text-2xl">🔗</span>
      <span className="text-lg">Connect Battle Wallet</span>
      <span className="text-2xl animate-bounce">⚔️</span>
    </button>
  );
};

export default ConnectWallet;
