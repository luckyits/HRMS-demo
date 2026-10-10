import { FEATURE_MASTER } from '@/access/features'
import { EMPLOYEE_TYPE_PROFILES } from '@/access/profiles'
import { PageHeader } from '@/components/common/PageHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  History,
  Laptop,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export const Employee360Page: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { employees, getEmployeeById, logSensitiveFieldReveal, activeCompany } = useEmployees()

  const [activeTab, setActiveTab] = useState<
    'overview' | 'job_history' | 'salary' | 'documents' | 'attendance' | 'assets' | 'features' | 'audit'
  >('overview')

  const employee = useMemo(() => {
    return getEmployeeById(id || '') || employees[0]
  }, [id, employees, getEmployeeById])

  if (!employee) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Employee record not found.</p>
        <Link to="/hr/employees" className="text-primary text-xs font-semibold hover:underline mt-2 inline-block">
          Return to Employee Directory
        </Link>
      </div>
    )
  }

  // Feature access breakdown for this employee
  const effectiveFeatures = useMemo(() => {
    const profileDefaults = EMPLOYEE_TYPE_PROFILES[employee.profileType]?.features || {}
    const companyToggles = activeCompany.featureToggles || {}
    const overrides = employee.featureOverrides || {}

    return FEATURE_MASTER.map((feat) => {
      // 1. Employee Override
      if (overrides[feat.code]) {
        return {
          ...feat,
          status: overrides[feat.code].state === 'Allow' ? 'Granted' : 'Denied',
          source: 'Employee Override',
        }
      }
      // 2. Company Ceiling
      if (companyToggles[feat.code] && companyToggles[feat.code].state === 'Deny') {
        return {
          ...feat,
          status: 'Disabled',
          source: 'Company Policy Ceiling',
        }
      }
      // 3. Profile
      const pGrant = profileDefaults[feat.code]
      if (pGrant === 'OFF') {
        return { ...feat, status: 'Disabled', source: `Profile (${employee.profileType})` }
      }
      if (pGrant === 'OPTIONAL') {
        return { ...feat, status: 'Optional', source: `Profile (${employee.profileType})` }
      }
      return { ...feat, status: 'Granted', source: `Profile (${employee.profileType})` }
    })
  }, [employee, activeCompany])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/hr/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to={`/hr/features/explainer?empId=${employee.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Trace Feature Access Engine</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-border shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                  {employee.id}
                </span>
                <StatusBadge status={employee.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {employee.designation} · <strong className="text-foreground">{employee.grade}</strong> · {employee.department}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-muted-foreground/70" />
                  {employee.branch}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                  {employee.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                  Joined: {employee.joiningDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Manager & CTC Metric Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs w-full md:w-auto">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Reporting Manager</span>
              <p className="font-medium text-foreground">{employee.reportingManagerName || 'Executive Committee'}</p>
            </div>
            <div className="h-8 w-px bg-border hidden sm:block" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Annual Compensation</span>
              <SensitiveField
                value={employee.ctc}
                onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'CTC')}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none pt-2">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'job_history', label: 'Job History', icon: History },
            { key: 'salary', label: 'Salary & Bank', icon: CreditCard },
            { key: 'documents', label: 'Documents', icon: FileText, count: employee.documents?.length },
            { key: 'attendance', label: 'Attendance & Leaves', icon: Clock },
            { key: 'assets', label: 'Assigned Assets', icon: Laptop, count: employee.assets?.length },
            { key: 'features', label: 'Feature Access', icon: Sparkles },
            { key: 'audit', label: 'Audit Trail', icon: FileCheck },
          ].map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={cn(
                  'inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition -mb-px',
                  isActive
                    ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground">
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs min-h-[350px]">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Demographics Card */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Contact & Personal Details
                </h3>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Mobile Phone:</span>
                    <span className="font-medium text-foreground">{employee.phone || '+91 98450 11223'}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Work Email:</span>
                    <span className="font-mono text-foreground">{employee.email}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span className="text-foreground">{employee.dateOfBirth || '1994-08-12'}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="text-foreground">{employee.gender || 'Not specified'}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Blood Group:</span>
                    <span className="font-semibold text-rose-500">
                      {employee.customFieldValues?.blood_group || 'O+'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Employment Profile Card */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-primary" /> Corporate Placement
                </h3>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Profile Archetype:</span>
                    <span className="font-bold text-primary">{employee.profileType}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Grade Level:</span>
                    <span className="font-medium text-foreground">{employee.grade}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="text-foreground">{employee.department}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Branch HQ:</span>
                    <span className="text-foreground">{employee.branch}</span>
                  </div>
                  <div className="pt-1.5 flex justify-between">
                    <span className="text-muted-foreground">Notice Period:</span>
                    <span className="text-foreground">{employee.noticePeriodDays || 60} Days</span>
                  </div>
                </div>
              </div>

              {/* Reporting Hierarchy Card */}
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Reporting Structure
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      M
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{employee.reportingManagerName || 'Sarah Jenkins'}</p>
                      <p className="text-[10px] text-muted-foreground">Direct Supervisor</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-card flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      HR
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Sarah Jenkins</p>
                      <p className="text-[10px] text-muted-foreground">HR Business Partner Lead</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Job History */}
        {activeTab === 'job_history' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Effective-Dated Employment History</h3>
                <p className="text-xs text-muted-foreground">
                  Complete chronological trace of hiring, department transfers, title promotions, and salary revisions.
                </p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {(employee.jobHistory || []).map((entry, idx) => (
                <div key={entry.id || idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary" />
                  <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {entry.changeType}
                      </span>
                      <span className="text-muted-foreground font-mono">{entry.effectiveDate}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground mt-1">{entry.newValue}</p>
                    {entry.reason && (
                      <p className="text-xs text-muted-foreground">Reason: {entry.reason}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      Approved By: {entry.approvedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Salary */}
        {activeTab === 'salary' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                Sensitive Salary & Statutory Information. Click on the eye icon to unmask values (all reveals are logged).
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Compensation Breakdown (CTC)
                </h3>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Annual CTC:</span>
                    <SensitiveField
                      value={employee.ctc}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'CTC')}
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Basic Pay:</span>
                    <SensitiveField
                      value={employee.basicSalary || '₹ 9,00,000'}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'Basic Pay')}
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">HRA (House Rent Allowance):</span>
                    <SensitiveField
                      value={employee.hra || '₹ 4,50,000'}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'HRA')}
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Special Allowances:</span>
                    <SensitiveField
                      value={employee.allowances || '₹ 4,50,000'}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'Special Allowance')}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Banking & Tax Identity
                </h3>
                <div className="space-y-2 text-xs divide-y divide-border/60">
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-medium text-foreground">{employee.bankName || 'HDFC Bank Ltd'}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Account Number:</span>
                    <SensitiveField
                      value={employee.bankAccountNumber || '50100450001'}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'Bank Account')}
                    />
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="font-mono text-foreground">{employee.ifscCode || 'HDFC0001234'}</span>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-muted-foreground">Income Tax PAN:</span>
                    <SensitiveField
                      value={employee.panNumber || 'ABCDE1234F'}
                      onReveal={() => logSensitiveFieldReveal(employee.id, employee.name, 'PAN Number')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Verified Document Vault</h3>
                <p className="text-xs text-muted-foreground">
                  Statutory compliance, degree certificates, and identity cards.
                </p>
              </div>
              <Link
                to="/hr/organization/documents-queue"
                className="text-xs text-primary font-semibold hover:underline"
              >
                Go to Verification Queue &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(employee.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{doc.docType}</p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">
                        {doc.fileName} ({doc.fileSize})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        doc.status === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : doc.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      )}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground">Monthly Attendance & Leave Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs text-muted-foreground font-medium">Present Days (Current Month)</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">21 / 22</p>
                <span className="text-[10px] text-muted-foreground">95.4% Attendance</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs text-muted-foreground font-medium">Leave Balance (Earned / Casual)</p>
                <p className="text-2xl font-bold text-primary mt-1">14.5 Days</p>
                <span className="text-[10px] text-muted-foreground">Quotas active</span>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background text-center">
                <p className="text-xs text-muted-foreground font-medium">Missed Punches / Regularizations</p>
                <p className="text-2xl font-bold text-foreground mt-1">0</p>
                <span className="text-[10px] text-muted-foreground">Clean punch record</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Assets */}
        {activeTab === 'assets' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground">Assigned Corporate Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(employee.assets || []).map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 rounded-xl border border-border bg-background flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{asset.assetName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">S/N: {asset.serialNumber}</p>
                      <span className="text-[10px] text-muted-foreground">Allocated: {asset.allocatedDate}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                    {asset.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Features */}
        {activeTab === 'features' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Effective Granted Capabilities</h3>
                <p className="text-xs text-muted-foreground">
                  Features unlocked by profile ({employee.profileType}) + company policies.
                </p>
              </div>
              <Link
                to={`/hr/features/explainer?empId=${employee.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <span>Full Access Explainer Trace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {effectiveFeatures.map((f) => {
                const isGranted = f.status === 'Granted'
                return (
                  <div
                    key={f.code}
                    className={cn(
                      'p-2.5 rounded-lg border text-xs flex flex-col justify-between transition',
                      isGranted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-muted/20 opacity-60'
                    )}
                  >
                    <div>
                      <p className="font-semibold text-foreground truncate">{f.name}</p>
                      <span className="text-[10px] text-muted-foreground">{f.module}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2 text-[10px]">
                      <span className="text-muted-foreground truncate">{f.source}</span>
                      <strong className={isGranted ? 'text-emerald-600' : 'text-muted-foreground'}>
                        {f.status}
                      </strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 8: Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground">Access & Profile Audit Log</h3>
            <div className="border border-border rounded-xl divide-y divide-border text-xs">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Employee Enrolled in System</p>
                  <p className="text-[11px] text-muted-foreground">By Sarah Jenkins (HR Admin)</p>
                </div>
                <span className="font-mono text-muted-foreground">{employee.joiningDate} 10:00 AM</span>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Document Verified (Aadhaar Card)</p>
                  <p className="text-[11px] text-muted-foreground">Statutory KYC completed</p>
                </div>
                <span className="font-mono text-muted-foreground">{employee.joiningDate} 11:30 AM</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
