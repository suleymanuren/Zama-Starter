import { useState } from 'react'

interface CodePlaygroundProps {
  title: string
  initialCode: string
  expectedCode?: string
  instructions: string[]
  onComplete?: () => void
  toast?: any
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({
  title,
  initialCode,
  expectedCode,
  instructions,
  onComplete,
  toast
}) => {
  const [code, setCode] = useState(initialCode)
  const [showSolution, setShowSolution] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const checkCode = () => {
    if (expectedCode && code.trim().includes(expectedCode.trim())) {
      setIsCompleted(true)
      if (onComplete) {
        onComplete()
      }
      if (toast) {
        toast.success('Code Challenge Complete! 🎉', 'Excellent! Your code looks correct!')
      }
    } else {
      if (toast) {
        toast.warning('Not Quite Right 🤔', 'Check the instructions and try again!')
      }
    }
  }

  const resetCode = () => {
    setCode(initialCode)
    setIsCompleted(false)
    setShowSolution(false)
  }

  return (
    <div className="bg-black/40 rounded-xl border border-gray-600 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h3 className="text-lg font-bold flex items-center">
          <span className="mr-2">👨‍💻</span>
          {title}
          {isCompleted && <span className="ml-2 text-green-300">✅</span>}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Instructions Panel */}
        <div className="p-6 bg-gray-900/50 border-r border-gray-600">
          <h4 className="text-yellow-400 font-bold mb-3">📋 Instructions:</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={checkCode}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ✓ Check Code
            </button>
            
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {showSolution ? '🙈 Hide Solution' : '💡 Show Solution'}
            </button>
            
            <button
              onClick={resetCode}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="p-6 bg-black/30">
          <div className="mb-3">
            <h4 className="text-green-400 font-bold mb-2">📝 Your Code:</h4>
            <div className="text-xs text-gray-400 mb-2">
              Edit the code below to complete the challenge
            </div>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-black/50 text-green-300 font-mono text-sm p-4 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
            spellCheck={false}
          />
          
          {showSolution && expectedCode && (
            <div className="mt-4">
              <h4 className="text-yellow-400 font-bold mb-2">💡 Solution:</h4>
              <pre className="bg-black/50 text-yellow-300 font-mono text-xs p-4 rounded-lg border border-yellow-600 overflow-x-auto">
                {expectedCode}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-t border-green-500/30 p-4">
          <div className="flex items-center text-green-300">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-bold">Great job!</p>
              <p className="text-sm text-green-200">You've successfully completed this coding challenge.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodePlayground
