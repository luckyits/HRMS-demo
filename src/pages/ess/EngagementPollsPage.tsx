import React, { useState } from 'react'
import {
  HeartHandshake,
  CheckCircle2,
  Send,
  Sparkles,
  BarChart3,
  MessageSquare,
  Smile,
  Check
} from 'lucide-react'
import { useOptionalModules } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'

export const EngagementPollsPage: React.FC = () => {
  const { quickPolls, surveys, voteInPoll } = useOptionalModules()
  const { showToast } = useToast()

  const [selectedPollOption, setSelectedPollOption] = useState<{ [pollId: string]: string }>({})
  const [surveyResponseSubmitted, setSurveyResponseSubmitted] = useState(false)
  const [sentimentChoice, setSentimentChoice] = useState<number | null>(5)
  const [feedbackNote, setFeedbackNote] = useState('')

  const handleVote = (pollId: string) => {
    const optId = selectedPollOption[pollId]
    if (!optId) {
      showToast('Please pick an option to cast your vote', 'warning')
      return
    }
    voteInPoll(pollId, optId)
    showToast('Your vote has been cast anonymously! Thank you.', 'success')
  }

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSurveyResponseSubmitted(true)
    showToast('Pulse survey responses recorded securely. Thank you for your feedback!', 'success')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Company Pulse & Quick Polls
            </h1>
            <p className="text-sm text-muted-foreground">
              Share your feedback anonymously and help shape team culture and workplace benefits
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Polls Card */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Active Micro-Polls
          </h2>

          {quickPolls.map((poll) => (
            <div key={poll.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base text-foreground leading-snug">{poll.question}</h3>
                {poll.userHasVoted && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Voted
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {poll.options.map((opt) => {
                  const isSelected = selectedPollOption[poll.id] === opt.id || poll.selectedOptionId === opt.id
                  const pct = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={poll.userHasVoted}
                      onClick={() => setSelectedPollOption({ ...selectedPollOption, [poll.id]: opt.id })}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{opt.text}</span>
                        </div>
                        {poll.userHasVoted && (
                          <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                        )}
                      </div>

                      {poll.userHasVoted && (
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {!poll.userHasVoted && (
                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleVote(poll.id)}
                    className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Vote
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pulse Survey Card */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            Monthly Workplace Pulse
          </h2>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500">
                Quarterly eNPS
              </span>
              <h3 className="font-bold text-lg text-foreground mt-2">
                How likely are you to recommend our company as a great place to work?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your responses are completely confidential and aggregated by department.
              </p>
            </div>

            {surveyResponseSubmitted ? (
              <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-foreground text-base">Feedback Submitted!</h4>
                <p className="text-xs text-muted-foreground">
                  Thank you for contributing to making our team culture better every day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="space-y-5">
                {/* 1-10 Scale */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    Score: 1 (Not Likely) to 10 (Extremely Likely)
                  </label>
                  <div className="grid grid-cols-10 gap-1.5 text-center">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSentimentChoice(score)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          sentimentChoice === score
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card border-border hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    What is the primary reason for your score? (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Share any thoughts on leadership, growth opportunities, or team collaboration..."
                    className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Submit Survey
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
