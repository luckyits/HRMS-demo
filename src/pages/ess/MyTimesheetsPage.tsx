import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Clock,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useOptionalModules, WeeklyTimesheetEntry } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'

export const MyTimesheetsPage: React.FC = () => {
  const { projects, weeklyTimesheets, submitWeeklyTimesheet } = useOptionalModules()
  const { showToast } = useToast()

  const [selectedWeek, setSelectedWeek] = useState('2026-10-05')
  const [selectedProject, setSelectedProject] = useState(projects[0]?.projectName || 'Cloud Architecture Modernization')
  const [selectedTask, setSelectedTask] = useState('API Gateway Design')
  const [isBillable, setIsBillable] = useState(true)

  const [hours, setHours] = useState({
    mon: 8,
    tue: 8,
    wed: 7.5,
    thu: 8,
    fri: 8.5,
    sat: 0,
    sun: 0,
  })

  const totalWeeklyHours = Object.values(hours).reduce((a, b) => a + b, 0)

  const handleSubmitTimesheet = (e: React.FormEvent) => {
    e.preventDefault()
    if (totalWeeklyHours === 0) {
      showToast('Cannot submit a timesheet with 0 total hours', 'warning')
      return
    }

    submitWeeklyTimesheet({
      employeeId: 'EMP-101',
      employeeName: 'Aarav Sharma',
      weekStartDate: selectedWeek,
      projectName: selectedProject,
      taskName: selectedTask,
      isBillable: isBillable,
      dailyHours: hours,
      status: 'Submitted',
    })

    showToast(`Timesheet for week ${selectedWeek} (${totalWeeklyHours} hrs) submitted to manager for approval!`, 'success')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                My Timesheets & Client Hours
              </h1>
              <p className="text-sm text-muted-foreground">
                Log weekly project hours, billable time, and submit for client invoice signoff
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/40 border border-border px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Week: Oct 05 – Oct 11, 2026</span>
          </div>
        </div>
      </div>

      {/* Grid: Form on Left, History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Timesheet Form */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Weekly Time Entry Grid</h2>
              <p className="text-xs text-muted-foreground">Log hours against assigned client projects</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Total Hours</span>
              <span className="text-2xl font-black text-primary">{totalWeeklyHours.toFixed(1)} hrs</span>
            </div>
          </div>

          <form onSubmit={handleSubmitTimesheet} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Assigned Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.projectName}>
                      {p.projectName} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">Task Description</label>
                <input
                  type="text"
                  required
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  placeholder="e.g. Backend API, sprint bug fixes..."
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBillableCheck"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="isBillableCheck" className="text-xs font-medium text-foreground">
                Mark this work as Billable to Client
              </label>
            </div>

            {/* Daily Inputs */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">Daily Hours Breakdown</label>
              <div className="grid grid-cols-7 gap-2 text-center">
                {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                  <div key={day} className="bg-muted/30 border border-border p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                      {day}
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={hours[day]}
                      onChange={(e) => setHours({ ...hours, [day]: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center text-sm font-bold bg-card border border-border rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 flex items-center gap-2 transition shadow-sm"
              >
                <Send className="w-4 h-4" />
                Submit Weekly Timesheet
              </button>
            </div>
          </form>
        </div>

        {/* History / Status card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground">Timesheet Submissions</h3>
          <p className="text-xs text-muted-foreground">Recent weekly cycle statuses and approvals</p>

          <div className="space-y-3">
            {weeklyTimesheets.map((ts) => (
              <div key={ts.id} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground font-mono">{ts.weekStartDate}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ts.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : ts.status === 'Submitted'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {ts.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{ts.projectName}</div>
                <div className="flex justify-between text-xs font-medium text-foreground pt-1 border-t border-border/50">
                  <span>{ts.totalHours} hrs logged</span>
                  <span className="text-indigo-500">{ts.billableHours} hrs billable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
