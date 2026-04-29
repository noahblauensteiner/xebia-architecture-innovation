interface Props {
  fileTree: string[]
  isGenerating: boolean
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

export function FileTree({ fileTree, isGenerating }: Props) {
  return (
    <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800 w-80">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        {isGenerating && (
          <span className="w-2 h-2 rounded-full bg-xebia animate-pulse" />
        )}
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          {isGenerating ? 'Generating…' : 'File Structure'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed">
        {fileTree.length === 0 ? (
          <div className="text-gray-600 italic pt-2 px-1">
            Add modules to the canvas to see the file structure
          </div>
        ) : (
          fileTree.map((line, i) => (
            <div key={i} className={lineColor(line)}>
              {line}
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-gray-800 text-[10px] text-gray-500 flex items-center gap-1.5">
        <span>🛡️</span>
        <span><span className="text-xebia font-medium">Xebia ArchUnit</span> rules included</span>
      </div>
    </div>
  )
}
