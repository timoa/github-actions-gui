import { useEffect, useRef } from 'react'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap } from '@codemirror/commands'
import { StreamLanguage } from '@codemirror/language'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { oneDark } from '@codemirror/theme-one-dark'

interface RunScriptDialogProps {
  initialValue: string
  stepLabel?: string
  onSave: (value: string) => void
  onClose: () => void
}

const shellLanguage = StreamLanguage.define(shell)

function getEditorTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? [oneDark] : [syntaxHighlighting(defaultHighlightStyle)]
}

export function RunScriptDialog({
  initialValue,
  stepLabel,
  onSave,
  onClose,
}: RunScriptDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const theme = EditorView.theme({
      '&': {
        backgroundColor: 'transparent',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      },
      '&.cm-focused': { outline: 'none' },
      '.cm-scroller': {
        overflow: 'auto',
        flex: 1,
        minHeight: 0,
      },
      '.cm-content': {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.875rem',
        padding: '1rem',
      },
      '.cm-lineNumbers': {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: '0.875rem',
        minWidth: '3ch',
        paddingRight: '1rem',
        textAlign: 'right',
      },
      '.cm-lineNumbers .cm-gutterElement': {
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem',
      },
    })

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        shellLanguage,
        ...getEditorTheme(),
        lineNumbers(),
        keymap.of(defaultKeymap),
        theme,
      ],
    })

    const view = new EditorView({
      state,
      parent: container,
    })
    viewRef.current = view
    view.focus()

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Editor is created once with initialValue; dialog unmounts when closed so remount gets new value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        const content = viewRef.current?.state.doc.toString() ?? ''
        onSave(content)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, onSave])

  const handleSave = () => {
    const content = viewRef.current?.state.doc.toString() ?? ''
    onSave(content)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-script-dialog-title"
      onClick={handleBackdropClick}
    >
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white dark:bg-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div>
            <h2 id="run-script-dialog-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Edit run script
            </h2>
            {stepLabel && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stepLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Script runs as sh on the GitHub runner (bash on Ubuntu).
          </p>
        </div>
        <div
          ref={containerRef}
          className="flex-1 min-h-0 flex flex-col rounded-none border-0 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden"
          aria-label="Run script content"
        />
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
