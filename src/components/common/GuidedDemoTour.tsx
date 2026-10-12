import React, { useState, useEffect } from 'react'
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Inbox,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'

export interface TourStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  targetRoute?: string
  role?: string
  badgeText: string
  highlightTips: string[]
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'personas',
    title: 'Workforce Personas & Adaptive Layout',
    subtitle: '7 Profiles × 9 Industry Templates',
    description:
      'Universal HRMS dynamically morphs its navigation, tabs, and feature access based on the logged-in role, industry template, and workforce profile.',
    icon: Users,
    targetRoute: '/employee/dashboard',
    badgeText: 'Dynamic Access Matrix',
    highlightTips: [
      'Switch persona anytime via the Top Bar or More screen',
      'Bottom navigation automatically tailors to role permissions',
      'Desktop-only heavy administration pages show friendly mobile guidance',
    ],
  },
  {
    id: 'punch-clock',
    title: 'Mobile Geofence & Punch Clock',
    subtitle: 'Biometric, GPS & Selfie Verification',
    description:
      'Employees can punch in or out in 1 tap. Inside-geofence checks and offline queueing keep compliance intact even without immediate network.',
    icon: Clock,
    targetRoute: '/employee/attendance',
    badgeText: 'Location & Biometrics',
    highlightTips: [
      'Auto-detects branch geofence boundary & GPS coordinates',
      'Flags suspicious punches if spoofing or location jump is detected',
      'Supports shift rosters and regularization in 1 tap',
    ],
  },
  {
    id: 'approvals',
    title: 'Swipeable Approvals Inbox',
    subtitle: 'Lightning-fast Manager & HR Workflows',
    description:
      'Review pending leaves, expense claims, advance requests, and overtime on the go with swipe gestures or one-click bulk approvals.',
    icon: Inbox,
    targetRoute: '/manager/approvals',
    role: 'Manager',
    badgeText: 'Swipe Gestures',
    highlightTips: [
      'Swipe right to Approve, swipe left to Reject',
      'Shows requester timeline and impact on team balances',
      'HR Admin approval scope spans cross-department requests',
    ],
  },
  {
    id: 'industry-features',
    title: 'Field Sales & Industry Modules',
    subtitle: 'Visits, Overtime & Expense Claims',
    description:
      'Specialized frontline capabilities: Field visit beat plans with client fences, factory overtime calculators, and multi-currency expense claims.',
    icon: MapPin,
    targetRoute: '/employee/visits',
    badgeText: 'Frontline Ready',
    highlightTips: [
      'Field Sales: Client visits with photo check-in and distance logging',
      'Manufacturing: Pre-approved OT & attendance bonus progress bars',
      'Finance: Camera receipt scan and multi-currency conversion',
    ],
  },
  {
    id: 'offline-pwa',
    title: 'Offline-First Queue & PWA App',
    subtitle: 'Zero Data Loss on Weak Connections',
    description:
      'When offline, all punches, visits, and requests are safely queued with idempotency keys. Once reconnected, 1-tap sync pushes all data.',
    icon: Zap,
    targetRoute: '/mobile/more',
    badgeText: 'Offline Cache',
    highlightTips: [
      'Toggle Offline Mode from the switcher or status bar',
      'Pending Sync badge displays unsent queue items',
      'App Lock with 4-digit PIN for device security',
    ],
  },
  {
    id: 'hr-command',
    title: 'HR Mobile Command Center',
    subtitle: 'Headcount Radar & Live Governance',
    description:
      'HR Leaders get quick headcount metrics, live attendance by branch, suspicious punch audits, and instant temporary feature grants.',
    icon: ShieldCheck,
    targetRoute: '/hr/dashboard',
    role: 'HR Admin',
    badgeText: 'Executive Governance',
    highlightTips: [
      'Live branch headcount and presence breakdown',
      'Suspicious punch review with explanation requests',
      'Audit log and temporary feature access overrides',
    ],
  },
]

export const GuidedDemoTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const navigate = useNavigate()
  const { setRole } = useDemo()

  // Listen for custom trigger event
  useEffect(() => {
    const handleStart = (e?: Event) => {
      const stepIdx = (e as CustomEvent)?.detail?.stepIndex ?? 0
      setCurrentStepIndex(stepIdx)
      setIsOpen(true)
    }

    window.addEventListener('start-demo-tour', handleStart)
    return () => window.removeEventListener('start-demo-tour', handleStart)
  }, [])

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStepIndex]
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === TOUR_STEPS.length - 1
  const StepIcon = step.icon

  const handleNext = () => {
    if (isLast) {
      setIsOpen(false)
      return
    }
    const nextIdx = currentStepIndex + 1
    setCurrentStepIndex(nextIdx)
    const nextStep = TOUR_STEPS[nextIdx]
    if (nextStep.role) {
      setRole(nextStep.role as any)
    }
    if (nextStep.targetRoute) {
      navigate(nextStep.targetRoute)
    }
  }

  const handlePrev = () => {
    if (isFirst) return
    const prevIdx = currentStepIndex - 1
    setCurrentStepIndex(prevIdx)
    const prevStep = TOUR_STEPS[prevIdx]
    if (prevStep.role) {
      setRole(prevStep.role as any)
    }
    if (prevStep.targetRoute) {
      navigate(prevStep.targetRoute)
    }
  }

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index)
    const targetStep = TOUR_STEPS[index]
    if (targetStep.role) {
      setRole(targetStep.role as any)
    }
    if (targetStep.targetRoute) {
      navigate(targetStep.targetRoute)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guided Demo Tour"
      className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none p-3 sm:p-4"
    >
      {/* Semi-transparent Backdrop with pointer events */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Guided Tour Card - strictly constrained to fit within 360px-430px mobile viewports */}
      <div className="relative pointer-events-auto w-full max-w-md mx-auto bg-card text-foreground rounded-3xl border border-border shadow-2xl overflow-hidden mb-16 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Top Header Pill Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate">
              Mobile Tour • Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Tour"
            className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all tap-target-48"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-block px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                {step.badgeText}
              </div>
              <h3 className="text-base font-bold text-foreground leading-snug break-words">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {step.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
            {step.description}
          </p>

          {/* Highlights checklist */}
          <div className="bg-muted/40 rounded-2xl p-3 border border-border/50 space-y-2">
            <p className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Key Mobile Capabilities:
            </p>
            <ul className="space-y-1.5">
              {step.highlightTips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[11px] sm:text-xs text-muted-foreground leading-tight"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="break-words">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Step dots navigation */}
        <div className="flex items-center justify-center gap-1.5 py-1 bg-muted/20">
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleJumpToStep(i)}
              aria-label={`Go to step ${i + 1}`}
              className={`h-1.5 rounded-full transition-all tap-target-48 min-w-[24px] flex items-center justify-center ${
                i === currentStepIndex
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
              }`}
            >
              <span className="sr-only">Step {i + 1}</span>
            </button>
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-2 p-3 bg-card border-t border-border">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirst}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all tap-target-48 ${
              isFirst
                ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                : 'text-foreground hover:bg-muted active:scale-95'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all tap-target-48"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all shadow-md flex items-center gap-1.5 tap-target-48"
            >
              <span>{isLast ? 'Complete Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
