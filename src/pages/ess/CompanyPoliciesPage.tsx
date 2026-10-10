import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { useEss } from '@/context/EssContext'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  History,
  Info,
  ShieldCheck,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const CompanyPoliciesPage: React.FC = () => {
  const { policies, acknowledgePolicy } = useEss()

  const [activeReadingPolicyId, setActiveReadingPolicyId] = useState<string | null>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState<boolean>(false)
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false)

  const activePolicy = policies.find((p) => p.id === activeReadingPolicyId)

  const handleOpenReader = (policyId: string) => {
    setActiveReadingPolicyId(policyId)
    setHasScrolledToBottom(false)
    setAgreementChecked(false)
  }

  const handleAcknowledge = () => {
    if (!activeReadingPolicyId) return
    acknowledgePolicy(activeReadingPolicyId)
    setActiveReadingPolicyId(null)
  }

  const acknowledgedCount = policies.filter((p) => p.acknowledged).length
  const pendingCount = policies.length - acknowledgedCount

  return (
    <FeatureGate feature="POLICY">
      <div className="space-y-6">
        <PageHeader
          title="Company Policies & Governance Standards"
          subtitle="Corporate codes, compliance guidelines, safety protocols, and statutory employee handbooks"
          action={
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {acknowledgedCount} Acknowledged
              </span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  {pendingCount} Awaiting Sign-off
                </span>
              )}
            </div>
          }
        />

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <History className="w-3 h-3" />
                    {policy.version}
                  </span>
                  {policy.acknowledged ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      Action Required
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {policy.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {policy.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {policy.summary}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated: {policy.lastUpdated}
                  </span>
                  {policy.acknowledgedAt && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Signed: {policy.acknowledgedAt}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReader(policy.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      policy.acknowledged
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {policy.acknowledged ? 'Review Policy' : 'Read & Acknowledge'}
                  </button>

                  <button
                    onClick={() => alert(`Downloading PDF copy of ${policy.title}`)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Download Official PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Governance Notice */}
        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center gap-3 text-xs text-indigo-900 dark:text-indigo-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div>
            <strong>Statutory Compliance Requirement:</strong> All employees are mandated under employment service rules to review updated company policies upon release. Acknowledgements are recorded into the employee audit trail with system timestamping.
          </div>
        </div>

        {/* Read & Acknowledge Drawer / Modal */}
        {activePolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {activePolicy.version}
                      </span>
                      <span className="text-xs text-slate-500">{activePolicy.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activePolicy.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveReadingPolicyId(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reader Body */}
              <div
                onScroll={(e) => {
                  const target = e.currentTarget
                  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
                    setHasScrolledToBottom(true)
                  }
                }}
                className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                    Executive Summary
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activePolicy.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    1. Scope and Applicability
                  </h4>
                  <p>
                    {activePolicy.fullContent}
                  </p>
                  <p>
                    This policy applies to all full-time employees, contractors, interns, and third-party vendors functioning across all operational plant sites, corporate hubs, and remote work arrangements.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Responsibilities and Obligations
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li>Maintain strict adherence to the organizational code and standards of conduct at all times.</li>
                    <li>Promptly report any suspected violations or non-compliance to the designated committee or confidential grievance line.</li>
                    <li>Avoid conflicts of interest, unauthorized data disclosure, or actions prejudicial to company reputation.</li>
                    <li>Cooperate fully with internal audit and compliance investigations whenever requested.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Disciplinary Action & Penalties
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Failure to abide by the provisions established herein will result in formal disciplinary action up to and including written warning, suspension, forfeiture of incentives, or termination of employment in accordance with statutory guidelines.
                  </p>
                </div>

                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    Last updated on {activePolicy.lastUpdated} by Corporate Legal & HR Compliance Council.
                  </span>
                </div>
              </div>

              {/* Acknowledgement Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0 space-y-4">
                {activePolicy.acknowledged ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <FileCheck className="w-4 h-4" />
                      Policy acknowledged on {activePolicy.acknowledgedAt}
                    </div>
                    <button
                      onClick={() => setActiveReadingPolicyId(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={agreementChecked}
                        onChange={(e) => setAgreementChecked(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        I acknowledge that I have read, understood, and agree to abide by the terms set forth in the <strong>{activePolicy.title} ({activePolicy.version})</strong>.
                      </span>
                    </label>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setActiveReadingPolicyId(null)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!agreementChecked}
                        onClick={handleAcknowledge}
                        className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        I have read and agree
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
export default CompanyPoliciesPage
