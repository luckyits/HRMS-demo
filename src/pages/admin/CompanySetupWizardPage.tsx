import { FEATURE_MASTER } from '@/access/features'
import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { getCompanyTemplateToggles } from '@/mock/companies'
import { cn } from '@/lib/utils'
import type { CompanyType } from '@/types'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Factory,
  GraduationCap,
  HeartPulse,
  Laptop,
  Layers,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Wrench,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface IndustryArchetype {
  type: CompanyType
  title: string
  subtitle: string
  icon: any
  tagline: string
  defaultProfiles: string[]
  defaultShifts: string
  leaveScheme: string
  keyFeatures: string[]
  restrictedFeatures: string[]
}

const TEMPLATES: IndustryArchetype[] = [
  {
    type: 'IT',
    title: 'IT & Software Services',
    subtitle: 'Knowledge workers, product teams, hybrid & remote engineering staff',
    icon: Laptop,
    tagline: 'Timesheets, flexible punch windows, project hours & device allocations',
    defaultProfiles: ['Office Staff', 'Remote', 'Intern', 'Manager'],
    defaultShifts: 'Flexible General (8 hrs between 8 AM - 8 PM)',
    leaveScheme: 'Annual Paid Leaves + Unlimited Sick Days',
    keyFeatures: ['TIMESHEET', 'EXPENSE', 'SHIFT_ROSTER', 'VISIT', 'PAYSLIP'],
    restrictedFeatures: ['OVERTIME (Exempt for IT)'],
  },
  {
    type: 'Manufacturing',
    title: 'Manufacturing & Heavy Engineering',
    subtitle: 'Factories, assembly plants, shop-floor workers & supervisors',
    icon: Factory,
    tagline: 'Strict biometric gates, 3-shift rotational rosters, double OT calculations',
    defaultProfiles: ['Factory Worker', 'Office Staff', 'Manager', 'Contractor'],
    defaultShifts: '3-Shift 24x7 Rotational (Morning, Evening, Night)',
    leaveScheme: 'Factories Act 1948 Statutory Earned Leave Schedule',
    keyFeatures: ['PUNCH', 'SHIFT_ROSTER', 'OVERTIME', 'ATT_BONUS', 'FACE_SELFIE'],
    restrictedFeatures: ['VISIT (Disabled)', 'TIMESHEET (Disabled)'],
  },
  {
    type: 'Field Sales',
    title: 'Field Sales & FMCG Distribution',
    subtitle: 'Route sales reps, van delivery agents, territory sales managers',
    icon: Truck,
    tagline: 'Live GPS client visits, beat tracking, daily TA/DA travel expense vouchers',
    defaultProfiles: ['Field Sales', 'Manager', 'Office Staff'],
    defaultShifts: 'Daily Beat Target Completion',
    leaveScheme: 'Standard Sales Incentive Leave Quota',
    keyFeatures: ['VISIT', 'EXPENSE', 'INCENTIVE', 'FACE_SELFIE', 'PUNCH'],
    restrictedFeatures: ['TIMESHEET (Disabled)', 'SHIFT_ROSTER (Disabled)'],
  },
  {
    type: 'Retail',
    title: 'Retail Stores & Supermarkets',
    subtitle: 'Store managers, cashiers, shelf stockers, showroom staff',
    icon: ShoppingBag,
    tagline: 'Multi-outlet shifts, weekend peak duty comp-offs, late evening punch outs',
    defaultProfiles: ['Office Staff', 'Contractor', 'Manager'],
    defaultShifts: 'Mall Hours Shift (10:00 AM - 10:00 PM Split)',
    leaveScheme: 'Shops & Establishment Act Quota (Comp-off supported)',
    keyFeatures: ['SHIFT_ROSTER', 'OVERTIME', 'COMPOFF', 'PUNCH', 'PAYSLIP'],
    restrictedFeatures: ['VISIT (Disabled)'],
  },
  {
    type: 'Hospital',
    title: 'Hospital & Healthcare Facilities',
    subtitle: 'Doctors, nurses, technicians, ward attendants & paramedic staff',
    icon: HeartPulse,
    tagline: 'Continuous emergency rotational staffing, on-call standby allowances',
    defaultProfiles: ['Office Staff', 'Contractor', 'Manager'],
    defaultShifts: 'Continuous 24x7 Emergency Shifts (Rotational)',
    leaveScheme: 'Medical Essential Service Leave Quota',
    keyFeatures: ['SHIFT_ROSTER', 'OVERTIME', 'PUNCH', 'TIMESHEET', 'PAYSLIP'],
    restrictedFeatures: ['VISIT (Disabled)'],
  },
  {
    type: 'School',
    title: 'Schools & Educational Institutes',
    subtitle: 'Teachers, administrative staff, academic coordinators, lab assistants',
    icon: GraduationCap,
    tagline: 'Academic term calendars, summer/winter vacation schedules, exam shifts',
    defaultProfiles: ['Office Staff', 'Manager', 'Contractor'],
    defaultShifts: 'Academic Timetable (8:00 AM - 3:30 PM)',
    leaveScheme: 'Summer Vacation & Semester Breaks + Casual Leave',
    keyFeatures: ['CALENDAR', 'HOLIDAY', 'LEAVE', 'PAYSLIP', 'PUNCH'],
    restrictedFeatures: ['VISIT (Disabled)', 'OVERTIME (Disabled)'],
  },
  {
    type: 'Construction',
    title: 'Construction & Infrastructure',
    subtitle: 'Site engineers, heavy machinery operators, field safety inspectors',
    icon: Wrench,
    tagline: 'Site-based attendance, contractor crew rosters, safety certificates',
    defaultProfiles: ['Factory Worker', 'Field Sales', 'Contractor', 'Manager'],
    defaultShifts: 'Site Day Shift with Extended Overtime',
    leaveScheme: 'Statutory Construction Labor Quota',
    keyFeatures: ['PUNCH', 'OVERTIME', 'GEOFENCE', 'FACE_SELFIE', 'ASSET'],
    restrictedFeatures: ['TIMESHEET (Disabled)'],
  },
  {
    type: 'Logistics',
    title: 'Logistics, Fleet & Courier Hubs',
    subtitle: 'Hub supervisors, long-haul drivers, sorters, warehouse operators',
    icon: Package,
    tagline: 'Warehouse attendance, driver trip logging, night shift allowances',
    defaultProfiles: ['Field Sales', 'Factory Worker', 'Contractor', 'Manager'],
    defaultShifts: 'Hub Night Sort Shift & Dispatch Window',
    leaveScheme: 'Logistics Operations Regular Quota',
    keyFeatures: ['VISIT', 'EXPENSE', 'PUNCH', 'SHIFT_ROSTER', 'PAYSLIP'],
    restrictedFeatures: ['TIMESHEET (Disabled)'],
  },
  {
    type: 'Small Shop',
    title: 'Small Business / Shop (Essentials)',
    subtitle: 'Micro-enterprises, single retail shop, 5-15 employees',
    icon: Store,
    tagline: 'Essential punch, basic leave, monthly payslips. Zero unnecessary complexity.',
    defaultProfiles: ['Office Staff'],
    defaultShifts: 'Fixed Shop Hours (9:00 AM - 8:00 PM)',
    leaveScheme: '1 Day/Month Basic Leave Allowance',
    keyFeatures: ['PUNCH', 'LEAVE', 'HOLIDAY', 'PAYSLIP'],
    restrictedFeatures: ['All Advanced Modules (Timesheet, Visit, OT, Shifts Hidden)'],
  },
]

export const CompanySetupWizardPage: React.FC = () => {
  const navigate = useNavigate()
  const { activeCompany, applyIndustryTemplate } = useEmployees()

  const [selectedType, setSelectedType] = useState<CompanyType>(activeCompany.industry || 'IT')
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null)

  const activeTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.type === selectedType) || TEMPLATES[0]
  }, [selectedType])

  const featureToggles = useMemo(() => {
    return getCompanyTemplateToggles(selectedType)
  }, [selectedType])

  const handleApply = () => {
    applyIndustryTemplate(selectedType)
    setAppliedMessage(`Successfully applied "${activeTemplate.title}" industry template to the company!`)
    setTimeout(() => {
      setAppliedMessage(null)
    }, 4000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Company Setup Wizard & Industry Archetype Selector"
        subtitle="Select your operational business archetype to automatically configure company-level feature ceilings, shifts, and profile defaults."
      />

      {appliedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{appliedMessage}</span>
        </div>
      )}

      {/* Grid of 9 Templates */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Choose an Industry Archetype (9 Pre-Built Templates)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon
            const isSelected = selectedType === tmpl.type
            const isCurrentActive = activeCompany.industry === tmpl.type

            return (
              <div
                key={tmpl.type}
                onClick={() => setSelectedType(tmpl.type)}
                className={cn(
                  'p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between text-left space-y-3 relative',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                {isCurrentActive && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Active Demo
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl shrink-0 transition',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 pr-6">
                    <h4 className="font-bold text-sm text-foreground leading-snug">{tmpl.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{tmpl.subtitle}</p>
                  </div>
                </div>

                <p className="text-[11px] text-foreground/80 italic font-medium pt-2 border-t border-border/50">
                  "{tmpl.tagline}"
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side-by-side Live Preview Panel */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Template Preview: {activeTemplate.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Review what will be pre-loaded and configured into the active demo workspace.
              </p>
            </div>
          </div>

          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Template to Active Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pre-loaded Profiles */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-primary" /> Pre-Loaded Profile Archetypes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activeTemplate.defaultProfiles.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {p}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground pt-2">
              Employees assigned to this company will inherit access grants tailored for these operational profiles.
            </p>
          </div>

          {/* Shift & Leave Scheme */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Default Shifts & Leaves
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="text-muted-foreground">
                Shift: <strong className="text-foreground block">{activeTemplate.defaultShifts}</strong>
              </p>
              <p className="text-muted-foreground pt-1 border-t border-border/50">
                Leave Policy: <strong className="text-foreground block">{activeTemplate.leaveScheme}</strong>
              </p>
            </div>
          </div>

          {/* Ceilings & Feature Toggles */}
          <div className="p-4 rounded-xl border border-border bg-background space-y-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Company Ceiling Toggles
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Unlocked Modules:</span>
                <p className="text-muted-foreground">{activeTemplate.keyFeatures.join(', ')}</p>
              </div>
              <div className="pt-1 border-t border-border/50">
                <span className="text-[10px] text-rose-500 font-bold uppercase block">Ceiling Blocked / Hidden:</span>
                <p className="text-muted-foreground">{activeTemplate.restrictedFeatures.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
