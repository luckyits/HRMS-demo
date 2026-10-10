import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import type { HolidayEntry } from '@/mock/adminLeaves'
import {
  CalendarDays,
  Plus,
  Copy,
  Calendar,
  CheckCircle2,
  Building,
  Sparkles,
  Info,
  Clock,
  Trash2,
  X,
} from 'lucide-react'

export const HolidayProfileBuilderPage: React.FC = () => {
  const { holidayProfiles, copyHolidaysFromLastYear, addHolidayEntry } = useAdminLeaves()

  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    holidayProfiles[0]?.id || ''
  )
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Add form state
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('2026-11-15')
  const [holidayType, setHolidayType] = useState<'Mandatory' | 'Optional / Restricted'>('Mandatory')
  const [description, setDescription] = useState('')

  const selectedProfile =
    holidayProfiles.find((p) => p.id === selectedProfileId) || holidayProfiles[0]

  const handleCopy = () => {
    if (!selectedProfile) return
    copyHolidaysFromLastYear(selectedProfile.id)
    setToastMessage(`Holidays successfully copied from 2025 calendar for ${selectedProfile.name}!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault()
    if (!holidayName.trim() || !selectedProfile) return

    const d = new Date(holidayDate)
    const dayOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][d.getDay()]

    addHolidayEntry(selectedProfile.id, {
      name: holidayName.trim(),
      date: holidayDate,
      dayOfWeek,
      type: holidayType,
      description: description.trim() || undefined,
    })

    setShowAddModal(false)
    setHolidayName('')
    setDescription('')
    setToastMessage(`Added ${holidayName} to ${selectedProfile.name}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Calculate upcoming holidays
  const upcomingHolidays = selectedProfile.holidays
    .filter((h) => h.date >= '2026-10-09')
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Holiday Profile Builder & Statutory Calendar"
        subtitle="Manage branch-specific festival calendars, optional/floating holidays, and year-over-year cloning"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4 text-primary" />
              <span>Copy From Last Year (2025)</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          </div>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Holiday Tracker KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Mandatory Holidays
          </span>
          <div className="text-2xl font-bold text-foreground mt-1">
            {selectedProfile.totalMandatory} Days
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">All employees off</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Optional / Floating Pool
          </span>
          <div className="text-2xl font-bold text-primary mt-1">
            {selectedProfile.totalOptional} Days Pool
          </div>
          <span className="text-[11px] text-muted-foreground">
            Max {selectedProfile.maxOptionalAllowedPerEmployee} claimable per staff
          </span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Upcoming in 2026
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {upcomingHolidays.length} Remaining
          </div>
          <span className="text-[11px] text-muted-foreground">Next: {upcomingHolidays[0]?.name || 'None'}</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            Branch Coverage
          </span>
          <div className="text-lg font-bold text-foreground mt-1 truncate">
            {selectedProfile.applicableBranches.join(', ')}
          </div>
          <span className="text-[11px] text-muted-foreground">{selectedProfile.stateOrRegion}</span>
        </div>
      </div>

      {/* Profile Selector Tabs */}
      <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl">
        <Building className="w-4 h-4 text-muted-foreground ml-2" />
        <span className="text-xs font-bold text-foreground mr-2">Region Profile:</span>
        {holidayProfiles.map((prof) => (
          <button
            key={prof.id}
            onClick={() => setSelectedProfileId(prof.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              prof.id === selectedProfileId
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {prof.name}
          </button>
        ))}
      </div>

      {/* Holiday Schedule Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            {selectedProfile.name} ({selectedProfile.holidays.length} Holidays)
          </h4>
          <span className="text-xs text-muted-foreground font-mono">Calendar Year {selectedProfile.year}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3.5">Holiday Name</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Day of Week</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {selectedProfile.holidays.map((h) => {
                const isPast = h.date < '2026-10-09'
                const isMandatory = h.type === 'Mandatory'

                return (
                  <tr
                    key={h.id}
                    className={`hover:bg-muted/15 transition-colors ${
                      isPast ? 'opacity-60 bg-muted/5' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold text-foreground flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isMandatory ? 'bg-primary' : 'bg-purple-500'
                        }`}
                      />
                      <span>{h.name}</span>
                      {isPast && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          (Past)
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-foreground font-semibold">
                      {h.date}
                    </td>

                    <td className="p-3.5 text-muted-foreground font-medium">
                      {h.dayOfWeek}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isMandatory
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        }`}
                      >
                        {h.type}
                      </span>
                    </td>

                    <td className="p-3.5 text-muted-foreground text-xs">
                      {h.description || 'Statutory general holiday'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Add Holiday Entry</h4>
                <p className="text-xs text-muted-foreground">
                  Adding to {selectedProfile.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Holiday Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guru Nanak Jayanti"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Holiday Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={holidayDate}
                    onChange={(e) => setHolidayDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Holiday Type
                  </label>
                  <select
                    value={holidayType}
                    onChange={(e) => setHolidayType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                  >
                    <option value="Mandatory">Mandatory / Gazetted</option>
                    <option value="Optional / Restricted">Optional / Restricted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Description / Observance Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Regional festival background..."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
