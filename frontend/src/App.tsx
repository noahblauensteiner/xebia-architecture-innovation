import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ModuleNodeComponent, type ModuleNodeData } from './components/ModuleNode'
import { ModulePalette } from './components/ModulePalette'
import { FileTree } from './components/FileTree'
import { QRDisplay } from './components/QRDisplay'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ConnectionContext } from './context/ConnectionContext'
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
  const [welcomed, setWelcomed] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [projectName, setProjectName] = useState('my-kotlin-app')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<{ branchUrl: string | null } | null>(null)
  const [fileTree, setFileTree] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [edgeMenu, setEdgeMenu] = useState<{ edge: Edge; x: number; y: number } | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handleId: string } | null>(null)
  const nodeCounter = useState(0)

  useEffect(() => {
    setFileTree(buildPreviewTree(nodes))
  }, [nodes])

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' }, style: { stroke: '#6b7280' } } as Edge, eds)
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
        edges: (edges as Edge[]).map((e) => ({ source: e.source, target: e.target })),
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
    setNodes([])
    setEdges([])
    setGeneratedResult(null)
    setFileTree([])
    setError(null)
    setEdgeMenu(null)
    setConnectingFrom(null)
  }

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setEdgeMenu({ edge, x: event.clientX, y: event.clientY })
  }, [])

  const onPaneClick = useCallback(() => {
    setEdgeMenu(null)
    setConnectingFrom(null)
  }, [])

  const handleHandleClick = useCallback((nodeId: string, handleId: string) => {
    setConnectingFrom((prev) => {
      if (!prev) return { nodeId, handleId }
      if (prev.nodeId === nodeId && prev.handleId === handleId) return null
      if (prev.nodeId === nodeId) return { nodeId, handleId }
      // Different node — create edge
      const newEdge: Edge = {
        id: `e-${prev.nodeId}-${nodeId}-${Date.now()}`,
        source: prev.nodeId,
        target: nodeId,
        sourceHandle: `${prev.handleId}-s`,
        targetHandle: `${handleId}-t`,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
        style: { stroke: '#6b7280' },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      return null
    })
  }, [setEdges])

  const deleteEdge = () => {
    if (!edgeMenu) return
    setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edge.id))
    setEdgeMenu(null)
  }

  const flipEdge = () => {
    if (!edgeMenu) return
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeMenu.edge.id
          ? {
              ...e,
              source: e.target,
              target: e.source,
              sourceHandle: e.targetHandle?.replace('-t', '-s') ?? e.targetHandle,
              targetHandle: e.sourceHandle?.replace('-s', '-t') ?? e.sourceHandle,
            }
          : e
      )
    )
    setEdgeMenu(null)
  }

  const displayEdges = edges.map((e) =>
    e.id === edgeMenu?.edge.id
      ? { ...e, style: { stroke: '#ff6600', strokeWidth: 2.5 } }
      : e
  )

  return (
    <ConnectionContext.Provider value={{ connectingFrom, onHandleClick: handleHandleClick }}>
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
        <ModulePalette onAdd={addModule} />

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={() => setConnectingFrom(null)}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-900"
          >
            <Background color="#374151" gap={24} />
            <Controls className="!bg-gray-800 !border-gray-700 !rounded-lg" />
          </ReactFlow>
        </div>

        <FileTree fileTree={fileTree} isGenerating={isGenerating} />
      </div>

      {/* Edge context menu */}
      {edgeMenu && (
        <div
          className="fixed z-40 flex gap-px bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{ left: edgeMenu.x, top: edgeMenu.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
        >
          <button
            onClick={flipEdge}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            ↔ Flip
          </button>
          <div className="w-px bg-gray-700" />
          <button
            onClick={deleteEdge}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
          >
            ✕ Delete
          </button>
        </div>
      )}

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
            generated={generatedResult !== null}
          />
        </div>
      </footer>
    </div>
    </ConnectionContext.Provider>
  )
}
