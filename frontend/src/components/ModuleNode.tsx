import { useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { MODULE_META, type ModuleType } from '../types/architecture'
import { useConnectionContext } from '../context/ConnectionContext'

export interface ModuleNodeData {
  moduleType: ModuleType
  label: string
  [key: string]: unknown
}

const SRC = '!bg-gray-400 !border-gray-600 !w-2.5 !h-2.5 cursor-crosshair'

export function ModuleNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as ModuleNodeData
  const meta = MODULE_META[nodeData.moduleType]
  const { updateNodeData } = useReactFlow()
  const { connectingFrom, onHandleClick } = useConnectionContext()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const isPending = connectingFrom?.nodeId === id
  const isTarget = connectingFrom !== null && !isPending

  const startEdit = () => { setDraft(nodeData.label); setEditing(true) }
  const commitEdit = () => {
    const t = draft.trim()
    if (t) updateNodeData(id, { label: t })
    setEditing(false)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  const click = (hId: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onHandleClick(id, hId)
  }

  const ring = isPending
    ? 'ring-2 ring-xebia ring-offset-1 ring-offset-gray-900'
    : isTarget
    ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-gray-900'
    : selected
    ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900'
    : ''

  return (
    <div className={`${meta.color} border-2 ${meta.borderColor} ${ring} rounded-xl px-4 py-3 min-w-[110px] text-center cursor-grab select-none shadow-lg transition-all`}>
      {/* Hidden target handles — provide snap targets for drag-to-connect */}
      <Handle id="top-t"    type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="left-t"   type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="right-t"  type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle id="bottom-t" type="target" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Visible source handles — drag to start a connection, or click for click-to-connect */}
      <Handle id="top-s"    type="source" position={Position.Top}    className={SRC} onClick={click('top')} />
      <Handle id="left-s"   type="source" position={Position.Left}   className={SRC} onClick={click('left')} />

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
        <div className="text-sm font-semibold text-gray-100 cursor-text" onDoubleClick={startEdit} title="Double-click to rename">
          {nodeData.label}
        </div>
      )}
      <div className="text-[10px] text-gray-400 mt-0.5">{meta.label}</div>

      <Handle id="right-s"  type="source" position={Position.Right}  className={SRC} onClick={click('right')} />
      <Handle id="bottom-s" type="source" position={Position.Bottom} className={SRC} onClick={click('bottom')} />
    </div>
  )
}
