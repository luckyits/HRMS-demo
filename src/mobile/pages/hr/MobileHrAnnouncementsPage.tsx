import React, { useState, useEffect } from 'react'
import {
  Megaphone,
  Plus,
  Send,
  Building,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'

export interface AnnouncementItem {
  id: string
  title: string
  body: string
  priority: 'Normal' | 'Important' | 'Urgent'
  targetBranch: string
  targetProfile: string
  publishedBy: string
  publishedRole: string
  publishedAt: string
}

const STORAGE_KEY = 'hrms_mobile_announcements_v1'

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ANN-01',
    title: 'Townhall: Quarterly Strategy Announcement',
    body: 'Join executive leadership this Monday at 11:00 AM IST for our Q3 corporate performance update, new customer wins, and upcoming festive calendar.',
    priority: 'Important',
    targetBranch: 'All Branches',
    targetProfile: 'All Profiles',
    publishedBy: 'Sarah Jenkins',
    publishedRole: 'HR Admin',
    publishedAt: '2026-10-10 09:30 AM',
  },
  {
    id: 'ANN-02',
    title: 'Diwali Festive Bonus & Advance Disbursals',
    body: 'All confirmed full-time staff can opt for festive salary advance or festival bonus disbursement before October 24 via the mobile Loans & Advances hub.',
    priority: 'Normal',
    targetBranch: 'Headquarters - Tech Park',
    targetProfile: 'Office Staff',
    publishedBy: 'Sarah Jenkins',
    publishedRole: 'HR Admin',
    publishedAt: '2026-10-08 14:15 PM',
  },
  {
    id: 'ANN-03',
    title: 'Plant Safety Audit & Hard Hat Protocol',
    body: 'Mandatory PPE compliance check tomorrow across bays 1 to 4. Ensure biometric facial check-in is logged before entering the shop floor.',
    priority: 'Urgent',
    targetBranch: 'Pune Dev Center',
    targetProfile: 'Factory Worker',
    publishedBy: 'Priya Sharma',
    publishedRole: 'Branch HR',
    publishedAt: '2026-10-06 17:00 PM',
  },
]

export const MobileHrAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_ANNOUNCEMENTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(announcements))
  }, [announcements])

  // Compose sheet state
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal')
  const [targetBranch, setTargetBranch] = useState('All Branches')
  const [targetProfile, setTargetProfile] = useState('All Profiles')

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  const branches = [
    'All Branches',
    'Headquarters - Tech Park',
    'Mumbai Branch',
    'Pune Dev Center',
    'Field Ops Beat',
  ]

  const profiles = [
    'All Profiles',
    'Office Staff',
    'Field Sales',
    'Factory Worker',
    'Remote Associates',
  ]

  const handlePublish = () => {
    if (!title.trim() || !body.trim()) {
      showToast({
        type: 'error',
        title: 'Fields Required',
        message: 'Please provide both title and body for the announcement.',
      })
      return
    }

    const now = new Date()
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const newAnnouncement: AnnouncementItem = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title,
      body,
      priority,
      targetBranch: isBranchHr ? activeBranch : targetBranch,
      targetProfile,
      publishedBy: settings.currentUser.name,
      publishedRole: settings.role,
      publishedAt: timestamp,
    }

    setAnnouncements([newAnnouncement, ...announcements])

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Announcement Published',
      module: 'Compliance',
      targetType: 'Policy',
      targetId: newAnnouncement.id,
      targetName: title,
      featureCode: 'ANNOUNCEMENT',
      beforeValue: 'Draft',
      afterValue: `Published (${priority}) to ${newAnnouncement.targetBranch}`,
      reason: `Broadcasted to ${targetProfile} staff by HR Operations`,
    })

    showToast({
      type: 'success',
      title: 'Announcement Published',
      message: `Broadcasted to ${newAnnouncement.targetBranch} (${targetProfile}).`,
    })

    setIsComposeOpen(false)
    setTitle('')
    setBody('')
    setPriority('Normal')
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
    showToast({
      type: 'info',
      title: 'Announcement Removed',
      message: 'The announcement has been withdrawn from the feed.',
    })
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Announcements Desk"
        subtitle="Corporate Broadcasts & Branch Bulletins"
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        {/* Top Header Card with Compose Trigger */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-primary/10 via-card to-card border border-primary/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Broadcasting Hub
            </span>
            <h3 className="text-sm font-black text-foreground mt-0.5">
              {announcements.length} Published Updates
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Visible on employee mobile home screens
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="py-2.5 px-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-3 flex-1">
          {announcements.map((item) => {
            const isUrgent = item.priority === 'Urgent'
            const isImportant = item.priority === 'Important'

            return (
              <div
                key={item.id}
                className={`p-4 rounded-3xl bg-card border shadow-xs space-y-2.5 ${
                  isUrgent
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : isImportant
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                            : isImportant
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.publishedAt}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground mt-1">
                      {item.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-muted-foreground hover:text-rose-500 transition"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.body}
                </p>

                {/* Target Scope Pill Chips */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold">
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                      <Building className="w-3 h-3 text-muted-foreground" />
                      {item.targetBranch}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {item.targetProfile}
                    </span>
                  </div>

                  <span className="text-muted-foreground font-medium">
                    By {item.publishedBy}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* COMPOSE ANNOUNCEMENT BOTTOM SHEET */}
      <BottomSheet
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose New Announcement"
      >
        <div className="space-y-4 pb-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Announcement Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Townhall Meeting / Holiday Closure"
              className="w-full p-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Body */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Message Body *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the full briefing message for staff..."
              rows={4}
              className="w-full p-2.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Notice Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Normal', 'Important', 'Urgent'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    priority === p
                      ? p === 'Urgent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : p === 'Important'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Target Branch */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Target Branch Location
            </label>
            {isBranchHr ? (
              <div className="p-2.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground">
                Locked to your branch: {activeBranch}
              </div>
            ) : (
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-hidden focus:border-primary"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Target Profile */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Target Employee Category / Profile
            </label>
            <select
              value={targetProfile}
              onChange={(e) => setTargetProfile(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground focus:outline-hidden focus:border-primary"
            >
              {profiles.map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsComposeOpen(false)}
              className="py-3 px-4 rounded-xl border border-border text-foreground font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Now</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
