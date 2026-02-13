import { parseWorkflow } from './parseWorkflow'
import { serializeWorkflow } from './serializeWorkflow'
import type { Workflow } from '@/types/workflow'

export interface VscodeApi {
  postMessage: (message: { command: string; [key: string]: unknown }) => void
}

declare global {
  interface Window {
    vscode?: VscodeApi
  }
}

export function getVscode(): VscodeApi | undefined {
  return window.vscode
}

export interface OpenResult {
  workflow: Workflow
  errors: string[]
}

export function openWorkflowFromYaml(yamlContent: string): OpenResult {
  const { workflow, errors } = parseWorkflow(yamlContent)
  return { workflow, errors }
}

export function saveWorkflowToFile(workflow: Workflow, filename: string = 'workflow.yml'): void {
  const yaml = serializeWorkflow(workflow)
  // Send save request to extension via VSCode message API
  const vscodeApi = getVscode()
  if (vscodeApi && vscodeApi.postMessage) {
    vscodeApi.postMessage({
      command: 'saveFile',
      content: yaml,
      filename,
    })
  } else {
    console.error('VSCode API not available for saving file')
  }
}

export function requestOpenFile(): void {
  // Request file open dialog from extension
  const vscodeApi = getVscode()
  if (vscodeApi && vscodeApi.postMessage) {
    vscodeApi.postMessage({
      command: 'openFile',
    })
  } else {
    console.error('VSCode API not available for opening file')
  }
}

export function validateWorkflow(workflow: Workflow): string[] {
  const yaml = serializeWorkflow(workflow)
  const { errors } = parseWorkflow(yaml)
  return errors
}
