import { memo } from 'react'
import { Handle, type NodeProps, Position } from '@xyflow/react'
import type { ParsedTrigger } from '@/lib/triggerUtils'
import { TriggerBadge } from './TriggerBadge'

export type TriggerNodeData = {
  triggers: ParsedTrigger[]
}

function TriggerNodeComponent(props: NodeProps) {
  const { data, selected } = props
  const d = data as TriggerNodeData

  return (
    <div
      className={`
        min-w-[180px] rounded-lg border-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 px-3 py-2 shadow-sm
        ${selected ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-900' : 'border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600'}
      `}
    >
      <div className="font-medium text-slate-800 dark:text-slate-200">Trigger</div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {d.triggers.length === 0 ? (
          <span className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-xs italic text-slate-500 dark:text-slate-400">No triggers</span>
        ) : (
          d.triggers.map((trigger, idx) => <TriggerBadge key={idx} trigger={trigger} />)
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-purple-400 dark:!border-purple-600 !bg-white dark:!bg-slate-800" />
    </div>
  )
}

export const TriggerNode = memo(TriggerNodeComponent)
