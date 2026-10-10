import { cn } from '@/lib/utils'
import { Eye, EyeOff, Lock } from 'lucide-react'
import React, { useState } from 'react'

interface SensitiveFieldProps {
  value: string | number
  maskChar?: string
  maskLength?: number
  label?: string
  className?: string
  maskedDisplay?: string
  onReveal?: () => void
}

export const SensitiveField: React.FC<SensitiveFieldProps> = ({
  value,
  maskChar = '•',
  maskLength = 8,
  label,
  className,
  maskedDisplay,
  onReveal,
}) => {
  const [revealed, setRevealed] = useState(false)

  const defaultMasked = maskedDisplay || maskChar.repeat(maskLength)

  const handleToggle = () => {
    if (!revealed && onReveal) {
      onReveal()
    }
    setRevealed(!revealed)
  }

  return (
    <div className={cn('inline-flex items-center gap-2 font-mono text-sm', className)}>
      {label && <span className="text-xs text-muted-foreground mr-1 font-sans">{label}:</span>}
      <span className={cn('tracking-wider select-none font-medium', !revealed && 'text-muted-foreground')}>
        {revealed ? value : defaultMasked}
      </span>
      <button
        type="button"
        onClick={handleToggle}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/80 transition focus:outline-none"
        title={revealed ? 'Hide sensitive data' : 'Reveal sensitive data (Logged)'}
      >
        {revealed ? (
          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-primary" />
        )}
      </button>
    </div>
  )
}
