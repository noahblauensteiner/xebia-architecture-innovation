import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  ConnectionMode,
  type NodeTypes,
} from '@xyflow/react'
import { ConnectionContext } from '../context/ConnectionContext'
import { ModuleNodeComponent } from './ModuleNode'
import type { CanvasState } from '../hooks/useCanvasState'

const nodeTypes: NodeTypes = { module: ModuleNodeComponent }

interface Props {
  canvas: CanvasState
  isActive: boolean
  onActivate: () => void
  onSplit: () => void
  isSplit: boolean
}

export function CanvasPane({ canvas, isActive, onActivate, onSplit, isSplit }: Props) {
  return (
    <div className="w-full h-full relative">

      <ConnectionContext.Provider value={{ connectingFrom: canvas.connectingFrom, onHandleClick: canvas.handleHandleClick }}>
        <ReactFlow
          nodes={canvas.nodes}
          edges={canvas.displayEdges}
          onNodesChange={canvas.onNodesChange}
          onEdgesChange={canvas.onEdgesChange}
          onConnect={canvas.onConnect}
          onConnectStart={canvas.cancelConnect}
          onEdgeClick={canvas.onEdgeClick}
          onPaneClick={() => { canvas.onPaneClick(); onActivate() }}
          onNodeClick={onActivate}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gray-900"
        >
          <Background color="#374151" gap={24} />
          <Controls className="!bg-gray-800 !border-gray-700 !rounded-lg" />
          <Panel position="top-left">
            <button
              onClick={(e) => { e.stopPropagation(); onSplit() }}
              title={isSplit ? 'Close split' : 'Split canvas'}
              className="bg-gray-800 border border-gray-700 hover:border-xebia rounded p-1.5 text-gray-400 hover:text-gray-100 transition-colors text-sm leading-none"
            >
              {isSplit ? '▣' : '⊟'}
            </button>
          </Panel>
        </ReactFlow>
      </ConnectionContext.Provider>

      {/* Active canvas border overlay */}
      {isSplit && (
        <div className={`absolute inset-0 z-10 pointer-events-none border-2 ${isActive ? 'border-xebia/70' : 'border-gray-700'}`} />
      )}

      {/* Edge context menu */}
      {canvas.edgeMenu && (
        <div
          className="fixed z-40 flex gap-px bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
          style={{ left: canvas.edgeMenu.x, top: canvas.edgeMenu.y, transform: 'translate(-50%, calc(-100% - 10px))' }}
        >
          <button
            onClick={canvas.flipEdge}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            ↔ Flip
          </button>
          <div className="w-px bg-gray-700" />
          <button
            onClick={canvas.deleteEdge}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
          >
            ✕ Delete
          </button>
        </div>
      )}
    </div>
  )
}
