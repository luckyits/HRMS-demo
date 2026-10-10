import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { useEss } from '@/context/EssContext'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileQuestion,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  Paperclip,
  PlusCircle,
  Search,
  Send,
  Shield,
  ShieldAlert,
  Tag,
  UserX,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const HelpdeskPage: React.FC = () => {
  const { tickets, createTicket } = useEss()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<'HR Operations' | 'Payroll & Tax' | 'IT & Equipment' | 'Workplace Grievance'>('HR Operations')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [description, setDescription] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    createTicket({
      subject,
      category,
      priority,
      isAnonymous,
      description,
    })

    setIsModalOpen(false)
    setSubject('')
    setDescription('')
    setIsAnonymous(false)
    setAttachmentName('')
  }

  const activeViewingTicket = tickets.find((t) => t.id === selectedTicketId)

  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </span>
        )
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3" />
            Open
          </span>
        )
    }
  }

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Urgent</span>
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">High</span>
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Medium</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Low</span>
    }
  }

  return (
    <FeatureGate feature="HELPDESK">
      <div className="space-y-6">
        <PageHeader
          title="Employee Helpdesk & Grievance Redressal"
          subtitle="Submit operational queries, IT service requests, or confidential anonymous whistleblower grievances"
          action={
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Raise New Ticket / Grievance
            </button>
          }
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Tickets Raised</span>
              <LifeBuoy className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {tickets.length}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Open / In Progress
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {openTicketsCount}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {resolvedCount}
            </div>
          </div>
        </div>

        {/* Anonymous Grievance Info Strip */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <strong>Whistleblower & Grievance Protection Protocol:</strong> Under company POSH and Ethics policies, you may toggle the "Anonymous" switch when filing a workplace grievance. Your identity, employee ID, and reporting manager are stripped from the ticket and transmitted solely to the Internal Ethics Committee.
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                My Submitted Tickets & Inquiries
              </h3>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket subject or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Anonymity</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No helpdesk tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold font-mono text-slate-900 dark:text-white">
                        {t.id}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {t.category}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate" title={t.subject}>
                        {t.subject}
                      </td>
                      <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                      <td className="px-4 py-3">
                        {t.isAnonymous ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            <UserX className="w-3.5 h-3.5" /> Anonymous
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Identified</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{t.createdAt}</td>
                      <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedTicketId(t.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 justify-end ml-auto"
                        >
                          <Eye className="w-3 h-3" /> View Thread
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raise Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Raise Helpdesk Ticket / Grievance
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="HR Operations">HR Operations</option>
                      <option value="Payroll & Tax">Payroll & Tax</option>
                      <option value="IT & Equipment">IT & Equipment</option>
                      <option value="Workplace Grievance">Workplace Grievance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Anonymous Grievance Toggle */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                      <UserX className="w-4 h-4" />
                      Submit as Anonymous Grievance
                    </div>
                    <div className="text-[11px] text-purple-800 dark:text-purple-300 leading-snug">
                      Your identity and employee details will remain hidden. Ideal for sensitive whistleblower queries.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide relevant context, timestamps, or device details..."
                    className="mt-1 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Attachment (Optional)
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={attachmentName}
                      onChange={(e) => setAttachmentName(e.target.value)}
                      placeholder="screenshot_or_log.pdf"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachmentName('diagnostic_evidence_screenshot.png')}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-semibold"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Attach
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Ticket Thread Modal */}
        {activeViewingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600">
                    {activeViewingTicket.id}
                  </span>
                  {getStatusBadge(activeViewingTicket.status)}
                </div>
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeViewingTicket.subject}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Category: {activeViewingTicket.category} • Submitted: {activeViewingTicket.createdAt}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeViewingTicket.description}
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
                <strong>Latest Operational Update:</strong> {activeViewingTicket.lastUpdate}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Close Thread
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
export default HelpdeskPage
