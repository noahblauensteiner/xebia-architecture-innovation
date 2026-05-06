export type ModuleType = 'core' | 'database' | 'ui' | 'api' | 'domain' | 'incomingPort' | 'incomingAdapter' | 'outgoingPort' | 'outgoingAdapter'

export interface ModuleNode {
  id: string
  type: ModuleType
  label: string
}

export interface DependencyEdge {
  source: string
  target: string
}

export interface GenerateRequest {
  projectName: string
  packageName: string
  nodes: ModuleNode[]
  edges: DependencyEdge[]
  visitorEmail?: string
}

export interface GenerateResponse {
  branchUrl: string | null
  zipDownloadUrl: string
  fileTree: string[]
}

export const MODULE_META: Record<ModuleType, { icon: string; label: string; color: string; borderColor: string }> = {
  core:            { icon: '⚙️', label: 'Core',        color: 'bg-orange-950', borderColor: 'border-orange-500' },
  database:        { icon: '🗄️', label: 'Database',    color: 'bg-blue-950',   borderColor: 'border-blue-500'   },
  ui:              { icon: '🖥️', label: 'UI',          color: 'bg-green-950',  borderColor: 'border-green-500'  },
  api:             { icon: '☁️', label: 'API',         color: 'bg-purple-950', borderColor: 'border-purple-500' },
  domain:          { icon: '📦', label: 'Domain',      color: 'bg-yellow-950', borderColor: 'border-yellow-500' },
  incomingPort:    { icon: '🔌', label: 'In Port',     color: 'bg-indigo-950', borderColor: 'border-indigo-500' },
  incomingAdapter: { icon: '📥', label: 'In Adapter',  color: 'bg-sky-950',    borderColor: 'border-sky-500'    },
  outgoingPort:    { icon: '🔗', label: 'Out Port',    color: 'bg-violet-950', borderColor: 'border-violet-500' },
  outgoingAdapter: { icon: '📤', label: 'Out Adapter', color: 'bg-rose-950',   borderColor: 'border-rose-500'   },
}
