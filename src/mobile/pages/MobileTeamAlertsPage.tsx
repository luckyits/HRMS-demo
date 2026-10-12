import React from 'react'
import {
  AlertTriangle,
  UserCheck,
  UserMinus,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useToast } from '@/context/ToastContext'

export const MobileTeamAlertsPage: React.FC = () => {
  const { showToast } = useToast()

  const probationAlerts = [
    {
      id: 'prob-1',
      name: 'Kavita Iyer',
      role: 'Operations Associate',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      daysRemaining: 12,
      joinedDate: '2026-04-24',
      status: 'Review Required',
    },
    {
      id: 'prob-2',
      name: 'Rohan Mehta',
      role: 'Full Stack Engineer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      daysRemaining: 28,
      joinedDate: '2026-05-10',
      status: 'On Track',
    },
  ]

  const exitAlerts = [
    {
      id: 'exit-1',
      name: 'Sneha Kulkarni',
      role: 'QA Engineer',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      lwd: '2026-10-24',
      tasksRemaining: 3,
      noticeDaysLeft: 12,
    },
  ]

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Probation & Exit Alerts"
        subtitle="Confirmation milestones & separation tracking"
        showBack={true}
      />

      <div className="p-4 space-y-5">
        {/* Probation Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Probation Confirmations ({probationAlerts.length})</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {probationAlerts.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {p.role}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {p.daysRemaining} Days Left
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
                  <span>Joined: {p.joinedDate}</span>
                  <button
                    type="button"
                    onClick={() => showToast(`Initiating 6-month probation review for ${p.name}...`, 'info')}
                    className="font-bold text-primary hover:underline"
                  >
                    Submit Review →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exit & Handover Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserMinus className="w-4 h-4 text-rose-500" />
              <span>Resignation Handover ({exitAlerts.length})</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {exitAlerts.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={e.avatar}
                      alt={e.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {e.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Last Working Day: {e.lwd}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {e.noticeDaysLeft} Days Remaining
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
                  <span>Pending Tasks: {e.tasksRemaining} asset clearances</span>
                  <button
                    type="button"
                    onClick={() => showToast(`Opening clearance task checklist for ${e.name}...`, 'info')}
                    className="font-bold text-primary hover:underline"
                  >
                    Clear Tasks →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
