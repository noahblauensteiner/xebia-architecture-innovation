import { useCallback, useEffect, useRef, useState } from 'react'
import type { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { CanvasPane } from './components/CanvasPane'
import { ModulePalette } from './components/ModulePalette'
import { FileTree } from './components/FileTree'
import { QRDisplay } from './components/QRDisplay'
import { WelcomeScreen } from './components/WelcomeScreen'
import { useCanvasState } from './hooks/useCanvasState'
import { generateProject } from './api/generate'
import type { ModuleNodeData } from './components/ModuleNode'

function toPackageName(projectName: string): string {
  return 'com.xebia.' + projectName.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function buildPreviewTree(nodes: Node[]): string[] {
  if (nodes.length === 0) return []
  const lines: string[] = []
  const projectName = 'my-kotlin-app'
  lines.push(`📁 ${projectName}/`)
  lines.push('├── settings.gradle.kts')
  lines.push('├── build.gradle.kts')
  nodes.forEach((n, i) => {
    const data = n.data as ModuleNodeData
    const isLast = i === nodes.length - 1
    const prefix = isLast ? '└──' : '├──'
    lines.push(`${prefix} 📁 ${data.label}/`)
    lines.push(`${isLast ? '   ' : '│  '} ├── build.gradle.kts`)
    lines.push(`${isLast ? '   ' : '│  '} └── 📁 src/main/kotlin/`)
  })
  return lines
}

export default function App() {
  const canvasA = useCanvasState()
  const canvasB = useCanvasState()

  const [welcomed, setWelcomed] = useState(false)
  const [projectName, setProjectName] = useState('my-kotlin-app')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<{ branchUrl: string | null } | null>(null)
  const [fileTree, setFileTree] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [isSplit, setIsSplit] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [activeCanvas, setActiveCanvas] = useState<'a' | 'b'>('a')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFileTree(buildPreviewTree(canvasA.nodes))
  }, [canvasA.nodes])

  const handleGenerate = async () => {
    if (canvasA.nodes.length === 0) return
    setIsGenerating(true)
    setError(null)
    setGeneratedResult(null)
    try {
      const result = await generateProject({
        projectName,
        packageName: toPackageName(projectName),
        nodes: canvasA.nodes.map((n) => {
          const d = n.data as ModuleNodeData
          return { id: n.id, type: d.moduleType, label: d.label }
        }),
        edges: canvasA.edges.map((e) => ({ source: e.source, target: e.target })),
        visitorEmail: visitorEmail || undefined,
      })
      setFileTree(result.fileTree)
      setGeneratedResult({ branchUrl: result.branchUrl })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    canvasA.clear()
    canvasB.clear()
    setGeneratedResult(null)
    setFileTree([])
    setError(null)
  }

  const renameNode = useCallback(
    (id: string, field: 'displayName' | 'label' | 'description', value: string) => {
      const updater = (nds: Node[]) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n))
      canvasA.setNodes(updater)
      canvasB.setNodes(updater)
    },
    [canvasA.setNodes, canvasB.setNodes],
  )

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = (ev.clientY - rect.top) / rect.height
      setSplitRatio(Math.max(0.2, Math.min(0.8, ratio)))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const activeCanvasState = activeCanvas === 'a' ? canvasA : canvasB
  const selectedNode =
    canvasA.nodes.find((n) => n.selected) ?? canvasB.nodes.find((n) => n.selected) ?? null

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {!welcomed && <WelcomeScreen onStart={() => setWelcomed(true)} />}

      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-2.5 bg-gray-950 border-b border-gray-800 flex-shrink-0">
        <span className="font-bold text-xebia tracking-widest text-sm">XEBIA</span>
        <input
          className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:border-xebia"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="project-name"
        />
        <span className="text-xs text-gray-500 ml-auto">Draw your architecture → Generate</span>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <ModulePalette onAdd={(type) => activeCanvasState.addModule(type)} />

        {/* Canvas area */}
        <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas A — always visible */}
          <div style={{ height: isSplit ? `${splitRatio * 100}%` : '100%' }} className="flex-shrink-0">
            <CanvasPane
              canvas={canvasA}
              isActive={activeCanvas === 'a'}
              onActivate={() => setActiveCanvas('a')}
              onSplit={() => setIsSplit((s) => !s)}
              isSplit={isSplit}
            />
          </div>

          {/* Splitter + Canvas B — only when split */}
          {isSplit && (
            <>
              <div
                className="h-1 bg-gray-700 hover:bg-xebia cursor-row-resize flex-shrink-0 transition-colors"
                onMouseDown={onSplitterMouseDown}
              />
              <div className="flex-1 min-h-0">
                <CanvasPane
                  canvas={canvasB}
                  isActive={activeCanvas === 'b'}
                  onActivate={() => setActiveCanvas('b')}
                  onSplit={() => setIsSplit(false)}
                  isSplit={isSplit}
                />
              </div>
            </>
          )}
        </div>

        <FileTree
          fileTree={fileTree}
          isGenerating={isGenerating}
          selectedNode={selectedNode}
          onRenameNode={renameNode}
        />
      </div>

      {/* Bottom bar */}
      <footer className="flex items-center gap-4 px-5 py-3 bg-gray-950 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || canvasA.nodes.length === 0}
          className="bg-xebia hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
        >
          {isGenerating ? 'Generating…' : '⚡ Generate Project'}
        </button>
        <button
          onClick={handleClear}
          className="border border-gray-700 text-gray-400 hover:text-gray-200 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Clear
        </button>
        <input
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 w-52 focus:outline-none focus:border-xebia"
          value={visitorEmail}
          onChange={(e) => setVisitorEmail(e.target.value)}
          placeholder="visitor@email.com (optional)"
          type="email"
        />
        {error && <span className="text-red-400 text-xs">{error}</span>}
        <div className="ml-auto">
          <QRDisplay
            url={generatedResult?.branchUrl ?? ''}
            generated={generatedResult !== null}
          />
        </div>
      </footer>
    </div>
  )
}
