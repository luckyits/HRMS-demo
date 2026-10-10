import React from 'react'

export interface FilterChip {
  id: string
  label: string
  count?: number
}

interface ChipFilterRowProps {
  chips: FilterChip[]
  selectedId: string
  onSelect: (id: string) => void
}

export const ChipFilterRow: React.FC<ChipFilterRowProps> = ({
  chips,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 px-1 min-w-max">
        {chips.map((chip) => {
          const isSelected = selectedId === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelect(chip.id)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all select-none active:scale-95 ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <span>{chip.label}</span>
              {chip.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {chip.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
