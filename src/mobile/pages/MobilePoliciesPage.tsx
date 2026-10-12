import React, { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'
import type { PolicyDocument } from '@/mock/essData'

export const MobilePoliciesPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { policies, acknowledgePolicy } = useEss()
  const { showToast } = useToast()

  const [activePolicy, setActivePolicy] = useState<PolicyDocument | null>(null)

  const handleAcknowledge = (id: string) => {
    acknowledgePolicy(id)
    showToast('Policy terms acknowledged and recorded in statutory compliance register!', 'success')
    // Update local active policy state to reflect immediately
    setActivePolicy((prev) => (prev ? { ...prev, acknowledged: true, acknowledgedAt: 'Just now' } : null))
  }

  if (!hasFeature('POLICIES')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Company policies library is disabled for your workforce profile.
      </div>
    )
  }

  // Full-screen readable document view
  if (activePolicy) {
    return (
      <div className="flex flex-col min-h-screen pb-24 bg-background">
        {/* Full-screen Reader Header */}
        <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePolicy(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Policies</span>
          </button>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {activePolicy.version}
          </span>
        </div>

        {/* Document Content */}
        <div className="p-5 space-y-4 max-w-xl mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              {activePolicy.category}
            </span>
            <h1 className="text-xl font-black text-foreground mt-1">
              {activePolicy.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Last revised: {activePolicy.lastUpdated} • Version {activePolicy.version}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
            Rules are for internal governance; compliance is tracked under DPDP and labour code audit regulations.
          </div>

          <div className="prose prose-sm dark:prose-invert space-y-3 text-xs leading-relaxed text-foreground/90">
            <h3 className="text-sm font-bold text-foreground">1. Executive Summary & Purpose</h3>
            <p>{activePolicy.summary}</p>

            <h3 className="text-sm font-bold text-foreground">2. Operating Guidelines & Code</h3>
            <p>{activePolicy.fullContent}</p>

            <h3 className="text-sm font-bold text-foreground">3. Breach & Disciplinary Actions</h3>
            <p>
              Non-compliance with established policy norms will be subject to progressive review by the designated Internal Committee and Ethics Desk, in conformity with corporate governance bylaws.
            </p>
          </div>
        </div>

        {/* Sticky Acknowledgement Bar */}
        <StickyActionBar>
          {activePolicy.acknowledged ? (
            <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Acknowledged on {activePolicy.acknowledgedAt || 'Oct 2026'}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleAcknowledge(activePolicy.id)}
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Read, Understood & Agree</span>
            </button>
          )}
        </StickyActionBar>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Company Policies"
        subtitle="Internal standards & regulatory code"
        showBack={true}
      />

      <div className="p-4 space-y-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            onClick={() => setActivePolicy(policy)}
            className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {policy.version}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {policy.category}
                </span>
              </div>

              {policy.acknowledged ? (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Acknowledged</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-foreground">
                {policy.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {policy.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
              <span>Updated: {policy.lastUpdated}</span>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span>Read Document</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
