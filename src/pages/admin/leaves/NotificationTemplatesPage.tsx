import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import type { NotificationTemplate } from '@/mock/adminLeaves'
import {
  BellRing,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Save,
  Sparkles,
  Send,
  Eye,
  Languages,
} from 'lucide-react'

export const NotificationTemplatesPage: React.FC = () => {
  const { notificationTemplates, updateNotificationTemplate } = useAdminLeaves()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    notificationTemplates[0]?.id || ''
  )
  const activeTemplate =
    notificationTemplates.find((t) => t.id === selectedTemplateId) ||
    notificationTemplates[0]

  // Form state
  const [channel, setChannel] = useState<NotificationTemplate['channel']>(
    activeTemplate?.channel || 'In-App'
  )
  const [language, setLanguage] = useState<NotificationTemplate['language']>(
    activeTemplate?.language || 'English'
  )
  const [subject, setSubject] = useState(activeTemplate?.subject || '')
  const [templateBody, setTemplateBody] = useState(activeTemplate?.templateBody || '')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSelectTemplate = (t: NotificationTemplate) => {
    setSelectedTemplateId(t.id)
    setChannel(t.channel)
    setLanguage(t.language)
    setSubject(t.subject || '')
    setTemplateBody(t.templateBody)
  }

  const handleInsertMergeField = (field: string) => {
    setTemplateBody((prev) => `${prev} {{${field}}}`)
  }

  const handleSave = () => {
    if (!activeTemplate) return
    updateNotificationTemplate(activeTemplate.id, {
      channel,
      language,
      subject: channel === 'Email' ? subject : undefined,
      templateBody,
    })
    setToastMessage(`Saved notification template for ${activeTemplate.eventName}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Interpolate mock values for preview
  const interpolatedPreview = templateBody
    .replace(/\{\{employee_name\}\}/g, 'Aarav Patel')
    .replace(/\{\{leave_type\}\}/g, 'Earned Leave')
    .replace(/\{\{days_count\}\}/g, '6')
    .replace(/\{\{start_date\}\}/g, '14 Oct 2026')
    .replace(/\{\{end_date\}\}/g, '21 Oct 2026')
    .replace(/\{\{approver_name\}\}/g, 'Vikram Malhotra')
    .replace(/\{\{request_type\}\}/g, 'Leave Application')
    .replace(/\{\{sla_hours\}\}/g, '24')
    .replace(/\{\{worked_date\}\}/g, '04 Oct 2026')
    .replace(/\{\{credited_days\}\}/g, '1.0')
    .replace(/\{\{expiry_date\}\}/g, '04 Dec 2026')
    .replace(/\{\{reason\}\}/g, 'Annual Family Vacation')

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Automated Notification & Channel Templates"
        subtitle="Custom message templates for In-App alerts, transactional emails, SMS alerts, and WhatsApp business dispatches"
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Layout: Template Selector on Left, Editor in Center, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-4 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
            Trigger Events
          </span>
          {notificationTemplates.map((t) => {
            const isSelected = t.id === selectedTemplateId
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary ring-1 ring-primary'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <div>
                  <h5 className="font-bold text-xs text-foreground">{t.eventName}</h5>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    {t.channel === 'Email' && <Mail className="w-3 h-3 text-blue-500" />}
                    {t.channel === 'In-App' && <BellRing className="w-3 h-3 text-amber-500" />}
                    {t.channel === 'WhatsApp' && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                    <span>{t.channel} &bull; {t.language}</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border">
                  {t.event}
                </span>
              </button>
            )
          })}
        </div>

        {/* Editor Form */}
        <div className="lg:col-span-5 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h4 className="font-bold text-sm text-foreground">{activeTemplate.eventName}</h4>
              <p className="text-xs text-muted-foreground">Configure content and merge tags</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
              Event: {activeTemplate.event}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg"
              >
                <option value="In-App">In-App Notification</option>
                <option value="Email">Email Message</option>
                <option value="SMS">SMS Text</option>
                <option value="WhatsApp">WhatsApp Business</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>

          {channel === 'Email' && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
              />
            </div>
          )}

          {/* Merge tags picker */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Insert Dynamic Merge Fields:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {activeTemplate.availableMergeFields.map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => handleInsertMergeField(field)}
                  className="px-2 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 text-[10px] font-mono text-primary transition-colors"
                >
                  +{field}
                </button>
              ))}
            </div>
          </div>

          {/* Template body */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Template Body Content
            </label>
            <textarea
              rows={6}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              className="w-full text-xs p-3 bg-muted/40 border border-border rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Live Device / Message Mockup Preview */}
        <div className="lg:col-span-3 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" /> Live {channel} Preview
            </h5>
          </div>

          {channel === 'WhatsApp' ? (
            /* WhatsApp Mockup */
            <div className="bg-[#ECE5DD] dark:bg-slate-900 border border-border rounded-2xl p-3 min-h-[320px] flex flex-col justify-end text-xs">
              <div className="bg-[#E7FFDB] dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-3 rounded-2xl shadow-sm space-y-1 text-slate-800 dark:text-emerald-100">
                <span className="font-bold text-[10px] text-emerald-700 block">
                  Apex HRMS Bot
                </span>
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{interpolatedPreview}</p>
                <span className="text-[9px] text-muted-foreground block text-right mt-1">
                  10:42 AM &bull; Delivered
                </span>
              </div>
            </div>
          ) : channel === 'Email' ? (
            /* Email Mockup */
            <div className="bg-muted/20 border border-border rounded-2xl p-3 min-h-[320px] text-xs space-y-2">
              <div className="p-2 bg-card rounded-lg border border-border text-[11px] space-y-0.5">
                <div>
                  <strong>From:</strong> people-ops@apex.internal
                </div>
                <div>
                  <strong>Subject:</strong> {subject || activeTemplate.subject}
                </div>
              </div>
              <div className="p-3 bg-card rounded-xl border border-border whitespace-pre-wrap leading-relaxed text-xs">
                {interpolatedPreview}
              </div>
            </div>
          ) : (
            /* In-App / Push Notification Mockup */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[320px] text-xs flex flex-col justify-start space-y-2">
              <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl shadow-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px] text-primary flex items-center gap-1">
                    <BellRing className="w-3 h-3" /> Apex HR Portal
                  </span>
                  <span className="text-[9px] text-slate-400">Just now</span>
                </div>
                <h6 className="font-bold text-xs text-white">
                  {activeTemplate.eventName}
                </h6>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {interpolatedPreview}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
