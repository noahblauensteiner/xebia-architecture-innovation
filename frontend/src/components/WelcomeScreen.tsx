import { useState } from 'react'

interface Props {
  onStart: () => void
  onChallenge: () => void
}

export function WelcomeScreen({ onStart, onChallenge }: Props) {
  const [fading, setFading] = useState(false)

  const FADE_MS = 300

  const handleStart = () => {
    setFading(true)
    setTimeout(onStart, FADE_MS)
  }

  const handleChallenge = () => {
    setFading(true)
    setTimeout(onChallenge, FADE_MS)
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
        className="absolute top-5 left-6 hover:opacity-80 transition-opacity"
      >
        <img src="/src/xebia_white.png" alt="Xebia" className="h-6" />
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

        {/* CTAs */}
        <div className="flex items-center gap-4">
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
          <button
            onClick={handleChallenge}
            className="
              border border-xavi text-xavi hover:bg-xavi/10 active:scale-95
              font-bold text-base px-8 py-4 rounded-2xl
              transition-all duration-150
              tracking-wide
            "
          >
            Accept Challenge
          </button>
        </div>
      </div>

      {/* bottom hint */}
      <div className="absolute bottom-5 text-[11px] text-gray-700 font-mono">
        double-click a node to rename it &nbsp;·&nbsp; drag from a handle to connect
      </div>
    </div>
  )
}
