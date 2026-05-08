import { useState } from 'react'

interface Props {
  onStart: () => void
}

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
      <a
        href="https://xebia.com"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-5 left-6 font-bold text-white tracking-widest hover:opacity-80 transition-opacity flex items-center"
      >
        <span className="text-3xl -mr-1">X</span><span className="text-xl">ebia</span>
      </a>

      {/* top-right tagline */}
      <div className="absolute top-5 right-6 text-xs text-gray-600 font-mono">
        KotlinConf 2025
      </div>

      {/* center content */}
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full px-8 text-center">

        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
            Meet <span className="text-xavi text-7xl">XAVI</span>
          </h1>
          <p className="text-gray-300 text-lg">
            our Xebian Architecture Visualization Innovation
          </p>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            Draw your architecture, see if it meets our 10 goals of solid architecture
            and walk away with a multi-module Gradle project and our ArchUnit tests included.
          </p>
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
            bg-xavi hover:bg-xavi active:scale-95
            text-white font-bold text-base px-10 py-4 rounded-2xl
            transition-all duration-150 shadow-lg shadow-purple-900/30
            tracking-wide
          "
        >
          Draw with us
        </button>
      </div>

      {/* bottom hint */}
      <div className="absolute bottom-5 text-[11px] text-gray-700 font-mono">
        double-click a node to rename it &nbsp;·&nbsp; drag from a handle to connect
      </div>
    </div>
  )
}
