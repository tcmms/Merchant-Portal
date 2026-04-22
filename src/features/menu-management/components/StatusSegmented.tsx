import { Tooltip } from '@tcmms/flock-ds'

export interface StatusTab<T extends string> {
  label: React.ReactNode
  value: T
  badge?: number
  badgeColor?: string
  tooltip?: string
}

interface StatusSegmentedProps<T extends string> {
  options: StatusTab<T>[]
  value: T
  onChange: (value: T) => void
  activeShadow?: string
  dataTourMap?: Partial<Record<T, string>>
  dataOnboardingMap?: Partial<Record<T, string>>
}

const FANCY_SHADOW = '0px 4px 30px 0px rgba(0,0,0,0.08)'

export function StatusSegmented<T extends string>({
  options,
  value,
  onChange,
  activeShadow,
  dataTourMap,
  dataOnboardingMap,
}: StatusSegmentedProps<T>) {
  return (
    <div
      className="flex items-center"
      style={{
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        padding: 3,
        gap: 4,
      }}
    >
      {options.map(option => {
        const isActive = option.value === value
        const hasBadge = option.badge != null && option.badge > 0

        return (
          <Tooltip
            key={option.value}
            title={option.tooltip}
            placement="bottom"
          >
            <button
              onClick={() => onChange(option.value)}
              data-tour={dataTourMap?.[option.value]}
              data-onboarding={dataOnboardingMap?.[option.value]}
              className="flex items-center h-[30px] rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
              style={{
                color: 'rgba(0,0,0,0.88)',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                boxShadow: isActive ? (activeShadow ?? FANCY_SHADOW) : 'none',
                border: 'none',
                paddingLeft: 16,
                paddingRight: hasBadge ? 12 : 16,
                gap: hasBadge ? 6 : 0,
              }}
            >
              {option.label}
              {hasBadge && (
                <span
                  className="flex items-center justify-center text-white font-black"
                  style={{
                    backgroundColor: option.badgeColor ?? '#5c44f0',
                    borderRadius: 124,
                    fontSize: 10,
                    lineHeight: 1,
                    minWidth: 14,
                    height: 14,
                    padding: '1px 3px',
                  }}
                >
                  {option.badge}
                </span>
              )}
            </button>
          </Tooltip>
        )
      })}
    </div>
  )
}
