import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
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
    case 'saveRequest':
      window.dispatchEvent(new CustomEvent('vscode-saveRequest'))
      break
    case 'undoRequest':
      window.dispatchEvent(new CustomEvent('vscode-undoRequest'))
      break
  }
})

// Render React app; App will send 'ready' to the extension after registering the loadFile listener
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
