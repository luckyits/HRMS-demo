import React from 'react'

export interface SegmentOption {
  id: string
  label: string
  count?: number
}

interface SegmentedControlProps {
  options: SegmentOption[]
  selectedId: string
  onSelect: (id: string) => void
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="w-full p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/60 flex items-center gap-1 select-none">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`flex-1 min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
              isSelected
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="truncate">{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted-foreground/10 text-muted-foreground'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
