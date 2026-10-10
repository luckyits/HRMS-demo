import React from 'react'
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Moon, Sun, Globe } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useAccess } from '@/access/useAccess'
import { useTheme } from '@/context/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/context/ToastContext'

export const MobileProfilePage: React.FC = () => {
  const { currentEmployee } = useAccess()
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const { showToast } = useToast()

  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    showToast(`Language switched to ${lang.toUpperCase()}`, 'info')
  }

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader title="My Profile" subtitle="Workforce credentials" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="p-6 rounded-3xl bg-card border border-border text-center shadow-xs space-y-3">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-primary/20 shadow-sm"
          />

          <div>
            <h3 className="text-lg font-black text-foreground">{currentEmployee.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{currentEmployee.designation}</p>
            <span className="font-mono text-xs text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mt-2 font-bold">
              ID: {currentEmployee.id}
            </span>
          </div>

          <div className="pt-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC & Aadhaar Verified</span>
            </span>
          </div>
        </div>

        {/* Work Details Card */}
        <div className="p-4 rounded-3xl bg-card border border-border space-y-3 text-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Employment Details
          </h4>
          <div className="flex items-center gap-3">
            <Building className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Department</span>
              <span className="font-semibold text-foreground">{currentEmployee.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Work Location</span>
              <span className="font-semibold text-foreground">{currentEmployee.branch}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="text-muted-foreground block text-[11px]">Work Email</span>
              <span className="font-semibold text-foreground truncate">{currentEmployee.email}</span>
            </div>
          </div>
        </div>

        {/* Quick App Preferences */}
        <div className="p-4 rounded-3xl bg-card border border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Preferences & Accessibility
          </h4>

          {/* Theme switcher */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span className="text-xs font-semibold text-foreground">Dark Theme</span>
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

          {/* Language Switcher */}
          <div className="pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-foreground">
              <Globe className="w-4 h-4 text-primary" />
              <span>Interface Language</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'gu', label: 'ગુજરાતી' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    i18n.language === lang.code
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
