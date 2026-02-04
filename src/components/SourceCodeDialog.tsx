import { useEffect, useRef, useState } from 'react'
import { parseWorkflow } from '@/lib/parseWorkflow'
import { lintWorkflow, type LintError } from '@/lib/workflowLinter'
import type { Workflow } from '@/types/workflow'

interface SourceCodeDialogProps {
  initialYaml: string
  onClose: () => void
  onSave: (workflow: Workflow, errors: string[]) => void
}

export function SourceCodeDialog({
  initialYaml,
  onClose,
  onSave,
}: SourceCodeDialogProps) {
  const [yaml, setYaml] = useState(initialYaml)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lintErrors, setLintErrors] = useState<LintError[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setYaml(initialYaml)
    setSaveError(null)
    setLintErrors([])
  }, [initialYaml])

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSave = () => {
    setSaveError(null)
    const { workflow, errors } = parseWorkflow(yaml)
    const isParseError =
      errors.length > 0 &&
      (errors[0].includes('YAML parse error') || errors[0].includes('Invalid workflow'))
    if (isParseError) {
      setSaveError(errors[0])
      return
    }
    // Also lint the workflow
    const lintErrs = lintWorkflow(workflow)
    setLintErrors(lintErrs)
    // Save even if there are lint errors (they're warnings or non-blocking)
    onSave(workflow, errors)
    onClose()
  }

  const handleLint = () => {
    setSaveError(null)
    const { workflow, errors } = parseWorkflow(yaml)
    const isParseError =
      errors.length > 0 &&
      (errors[0].includes('YAML parse error') || errors[0].includes('Invalid workflow'))
    if (isParseError) {
      setSaveError(errors[0])
      setLintErrors([])
      return
    }
    const lintErrs = lintWorkflow(workflow)
    setLintErrors(lintErrs)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-dialog-title"
      onClick={handleBackdropClick}
    >
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white dark:bg-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <h2 id="source-dialog-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Workflow source (YAML)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit the YAML below. The flow diagram updates only when you click Save.
          </p>
          <button
            type="button"
            onClick={handleLint}
            className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Check syntax
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <textarea
            ref={textareaRef}
            value={yaml}
            onChange={(e) => setYaml(e.target.value)}
            className="flex-1 w-full resize-none rounded-none border-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 font-mono text-sm text-slate-800 dark:text-slate-200 focus:ring-0"
            spellCheck={false}
            aria-label="Workflow YAML content"
          />
        </div>
        {(saveError || lintErrors.length > 0) && (
          <div
            role="alert"
            className="border-t border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 text-sm text-amber-800 dark:text-amber-200 max-h-40 overflow-y-auto"
          >
            {saveError && <div className="mb-2 font-medium">{saveError}</div>}
            {lintErrors.length > 0 && (
              <div>
                <div className="mb-1 font-medium">
                  {lintErrors.length} lint error{lintErrors.length !== 1 ? 's' : ''}:
                </div>
                <ul className="ml-4 list-disc space-y-0.5 text-xs">
                  {lintErrors.map((error, idx) => (
                    <li key={idx}>
                      <span className={error.severity === 'error' ? 'font-medium' : ''}>
                        {error.path && <code className="text-xs">{error.path}:</code>} {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-slate-800 dark:bg-slate-700 px-3 py-1.5 text-sm text-white dark:text-slate-200 hover:bg-slate-700 dark:hover:bg-slate-600"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
