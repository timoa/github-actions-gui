import { SiUbuntu, SiApple } from 'react-icons/si'
import { FaWindows } from 'react-icons/fa'
import { HiServer } from 'react-icons/hi'

function getRunnerIconAndVersion(runsOn: string): { icon: React.ReactNode; version: string } {
  const first = (runsOn || 'ubuntu-latest').split(',')[0].trim().toLowerCase()
  if (first.startsWith('ubuntu')) {
    const version = first.slice('ubuntu-'.length) || 'latest'
    return { icon: <SiUbuntu className="text-[#E95420] shrink-0" size={14} />, version }
  }
  if (first.startsWith('macos')) {
    const version = first.slice('macos-'.length) || 'latest'
    return { icon: <SiApple className="text-gray-700 shrink-0" size={14} />, version }
  }
  if (first.startsWith('windows')) {
    const version = first.slice('windows-'.length) || 'latest'
    return { icon: <FaWindows className="text-blue-500 shrink-0" size={14} />, version }
  }
  if (first === 'self-hosted' || first.startsWith('self-hosted')) {
    return { icon: <HiServer className="text-slate-600 shrink-0" size={14} />, version: 'self-hosted' }
  }
  // Unknown runner: show generic server icon and use part after first hyphen or full string
  const version = first.includes('-') ? first.slice(first.indexOf('-') + 1) : first || 'latest'
  return { icon: <HiServer className="text-slate-600 shrink-0" size={14} />, version }
}

interface RunnerBadgeProps {
  runsOn: string
  className?: string
}

export function RunnerBadge({ runsOn, className = '' }: RunnerBadgeProps) {
  const { icon, version } = getRunnerIconAndVersion(runsOn)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 ${className}`}
      title={runsOn || 'ubuntu-latest'}
    >
      {icon}
      <span>{version}</span>
    </span>
  )
}
