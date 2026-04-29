import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ModuleNodeComponent, type ModuleNodeData } from './components/ModuleNode'
import { ModulePalette } from './components/ModulePalette'
import { FileTree } from './components/FileTree'
import { QRDisplay } from './components/QRDisplay'
import { generateProject } from './api/generate'
import type { ModuleType } from './types/architecture'

const nodeTypes = { module: ModuleNodeComponent }

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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [projectName, setProjectName] = useState('my-kotlin-app')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<{ branchUrl: string | null; zipUrl: string } | null>(null)
  const [fileTree, setFileTree] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const nodeCounter = useState(0)

  useEffect(() => {
    setFileTree(buildPreviewTree(nodes))
  }, [nodes])

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' }, style: { stroke: '#6b7280' } }, eds)
      ),
    [setEdges]
  )

  const addModule = useCallback(
    (type: ModuleType) => {
      const id = `${type}-${Date.now()}`
      const count = nodeCounter[0]
      nodeCounter[1](count + 1)
      const newNode: Node = {
        id,
        type: 'module',
        position: { x: 160 + (count % 3) * 180, y: 80 + Math.floor(count / 3) * 140 },
        data: { moduleType: type, label: type } satisfies ModuleNodeData,
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes, nodeCounter]
  )

  const handleGenerate = async () => {
    if (nodes.length === 0) return
    setIsGenerating(true)
    setError(null)
    setGeneratedResult(null)

    try {
      const result = await generateProject({
        projectName,
        packageName: toPackageName(projectName),
        nodes: nodes.map((n) => {
          const d = n.data as ModuleNodeData
          return { id: n.id, type: d.moduleType, label: d.label }
        }),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
        visitorEmail: visitorEmail || undefined,
      })
      setFileTree(result.fileTree)
      setGeneratedResult({ branchUrl: result.branchUrl, zipUrl: result.zipDownloadUrl })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    setNodes([])
    setEdges([])
    setGeneratedResult(null)
    setFileTree([])
    setError(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
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
        <ModulePalette onAdd={addModule} />

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-900"
          >
            <Background color="#374151" gap={24} />
            <Controls className="!bg-gray-800 !border-gray-700 !rounded-lg" />
          </ReactFlow>
        </div>

        <FileTree fileTree={fileTree} isGenerating={isGenerating} />
      </div>

      {/* Bottom bar */}
      <footer className="flex items-center gap-4 px-5 py-3 bg-gray-950 border-t border-gray-800 flex-shrink-0">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || nodes.length === 0}
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
            zipUrl={generatedResult?.zipUrl ?? ''}
          />
        </div>
      </footer>
    </div>
  )
}
