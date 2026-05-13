import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { CanvasPane } from './CanvasPane'
import { ModulePalette } from './ModulePalette'
import { ChallengeSidebar } from './ChallengeSidebar'
import { useCanvasState } from '../hooks/useCanvasState'
import { LEVELS } from '../data/challengeLevels'

interface Props {
  onExit: () => void
}

export function ChallengeScreen({ onExit }: Props) {
  const canvas = useCanvasState()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [solved, setSolved] = useState(false)

  const level = LEVELS[currentLevel]

  useEffect(() => {
    canvas.setNodes(level.initialNodes)
    canvas.setEdges(level.initialEdges)
    setSolved(false)
  }, [currentLevel, level])

  useEffect(() => {
    if (!solved && level.checkWin(canvas.nodes, canvas.edges)) {
      setSolved(true)
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } })
    }
  }, [canvas.edges, canvas.nodes, level, solved])

  const handleShowSolution = () => {
    canvas.setNodes(level.solutionNodes)
    canvas.setEdges(level.solutionEdges)
  }

  const handleRestart = () => {
    canvas.setNodes(level.initialNodes)
    canvas.setEdges(level.initialEdges)
    setSolved(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex items-center gap-4 px-5 py-4 bg-gray-950 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={onExit}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img src="/src/xebia_purple.png" alt="Xebia" className="h-6" />
        </button>
        <h1 className="text-white font-bold text-xl flex-1 text-center">Kotlin Conference Challenge</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ModulePalette onAdd={(type) => canvas.addModule(type)} />

        <div className="flex-1 overflow-hidden">
          <CanvasPane
            canvas={canvas}
            isActive={true}
            onActivate={() => {}}
            onSplit={() => {}}
            isSplit={false}
            showSplit={false}
          />
        </div>

        <ChallengeSidebar
          level={level}
          progress={{ index: currentLevel, total: LEVELS.length }}
          nodes={canvas.nodes}
          edges={canvas.edges}
          solved={solved}
          onNext={() => setCurrentLevel(l => l + 1)}
          onShowSolution={handleShowSolution}
          onRestart={handleRestart}
        />
      </div>
    </div>
  )
}
