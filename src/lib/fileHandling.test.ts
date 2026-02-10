import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openWorkflowFromYaml, validateWorkflow, saveWorkflowToFile } from './fileHandling'
import type { Workflow } from '@/types/workflow'

describe('openWorkflowFromYaml', () => {
  it('returns workflow and errors from parseWorkflow', () => {
    const yaml = `
name: Test
on: push
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo hi
`
    const result = openWorkflowFromYaml(yaml)
    expect(result.errors).toEqual([])
    expect(result.workflow.name).toBe('Test')
    expect(result.workflow.jobs.build).toBeDefined()
  })

  it('returns errors for invalid YAML', () => {
    const result = openWorkflowFromYaml('invalid: [yaml:')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.workflow.jobs).toEqual({})
  })
})

describe('validateWorkflow', () => {
  it('returns parse errors when workflow is serialized and re-parsed', () => {
    const workflow: Workflow = {
      name: 'Valid',
      on: 'push',
      jobs: {
        build: {
          'runs-on': 'ubuntu-latest',
          steps: [{ run: 'echo hi' }],
        },
      },
    }
    const errors = validateWorkflow(workflow)
    expect(errors).toEqual([])
  })

  it('returns empty array for valid workflow', () => {
    const workflow: Workflow = {
      name: 'X',
      on: 'push',
      jobs: {
        j: {
          'runs-on': 'ubuntu-latest',
          steps: [{ run: 'true' }],
        },
      },
    }
    expect(validateWorkflow(workflow)).toEqual([])
  })
})

describe('saveWorkflowToFile (browser download)', () => {
  const originalCreateObjectUrl = URL.createObjectURL
  const originalRevokeObjectUrl = URL.revokeObjectURL
  let originalCreateElement: ((tag: string) => unknown) | undefined

  beforeEach(() => {
    // Ensure a global document exists (Node test environment)
    const g = globalThis as unknown as { document?: { createElement: (tag: string) => unknown } }
    if (!g.document) {
      g.document = {
        // placeholder, will be replaced in individual tests
        createElement: ((tag: string) => ({ tag })) as (tag: string) => unknown,
      }
    }
    originalCreateElement = g.document.createElement

    // Mock URL and anchor element behavior
    // @ts-expect-error mock
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    // @ts-expect-error mock
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    // Restore globals
    URL.createObjectURL = originalCreateObjectUrl
    URL.revokeObjectURL = originalRevokeObjectUrl
    const g = globalThis as unknown as { document?: { createElement: (tag: string) => unknown } }
    if (g.document && originalCreateElement) {
      g.document.createElement = originalCreateElement
    }
    vi.restoreAllMocks()
  })

  it('creates a downloadable link with the expected filename', () => {
    const clickSpy = vi.fn()

    // Mock document.createElement to capture the anchor element
    const g = globalThis as unknown as { document: { createElement: (tag: string) => unknown } }
    g.document.createElement = vi.fn(() => ({
      href: '',
      download: '',
      click: clickSpy,
    }))

    const workflow: Workflow = {
      name: 'Download test',
      on: 'push',
      jobs: {
        build: {
          'runs-on': 'ubuntu-latest',
          steps: [{ run: 'echo hi' }],
        },
      },
    }

    saveWorkflowToFile(workflow, 'download.yml')

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)

    const anchor = (document.createElement as unknown as vi.Mock).mock
      .results[0].value as HTMLAnchorElement
    expect(anchor.download).toBe('download.yml')
    expect(typeof anchor.href).toBe('string')
  })
})
