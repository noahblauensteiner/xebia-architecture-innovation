import { useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { MODULE_META, type ModuleType } from '../types/architecture'
import { useConnectionContext } from '../context/ConnectionContext'

export interface ModuleNodeData {
  moduleType: ModuleType
  label: string        // technical Gradle module name
  displayName: string  // human-readable label shown bold on canvas
  description: string  // optional short description shown below display name
  [key: string]: unknown
}

type EditingField = 'displayName' | 'label' | 'description' | null

const SRC = '!bg-gray-400 !border-gray-600 !w-2.5 !h-2.5 cursor-crosshair'

export function ModuleNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as ModuleNodeData
  const meta = MODULE_META[nodeData.moduleType]
  const { updateNodeData } = useReactFlow()
  const { connectingFrom, onHandleClick } = useConnectionContext()
  const [editing, setEditing] = useState<EditingField>(null)
  const [draft, setDraft] = useState('')

  const isPending = connectingFrom?.nodeId === id
  const isTarget = connectingFrom !== null && !isPending

  const startEdit = (field: EditingField) => (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(field === 'displayName' ? nodeData.displayName : field === 'label' ? nodeData.label : nodeData.description)
    setEditing(field)
  }

  const commitEdit = () => {
    if (!editing) return
    const t = draft.trim()
    updateNodeData(id, { [editing]: t })
    setEditing(null)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(null)
  }

  const click = (hId: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onHandleClick(id, hId)
  }

  const ring = isPending
    ? 'ring-2 ring-xavi ring-offset-1 ring-offset-gray-900'
    : isTarget
    ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-gray-900'
    : selected
    ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900'
    : ''

  const inputBase = 'nopan nodrag bg-transparent border-b text-center w-full outline-none'

  return (
    <div className={`${meta.color} border-2 ${meta.borderColor} ${ring} rounded-xl px-4 py-3 min-w-[130px] text-center cursor-grab select-none shadow-lg transition-all`}>
      {/* Hidden target handles */}
      <Handle id="top-t"    type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left-t"   type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right-t"  type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom-t" type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Visible source handles */}
      <Handle id="top-s"    type="source" position={Position.Top}    className={SRC} onClick={click('top')} />
      <Handle id="left-s"   type="source" position={Position.Left}   className={SRC} onClick={click('left')} />

      {/* Module name — above icon */}
      {editing === 'label' ? (
        <input
          autoFocus
          className={`${inputBase} border-gray-600 text-[10px] font-mono text-gray-400 mb-1`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={onKeyDown}
        />
      ) : (
        <div
          className="text-[10px] font-mono text-gray-500 mb-1 cursor-text"
          onDoubleClick={startEdit('label')}
          title="Double-click to set module name"
        >
          :{nodeData.label}
        </div>
      )}

      <div className="text-2xl mb-1">{meta.icon}</div>

      {/* Display name */}
      {editing === 'displayName' ? (
        <input
          autoFocus
          className={`${inputBase} border-gray-400 text-sm font-semibold text-gray-100`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={onKeyDown}
        />
      ) : (
        <div
          className="text-sm font-semibold text-gray-100 leading-tight cursor-text"
          onDoubleClick={startEdit('displayName')}
          title="Double-click to rename"
        >
          {nodeData.displayName}
        </div>
      )}

      {/* Description */}
      {editing === 'description' ? (
        <input
          autoFocus
          className={`${inputBase} border-gray-600 text-[10px] text-gray-400 mt-1 italic`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={onKeyDown}
        />
      ) : (
        <div
          className={`text-[10px] mt-1 leading-tight cursor-text whitespace-pre-wrap ${nodeData.description ? 'text-gray-400 italic' : 'text-gray-600'}`}
          onDoubleClick={startEdit('description')}
          title="Double-click to add description"
        >
          {nodeData.description || 'add description…'}
        </div>
      )}

      <Handle id="right-s"  type="source" position={Position.Right}  className={SRC} onClick={click('right')} />
      <Handle id="bottom-s" type="source" position={Position.Bottom} className={SRC} onClick={click('bottom')} />
    </div>
  )
}
