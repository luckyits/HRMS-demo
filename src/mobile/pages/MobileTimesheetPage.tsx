import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
  AlertCircle,
  Briefcase
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import {
  useOptionalModules,
  type WeeklyTimesheetEntry,
} from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'

export const MobileTimesheetPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { projects, weeklyTimesheets, submitWeeklyTimesheet } = useOptionalModules()
  const { showToast } = useToast()

  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '')
  const [dailyHours, setDailyHours] = useState({
    mon: 8.0,
    tue: 8.0,
    wed: 8.5,
    thu: 8.0,
    fri: 7.5,
    sat: 0.0,
    sun: 0.0,
  })

  if (!hasFeature('TIMESHEET')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Project Timesheets" subtitle="Remote & IT Operations" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Project timesheet logging is not enabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  const selectedProj = projects.find((p) => p.id === selectedProjectId) || projects[0]

  const totalWeekHours =
    dailyHours.mon +
    dailyHours.tue +
    dailyHours.wed +
    dailyHours.thu +
    dailyHours.fri +
    dailyHours.sat +
    dailyHours.sun

  const handleStepDay = (day: keyof typeof dailyHours, delta: number) => {
    setDailyHours((prev) => ({
      ...prev,
      [day]: Math.max(0, Math.min(16, parseFloat((prev[day] + delta).toFixed(1)))),
    }))
  }

  const handleSubmitWeek = () => {
    if (totalWeekHours === 0) {
      showToast('Please log hours before submitting the timesheet', 'error')
      return
    }

    submitWeeklyTimesheet({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      weekStartDate: '2026-10-12',
      projectName: selectedProj ? selectedProj.projectName : 'Cloud Platform V2',
      taskName: selectedProj ? selectedProj.taskName : 'Fullstack Engineering',
      isBillable: selectedProj ? selectedProj.isBillable : true,
      dailyHours,
      status: 'Submitted',
    })

    showToast(`Weekly timesheet (${totalWeekHours}h) submitted for supervisor approval!`, 'success')
  }

  const daysConfig: Array<{ key: keyof typeof dailyHours; label: string; date: string }> = [
    { key: 'mon', label: 'Mon', date: 'Oct 12' },
    { key: 'tue', label: 'Tue', date: 'Oct 13' },
    { key: 'wed', label: 'Wed', date: 'Oct 14' },
    { key: 'thu', label: 'Thu', date: 'Oct 15' },
    { key: 'fri', label: 'Fri', date: 'Oct 16' },
    { key: 'sat', label: 'Sat', date: 'Oct 17' },
    { key: 'sun', label: 'Sun', date: 'Oct 18' },
  ]

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Project Timesheets"
        subtitle="Week of Oct 12 - Oct 18, 2026"
      />

      <div className="p-4 space-y-4">
        {/* Weekly Header Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Logged Hours
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-foreground">
                {totalWeekHours.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">/ 40.0 hrs</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Billability
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {selectedProj?.isBillable ? 'Billable Client Project' : 'Internal Non-Billable'}
            </span>
          </div>
        </div>

        {/* Project & Task Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground px-1 block">
            Project & Client Task
          </label>
          <div className="space-y-2">
            {projects.map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProjectId(proj.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition shadow-xs ${
                  selectedProjectId === proj.id
                    ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
                    : 'bg-card border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-foreground">
                    {proj.projectName}
                  </h5>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {proj.clientName}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {proj.taskName} • Rate: ₹{proj.hourlyBillingRateInr}/hr
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Hours Steppers */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Day-by-Day Hours Stepper
          </h4>

          <div className="space-y-1.5">
            {daysConfig.map((d) => (
              <div
                key={d.key}
                className="p-3 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {d.label} ({d.date})
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dailyHours[d.key] > 0
                      ? `${dailyHours[d.key]}h recorded`
                      : 'Zero hours logged'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStepDay(d.key, -0.5)}
                    className="w-8 h-8 rounded-xl bg-muted border border-border text-foreground font-black text-sm flex items-center justify-center active:scale-95 transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-black text-sm text-foreground">
                    {dailyHours[d.key].toFixed(1)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepDay(d.key, 0.5)}
                    className="w-8 h-8 rounded-xl bg-muted border border-border text-foreground font-black text-sm flex items-center justify-center active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Week Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmitWeek}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Week for Approval ({totalWeekHours.toFixed(1)} hrs)</span>
          </button>
        </div>

        {/* Timesheet Submission History */}
        {weeklyTimesheets.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Previous Submissions
            </h4>
            <div className="space-y-2">
              {weeklyTimesheets.map((ts) => (
                <div
                  key={ts.id}
                  className="p-3 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-foreground block">
                      Week of {ts.weekStartDate}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {ts.projectName} • {ts.totalHours} hrs
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ts.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {ts.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
