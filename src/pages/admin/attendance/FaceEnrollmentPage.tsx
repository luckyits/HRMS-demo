import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { FaceEnrollmentRecord } from '@/mock/adminAttendance'
import {
  ScanFace,
  CheckCircle2,
  Clock,
  ShieldAlert,
  RotateCw,
  Settings,
  Search,
  Filter,
  KeyRound,
  QrCode,
  ShieldCheck,
  X,
  Lock,
} from 'lucide-react'

export const FaceEnrollmentPage: React.FC = () => {
  const { faceEnrollments, triggerReEnroll, updateFallbackMethod } = useAdminAttendance()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedRecordForFallback, setSelectedRecordForFallback] =
    useState<FaceEnrollmentRecord | null>(null)
  const [newFallback, setNewFallback] =
    useState<FaceEnrollmentRecord['fallbackMethod']>('Supervisor PIN')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredRecords = faceEnrollments.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const enrolledCount = faceEnrollments.filter((r) => r.status === 'Enrolled').length
  const pendingCount = faceEnrollments.filter((r) => r.status === 'Pending').length
  const withdrawnCount = faceEnrollments.filter((r) => r.status === 'Consent Withdrawn').length

  const handleReEnroll = (id: string, name: string) => {
    triggerReEnroll(id)
    setToastMessage(`Re-enrollment session dispatched to ${name}'s device.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSaveFallback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecordForFallback) return
    updateFallbackMethod(selectedRecordForFallback.id, newFallback)
    setSelectedRecordForFallback(null)
    setToastMessage(`Fallback authentication updated to ${newFallback}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Facial Biometric & Enrollment Governance"
        subtitle="Manage employee 3D facial vectors, consent withdrawal opt-outs, and fallback punch methods"
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-emerald-500/20 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
              Enrolled & Verified
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">{enrolledCount} Staff</div>
            <span className="text-[11px] text-muted-foreground">3D Vector Mesh Active</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <ScanFace className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-amber-500/20 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
              Pending Enrollment
            </span>
            <div className="text-2xl font-bold text-foreground mt-1">{pendingCount} Staff</div>
            <span className="text-[11px] text-muted-foreground">Awaiting selfie onboarding</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-rose-500/20 p-4 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase">
              Consent Withdrawn (Opt-Out)
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {withdrawnCount} Staff
            </div>
            <span className="text-[11px] text-muted-foreground">Routing through fallback method</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employee, ID, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1">
            {['All', 'Enrolled', 'Pending', 'Consent Withdrawn'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Enrollment Status</th>
                <th className="p-3.5 text-center">Quality Score</th>
                <th className="p-3.5">Consent & Date</th>
                <th className="p-3.5">Active Fallback Method</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((r) => {
                return (
                  <tr key={r.id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={r.avatar}
                        alt={r.employeeName}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-foreground">{r.employeeName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {r.employeeId} &bull; {r.department} &bull; {r.branch}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {r.status === 'Enrolled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Enrolled
                        </span>
                      )}
                      {r.status === 'Pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Capture
                        </span>
                      )}
                      {r.status === 'Consent Withdrawn' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Opted Out
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {r.qualityScore ? (
                        <div className="inline-flex items-center gap-1 font-bold text-foreground">
                          <span>{r.qualityScore}%</span>
                          <span className="text-[10px] text-emerald-600 font-normal">Optimal</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="text-foreground font-medium">
                        {r.consentDate || 'Pending Consent'}
                      </div>
                      {r.notes && <div className="text-[10px] text-muted-foreground">{r.notes}</div>}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {r.fallbackMethod === 'Supervisor PIN' && (
                          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        {r.fallbackMethod === 'QR Code' && (
                          <QrCode className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        {r.fallbackMethod === 'Kiosk Passcode' && (
                          <Lock className="w-3.5 h-3.5 text-purple-500" />
                        )}
                        <span className="font-semibold text-foreground">{r.fallbackMethod}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRecordForFallback(r)
                            setNewFallback(r.fallbackMethod)
                          }}
                          className="px-2.5 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1"
                          title="Configure Fallback Method"
                        >
                          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Fallback</span>
                        </button>

                        <button
                          onClick={() => handleReEnroll(r.id, r.employeeName)}
                          className="px-2.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors flex items-center gap-1"
                          title="Trigger Face Re-enrollment"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Re-enroll</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fallback Configuration Modal */}
      {selectedRecordForFallback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedRecordForFallback(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Configure Fallback Method</h4>
                <p className="text-xs text-muted-foreground">
                  Employee: {selectedRecordForFallback.employeeName}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFallback} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                When face biometric recognition fails or if consent is withdrawn, the employee may authenticate punches using one of the following compliant methods:
              </p>

              <div className="space-y-2">
                {(['Supervisor PIN', 'QR Code', 'Kiosk Passcode', 'None'] as FaceEnrollmentRecord['fallbackMethod'][]).map(
                  (method) => {
                    const isSelected = newFallback === method
                    return (
                      <label
                        key={method}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary ring-1 ring-primary'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="fallbackOption"
                            checked={isSelected}
                            onChange={() => setNewFallback(method)}
                            className="accent-primary"
                          />
                          <span className="text-xs font-bold text-foreground">{method}</span>
                        </div>
                      </label>
                    )
                  }
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForFallback(null)}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
                >
                  Update Fallback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
