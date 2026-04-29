import { MODULE_META, type ModuleType } from '../types/architecture'

const PALETTE_TYPES: ModuleType[] = ['core', 'database', 'ui', 'api', 'auth', 'domain', 'network', 'test']

interface Props {
  onAdd: (type: ModuleType) => void
}

export function ModulePalette({ onAdd }: Props) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-950 border-r border-gray-800 w-20">
      <div className="text-[9px] text-gray-500 uppercase tracking-widest text-center pt-1">Add</div>
      {PALETTE_TYPES.map((type) => {
        const meta = MODULE_META[type]
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            title={meta.label}
            className={`
              flex flex-col items-center justify-center gap-0.5
              w-14 h-12 mx-auto rounded-lg border border-dashed border-gray-700
              hover:border-xebia hover:bg-gray-900 transition-colors
              text-gray-400 hover:text-gray-200
            `}
          >
            <span className="text-base">{meta.icon}</span>
            <span className="text-[9px]">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
