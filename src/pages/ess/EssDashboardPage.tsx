import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { PunchModal } from '@/components/attendance/PunchModal'
import { useAccess } from '@/access/useAccess'
import { useAttendance } from '@/context/AttendanceContext'
import { useDemo } from '@/context/DemoContext'
import {
  AlertCircle,
  Banknote,
  Cake,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Fingerprint,
  Gift,
  HelpCircle,
  MapPin,
  Megaphone,
  Moon,
  Navigation,
  Play,
  Receipt,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const EssDashboardPage: React.FC = () => {
  const { settings } = useDemo()
  const { currentEmployee, hasFeature } = useAccess()
  const { isPunchedIn, punchInTime, workSeconds, punchesToday } = useAttendance()
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false)

  // Format running work seconds into HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}h ${minutes
      .toString()
      .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }

  // Determine current shift based on profile
  const isFactoryWorker = settings.employeeType === 'Factory Worker'
  const shiftInfo = isFactoryWorker
    ? {
        name: 'Plant Night Shift C',
        timing: '10:00 PM – 06:00 AM (+1)',
        notes: 'Belongs to shift date: 5th • Night allowance active',
        isNight: true,
      }
    : {
        name: 'General Corporate Shift',
        timing: '09:30 AM – 06:30 PM',
        notes: 'Grace period: 15 mins • 1 Hour lunch break',
        isNight: false,
      }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Hello, ${currentEmployee.name}! 👋`}
        subtitle={`Welcome to your Self-Service Hub • ${settings.companyType} Industry • Profile: ${settings.employeeType}`}
        scope="Self"
        breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'My Space' }]}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <StatusBadge status={isPunchedIn ? 'active' : 'inactive'} label={isPunchedIn ? 'On Duty' : 'Off Duty'} />
          </div>
        }
      />

      {/* ANNOUNCEMENT BANNER (FeatureGate: ANNOUNCEMENT) */}
      <FeatureGate feature="ANNOUNCEMENT">
        <div className="bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Company Townhall & Q3 Updates
                </span>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded font-semibold">
                  New
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join our quarterly CEO briefing tomorrow at 04:00 PM IST on Microsoft Teams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert('Townhall details link')}
            className="px-3 py-1.5 text-xs font-medium bg-card border border-border hover:bg-muted rounded-lg transition shrink-0"
          >
            View Bulletin
          </button>
        </div>
      </FeatureGate>

      {/* PRIMARY ATTENDANCE & SHIFT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Large Interactive Punch In / Punch Out Card */}
        <FeatureGate feature="PUNCH">
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Web & Biometric Punch Clock
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {punchInTime ? `Punched in at ${punchInTime} today` : 'No punch recorded today yet'}
                    </p>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    On Time
                  </span>

                  <FeatureGate feature="GEOFENCE">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800">
                      <MapPin className="w-3 h-3" />
                      Inside Fence
                    </span>
                  </FeatureGate>
                </div>
              </div>

              {/* Running Work Timer Display */}
              <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Current Work Duration Today
                  </span>
                  <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-foreground mt-1">
                    {isPunchedIn ? formatTimer(workSeconds) : '00h 00m 00s'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: 08h 00m standard minimum work hours
                  </p>
                </div>

                {/* Big Punch Action Button */}
                <button
                  type="button"
                  onClick={() => setIsPunchModalOpen(true)}
                  className={`px-8 py-5 rounded-2xl text-sm font-bold tracking-wide uppercase shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 ${
                    isPunchedIn
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>{isPunchedIn ? 'Punch Out Now' : 'Punch In Now'}</span>
                </button>
              </div>
            </div>

            {/* Quick Log Strip */}
            <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Today’s Punches: {punchesToday.length > 0 ? `${punchesToday.length} logs recorded` : 'None'}
              </span>
              <Link
                to="/employee/attendance"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>View Full Attendance History</span>
                <Clock className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </FeatureGate>

        {/* Right Column (4 cols): Today's Shift Card */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Assigned Shift Schedule
              </span>
              {shiftInfo.isNight ? (
                <Moon className="w-4 h-4 text-purple-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-foreground">
                  {shiftInfo.name}
                </h4>
                {shiftInfo.isNight && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    Night Roster
                  </span>
                )}
              </div>

              <div className="text-2xl font-bold font-mono text-primary mt-2">
                {shiftInfo.timing}
              </div>

              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {shiftInfo.notes}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <FeatureGate feature="SHIFT_ROSTER">
              <Link
                to="/employee/shifts"
                className="text-xs text-primary hover:underline font-semibold"
              >
                View Weekly Roster
              </Link>
            </FeatureGate>
            <Link
              to="/employee/attendance"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Request Regularization
            </Link>
          </div>
        </div>
      </div>

      {/* DYNAMIC ESS WIDGET GRID (Generated strictly from Access List) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Leave Wallet Widget */}
        <FeatureGate feature="LEAVE">
          <StatCard
            title="Leave Wallet Balance"
            value="14.5 Days"
            subtext="Earned: 10 • Casual: 4.5 Available"
            trend={{ value: 'Full entitlement', positive: true }}
            icon={CalendarCheck}
            iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
            onClick={() => alert('Navigate to apply leave')}
          />
        </FeatureGate>

        {/* 2. Upcoming Holiday Widget */}
        <FeatureGate feature="HOLIDAY">
          <StatCard
            title="Upcoming Holiday"
            value="Diwali Break"
            subtext="Oct 30 – Nov 01 (3 Days Off)"
            icon={Calendar}
            iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
          />
        </FeatureGate>

        {/* 3. Field Visits Beats (Field Sales) */}
        <FeatureGate feature="VISIT">
          <StatCard
            title="Today's Client Beats"
            value="18 Beats"
            subtext="14 Visited • 4 Pending check-in"
            trend={{ value: 'GPS verified', positive: true }}
            icon={Navigation}
            iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
          />
        </FeatureGate>

        {/* 4. Claims & Expenses */}
        <FeatureGate feature="EXPENSE">
          <StatCard
            title="Claim Reimbursements"
            value="₹ 4,320"
            subtext="2 Vouchers pending approval"
            icon={Receipt}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          />
        </FeatureGate>

        {/* 5. Latest Payslip */}
        <FeatureGate feature="PAYSLIP">
          <StatCard
            title="Latest Payslip"
            value="Sept 2026"
            subtext="Net Pay: ₹ 1,24,500 • Ready"
            icon={Banknote}
            iconColor="text-violet-600 bg-violet-50 dark:bg-violet-950/50"
            onClick={() => alert('Open payslip download')}
          />
        </FeatureGate>

        {/* 6. Overtime Widget (Factory Worker) */}
        <FeatureGate feature="OVERTIME">
          <StatCard
            title="Accumulated Overtime"
            value="8.5 Hours"
            subtext="Double wage rate multiplier"
            trend={{ value: '+2.5h this week', positive: true }}
            icon={Clock}
            iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
          />
        </FeatureGate>

        {/* 7. Sales Incentives (Field Sales) */}
        <FeatureGate feature="INCENTIVE">
          <StatCard
            title="Sales Commission"
            value="₹ 12,500"
            subtext="Q3 Target met at 112%"
            trend={{ value: '+₹3,200 bonus', positive: true }}
            icon={TrendingUp}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          />
        </FeatureGate>

        {/* 8. Helpdesk & Requests */}
        <FeatureGate feature="HELPDESK">
          <StatCard
            title="My HR Helpdesk Tickets"
            value="1 Open"
            subtext="ID card replacement ticket"
            icon={HelpCircle}
            iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50"
          />
        </FeatureGate>
      </div>

      {/* BIRTHDAY / ANNIVERSARY STRIP (FeatureGate: BIRTHDAY_ANNIV) */}
      <FeatureGate feature="BIRTHDAY_ANNIV">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Team Celebrations This Week 🎂
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 font-semibold">
                  2 Events
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Priya Sharma celebrates 3 years at company on Oct 11 • Rohan Deshmukh’s birthday on Oct 14!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert('Wished colleague happy anniversary!')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-pink-600 hover:bg-pink-700 text-white shadow-2xs transition"
          >
            Send Greetings 🎈
          </button>
        </div>
      </FeatureGate>

      {/* Interactive Punch Modal */}
      <PunchModal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
      />
    </div>
  )
}
