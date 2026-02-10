import { describe, it, expect } from 'vitest'
import {
  parseTriggers,
  formatTrigger,
  getTriggerLabel,
  triggersToOn,
  triggerSupportsTypes,
  TRIGGERS_WITH_TYPES,
} from './triggerUtils'

describe('parseTriggers', () => {
  it('returns empty array for undefined on', () => {
    expect(parseTriggers(undefined)).toEqual([])
  })

  it('parses string trigger', () => {
    expect(parseTriggers('push')).toEqual([{ event: 'push', config: {} }])
    expect(parseTriggers('workflow_dispatch')).toEqual([
      { event: 'workflow_dispatch', config: {} },
    ])
  })

  it('parses array of string triggers', () => {
    const result = parseTriggers(['push', 'pull_request'])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ event: 'push', config: {} })
    expect(result[1]).toEqual({ event: 'pull_request', config: {} })
  })

  it('parses array with object config', () => {
    const result = parseTriggers([
      { push: { branches: ['main'], tags: ['v*'] } },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].event).toBe('push')
    expect(result[0].config).toEqual({ branches: ['main'], tags: ['v*'] })
  })

  it('parses object with push config', () => {
    const result = parseTriggers({
      push: { branches: ['main'], paths: ['src/**'] },
    })
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      event: 'push',
      config: { branches: ['main'], paths: ['src/**'] },
    })
  })

  it('parses schedule with cron array', () => {
    const result = parseTriggers({
      schedule: [{ cron: '0 0 * * *' }, { cron: '0 12 * * 1-5' }],
    })
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ event: 'schedule', config: { cron: '0 0 * * *' } })
    expect(result[1]).toEqual({ event: 'schedule', config: { cron: '0 12 * * 1-5' } })
  })

  it('parses multiple events from object', () => {
    const result = parseTriggers({
      push: { branches: ['main'] },
      pull_request: { types: ['opened'] },
    })
    expect(result).toHaveLength(2)
    expect(result[0].event).toBe('push')
    expect(result[1].event).toBe('pull_request')
    expect(result[1].config.types).toEqual(['opened'])
  })
})

describe('formatTrigger', () => {
  it('formats trigger with only event', () => {
    expect(formatTrigger({ event: 'push', config: {} })).toBe('push')
  })

  it('formats trigger with branches', () => {
    expect(
      formatTrigger({
        event: 'push',
        config: { branches: ['main', 'develop'] },
      })
    ).toBe('push • branches: main, develop')
  })

  it('formats trigger with types', () => {
    expect(
      formatTrigger({
        event: 'pull_request',
        config: { types: ['opened', 'synchronize'] },
      })
    ).toBe('pull_request • types: opened, synchronize')
  })
})

describe('getTriggerLabel', () => {
  it('returns event only when no config', () => {
    expect(getTriggerLabel({ event: 'workflow_dispatch', config: {} })).toBe(
      'workflow_dispatch'
    )
  })

  it('returns event with branches', () => {
    expect(
      getTriggerLabel({
        event: 'push',
        config: { branches: ['main'] },
      })
    ).toBe('push (main)')
  })

  it('returns event with tags', () => {
    expect(
      getTriggerLabel({
        event: 'push',
        config: { tags: ['v*'] },
      })
    ).toBe('push (v*)')
  })
})

describe('triggersToOn', () => {
  it('returns empty object for no triggers', () => {
    expect(triggersToOn([])).toEqual({})
  })

  it('converts single trigger with empty config to string', () => {
    expect(triggersToOn([{ event: 'push', config: {} }])).toBe('push')
  })

  it('converts single trigger with config to object', () => {
    expect(
      triggersToOn([{ event: 'push', config: { branches: ['main'] } }])
    ).toEqual({ push: { branches: ['main'] } })
  })

  it('converts schedule triggers to array format', () => {
    const result = triggersToOn([
      { event: 'schedule', config: { cron: '0 0 * * *' } },
    ])
    expect(result).toEqual({ schedule: [{ cron: '0 0 * * *' }] })
  })

  it('converts multiple non-schedule triggers to array', () => {
    const result = triggersToOn([
      { event: 'push', config: {} },
      { event: 'pull_request', config: {} },
    ])
    expect(result).toEqual(['push', 'pull_request'])
  })

  it('merges multiple non-schedule triggers with schedule into array format', () => {
    const result = triggersToOn([
      { event: 'push', config: {} },
      { event: 'pull_request', config: { types: ['opened'] } },
      { event: 'schedule', config: { cron: '0 0 * * *' } },
    ])

    expect(Array.isArray(result)).toBe(true)
    const arr = result as unknown[]
    expect(arr).toHaveLength(3)
    expect(arr[0]).toBe('push')
    expect(arr[1]).toEqual({ pull_request: { types: ['opened'] } })
    expect(arr[2]).toEqual({
      schedule: [{ cron: '0 0 * * *' }],
    })
  })

  it('returns only schedule object when there are only schedule triggers', () => {
    const result = triggersToOn([
      { event: 'schedule', config: { cron: '0 0 * * *' } },
      { event: 'schedule', config: { cron: '0 12 * * 1-5' } },
    ])

    expect(result).toEqual({
      schedule: [
        { cron: '0 0 * * *' },
        { cron: '0 12 * * 1-5' },
      ],
    })
  })
})

describe('triggerSupportsTypes', () => {
  it('returns true for pull_request', () => {
    expect(triggerSupportsTypes('pull_request')).toBe(true)
  })

  it('returns true for workflow_run', () => {
    expect(triggerSupportsTypes('workflow_run')).toBe(true)
  })

  it('returns false for push', () => {
    expect(triggerSupportsTypes('push')).toBe(false)
  })

  it('matches TRIGGERS_WITH_TYPES set', () => {
    for (const event of ['pull_request', 'release', 'schedule']) {
      expect(triggerSupportsTypes(event)).toBe(TRIGGERS_WITH_TYPES.has(event))
    }
  })
})
