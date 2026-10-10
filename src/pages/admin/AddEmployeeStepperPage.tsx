import { FEATURE_MASTER } from '@/access/features'
import { EMPLOYEE_TYPE_PROFILES } from '@/access/profiles'
import { PageHeader } from '@/components/common/PageHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import type { EmployeeType } from '@/types'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const STEPS = [
  { id: 1, title: 'Personal', icon: User, desc: 'Contact & demographics' },
  { id: 2, title: 'Job & Role', icon: Briefcase, desc: 'Org placement & profile' },
  { id: 3, title: 'Salary & Bank', icon: CreditCard, desc: 'CTC & payout info' },
  { id: 4, title: 'Documents', icon: FileText, desc: 'KYC & compliance' },
  { id: 5, title: 'Policies', icon: ShieldCheck, desc: 'Attendance & leave rules' },
  { id: 6, title: 'Review & Features', icon: Sparkles, desc: 'Live access preview' },
]

export const AddEmployeeStepperPage: React.FC = () => {
  const navigate = useNavigate()
  const { masterData, addEmployee, activeCompany } = useEmployees()

  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: 'Arjun',
    lastName: 'Singhania',
    email: 'arjun.s@apex.internal',
    phone: '+91 98450 11223',
    dateOfBirth: '1995-06-20',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    emergencyContact: '+91 98450 99887 (Father)',

    // Step 2: Job
    entityId: masterData.entities[0]?.id || 'ENT-001',
    branch: masterData.branches[0]?.name || 'Bengaluru HQ',
    department: masterData.departments[0]?.name || 'Engineering',
    designation: 'Senior Product Specialist',
    grade: 'L4',
    reportingManagerName: 'Vikram Malhotra',
    profileType: 'Office Staff' as EmployeeType,
    addonProfiles: [] as EmployeeType[],
    joiningDate: new Date().toISOString().split('T')[0],

    // Step 3: Salary & Bank
    ctc: '₹ 16,50,000',
    basicSalary: '₹ 8,25,000',
    hra: '₹ 4,12,500',
    allowances: '₹ 4,12,500',
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '5010049281726',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCDE9876K',

    // Step 4: Documents
    idProofUploaded: true,
    educationUploaded: true,
    medicalUploaded: false,

    // Step 5: Policies
    attendancePolicy: 'Standard Flexible (9 hrs between 8 AM - 8 PM)',
    workingCalendar: 'Standard IT 5-Day (Mon-Fri)',
    shiftAssignment: 'General Shift (9:30 AM - 6:30 PM)',
    leavePolicy: 'Apex Standard Quota (18 Earned, 12 Casual/Sick)',
  })

  // Calculate live features preview based on selected profileType and add-ons
  const previewFeatures = useMemo(() => {
    const profileRules = EMPLOYEE_TYPE_PROFILES[formData.profileType]?.features || {}
    const companyToggles = activeCompany.featureToggles || {}

    return FEATURE_MASTER.map((feat) => {
      // Check company ceiling
      const companyGrant = companyToggles[feat.code]
      if (companyGrant && companyGrant.state === 'Deny') {
        return { ...feat, effective: 'Disabled (Company Policy)' }
      }

      // Check profile default
      const profileGrant = profileRules[feat.code]
      if (profileGrant === 'OFF') {
        return { ...feat, effective: 'OFF' }
      }
      if (profileGrant === 'OPTIONAL') {
        return { ...feat, effective: 'Optional' }
      }
      return { ...feat, effective: 'Enabled' }
    })
  }, [formData.profileType, activeCompany])

  const enabledCount = previewFeatures.filter((f) => f.effective === 'Enabled').length

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    const newEmp = addEmployee({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      branch: formData.branch,
      department: formData.department,
      designation: formData.designation,
      grade: formData.grade,
      reportingManagerName: formData.reportingManagerName,
      profileType: formData.profileType,
      addonProfiles: formData.addonProfiles,
      joiningDate: formData.joiningDate,
      ctc: formData.ctc,
      basicSalary: formData.basicSalary,
      hra: formData.hra,
      allowances: formData.allowances,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      ifscCode: formData.ifscCode,
      panNumber: formData.panNumber,
      status: 'Probation',
    })

    navigate(`/hr/employees/${newEmp.id}`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link
          to="/hr/employees"
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Add New Employee</h1>
          <p className="text-xs text-muted-foreground">
            Complete the 6-step onboarding wizard. Effective access permissions are calculated automatically.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon
            const isDone = s.id < currentStep
            const isCurrent = s.id === currentStep

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={cn(
                  'flex items-center gap-2.5 p-2 rounded-lg text-left transition border',
                  isCurrent
                    ? 'border-primary bg-primary/10 text-primary'
                    : isDone
                    ? 'border-border/60 bg-muted/40 text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/20'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6 min-h-[380px]">
        {/* Step 1: Personal */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <User className="w-4 h-4 text-primary" /> Personal & Demographic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Work Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile Number *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Job & Role */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Briefcase className="w-4 h-4 text-primary" /> Job Assignment & Access Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Branch / Location *</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {masterData.branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {masterData.departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Designation Title *</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Grade Level</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {masterData.grades.map((g) => (
                    <option key={g.id} value={g.grade}>
                      {g.grade} - {g.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Reporting Manager *</label>
                <input
                  type="text"
                  value={formData.reportingManagerName}
                  onChange={(e) => setFormData({ ...formData, reportingManagerName: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Joining Date *</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-muted/30 border border-border rounded-xl space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Primary Profile Archetype (Governs Default Feature Grants) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    ['Office Staff', 'Field Sales', 'Factory Worker', 'Remote', 'Intern', 'Contractor', 'Manager'] as EmployeeType[]
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, profileType: p })}
                      className={cn(
                        'p-2 text-xs font-semibold rounded-lg border text-center transition',
                        formData.profileType === p
                          ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Salary & Bank */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <CreditCard className="w-4 h-4 text-primary" /> Compensation & Statutory Bank Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Annual CTC (Cost to Company)</label>
                <input
                  type="text"
                  value={formData.ctc}
                  onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Basic Salary (50%)</label>
                <input
                  type="text"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full text-sm font-mono px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Bank Account Number (Masked)</label>
                <div className="p-2 border border-input rounded-lg bg-background flex items-center justify-between">
                  <SensitiveField value={formData.bankAccountNumber} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">PAN Number (Masked)</label>
                <div className="p-2 border border-input rounded-lg bg-background flex items-center justify-between">
                  <SensitiveField value={formData.panNumber} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <FileText className="w-4 h-4 text-primary" /> Compliance & Verification Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-xl bg-card space-y-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">National Identity Proof (Aadhaar / SSN)</p>
                  <p className="text-[11px] text-muted-foreground">Mandatory for statutory compliance</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, idProofUploaded: !formData.idProofUploaded })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg border transition',
                    formData.idProofUploaded ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-muted text-foreground'
                  )}
                >
                  {formData.idProofUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>

              <div className="p-4 border border-border rounded-xl bg-card space-y-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-foreground">Highest Degree Certificate</p>
                  <p className="text-[11px] text-muted-foreground">Convocation or provisional marksheet</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, educationUploaded: !formData.educationUploaded })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg border transition',
                    formData.educationUploaded ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-muted text-foreground'
                  )}
                >
                  {formData.educationUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>

              <div className="p-4 border border-border rounded-xl bg-card space-y-2 flex items-center justify-between sm:col-span-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Medical Fitness & Insurance Form</p>
                  <p className="text-[11px] text-muted-foreground">Optional, can be completed during induction</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, medicalUploaded: !formData.medicalUploaded })}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg border transition',
                    formData.medicalUploaded ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-muted text-foreground'
                  )}
                >
                  {formData.medicalUploaded ? 'Uploaded ✓' : 'Upload File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Policies */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Policies & Schedule Assignments
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Attendance & Punctuality Policy</label>
                <select
                  value={formData.attendancePolicy}
                  onChange={(e) => setFormData({ ...formData, attendancePolicy: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option>Standard Flexible (9 hrs between 8 AM - 8 PM)</option>
                  <option>Strict Biometric Fixed Shift (Grace 15 mins)</option>
                  <option>Plant 3-Shift Rotational Schedule</option>
                  <option>Field Beat Daily Target (No fixed punch)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Working Calendar</label>
                <select
                  value={formData.workingCalendar}
                  onChange={(e) => setFormData({ ...formData, workingCalendar: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {masterData.workingCalendars.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Leave Quota Plan</label>
                <select
                  value={formData.leavePolicy}
                  onChange={(e) => setFormData({ ...formData, leavePolicy: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option>Apex Standard Quota (18 Earned, 12 Casual/Sick)</option>
                  <option>Factory Worker Statutory Quota (Factories Act)</option>
                  <option>Intern Fixed Stipend Quota (1 Day/Month)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Shift Roster</label>
                <input
                  type="text"
                  value={formData.shiftAssignment}
                  onChange={(e) => setFormData({ ...formData, shiftAssignment: e.target.value })}
                  className="w-full text-sm px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Live Feature Preview */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Live Feature Access Preview
                </h3>
                <p className="text-xs text-muted-foreground">
                  Computed via the access engine based on Profile ({formData.profileType}) and Company ceilings.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {enabledCount} Features Granted
              </span>
            </div>

            {/* Employee Summary Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Employee:</span>
                <strong className="text-foreground">{formData.firstName} {formData.lastName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Designation:</span>
                <strong className="text-foreground">{formData.designation} ({formData.grade})</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Department / Branch:</span>
                <strong className="text-foreground">{formData.department} · {formData.branch}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Profile Archetype:</span>
                <strong className="text-primary">{formData.profileType}</strong>
              </div>
            </div>

            {/* Dynamic Features Grid */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Generated Module Access Permissions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                {previewFeatures.map((f) => {
                  const isEnabled = f.effective === 'Enabled'
                  const isOptional = f.effective === 'Optional'
                  return (
                    <div
                      key={f.code}
                      className={cn(
                        'p-2.5 rounded-lg border text-xs flex items-center justify-between transition',
                        isEnabled
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-foreground'
                          : isOptional
                          ? 'border-amber-500/30 bg-amber-500/5 text-muted-foreground'
                          : 'border-border bg-muted/20 text-muted-foreground/60'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold truncate">{f.name}</p>
                        <span className="text-[10px] text-muted-foreground truncate block">{f.module}</span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                          isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isOptional
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {f.effective}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-border transition',
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-card hover:bg-muted text-foreground'
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
            >
              <span>Continue to {STEPS[currentStep].title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Enroll Employee</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
