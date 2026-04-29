export type ModuleType = 'core' | 'database' | 'ui' | 'api' | 'auth' | 'domain' | 'network' | 'test'

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
  core:     { icon: '⚙️', label: 'Core',     color: 'bg-orange-950', borderColor: 'border-orange-500' },
  database: { icon: '🗄️', label: 'Database', color: 'bg-blue-950',   borderColor: 'border-blue-500'   },
  ui:       { icon: '🖥️', label: 'UI',       color: 'bg-green-950',  borderColor: 'border-green-500'  },
  api:      { icon: '☁️', label: 'API',      color: 'bg-purple-950', borderColor: 'border-purple-500' },
  auth:     { icon: '🔐', label: 'Auth',     color: 'bg-red-950',    borderColor: 'border-red-500'    },
  domain:   { icon: '📦', label: 'Domain',   color: 'bg-yellow-950', borderColor: 'border-yellow-500' },
  network:  { icon: '📡', label: 'Network',  color: 'bg-cyan-950',   borderColor: 'border-cyan-500'   },
  test:     { icon: '🧪', label: 'Test',     color: 'bg-pink-950',   borderColor: 'border-pink-500'   },
}
