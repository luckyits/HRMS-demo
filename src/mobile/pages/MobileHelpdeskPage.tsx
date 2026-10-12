import React, { useState } from 'react'
import {
  LifeBuoy,
  Shield,
  Camera,
  Upload,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserX,
  MessageSquare,
  Lock,
  ChevronRight
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { ApprovalTimeline, type ApprovalStep } from '@/components/common/ApprovalTimeline'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'
import type { HelpdeskTicket } from '@/mock/essData'

export const MobileHelpdeskPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { tickets, createTicket } = useEss()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'raise' | 'tracking'>('raise')

  // Form State
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<HelpdeskTicket['category']>('HR Operations')
  const [priority, setPriority] = useState<HelpdeskTicket['priority']>('Medium')
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [hasPhoto, setHasPhoto] = useState(false)

  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      showToast('Please provide subject and detailed description', 'warning')
      return
    }

    createTicket({
      subject,
      category,
      priority,
      description,
      isAnonymous,
    })

    showToast(
      isAnonymous
        ? 'Confidential anonymous grievance ticket lodged with Internal Committee!'
        : 'Support ticket raised successfully! SLA response assigned within 4 hours.',
      'success'
    )

    setSubject('')
    setDescription('')
    setIsAnonymous(false)
    setHasPhoto(false)
    setActiveTab('tracking')
  }

  const getTrackingSteps = (t: HelpdeskTicket): ApprovalStep[] => [
    {
      id: 'step-1',
      title: 'Ticket Lodged',
      approverName: t.isAnonymous ? 'Anonymous Employee (Masked)' : 'Aarav Patel (You)',
      approverRole: 'Applicant',
      status: 'approved',
      timestamp: t.createdAt,
      comments: t.description,
    },
    {
      id: 'step-2',
      title: 'SLA Desk Assignment',
      approverName: t.category === 'Workplace Grievance' ? 'Internal Ethics Committee' : 'Support Specialist',
      approverRole: t.category,
      status: t.status === 'Resolved' || t.status === 'In Progress' ? 'approved' : 'pending',
      timestamp: 'Today, 11:00 AM',
      comments: 'Priority assigned: ' + t.priority,
    },
    {
      id: 'step-3',
      title: 'Resolution & Closure',
      approverName: 'Department Head',
      approverRole: 'Final Sign-off',
      status: t.status === 'Resolved' || t.status === 'Closed' ? 'approved' : 'waiting',
      comments: t.status === 'Resolved' ? 'Issue resolved and verified with employee.' : undefined,
    },
  ]

  if (!hasFeature('HELPDESK')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Helpdesk and grievance module is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Helpdesk & Grievance"
        subtitle="Support tickets & confidential reports"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Switcher */}
        <div className="flex p-1 bg-muted/60 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('raise')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'raise' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Raise a Ticket
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'tracking' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            My Tickets ({tickets.length})
          </button>
        </div>

        {activeTab === 'raise' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="HR Operations">HR Operations & Policy Clarification</option>
                <option value="Payroll & Tax">Payroll, TDS & Salary Queries</option>
                <option value="IT & Equipment">IT, Hardware & Software Access</option>
                <option value="Workplace Grievance">Workplace Grievance / POSH Cell</option>
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Subject Line
              </label>
              <input
                type="text"
                required
                placeholder="Brief summary of your query or issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Severity / Urgency
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      priority === p
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-foreground bg-card'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Detailed Description
              </label>
              <textarea
                rows={4}
                required
                placeholder="Provide all relevant details, date, incident context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Photo / Screenshot Attachment Simulator */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Screenshot / Photo Proof (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setHasPhoto(!hasPhoto)
                  showToast(hasPhoto ? 'Photo removed' : 'Screenshot attached', 'info')
                }}
                className={`w-full py-3 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition ${
                  hasPhoto
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{hasPhoto ? '✓ screenshot_proof.png attached' : 'Tap to attach camera photo / file'}</span>
              </button>
            </div>

            {/* Anonymous Toggle for Grievance */}
            <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Submit Anonymously
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Protects identity for POSH & grievance audits
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded-md text-primary accent-primary"
                />
              </div>

              {isAnonymous && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
                  <span>
                    Your name and employee ID will be completely redacted. The complaint is delivered strictly to the external Presiding Officer.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tracking List */
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {t.id}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground truncate">
                      {t.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'Resolved' || t.status === 'Closed'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : t.status === 'In Progress'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    {t.subject}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    {t.isAnonymous ? (
                      <span className="text-purple-600 font-semibold text-[10px]">Anonymous</span>
                    ) : (
                      <span>Priority: {t.priority}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <span>View Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details & Timeline Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject}
        subtitle={selectedTicket ? `ID: ${selectedTicket.id} • ${selectedTicket.category}` : undefined}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-foreground">{selectedTicket.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-bold text-foreground">{selectedTicket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Logged On:</span>
                <span className="font-bold text-foreground">{selectedTicket.createdAt}</span>
              </div>
              <div className="pt-1 border-t border-border/60">
                <span className="text-muted-foreground block font-medium mb-0.5">Complaint Summary:</span>
                <p className="text-foreground italic bg-background p-2 rounded-lg border border-border/60">
                  "{selectedTicket.description}"
                </p>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                SLA Ticket Resolution Progress
              </h4>
              <ApprovalTimeline steps={getTrackingSteps(selectedTicket)} />
            </div>

            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
            >
              Close
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
