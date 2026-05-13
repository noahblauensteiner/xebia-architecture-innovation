import { MarkerType, type Node, type Edge } from '@xyflow/react'
import type { ModuleNodeData } from '../components/ModuleNode'

export interface ChallengeGoal {
  text: string
  check: (nodes: Node[], edges: Edge[]) => boolean
  violated: (nodes: Node[], edges: Edge[]) => boolean
}

export interface ChallengeLevel {
  title: string
  goalHeading: string
  explanationParagraphs: string[]
  hint: string
  goals: ChallengeGoal[]
  initialNodes: Node[]
  initialEdges: Edge[]
  solutionNodes: Node[]
  solutionEdges: Edge[]
  checkWin: (nodes: Node[], edges: Edge[]) => boolean
}

function moduleNode(id: string, moduleType: ModuleNodeData['moduleType'], displayName: string, x: number, y: number, description = ''): Node {
  return {
    id,
    type: 'module',
    position: { x, y },
    data: { moduleType, label: id, displayName, description } satisfies ModuleNodeData,
  }
}

function edge(id: string, source: string, target: string, sourceHandle = 'right-s', targetHandle = 'left-t'): Edge {
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    style: { stroke: '#6b7280' },
  }
}

function isConnected(fromId: string, toId: string, edges: Edge[]): boolean {
  const visited = new Set<string>([fromId])
  const queue = [fromId]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === toId) return true
    edges.forEach(e => {
      if (e.source === current && !visited.has(e.target)) { visited.add(e.target); queue.push(e.target) }
      if (e.target === current && !visited.has(e.source)) { visited.add(e.source); queue.push(e.source) }
    })
  }
  return false
}

// Node IDs for level 1 — extracted to avoid scattered string literals in goal functions
const L1_UI   = 'order-ui'
const L1_CORE = 'order-core'
const L1_DB   = 'order-db'

export const LEVELS: ChallengeLevel[] = [
  {
    title: 'Level 1: Clean Architecture',
    goalHeading: 'Connect the modules in a way where there are no direct dependencies on the core module',
    explanationParagraphs: [
      'When UI or database modules depend directly on your core, you can\'t swap them without touching business logic.',
      'The core should define interfaces — ports — that external modules implement. Dependencies flow outward from core, never inward.',
      'This keeps your business logic free of frameworks, persistence libraries, and any infrastructure concern.',
    ],
    hint: 'Add an incoming port between UI and core, and an outgoing port between core and DB. Arrows should point away from core.',
    goals: [
      {
        text: 'No direct dependencies on the core module',
        check: (_nodes, edges) =>
          edges.length >= 1 &&
          !edges.some(e =>
            (e.source === L1_UI && e.target === L1_CORE) ||
            (e.source === L1_DB && e.target === L1_CORE),
          ),
        violated: (_nodes, edges) =>
          edges.some(e =>
            (e.source === L1_UI && e.target === L1_CORE) ||
            (e.source === L1_DB && e.target === L1_CORE),
          ),
      },
      {
        text: 'Core has no direct knowledge of external systems',
        check: (_nodes, edges) =>
          edges.length >= 1 &&
          !edges.some(e =>
            (e.source === L1_CORE && e.target === L1_DB) ||
            (e.source === L1_CORE && e.target === L1_UI),
          ),
        violated: (_nodes, edges) =>
          edges.some(e =>
            (e.source === L1_CORE && e.target === L1_DB) ||
            (e.source === L1_CORE && e.target === L1_UI),
          ),
      },
      {
        text: 'Both UI and DB are connected to core (directly or through ports)',
        check: (_nodes, edges) =>
          edges.length >= 1 &&
          isConnected(L1_UI, L1_CORE, edges) &&
          isConnected(L1_DB, L1_CORE, edges),
        violated: (_nodes, edges) =>
          edges.length >= 1 &&
          (!isConnected(L1_UI, L1_CORE, edges) || !isConnected(L1_DB, L1_CORE, edges)),
      },
    ],
    initialNodes: [
      moduleNode('order-ui',   'ui',       'order-ui',   80,  220, 'React frontend'),
      moduleNode('order-core', 'core',     'order-core', 360, 220, 'holds business logic & rules'),
      moduleNode('order-db',   'database', 'order-db',   640, 220, 'PostgreSQL'),
    ],
    initialEdges: [],
    solutionNodes: [
      moduleNode('order-ui',          'ui',              'order-ui',          40,  220, 'React frontend'),
      moduleNode('order-in-web',      'incomingAdapter', 'order-in-web',      260, 220, 'defines the contract for the UI \n & holds REST Controllers'),
      moduleNode('order-core',        'core',            'order-core',        480, 220, 'holds business logic & rules'),
      moduleNode('order-out-persist', 'outgoingPort',    'order-out-persist', 700, 220, 'defining the contract for persistence'),
      moduleNode('order-db',          'database',        'order-db',          920, 220, 'PostgreSQL'),
    ],
    solutionEdges: [
      edge('e-ui-inWeb',        'order-ui',          'order-in-web'),
      edge('e-inWeb-core',      'order-in-web',      'order-core'),
      edge('e-core-outPersist', 'order-core',        'order-out-persist'),
      edge('e-db-outPersist',   'order-db',          'order-out-persist', 'left-s', 'right-t'),
    ],
    checkWin: (nodes, edges) =>
      LEVELS[0].goals.every(g => g.check(nodes, edges)),
  },
]
