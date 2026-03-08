import { useState, useCallback, useRef, useEffect } from 'react'
import { loadPyodide, version as pyodideVersion, type PyodideInterface } from 'pyodide'
import Editor from '@monaco-editor/react'
import { useTheme } from '../contexts/ThemeContext'

const DRACULA_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '#6272A4', fontStyle: 'italic' },
    { token: 'keyword', foreground: '#FF79C6' },
    { token: 'keyword.control', foreground: '#FF79C6' },
    { token: 'storage.type', foreground: '#BD93F9' },
    { token: 'string', foreground: '#F1FA8C' },
    { token: 'string.escape', foreground: '#FF79C6' },
    { token: 'number', foreground: '#BD93F9' },
    { token: 'keyword.operator', foreground: '#FF79C6' },
    { token: 'entity.name.function', foreground: '#50FA7B' },
    { token: 'support.function', foreground: '#50FA7B' },
    { token: 'variable.parameter', foreground: '#FF79C6' },
    { token: 'entity.name.type', foreground: '#8BE9FD' },
    { token: 'variable', foreground: '#F8F8F2' },
    { token: 'invalid', foreground: '#FF5555' },
    { token: 'constant.language', foreground: '#BD93F9' },
  ],
  colors: {
    'editor.background': '#111827',
    'editor.foreground': '#E6EDF3',
    'editor.selectionBackground': '#243041',
    'editor.lineHighlightBackground': '#0F172A',
    'editorCursor.foreground': '#E6EDF3',
  },
}

const LIGHT_THEME = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '#6B7280', fontStyle: 'italic' },
    { token: 'keyword', foreground: '#7C3AED' },
    { token: 'keyword.control', foreground: '#7C3AED' },
    { token: 'storage.type', foreground: '#059669' },
    { token: 'string', foreground: '#B45309' },
    { token: 'string.escape', foreground: '#DC2626' },
    { token: 'number', foreground: '#059669' },
    { token: 'keyword.operator', foreground: '#374151' },
    { token: 'entity.name.function', foreground: '#2563EB' },
    { token: 'support.function', foreground: '#2563EB' },
    { token: 'variable.parameter', foreground: '#7C3AED' },
    { token: 'entity.name.type', foreground: '#0891B2' },
    { token: 'variable', foreground: '#1F2937' },
    { token: 'invalid', foreground: '#DC2626' },
    { token: 'constant.language', foreground: '#059669' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#0F172A',
    'editor.selectionBackground': '#E2E8F0',
    'editor.lineHighlightBackground': '#F1F5F9',
    'editorCursor.foreground': '#0F172A',
  },
}

const DEFAULT_CODE = `# Simple Python editor - try it!
print("Hello from Python")
x = 2 + 2
print(f"2 + 2 = {x}")
`

interface PythonCoderPanelProps {
  open: boolean
  onClose: () => void
}

const PANEL_WIDTH = '75vw'
const STRIP_WIDTH = 44

export function PythonCoderPanel({ open, onClose }: PythonCoderPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [code, setCode] = useState(DEFAULT_CODE)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [logs, setLogs] = useState('')
  const [minimized, setMinimized] = useState(false)
  const pyodideRef = useRef<PyodideInterface | null>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [editorHeight, setEditorHeight] = useState(400)

  useEffect(() => {
    if (!open || minimized) return
    const el = editorContainerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { height } = entries[0]?.contentRect ?? {}
      if (typeof height === 'number' && height > 0) setEditorHeight(height)
    })
    ro.observe(el)
    setEditorHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [open, minimized])

  const runCode = useCallback(async () => {
    if (!code.trim()) return

    setRunning(true)
    setOutput('')
    setLogs('')

    try {
      let pyodide = pyodideRef.current
      if (!pyodide) {
        setLoading(true)
        pyodide = await loadPyodide({
          indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
        })
        pyodideRef.current = pyodide
        setLoading(false)
      }

      pyodide.setStdout({
        batched: (msg: string) => setOutput((prev) => prev + msg + '\n'),
      })
      pyodide.setStderr({
        batched: (msg: string) => setLogs((prev) => prev + msg + '\n'),
      })

      await pyodide.runPythonAsync(code)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setLogs((prev) => prev + (prev ? '\n' : '') + message)
    } finally {
      setRunning(false)
    }
  }, [code])

  if (!open) return null

  return (
    <div
      className="fixed right-0 top-0 bottom-0 z-50 flex flex-row transition-[width] duration-200 ease-out"
      style={{ width: minimized ? STRIP_WIDTH : PANEL_WIDTH }}
    >
      {/* Minimized strip: click to expand */}
      {minimized ? (
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flex h-full w-full flex-col items-center justify-center gap-1 border-l border-border bg-surface-2 py-4 shadow-lg transition-colors hover:bg-surface"
          title="Expand Python Coder"
        >
          <svg className="h-5 w-5 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-[9px] font-medium text-muted">Py</span>
        </button>
      ) : (
        <div className="flex h-full w-full flex-col border-l border-border bg-surface shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
            <h2 className="text-sm font-semibold text-text">Python Coder</h2>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="rounded p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                title="Minimize"
                aria-label="Minimize"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
                title="Close"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
            <div className="flex min-h-0 flex-1 flex-col">
              <label className="mb-1 shrink-0 text-xs font-medium text-muted">Code</label>
              <div ref={editorContainerRef} className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
                <Editor
                  height={editorHeight}
                  defaultLanguage="python"
                  value={code}
                  onChange={(value) => setCode(value ?? '')}
                  theme={isDark ? 'dracula' : '_underthecode-light'}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('dracula', DRACULA_THEME)
                    monaco.editor.defineTheme('_underthecode-light', LIGHT_THEME)
                  }}
                  options={{
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    scrollBeyondLastLine: false,
                    padding: { top: 8 },
                    wordWrap: 'on',
                  }}
                  loading={null}
                />
              </div>
            </div>

            <div className="mt-2 flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={runCode}
                disabled={running || loading}
                className="rounded-lg bg-violet px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Loading…' : running ? 'Running…' : 'Run'}
              </button>
              {loading && (
                <span className="text-xs text-muted">First run loads Pyodide</span>
              )}
            </div>

            {(output !== '' || logs !== '') && (
              <div className="mt-2 flex shrink-0 flex-col gap-1.5">
                {output !== '' && (
                  <div>
                    <label className="mb-0.5 block text-xs font-medium text-muted">Output</label>
                    <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded border border-border bg-surface-2 p-2 text-xs leading-relaxed text-green">
                      {output}
                    </pre>
                  </div>
                )}
                {logs !== '' && (
                  <div>
                    <label className="mb-0.5 block text-xs font-medium text-muted">Logs / Errors</label>
                    <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded border border-border bg-surface-2 p-2 text-xs leading-relaxed text-amber">
                      {logs}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
