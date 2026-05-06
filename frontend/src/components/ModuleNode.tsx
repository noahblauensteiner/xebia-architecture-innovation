import { useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { MODULE_META, type ModuleType } from '../types/architecture'

export interface ModuleNodeData {
  moduleType: ModuleType
  label: string
  [key: string]: unknown
}

export function ModuleNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as ModuleNodeData
  const meta = MODULE_META[nodeData.moduleType]
  const { updateNodeData } = useReactFlow()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEdit = () => {
    setDraft(nodeData.label)
    setEditing(true)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed) updateNodeData(id, { label: trimmed })
    setEditing(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

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
      {editing ? (
        <input
          autoFocus
          className="nopan nodrag bg-transparent border-b border-gray-400 text-sm font-semibold text-gray-100 text-center w-full outline-none"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={onKeyDown}
        />
      ) : (
        <div
          className="text-sm font-semibold text-gray-100 cursor-text"
          onDoubleClick={startEdit}
          title="Double-click to rename"
        >
          {nodeData.label}
        </div>
      )}
      <div className="text-[10px] text-gray-400 mt-0.5">{meta.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !border-gray-600 !w-2 !h-2" />
    </div>
  )
}
