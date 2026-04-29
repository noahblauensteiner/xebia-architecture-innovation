import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MODULE_META, type ModuleType } from '../types/architecture'

export interface ModuleNodeData {
  moduleType: ModuleType
  label: string
  [key: string]: unknown
}

export function ModuleNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as ModuleNodeData
  const meta = MODULE_META[nodeData.moduleType]

  return (
    <div
      className={`
        ${meta.color} border-2 ${meta.borderColor}
        ${selected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''}
        rounded-xl px-4 py-3 min-w-[110px] text-center cursor-grab select-none
        shadow-lg transition-all
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !border-gray-600 !w-2 !h-2" />
      <div className="text-2xl mb-1">{meta.icon}</div>
      <div className="text-sm font-semibold text-gray-100">{nodeData.label}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{meta.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !border-gray-600 !w-2 !h-2" />
    </div>
  )
}
