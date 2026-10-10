import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { useTheme } from '@/context/ThemeContext'
import { AuditLogService } from '@/services/auditLogService'
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Languages,
  Laptop,
  Moon,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sun,
  UserCheck,
} from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ConsentSetting {
  id: string
  title: string
  description: string
  granted: boolean
  grantedAt: string
  impactWarning: string
}

const DEFAULT_CONSENTS: ConsentSetting[] = [
  {
    id: 'consent_face',
    title: 'Facial Biometric & Liveness Verification Consent',
    description: 'Permits the browser to capture selfie images strictly for biometric liveness verification upon punch-in.',
    granted: true,
    grantedAt: '2026-08-01 09:30 AM',
    impactWarning: 'Withdrawing biometric consent will disable instant self-punch. You will need to submit manual attendance regularizations for manager approval.',
  },
  {
    id: 'consent_geo',
    title: 'Geofencing & GPS Coordinates Tracking Consent',
    description: 'Allows browser location queries solely at the instant of punch to verify designated site geofence presence.',
    granted: true,
    grantedAt: '2026-08-01 09:30 AM',
    impactWarning: 'Withdrawing geofence location consent will flag all punches as outside perimeter and require manager justification.',
  },
  {
    id: 'consent_directory',
    title: 'Employee Directory & Celebrations Visibility',
    description: 'Allows your work anniversary and birthday to appear in the company celebrations widget for peer congratulations.',
    granted: true,
    grantedAt: '2026-08-01 09:30 AM',
    impactWarning: 'Your milestones will be hidden from team celebration lists and peer greeting feeds.',
  },
]

export const EssSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  const [consents, setConsents] = useState<ConsentSetting[]>(() => {
    try {
      const saved = localStorage.getItem('hrms_ess_user_consents')
      if (saved) return JSON.parse(saved)
    } catch {}
    return DEFAULT_CONSENTS
  })

  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null)

  const handleLanguageChange = (lang: string) => {
    const prev = i18n.language
    i18n.changeLanguage(lang)
    AuditLogService.addLog({
      actorName: 'Priya Sharma',
      actorRole: 'Employee',
      action: 'Language Preference Updated',
      targetType: 'Employee',
      targetId: 'EMP-0418',
      targetName: 'Priya Sharma',
      featureCode: 'PROFILE',
      beforeValue: prev,
      afterValue: lang,
      reason: 'User preference updated via settings portal',
    })
  }

  const handleToggleConsent = (id: string) => {
    const target = consents.find((c) => c.id === id)
    if (!target) return

    if (target.granted) {
      // Prompt confirm to withdraw
      setWithdrawTargetId(id)
    } else {
      // Re-grant
      const updated = consents.map((c) =>
        c.id === id ? { ...c, granted: true, grantedAt: new Date().toLocaleString() } : c
      )
      setConsents(updated)
      localStorage.setItem('hrms_ess_user_consents', JSON.stringify(updated))
      AuditLogService.addLog({
        actorName: 'Priya Sharma',
        actorRole: 'Employee',
        action: 'Consent Re-granted',
        targetType: 'Employee',
        targetId: 'EMP-0418',
        targetName: 'Priya Sharma',
        featureCode: 'PROFILE',
        beforeValue: 'Withdrawn',
        afterValue: 'Active',
        reason: `Employee granted consent for ${id}`,
      })
    }
  }

  const confirmWithdrawConsent = () => {
    if (!withdrawTargetId) return
    const updated = consents.map((c) =>
      c.id === withdrawTargetId ? { ...c, granted: false } : c
    )
    setConsents(updated)
    localStorage.setItem('hrms_ess_user_consents', JSON.stringify(updated))
    AuditLogService.addLog({
      actorName: 'Priya Sharma',
      actorRole: 'Employee',
      action: 'Consent Revoked',
      targetType: 'Employee',
      targetId: 'EMP-0418',
      targetName: 'Priya Sharma',
      featureCode: 'PROFILE',
      beforeValue: 'Active',
      afterValue: 'Withdrawn',
      reason: `Employee withdrew statutory consent for ${withdrawTargetId}`,
    })
    setWithdrawTargetId(null)
  }

  const targetConsent = consents.find((c) => c.id === withdrawTargetId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preferences & Consent Management"
        subtitle="Manage portal appearance, interface language, and digital privacy authorizations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Language */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Interface Language
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Select your preferred display language across all self-service dashboards and forms
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  i18n.language === lang.code
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{lang.native}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{lang.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Theme */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Visual Theme
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Customize the portal color scheme for optimal viewing in light or dark environments
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { mode: 'light', label: 'Light', icon: Sun },
              { mode: 'dark', label: 'Dark', icon: Moon },
              { mode: 'system', label: 'System', icon: Laptop },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode as any)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  theme === mode
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Privacy & Consent Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Digital Privacy & Statutory Consent Management
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            In compliance with DPDP (Digital Personal Data Protection) Act and GDPR provisions, you have the right to inspect and revoke consent for sensitive telemetry data.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {consents.map((consent) => (
            <div
              key={consent.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {consent.title}
                  </h4>
                  {consent.granted ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Active Consent
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <AlertTriangle className="w-3 h-3" /> Withdrawn
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {consent.description}
                </p>

                <div className="text-[11px] text-slate-400">
                  {consent.granted ? (
                    <span>Authorized on: {consent.grantedAt}</span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      Authorization revoked by employee. Fallback compliance mode active.
                    </span>
                  )}
                </div>
              </div>

              <div className="self-end sm:self-center shrink-0">
                {consent.granted ? (
                  <button
                    onClick={() => handleToggleConsent(consent.id)}
                    className="px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold transition-colors"
                  >
                    Withdraw Consent
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleConsent(consent.id)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Grant Consent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog for Withdrawing Consent */}
      <ConfirmDialog
        isOpen={!!withdrawTargetId}
        title="Confirm Consent Withdrawal"
        description={targetConsent?.impactWarning || 'Are you sure you want to withdraw consent?'}
        confirmText="Confirm Withdrawal"
        cancelText="Keep Active"
        isDestructive={true}
        onConfirm={confirmWithdrawConsent}
        onCancel={() => setWithdrawTargetId(null)}
      />
    </div>
  )
}
export default EssSettingsPage
