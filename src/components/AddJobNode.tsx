import { memo } from 'react'
import { Handle, type NodeProps, Position } from '@xyflow/react'

export type AddJobNodeData = {
  needs: string[]
}

function AddJobNodeComponent(props: NodeProps) {
  const { selected } = props
  return (
    <div
      className={`
        flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
        text-lg font-light text-slate-500 dark:text-slate-400 shadow-sm transition-colors
        hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400
        ${selected ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : ''}
      `}
      title="Add new job"
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-2 !border-slate-400 dark:!border-slate-600 !bg-white dark:!bg-slate-800" />
      +
    </div>
  )
}

export const AddJobNode = memo(AddJobNodeComponent)
