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

const GAP_X = 230
const CENTER_Y = 200

// Module types that always belong on the left (consumer/driver side)
const LEFT_TYPES = new Set(['ui', 'incomingAdapter', 'incomingPort'])
// Module types that always belong on the right (infrastructure/driven side)
const RIGHT_TYPES = new Set(['database', 'outgoingAdapter', 'outgoingPort'])

function computeLayout(nodes: Node[], edges: Edge[]): Map<string, { x: number; y: number }> {
  if (nodes.length === 0) return new Map()

  const getType = (n: Node) => (n.data as ModuleNodeData).moduleType

  // Find center: prefer core/domain node, else highest in-degree
  let center = nodes.find(n => getType(n) === 'core' || getType(n) === 'domain')
  if (!center) {
    const inDeg = new Map<string, number>(nodes.map(n => [n.id, 0]))
    edges.forEach(e => inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1))
    center = nodes.reduce((a, b) => (inDeg.get(a.id) ?? 0) >= (inDeg.get(b.id) ?? 0) ? a : b)
  }

  // BFS outward from center with type-aware column assignment
  const col = new Map<string, number>([[center.id, 0]])
  const visited = new Set<string>([center.id])
  const queue = [center.id]

  while (queue.length > 0) {
    const nodeId = queue.shift()!
    const c = col.get(nodeId)!

    const neighbors: Array<{ id: string; inbound: boolean }> = [
      ...edges.filter(e => e.target === nodeId && !visited.has(e.source)).map(e => ({ id: e.source, inbound: true })),
      ...edges.filter(e => e.source === nodeId && !visited.has(e.target)).map(e => ({ id: e.target, inbound: false })),
    ]

    for (const { id, inbound } of neighbors) {
      if (visited.has(id)) continue
      const neighbor = nodes.find(n => n.id === id)
      const t = neighbor ? getType(neighbor) : null

      let newCol: number
      if (t && LEFT_TYPES.has(t)) {
        // Force left side, one step further than current node
        newCol = Math.min(c, 0) - 1
      } else if (t && RIGHT_TYPES.has(t)) {
        // Force right side
        newCol = Math.max(c, 0) + 1
      } else {
        // Neutral type: follow edge direction
        newCol = inbound ? (c <= 0 ? c - 1 : c + 1) : (c >= 0 ? c + 1 : c - 1)
      }

      col.set(id, newCol)
      visited.add(id)
      queue.push(id)
    }
  }

  // Disconnected nodes: classify by type, fall back to far right
  let nextRight = (col.size > 0 ? Math.max(...col.values()) : 0) + 1
  let nextLeft = (col.size > 0 ? Math.min(...col.values()) : 0) - 1
  nodes.forEach(n => {
    if (col.has(n.id)) return
    const t = getType(n)
    if (LEFT_TYPES.has(t)) col.set(n.id, nextLeft--)
    else col.set(n.id, nextRight++)
  })

  // Resolve column collisions: bump by ±1 per side (center-adjacent nodes win)
  const occupied = new Set<number>()
  const finalCol = new Map<string, number>()
  const sorted = [...col.entries()].sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))

  for (const [id, c] of sorted) {
    const sign = c > 0 ? 1 : c < 0 ? -1 : 0
    let slot = c
    while (occupied.has(slot)) slot += sign === 0 ? 1 : sign
    occupied.add(slot)
    finalCol.set(id, slot)
  }

  // All nodes on one horizontal line
  const allCols = [...finalCol.values()].sort((a, b) => a - b)
  const minCol = allCols[0]
  const positions = new Map<string, { x: number; y: number }>()

  finalCol.forEach((c, id) => {
    positions.set(id, { x: 80 + (c - minCol) * GAP_X, y: CENTER_Y })
  })

  return positions
}

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
  addPort: () => void
  autoLayout: () => void
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

  const addPort = useCallback(() => {
    if (!edgeMenu) return
    const { edge } = edgeMenu
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)
    if (!sourceNode || !targetNode) return

    const srcType = (sourceNode.data as ModuleNodeData).moduleType
    const tgtType = (targetNode.data as ModuleNodeData).moduleType
    const types = new Set([srcType, tgtType])

    let portModuleType: ModuleNodeData['moduleType'] = 'outgoingPort'
    let portName = 'port'
    if (types.has('ui') && types.has('core')) {
      portModuleType = 'incomingPort'
      portName = 'order-in-web'
    } else if (types.has('database') && types.has('core')) {
      portModuleType = 'outgoingPort'
      portName = 'order-out-persistence'
    }

    const portId = `${portName}-${Date.now()}`
    const portNode: Node = {
      id: portId,
      type: 'module',
      position: {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      },
      data: { moduleType: portModuleType, label: portName, displayName: portName, description: '' } satisfies ModuleNodeData,
    }

    const edgeStyle = { animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' }, style: { stroke: '#6b7280' } }
    // source → port (source depends on port)
    const srcLtr = sourceNode.position.x <= portNode.position.x
    const e1: Edge = { id: `e-${edge.source}-${portId}`, source: edge.source, target: portId, sourceHandle: srcLtr ? 'right-s' : 'left-s', targetHandle: srcLtr ? 'left-t' : 'right-t', ...edgeStyle }
    // target → port (target also depends on port — both depend on the interface)
    const tgtLtr = targetNode.position.x <= portNode.position.x
    const e2: Edge = { id: `e-${edge.target}-${portId}`, source: edge.target, target: portId, sourceHandle: tgtLtr ? 'right-s' : 'left-s', targetHandle: tgtLtr ? 'left-t' : 'right-t', ...edgeStyle }

    // Compute layout on the new node+edge set
    const newNodes = [...nodes, portNode]
    const newEdges = [...edges.filter((e) => e.id !== edge.id), e1, e2]

    const positions = computeLayout(newNodes, newEdges)
    setNodes(newNodes.map(n => ({ ...n, position: positions.get(n.id) ?? n.position })))
    setEdges(newEdges)
    setEdgeMenu(null)
  }, [edgeMenu, nodes, edges, setNodes, setEdges])

  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return
    const positions = computeLayout(nodes, edges)
    setNodes(nds => nds.map(n => {
      const pos = positions.get(n.id)
      return pos ? { ...n, position: pos } : n
    }))
  }, [nodes, edges, setNodes])

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
    cancelConnect, deleteEdge, flipEdge, addPort, autoLayout, handleHandleClick, clear,
  }
}
