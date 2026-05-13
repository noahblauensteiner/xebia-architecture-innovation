interface Props {
  onStart: () => void
  onChallenge: () => void
}

export function WelcomeScreen({ onStart, onChallenge }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d12] flex flex-col">

      {/* Header */}
      <header className="relative flex items-center px-8 py-5 flex-shrink-0">
        <a
          href="https://xebia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
        >
          <img src="/src/xebia_white.png" alt="Xebia" className="h-5" />
        </a>
        <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-[0.3em] text-gray-700 uppercase">
          XAVI
        </span>
        <span className="ml-auto text-xs text-gray-600 font-mono">KotlinConf 2026</span>
      </header>

      {/* Identity */}
      <div className="flex flex-col items-center gap-1.5 pt-6 pb-2 flex-shrink-0">
        <h1 className="text-4xl font-bold text-white leading-tight">
          Meet <span className="text-xavi text-6xl">XAVI</span>
        </h1>
        <p className="text-sm text-gray-500">our Xebian Architecture Visualization Innovation</p>
      </div>

      {/* Split main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Draw */}
        <div
          onClick={onStart}
          className="flex-1 flex flex-col items-center justify-center gap-10 px-16 py-12 cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <svg width="80" height="56" viewBox="0 0 80 56" fill="none" aria-hidden>
            <rect x="1" y="18" width="20" height="20" rx="3" stroke="#64235c" strokeWidth="1.5"/>
            <rect x="30" y="18" width="20" height="20" rx="3" stroke="#64235c" strokeWidth="1.5"/>
            <rect x="59" y="18" width="20" height="20" rx="3" stroke="#64235c" strokeWidth="1.5"/>
            <line x1="21" y1="28" x2="30" y2="28" stroke="#64235c" strokeWidth="1.5"/>
            <line x1="50" y1="28" x2="59" y2="28" stroke="#64235c" strokeWidth="1.5"/>
            <polyline points="26,24 30,28 26,32" stroke="#64235c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <polyline points="55,24 59,28 55,32" stroke="#64235c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>

          <div className="flex flex-col gap-3 max-w-xs text-center">
            <h2 className="text-[2rem] font-bold text-white leading-tight">
              Draw your architecture
            </h2>
            <p className="text-[0.875rem] text-gray-500 leading-relaxed">
              Place modules on a canvas, draw dependency arrows, and score your design
              against 10 principles of solid architecture. Walk away with a generated
              Kotlin multi-module project — ready to build on.
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onStart() }}
            className="bg-xavi hover:bg-[#7a2d72] text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Start drawing
          </button>
        </div>

        {/* Divider */}
        <div className="relative w-px bg-white/[0.07] flex-shrink-0">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d0d12] px-1.5 py-1 text-[11px] font-mono text-gray-700">
            or
          </span>
        </div>

        {/* Right: Challenge */}
        <div
          onClick={onChallenge}
          className="flex-1 flex flex-col items-center justify-center gap-10 px-16 py-12 cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex flex-col gap-1.5 w-52">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-600 w-12 text-right shrink-0">Warm</span>
              <div className="flex-1 h-5 rounded-sm bg-amber-500/70" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-600 w-12 text-right shrink-0">Hot</span>
              <div className="flex-1 h-5 rounded-sm bg-orange-500/80" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-600 w-12 text-right shrink-0">Blazing</span>
              <div className="flex-1 h-5 rounded-sm bg-red-600/90" />
            </div>
          </div>

          <div className="flex flex-col gap-3 max-w-xs text-center">
            <h2 className="text-[2rem] font-bold text-white leading-tight">
              Take the challenge
            </h2>
            <p className="text-[0.875rem] text-gray-500 leading-relaxed">
              Three escalating levels — module boundaries, clean architecture, agentic systems.
              Fix the flaws in a broken design and learn what makes Kotlin services production-ready.
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onChallenge() }}
            className="border border-white/20 hover:border-white/40 hover:text-white text-gray-400 text-sm font-bold px-8 py-3 rounded-xl transition-colors"
          >
            How hot can you go?
          </button>
        </div>

      </div>

      {/* Privacy note */}
      <footer className="flex justify-center px-8 py-5 flex-shrink-0">
        <p className="text-[11px] text-gray-700">
          Nothing you draw ever leaves this screen — unless you choose to publish your generated repo to GitHub.
        </p>
      </footer>

    </div>
  )
}
