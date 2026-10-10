import React, { useState, useEffect } from 'react'
import {
  Clock,
  CalendarCheck,
  Banknote,
  Navigation,
  Receipt,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Building,
  Sparkles,
  Inbox,
  Calendar,
  Gift,
  Megaphone,
  BellRing,
  FileSpreadsheet,
  Moon,
  ShieldCheck,
  WifiOff
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { useAccess } from '@/access/useAccess'
import { useAttendance } from '@/context/AttendanceContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { StatusCard } from '@/mobile/components/StatusCard'
import { ActionTile } from '@/mobile/components/ActionTile'
import { TrackingIndicator } from '@/mobile/components/TrackingIndicator'
import { PullToRefresh } from '@/mobile/components/PullToRefresh'
import { MobilePunchFlowModal } from '@/mobile/components/MobilePunchFlowModal'
import { MobileRosterStrip } from '@/mobile/components/MobileRosterStrip'
import { useToast } from '@/context/ToastContext'

export const MobileHomePage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { hasFeature, currentEmployee } = useAccess()
  const { isPunchedIn, punchInTime, workSeconds } = useAttendance()
  const { showToast } = useToast()

  const [showPunchModal, setShowPunchModal] = useState(false)
  const [runningSeconds, setRunningSeconds] = useState(workSeconds)

  const isManager = settings.role === 'Manager'
  const isFactoryWorker = settings.employeeType === 'Factory Worker'

  // Work timer tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (isPunchedIn) {
      timer = setInterval(() => {
        setRunningSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPunchedIn])

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    showToast('Workplace feeds updated', 'info')
  }

  // Greeting based on time of day
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good Morning'
    if (hr < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Status chip calculation
  const getStatusChip = () => {
    if (settings.offlineMode) {
      return { text: 'Offline Mode', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
    }
    if (!isPunchedIn) {
      return { text: 'Not Punched In', bg: 'bg-muted text-muted-foreground border-border' }
    }
    return { text: 'On Time (09:34 AM)', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' }
  }

  const chip = getStatusChip()

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title={settings.role === 'HR Admin' ? 'Admin Portal' : isManager ? 'Manager Hub' : 'My Workplace'}
        subtitle={`${settings.companyType} • ${settings.employeeType}`}
        showNotificationBell={true}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4">
          {/* Top Greeting, Date and Branch Banner */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary tracking-wide block">
                {getGreeting()},
              </span>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                {currentEmployee.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>Saturday, 10 October 2026</span>
                <span>•</span>
                <span className="font-semibold text-foreground">{currentEmployee.branch}</span>
              </div>
            </div>

            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shrink-0 shadow-xs"
            />
          </div>

          {/* Today's Shift Card (Supports Night Shift note) */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Today's Assigned Shift</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {isFactoryWorker ? 'Shift C (Night)' : 'General Shift'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-lg font-black text-foreground block">
                  {isFactoryWorker ? '10:00 PM – 06:00 AM (+1)' : '09:00 AM – 06:00 PM'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isFactoryWorker ? 'Counts for shift date: 5th October' : 'Total Planned Duration: 9h 00m'}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Active Today
              </span>
            </div>
          </div>

          {/* Roster Strip (Only if SHIFT_ROSTER is allowed - e.g. Factory Worker) */}
          {hasFeature('SHIFT_ROSTER') && <MobileRosterStrip />}

          {/* Lower-Middle Huge Circular Punch Button with Running Work Timer */}
          {hasFeature('PUNCH') && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-card via-card to-muted/20 border border-border text-center shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${chip.bg}`}>
                  {chip.text}
                </span>

                <span className="text-xs text-muted-foreground">
                  Last Punch: <strong className="text-foreground">{punchInTime || 'None Today'}</strong>
                </span>
              </div>

              {/* Running Work Timer */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Running Shift Timer
                </span>
                <div className="text-3xl font-black font-mono text-foreground tracking-tight">
                  {isPunchedIn ? formatTimer(runningSeconds) : '00:00:00'}
                </div>
              </div>

              {/* Large Circular Punch In / Out Button */}
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(true)}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center gap-1.5 text-white font-black shadow-xl active:scale-95 transition-all select-none ${
                    isPunchedIn
                      ? 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-rose-600/30 ring-4 ring-rose-500/20'
                      : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-emerald-600/30 ring-4 ring-emerald-500/20'
                  }`}
                >
                  <Clock className="w-8 h-8 stroke-[2.5px]" />
                  <span className="text-sm font-black uppercase tracking-wider">
                    {isPunchedIn ? 'Punch OUT' : 'Punch IN'}
                  </span>
                  <span className="text-[10px] font-normal opacity-90">
                    {isPunchedIn ? 'Tap to end shift' : 'Tap to start shift'}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Camera Selfie & Geo-fence Audit Enabled</span>
              </div>
            </div>
          )}

          {/* Pending Items Card (My requests awaiting approval) */}
          <div
            onClick={() => navigate('/employee/requests')}
            className="p-4 rounded-3xl bg-card border border-border shadow-xs cursor-pointer active:scale-[0.99] transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Requests Awaiting Approval
                </h4>
                <p className="text-xs text-muted-foreground">
                  1 Leave request • 1 Expense claim pending sign-off
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Quick-Action Tiles Generated from Effective Access */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Shortcuts & Tasks
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {hasFeature('LEAVE') && (
                <ActionTile
                  icon={CalendarCheck}
                  label="Apply Leave"
                  subtitle="Casual, sick & earned leave wallets"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/leaves')}
                />
              )}

              {hasFeature('REGULARIZATION') && (
                <ActionTile
                  icon={Clock}
                  label="Attendance Regularization"
                  subtitle="Request missed punch approval"
                  badge="Correction"
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  onClick={() => navigate('/employee/regularization')}
                />
              )}

              {/* Client Visit (Only if VISIT is allowed - e.g. Field Sales, not Office Staff) */}
              {hasFeature('VISIT') && (
                <ActionTile
                  icon={Navigation}
                  label="Client Visits & Beat Plan"
                  subtitle="Geo-fenced client check-in & visit notes"
                  badge="Field Beat"
                  badgeVariant="primary"
                  iconColor="text-rose-600 dark:text-rose-400"
                  iconBg="bg-rose-50 dark:bg-rose-950/40"
                  onClick={() => navigate('/employee/visits')}
                />
              )}

              {hasFeature('EXPENSE') && (
                <ActionTile
                  icon={Receipt}
                  label="Expense Claims"
                  subtitle="Submit voucher with camera photo"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/claims')}
                />
              )}

              {/* Overtime (Only if OVERTIME is allowed - e.g. Factory Worker, not Office Staff) */}
              {hasFeature('OVERTIME') && (
                <ActionTile
                  icon={TrendingUp}
                  label="Overtime & Bonus Hub"
                  subtitle="18.5 hrs accrued • 2 days to Rs 1,000 bonus"
                  badge="OT 2.0x"
                  badgeVariant="warning"
                  iconColor="text-amber-600 dark:text-amber-400"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  onClick={() => navigate('/employee/overtime')}
                />
              )}

              {hasFeature('PAYSLIP') && (
                <ActionTile
                  icon={Banknote}
                  label="Salary Slip & Form 16"
                  subtitle="September net pay voucher (₹64,250)"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/payslips')}
                />
              )}

              {hasFeature('HOLIDAY') && (
                <ActionTile
                  icon={Calendar}
                  label="Holiday Calendar"
                  subtitle="Next holiday: Diwali (Oct 31, 2026)"
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  onClick={() => navigate('/employee/calendar')}
                />
              )}

              {hasFeature('TIMESHEET') && (
                <ActionTile
                  icon={FileSpreadsheet}
                  label="Project Timesheets"
                  subtitle="Log billable client hours"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/timesheets')}
                />
              )}
            </div>
          </div>

          {/* Social Strips: Birthdays & Latest Announcement (Only if allowed) */}
          {hasFeature('ANNOUNCEMENT') && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-950 dark:text-indigo-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <Megaphone className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate font-semibold">
                  Townhall: Quarterly Strategy Announcement on Monday 11 AM
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          )}

          {hasFeature('BIRTHDAY_ANNIV') && (
            <div
              onClick={() => navigate('/employee/celebrations')}
              className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between text-xs text-pink-950 dark:text-pink-200 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Gift className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="truncate font-semibold">
                  Today's Celebration: Priya Sharma completes 3 Years!
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-pink-500/20 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded-full">
                Say Congrats
              </span>
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Full-Screen Punch Flow Modal */}
      <MobilePunchFlowModal
        isOpen={showPunchModal}
        onClose={() => setShowPunchModal(false)}
        punchType={isPunchedIn ? 'OUT' : 'IN'}
        onSuccess={() => setShowPunchModal(false)}
      />
    </div>
  )
}
