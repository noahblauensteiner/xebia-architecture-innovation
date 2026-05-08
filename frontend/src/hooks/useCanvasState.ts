import { useCallback, useRef, useState } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react'
import type { ModuleType } from '../types/architecture'
import type { ModuleNodeData } from '../components/ModuleNode'

export interface EdgeMenuState {
  edge: Edge
  x: number
  y: number
}

export interface CanvasState {
  nodes: Node[]
  setNodes: ReturnType<typeof useNodesState<Node>>[1]
  onNodesChange: ReturnType<typeof useNodesState<Node>>[2]
  edges: Edge[]
  setEdges: ReturnType<typeof useEdgesState<Edge>>[1]
  onEdgesChange: ReturnType<typeof useEdgesState<Edge>>[2]
  displayEdges: Edge[]
  connectingFrom: { nodeId: string; handleId: string } | null
  edgeMenu: EdgeMenuState | null
  addModule: (type: ModuleType) => void
  onConnect: (connection: Connection) => void
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void
  onPaneClick: () => void
  cancelConnect: () => void
  deleteEdge: () => void
  flipEdge: () => void
  handleHandleClick: (nodeId: string, handleId: string) => void
  clear: () => void
}

export function useCanvasState(): CanvasState {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; handleId: string } | null>(null)
  const [edgeMenu, setEdgeMenu] = useState<EdgeMenuState | null>(null)
  const nodeCountRef = useRef(0)

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' }, style: { stroke: '#6b7280' } } as Edge,
          eds,
        )
      ),
    [setEdges],
  )

  const addModule = useCallback(
    (type: ModuleType) => {
      const c = nodeCountRef.current++
      const id = `${type}-${Date.now()}`
      const newNode: Node = {
        id,
        type: 'module',
        position: { x: 160 + (c % 3) * 180, y: 80 + Math.floor(c / 3) * 140 },
        data: { moduleType: type, label: type, displayName: type, description: '' } satisfies ModuleNodeData,
      }
      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), { ...newNode, selected: true }])
    },
    [setNodes],
  )

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setEdgeMenu({ edge, x: event.clientX, y: event.clientY })
  }, [])

  const cancelConnect = useCallback(() => setConnectingFrom(null), [])

  const onPaneClick = useCallback(() => {
    setEdgeMenu(null)
    setConnectingFrom(null)
  }, [])

  const deleteEdge = useCallback(() => {
    if (!edgeMenu) return
    setEdges((eds) => eds.filter((e) => e.id !== edgeMenu.edge.id))
    setEdgeMenu(null)
  }, [edgeMenu, setEdges])

  const flipEdge = useCallback(() => {
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
          : e,
      )
    )
    setEdgeMenu(null)
  }, [edgeMenu, setEdges])

  const handleHandleClick = useCallback(
    (nodeId: string, handleId: string) => {
      setConnectingFrom((prev) => {
        if (!prev) return { nodeId, handleId }
        if (prev.nodeId === nodeId && prev.handleId === handleId) return null
        if (prev.nodeId === nodeId) return { nodeId, handleId }
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
    },
    [setEdges],
  )

  const clear = useCallback(() => {
    setNodes([])
    setEdges([])
    setEdgeMenu(null)
    setConnectingFrom(null)
    nodeCountRef.current = 0
  }, [setNodes, setEdges])

  const displayEdges = edges.map((e) =>
    e.id === edgeMenu?.edge.id ? { ...e, style: { stroke: '#ff6600', strokeWidth: 2.5 } } : e,
  )

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange,
    displayEdges, connectingFrom, edgeMenu,
    addModule, onConnect, onEdgeClick, onPaneClick,
    cancelConnect, deleteEdge, flipEdge, handleHandleClick, clear,
  }
}
