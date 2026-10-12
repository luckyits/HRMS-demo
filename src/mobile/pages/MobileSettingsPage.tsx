import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe,
  Moon,
  Sun,
  Lock,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Camera,
  MapPin,
  Fingerprint,
  Info,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Zap,
  Clock,
  WifiOff,
  Compass
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useTheme } from '@/context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useAttendance } from '@/context/AttendanceContext'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'

export const MobileSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const { hasConsent, setConsent } = useAttendance()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const [appLockEnabled, setAppLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hrms_mobile_app_lock') === 'true'
  })

  const [liteMode, setLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('hrms_lite_mode') === 'true'
  })

  const toggleLiteMode = () => {
    const nextVal = !liteMode
    setLiteMode(nextVal)
    localStorage.setItem('hrms_lite_mode', String(nextVal))
    if (nextVal) {
      document.documentElement.classList.add('lite-mode')
      showToast('Lite mode enabled: animations disabled for low-end device performance', 'info')
    } else {
      document.documentElement.classList.remove('lite-mode')
      showToast('Lite mode disabled', 'info')
    }
  }

  const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false)

  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    showToast(`Language updated to ${lang.toUpperCase()}`, 'info')
  }

  const toggleAppLock = () => {
    const nextVal = !appLockEnabled
    setAppLockEnabled(nextVal)
    localStorage.setItem('hrms_mobile_app_lock', String(nextVal))
    showToast(nextVal ? 'Biometric App Lock enabled' : 'App Lock disabled', 'info')
  }

  const handleWithdrawConsent = () => {
    setConsent(false)
    setIsWithdrawSheetOpen(false)
    showToast('Biometric & GPS consent withdrawn. Attendance will require supervisor sign-off.', 'warning')
  }

  const handleGrantConsent = () => {
    setConsent(true)
    showToast('Biometric camera and location consent granted!', 'success')
  }

  const handleLogout = () => {
    showToast('Logged out of session', 'info')
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Settings & Privacy"
        subtitle="App controls & DPDP data consent"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* 1. Interface Language */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Globe className="w-4 h-4 text-primary" />
            <span>Language Selection</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { code: 'en', label: 'English', sub: 'Default' },
              { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
              { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                  i18n.language === lang.code
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                    : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                }`}
              >
                <span className="block text-sm font-bold">{lang.label}</span>
                <span className="block text-[10px] opacity-80">{lang.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Visual Theme & Appearance */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Dark Mode Appearance
              </h4>
              <p className="text-xs text-muted-foreground">
                {isDark ? 'OLED Dark mode active' : 'Clean light theme active'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              isDark ? 'bg-primary justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* 3. App Security & Lock */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Biometric App Lock
              </h4>
              <p className="text-xs text-muted-foreground">
                Require Face ID / PIN on launch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAppLock}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              appLockEnabled ? 'bg-primary justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* 3b. Lite Mode (Low-End Phones) */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-foreground">
                  Lite Mode (Low-End Phones)
                </h4>
                {liteMode && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Disables animations & reduces GPU load
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleLiteMode}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              liteMode ? 'bg-amber-500 justify-end' : 'bg-muted justify-start'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* 3c. Mobile System Diagnostics & Lock */}
        <div className="p-4 rounded-3xl bg-muted/30 border border-border space-y-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Mobile Security & Diagnostics
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/mobile/lock')}
              className="p-2.5 rounded-2xl bg-card border border-border text-left hover:border-primary/40 active:scale-95 transition"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Lock App Now</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Test 4-digit PIN lock
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/mobile/session-expired')}
              className="p-2.5 rounded-2xl bg-card border border-border text-left hover:border-primary/40 active:scale-95 transition"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Session Timeout</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Simulate 15m timeout
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/mobile/permissions')}
              className="p-2.5 rounded-2xl bg-card border border-border text-left hover:border-primary/40 active:scale-95 transition"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Camera className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sensors & GPS</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Permissions guide
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('start-demo-tour', { detail: { stepIndex: 0 } }))
              }}
              className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left hover:border-amber-500/60 active:scale-95 transition"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Demo Tour</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5">
                Interactive walkthrough
              </span>
            </button>
          </div>
        </div>

        {/* 4. Privacy & DPDP Consent Management */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>DPDP Consent Management</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasConsent
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              }`}
            >
              {hasConsent ? 'Consent Active' : 'Withdrawn'}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            In compliance with India's Digital Personal Data Protection (DPDP) Act, you have the right to inspect or withdraw camera and geolocation processing rights at any time.
          </p>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Facial Selfie & Liveness Verification</span>
              </div>
              <span className="font-semibold text-foreground">
                {hasConsent ? 'Granted' : 'Revoked'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>GPS Geofence Boundary Check</span>
              </div>
              <span className="font-semibold text-foreground">
                {hasConsent ? 'Granted' : 'Revoked'}
              </span>
            </div>
          </div>

          <div className="pt-1">
            {hasConsent ? (
              <button
                type="button"
                onClick={() => setIsWithdrawSheetOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Withdraw Biometric & Location Consent</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGrantConsent}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Grant Biometric & GPS Consent</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. Logout Session */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Mobile Workspace</span>
          </button>
        </div>
      </div>

      {/* Withdraw Consent Warning Bottom Sheet */}
      <BottomSheet
        isOpen={isWithdrawSheetOpen}
        onClose={() => setIsWithdrawSheetOpen(false)}
        title="Withdraw DPDP Consent?"
        subtitle="Impact on Biometric Punching"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 space-y-2">
            <h4 className="font-bold">What happens when you withdraw consent:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Camera face verification and GPS location checks will be halted.</li>
              <li>You will not be able to mark instant biometric punches.</li>
              <li>Attendance will require supervisor manual intervention or punch regularisation requests.</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleWithdrawConsent}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs active:scale-95 transition shadow-sm"
            >
              Confirm Withdrawal
            </button>
            <button
              type="button"
              onClick={() => setIsWithdrawSheetOpen(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-muted text-foreground font-bold text-xs active:scale-95 transition"
            >
              Keep Consent
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
