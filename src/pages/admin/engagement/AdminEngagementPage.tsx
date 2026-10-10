import React, { useState } from 'react'
import {
  HeartHandshake,
  MessageSquare,
  BarChart3,
  Plus,
  Send,
  Sparkles,
  PieChart,
  Users,
  Smile,
  Frown,
  Meh,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { useOptionalModules, QuickPollItem, SurveyPulseItem } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'

export const AdminEngagementPage: React.FC = () => {
  const { quickPolls, surveys, createQuickPoll } = useOptionalModules()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'polls' | 'surveys'>('polls')
  const [showPollModal, setShowPollModal] = useState(false)

  // Quick Poll Form
  const [pollQuestion, setPollQuestion] = useState('')
  const [option1, setOption1] = useState('')
  const [option2, setOption2] = useState('')
  const [option3, setOption3] = useState('')
  const [option4, setOption4] = useState('')
  const [expiryDays, setExpiryDays] = useState('7')

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollQuestion.trim() || !option1.trim() || !option2.trim()) {
      showToast('Please provide a question and at least 2 response options', 'warning')
      return
    }

    const options = [
      { id: 'opt_1', text: option1.trim(), votesCount: 0 },
      { id: 'opt_2', text: option2.trim(), votesCount: 0 },
    ]
    if (option3.trim()) options.push({ id: 'opt_3', text: option3.trim(), votesCount: 0 })
    if (option4.trim()) options.push({ id: 'opt_4', text: option4.trim(), votesCount: 0 })

    const expDate = new Date()
    expDate.setDate(expDate.getDate() + Number(expiryDays))

    createQuickPoll({
      question: pollQuestion.trim(),
      options: options,
      expiresAt: expDate.toISOString().split('T')[0],
    })

    showToast('Quick Poll published live to employee feeds!', 'success')
    setShowPollModal(false)
    setPollQuestion('')
    setOption1('')
    setOption2('')
    setOption3('')
    setOption4('')
  }

  const averageSentiment = Math.round(
    surveys.reduce((acc, s) => acc + s.sentimentScorePct, 0) / (surveys.length || 1)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Employee Engagement & Pulse Surveys
              </h1>
              <p className="text-sm text-muted-foreground">
                Measure workplace sentiment, run micro-polls, and track employee net promoter score (eNPS)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPollModal(true)}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Live Poll
          </button>
        </div>
      </div>

      {/* Sentiment Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Company Sentiment Score</span>
            <Smile className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-500">{averageSentiment}% Positive</div>
          <div className="text-xs text-muted-foreground mt-1">Based on {surveys.length} pulse surveys</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Polls</span>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-foreground">
            {quickPolls.filter((p) => p.isActive).length} Live
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total employee votes cast: <span className="font-semibold">{quickPolls.reduce((a, b) => a + b.totalVotes, 0)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">eNPS Index</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-500">+48 eNPS</div>
          <div className="text-xs text-muted-foreground mt-1">Top quartile industry benchmark</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('polls')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'polls'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Live Micro-Polls ({quickPolls.length})
        </button>
        <button
          onClick={() => setActiveTab('surveys')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'surveys'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Pulse Surveys & NPS ({surveys.length})
        </button>
      </div>

      {activeTab === 'polls' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quickPolls.map((poll) => (
            <div key={poll.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-base text-foreground leading-snug">{poll.question}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold shrink-0 ${
                    poll.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {poll.isActive ? 'Live' : 'Closed'}
                </span>
              </div>

              {/* Options breakdown */}
              <div className="space-y-2.5">
                {poll.options.map((opt) => {
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0
                  return (
                    <div key={opt.id} className="space-y-1">
                      <div className="flex justify-between text-xs text-foreground font-medium">
                        <span>{opt.text}</span>
                        <span className="text-muted-foreground">{pct}% ({opt.votesCount} votes)</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Expires: {poll.expiresAt}</span>
                <span className="font-semibold text-foreground">{poll.totalVotes} Total Votes</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {surveys.map((survey) => (
            <div key={survey.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{survey.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{survey.description}</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-500">
                  {survey.status}
                </span>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl border border-border/50 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Responses</span>
                  <span className="text-xl font-bold text-foreground">{survey.totalResponses}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Sentiment</span>
                  <span className="text-xl font-bold text-emerald-500">{survey.sentimentScorePct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Questions</span>
                  <span className="text-xl font-bold text-foreground">{survey.questionsCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Quick Poll */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Launch Quick Employee Poll</h3>
              <button onClick={() => setShowPollModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Poll Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Which team bonding activity do you prefer next month?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">Response Options</label>
                <input
                  type="text"
                  required
                  placeholder="Option 1 (e.g. Outdoor Sports Day)"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                />
                <input
                  type="text"
                  required
                  placeholder="Option 2 (e.g. Board Games & Dinner)"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Option 3 (Optional)"
                  value={option3}
                  onChange={(e) => setOption3(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Option 4 (Optional)"
                  value={option4}
                  onChange={(e) => setOption4(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Duration (Days)</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                >
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (1 Week)</option>
                  <option value="14">14 Days (2 Weeks)</option>
                  <option value="30">30 Days (1 Month)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 shadow-sm"
                >
                  Publish Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
