import React, { useState } from 'react'
import {
  Lock,
  Delete,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'

interface MobilePinLockPageProps {
  onUnlock?: () => void
  targetPath?: string
}

export const MobilePinLockPage: React.FC<MobilePinLockPageProps> = ({
  onUnlock,
  targetPath = '/',
}) => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const [pin, setPin] = useState('')
  const [hasError, setHasError] = useState(false)
  const defaultPin = '1234'

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num
      setPin(nextPin)
      setHasError(false)

      if (nextPin.length === 4) {
        verifyPin(nextPin)
      }
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setHasError(false)
  }

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === defaultPin) {
      showToast('Device unlocked successfully', 'success')
      if (onUnlock) {
        onUnlock()
      } else {
        navigate(targetPath)
      }
    } else {
      setHasError(true)
      showToast('Incorrect PIN. Default demo PIN is 1234', 'error')
      setTimeout(() => setPin(''), 600)
    }
  }

  const handleBiometricUnlock = () => {
    showToast('Biometric Face ID / Fingerprint verified', 'success')
    if (onUnlock) {
      onUnlock()
    } else {
      navigate(targetPath)
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-full p-6 bg-linear-to-b from-card via-background to-background text-foreground select-none">
      {/* Top Header */}
      <div className="flex flex-col items-center text-center space-y-2 pt-8">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">
          Enter Security PIN
        </h2>
        <p className="text-xs text-muted-foreground">
          Logged in as {settings.currentUser.name}
        </p>
      </div>

      {/* PIN Dots Indicator */}
      <div className="my-6 flex flex-col items-center space-y-3">
        <div
          className={`flex items-center gap-4 transition-transform ${
            hasError ? 'animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-primary border-primary scale-110'
                    : hasError
                    ? 'border-rose-500 bg-rose-500/20'
                    : 'border-muted-foreground/40 bg-transparent'
                }`}
              />
            )
          })}
        </div>

        <span className="text-[11px] text-muted-foreground font-semibold">
          Demo Default PIN: <strong className="text-primary font-mono">1234</strong>
        </span>
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-[280px] space-y-3 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-3xl bg-muted/40 hover:bg-muted text-foreground font-bold text-xl active:scale-95 transition shadow-2xs border border-border/50 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          {/* Biometrics */}
          <button
            type="button"
            onClick={handleBiometricUnlock}
            title="Biometric Unlock"
            className="h-16 rounded-3xl bg-muted/40 hover:bg-muted text-primary active:scale-95 transition border border-border/50 flex items-center justify-center"
          >
            <Fingerprint className="w-7 h-7" />
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-3xl bg-muted/40 hover:bg-muted text-foreground font-bold text-xl active:scale-95 transition shadow-2xs border border-border/50 flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            title="Delete"
            className="h-16 rounded-3xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground active:scale-95 transition border border-border/50 flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Emergency Logout */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-muted-foreground hover:text-rose-500 transition"
          >
            Log Out or Switch Account
          </button>
        </div>
      </div>
    </div>
  )
}
