import { useState, useEffect } from 'react'
import type { Node } from '@xyflow/react'
import { MODULE_META } from '../types/architecture'
import type { ModuleNodeData } from './ModuleNode'

interface Props {
  fileTree: string[]
  isGenerating: boolean
  selectedNode: Node | null
  onRenameNode: (id: string, field: 'displayName' | 'label' | 'description', value: string) => void
}

const TYPE_COLOR: Record<string, string> = {
  '.kts':  'text-green-400',
  '.kt':   'text-purple-400',
  '/':     'text-blue-400',
}

function lineColor(line: string): string {
  for (const [ext, color] of Object.entries(TYPE_COLOR)) {
    if (line.endsWith(ext) || (ext === '/' && line.trimStart().startsWith('📁'))) return color
  }
  return 'text-gray-400'
}

function ModuleDetail({ node, onRename }: { node: Node; onRename: Props['onRenameNode'] }) {
  const d = node.data as ModuleNodeData
  const meta = MODULE_META[d.moduleType]

  const [displayDraft, setDisplayDraft] = useState(d.displayName)
  const [labelDraft, setLabelDraft] = useState(d.label)
  const [descDraft, setDescDraft] = useState(d.description)

  useEffect(() => {
    setDisplayDraft(d.displayName)
    setLabelDraft(d.label)
    setDescDraft(d.description)
  }, [node.id, d.displayName, d.label, d.description])

  const commit = (
    field: 'displayName' | 'label' | 'description',
    draft: string,
    current: string,
    reset: (v: string) => void,
  ) => {
    const t = draft.trim()
    if (field === 'description') { onRename(node.id, field, t); return }
    if (t && t !== current) onRename(node.id, field, t)
    else reset(current)
  }

  const onKey = (cb: () => void) => (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.currentTarget.tagName === 'INPUT') e.currentTarget.blur()
    if (e.key === 'Escape') { cb(); e.currentTarget.blur() }
  }

  const inputCls = 'bg-gray-800 border border-gray-700 focus:border-xavi text-gray-100 rounded-lg px-3 py-2 outline-none transition-colors w-full'

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Type badge */}
      <div className={`${meta.color} border ${meta.borderColor} rounded-xl px-4 py-3 flex items-center gap-3`}>
        <span className="text-2xl">{meta.icon}</span>
        <span className="text-xs text-gray-400 font-mono">{meta.label}</span>
      </div>

      {/* Module name */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Module Name</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm select-none">:</span>
          <input
            className="bg-gray-800 border border-gray-700 focus:border-gray-500 text-gray-400 text-[11px] font-mono rounded-lg pl-5 pr-3 py-2 outline-none transition-colors w-full"
            value={labelDraft}
            onChange={(e) => setLabelDraft(e.target.value)}
            onBlur={() => commit('label', labelDraft, d.label, setLabelDraft)}
            onKeyDown={onKey(() => setLabelDraft(d.label))}
          />
        </div>
        <p className="text-[9px] text-gray-600">Used as the Gradle module name</p>
      </div>

      {/* Display name */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Display Name</label>
        <input
          className={`${inputCls} text-sm font-semibold`}
          value={displayDraft}
          onChange={(e) => setDisplayDraft(e.target.value)}
          onBlur={() => commit('displayName', displayDraft, d.displayName, setDisplayDraft)}
          onKeyDown={onKey(() => setDisplayDraft(d.displayName))}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-widest text-gray-500">Description</label>
        <textarea
          rows={3}
          placeholder="What does this module do?"
          className={`${inputCls} text-xs text-gray-300 resize-none`}
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          onBlur={() => commit('description', descDraft, d.description, setDescDraft)}
          onKeyDown={onKey(() => setDescDraft(d.description))}
        />
      </div>
    </div>
  )
}

export function FileTree({ fileTree, isGenerating, selectedNode, onRenameNode }: Props) {
  const showModule = selectedNode !== null

  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-80">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        {isGenerating && <span className="w-2 h-2 rounded-full bg-xavi animate-pulse" />}
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          {showModule ? 'Module' : isGenerating ? 'Generating…' : 'File Structure'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showModule ? (
          <ModuleDetail node={selectedNode} onRename={onRenameNode} />
        ) : (
          <div className="p-3 font-mono text-[11px] leading-relaxed">
            {fileTree.length === 0 ? (
              <div className="text-gray-600 italic pt-2 px-1">
                Add modules to the canvas to see the file structure
              </div>
            ) : (
              fileTree.map((line, i) => (
                <div key={i} className={lineColor(line)}>{line}</div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-800 text-[10px] text-gray-500 flex items-center gap-1.5">
        <span>🛡️</span>
        <span><span className="text-xavi font-medium">Xebia ArchUnit</span> rules included</span>
      </div>
    </div>
  )
}
