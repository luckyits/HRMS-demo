import React, { useState } from 'react'
import {
  Smartphone,
  KeyRound,
  Fingerprint,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { useNavigate } from 'react-router-dom'

export const MobileLoginPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { settings, setRole, setEmployeeType } = useDemo()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [authMode, setAuthMode] = useState<'otp' | 'pin'>('otp')
  const [phoneNumber, setPhoneNumber] = useState('9845011920')
  const [otpCode, setOtpCode] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    showToast(`Language switched to ${lang.toUpperCase()}`, 'info')
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning')
      return
    }
    setOtpSent(true)
    setOtpCode('1234')
    showToast('OTP sent to +91 ' + phoneNumber + ' (Use 1234 for demo)', 'info')
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      showToast('Logged in successfully as ' + settings.currentUser.name, 'success')
      navigate('/employee/dashboard')
    }, 600)
  }

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinCode.length < 4) {
      showToast('Please enter 4-digit security PIN', 'warning')
      return
    }
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      showToast('PIN verified! Welcome ' + settings.currentUser.name, 'success')
      navigate('/employee/dashboard')
    }, 500)
  }

  const handleBiometricUnlock = () => {
    setIsVerifying(true)
    showToast('Scanning fingerprint / Face ID sensor...', 'info')
    setTimeout(() => {
      setIsVerifying(false)
      showToast('Biometric match 99.8%! Logging in...', 'success')
      navigate('/employee/dashboard')
    }, 700)
  }

  return (
    <div className="min-h-full flex flex-col justify-between p-6 bg-background text-foreground select-none">
      {/* Top Header & Language Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/30">
            HR
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
            {[
              { code: 'en', label: 'EN' },
              { code: 'hi', label: 'हि' },
              { code: 'gu', label: 'ગુ' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  i18n.language === lang.code
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Universal HRMS
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Workforce Portal • One-tap biometric attendance & self-service
          </p>
        </div>
      </div>

      {/* Center Auth Form */}
      <div className="my-auto py-6 space-y-5">
        {/* Auth Mode Tabs (OTP / PIN) */}
        <div className="flex p-1 bg-muted/60 rounded-xl border border-border/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'otp' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Mobile & OTP
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('pin')}
            className={`flex-1 py-2 rounded-lg transition ${
              authMode === 'pin' ? 'bg-card text-foreground font-bold shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Security PIN
          </button>
        </div>

        {authMode === 'otp' ? (
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-muted-foreground">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full pl-12 pr-4 py-3 text-sm font-semibold bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <span>Send Login OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Enter 4-Digit OTP
                  </label>
                  <span className="text-[11px] text-primary font-semibold">
                    Sent to +91 {phoneNumber}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full text-center tracking-widest text-xl font-black py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                {isVerifying ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Change mobile number
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                4-Digit Security PIN
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-widest font-black py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full min-h-[48px] py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock with PIN</span>
            </button>
          </form>
        )}

        {/* Biometric Quick Unlock Option */}
        <div className="pt-2">
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-border w-full absolute" />
            <span className="bg-background px-3 text-[11px] text-muted-foreground uppercase font-bold relative">
              Or Fast Unlock
            </span>
          </div>

          <button
            type="button"
            onClick={handleBiometricUnlock}
            className="w-full min-h-[50px] p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
          >
            <Fingerprint className="w-5 h-5 stroke-[2.2px]" />
            <span>Use Fingerprint / Face Unlock</span>
          </button>
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="pt-4 border-t border-border/60 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AES-256 Bit Biometric Encryption</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Demo Profile: {settings.currentUser.name} ({settings.employeeType})
        </p>
      </div>
    </div>
  )
}
