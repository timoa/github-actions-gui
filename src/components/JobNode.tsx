import { memo } from 'react'
import { Handle, type NodeProps, Position } from '@xyflow/react'
import type { JobNodeData } from '@/lib/workflowToFlow'
import { RunnerBadge } from './RunnerBadge'

function JobNodeComponent(props: NodeProps) {
  const { data, selected } = props
  const d = data as JobNodeData
  return (
    <div
      className={`
        min-w-[180px] rounded-lg border-2 bg-white dark:bg-slate-800 px-3 py-2 shadow-sm
        ${selected ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
      `}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-2 !border-slate-400 dark:!border-slate-600 !bg-white dark:!bg-slate-800" />
      <div className="font-medium text-slate-800 dark:text-slate-200">{d.label}</div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <RunnerBadge runsOn={d.runsOn ?? 'ubuntu-latest'} />
        {d.hasMatrix && d.matrixCombinations && (
          <span className="rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
            {d.matrixCombinations}× matrix
          </span>
        )}
        {d.stepCount > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{d.stepCount} step{d.stepCount !== 1 ? 's' : ''}</span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-slate-400 dark:!border-slate-600 !bg-white dark:!bg-slate-800" />
    </div>
  )
}

export const JobNode = memo(JobNodeComponent)
