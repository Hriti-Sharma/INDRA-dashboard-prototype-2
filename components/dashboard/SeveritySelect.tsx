'use client'

import { ChevronDown } from 'lucide-react'
import { Combobox } from '@base-ui/react/combobox'

export default function SeveritySelect({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  const display = (val: string): string => {
    if (val === 'all') return 'All severities'
    return val.charAt(0).toUpperCase() + val.slice(1)
  }

  return (
    <label className="severity-select">
      {label}
      <Combobox.Root
        value={value}
        onValueChange={(val) => onChange((val as string) ?? 'all')}
        itemToStringLabel={(item) => display(item as string)}
      >
        <div className="severity-select-control">
          <Combobox.Input
            className="severity-select-input"
            readOnly
          />
          <ChevronDown size={14} className="severity-select-chevron" />
        </div>
        <Combobox.Portal>
          <Combobox.Positioner side="bottom" align="start" sideOffset={4}>
            <Combobox.Popup className="severity-select-popup">
              <Combobox.List>
                {options.map(opt => (
                  <Combobox.Item
                    key={opt}
                    value={opt}
                    className="severity-select-item"
                  >
                    {display(opt)}
                  </Combobox.Item>
                ))}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </label>
  )
}