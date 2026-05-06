import { useState } from 'react'

interface Props {
  onStart: () => void
}

const FLOW: { icon: string; label: string; border: string; bg: string }[] = [
  { icon: '📥', label: 'In Adapter',  border: 'border-sky-500',    bg: 'bg-sky-950'    },
  { icon: '🔌', label: 'In Port',     border: 'border-indigo-500', bg: 'bg-indigo-950' },
  { icon: '📦', label: 'Domain',      border: 'border-yellow-500', bg: 'bg-yellow-950' },
  { icon: '🔗', label: 'Out Port',    border: 'border-violet-500', bg: 'bg-violet-950' },
  { icon: '📤', label: 'Out Adapter', border: 'border-rose-500',   bg: 'bg-rose-950'   },
]

export function WelcomeScreen({ onStart }: Props) {
  const [fading, setFading] = useState(false)

  const handleStart = () => {
    setFading(true)
    setTimeout(onStart, 280)
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center
        transition-opacity duration-300
        ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* top-left brand */}
      <div className="absolute top-5 left-6 font-bold text-xebia tracking-widest text-sm">
        XEBIA
      </div>

      {/* top-right tagline */}
      <div className="absolute top-5 right-6 text-xs text-gray-600 font-mono">
        KotlinConf 2025
      </div>

      {/* center content */}
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full px-8 text-center">

        {/* headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Design your Kotlin architecture.<br />
            <span className="text-xebia">Get real code back.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            Drag modules onto the canvas, draw your dependency graph,<br />
            hit <span className="text-gray-200 font-medium">Generate</span> — and walk away with a full multi-module Gradle scaffold,<br />
            hexagonal structure and ArchUnit rules included.
          </p>
        </div>

        {/* architecture flow diagram */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {FLOW.map((m, i) => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className={`
                ${m.bg} border ${m.border}
                rounded-lg px-3 py-2 flex flex-col items-center gap-0.5 min-w-[76px]
              `}>
                <span className="text-lg">{m.icon}</span>
                <span className="text-[10px] text-gray-300 font-mono">{m.label}</span>
              </div>
              {i < FLOW.length - 1 && (
                <span className="text-gray-600 font-mono text-sm">→</span>
              )}
            </div>
          ))}
        </div>

        {/* privacy notice */}
        <p className="text-xs text-gray-500 leading-relaxed max-w-md">
          <span className="text-gray-400">🔒 Your design stays on this screen.</span><br />
          Only if you choose to <span className="text-gray-300 font-medium">Publish</span>, we push a single commit to our public GitHub repo — yours to clone and build on. Nothing else leaves this page.
        </p>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="
            bg-xebia hover:bg-orange-500 active:scale-95
            text-white font-bold text-base px-10 py-4 rounded-2xl
            transition-all duration-150 shadow-lg shadow-orange-900/30
            tracking-wide
          "
        >
          Start Designing →
        </button>
      </div>

      {/* bottom hint */}
      <div className="absolute bottom-5 text-[11px] text-gray-700 font-mono">
        double-click a node to rename it &nbsp;·&nbsp; drag from a handle to connect
      </div>
    </div>
  )
}
