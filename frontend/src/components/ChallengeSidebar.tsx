import { useState } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { ChallengeLevel } from '../data/challengeLevels'

interface LevelProgress {
  index: number
  total: number
}

interface Props {
  level: ChallengeLevel
  progress: LevelProgress
  nodes: Node[]
  edges: Edge[]
  solved: boolean
  onNext: () => void
  onShowSolution: () => void
  onRestart: () => void
}

export function ChallengeSidebar({ level, progress, nodes, edges, solved, onNext, onShowSolution, onRestart }: Props) {
  const [hintOpen, setHintOpen] = useState(false)
  const isLastLevel = progress.index === progress.total - 1

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-base font-bold text-white tracking-wide">{level.title}</span>
        <span className="text-xs font-mono text-gray-500">{progress.index + 1} / {progress.total}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {solved ? (
          <div className="flex flex-col items-center gap-5 pt-4 text-center">
            <h2 className="text-white font-bold text-xl">Level Completed!</h2>
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3psMmcxdWYzODBuMGduOXltYzc4a3E0YmNuMmxwbGR6Mzdsa3VwOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ztzt8zhmmpVPUiSNMX/giphy.gif"
              alt="Level complete"
              className="w-full rounded-xl"
            />
            {isLastLevel ? (
              <p className="text-gray-400 text-sm leading-relaxed">You completed all challenges. Great architecture!</p>
            ) : (
              <button
                onClick={onNext}
                className="w-full bg-xavi hover:bg-[#7a2d72] text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                Next Challenge →
              </button>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-white font-semibold text-sm leading-snug">
              {level.goalHeading}
            </h2>

            <div className="flex flex-col gap-2">
              {level.explanationParagraphs.map((para, i) => (
                <p key={i} className="text-xs text-gray-400 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* Goals checklist */}
            <div className="flex flex-col gap-2 border border-gray-800 rounded-lg p-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Goals</span>
              {level.goals.map((goal, i) => {
                const done = goal.check(nodes, edges)
                const bad = !done && goal.violated(nodes, edges)
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className={`mt-0.5 flex-shrink-0 text-sm ${done ? 'text-green-400' : bad ? 'text-red-400' : 'text-gray-600'}`}>
                      {done ? '✓' : bad ? '✗' : '○'}
                    </span>
                    <span className={`text-xs leading-relaxed ${done ? 'text-green-400' : bad ? 'text-red-400' : 'text-gray-300'}`}>
                      {goal.text}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Hint + solution */}
            <div className="border border-gray-800 rounded-lg overflow-hidden">
              <div className="flex items-stretch">
                <button
                  onClick={() => setHintOpen(o => !o)}
                  className="flex-1 flex items-center justify-between px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-900 transition-colors"
                >
                  <span className="font-medium">Hint</span>
                  <span>{hintOpen ? '▲' : '▼'}</span>
                </button>
                <div className="w-px bg-gray-800" />
                <button
                  onClick={onShowSolution}
                  className="px-3 py-2 text-xs text-gray-500 hover:text-xavi hover:bg-gray-900 transition-colors whitespace-nowrap"
                >
                  Show solution
                </button>
              </div>
              {hintOpen && (
                <p className="px-3 pb-3 text-xs text-gray-400 leading-relaxed border-t border-gray-800">
                  {level.hint}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <button
          onClick={onRestart}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ↺ Restart level
        </button>
      </div>
    </div>
  )
}
