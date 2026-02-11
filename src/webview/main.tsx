import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { getVscode } from './lib/fileHandling'

// Get vscode API from window (set by script in HTML)
const vscode = getVscode()

// Set up message listener for VSCode
window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.command) {
    case 'loadFile':
      // Dispatch custom event for App to handle
      window.dispatchEvent(
        new CustomEvent('vscode-loadFile', {
          detail: { content: message.content, filename: message.filename },
        })
      )
      break
    case 'themeChanged':
      // Dispatch theme change event
      window.dispatchEvent(
        new CustomEvent('vscode-themeChanged', {
          detail: { theme: message.theme },
        })
      )
      break
    case 'iconUri':
      // Dispatch icon URI event
      window.dispatchEvent(
        new CustomEvent('vscode-iconUri', {
          detail: { uri: message.uri },
        })
      )
      break
    case 'saveRequest':
      window.dispatchEvent(new CustomEvent('vscode-saveRequest'))
      break
    case 'undoRequest':
      window.dispatchEvent(new CustomEvent('vscode-undoRequest'))
      break
  }
})

// Notify extension that webview is ready
if (vscode && vscode.postMessage) {
  vscode.postMessage({ command: 'ready' })
} else {
  console.error('VSCode API not available')
}

// Render React app
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found')
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render React app:', error)
  }
}
