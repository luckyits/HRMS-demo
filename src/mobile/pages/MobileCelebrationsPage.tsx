import React, { useState } from 'react'
import {
  PartyPopper,
  Gift,
  Heart,
  Send,
  CheckCircle2,
  Calendar,
  Smile,
  Sparkles
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'
import type { CelebrationItem } from '@/mock/essData'

export const MobileCelebrationsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { celebrations, sendWish } = useEss()
  const { showToast } = useToast()

  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [selectedPerson, setSelectedPerson] = useState<CelebrationItem | null>(null)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🎂')
  const [customMessage, setCustomMessage] = useState<string>('Wishing you wonderful joy and continued success!')

  const emojis = ['🎂', '🎉', '💐', '👏', '🌟', '🥂', '🎁', '🥳']

  const quickMessages = [
    'Wishing you a very Happy Birthday! Have an amazing year ahead! 🎉',
    'Congratulations on completing another milestone year with us! 👏',
    'Warm wishes on your special day! Stay blessed! 💐',
    'Happy Work Anniversary! Thank you for being such an inspiring colleague! 🌟',
  ]

  const filteredItems = celebrations.filter((c) => {
    if (filterPeriod === 'today') return c.isToday
    if (filterPeriod === 'week') return c.isThisWeek || c.isToday
    return true // this month
  })

  const handleSendWish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPerson) return

    sendWish(selectedPerson.id)
    showToast(`Wish sent to ${selectedPerson.employeeName} ${selectedEmoji}!`, 'success')
    setSelectedPerson(null)
  }

  if (!hasFeature('BIRTHDAY_ANNIV')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Birthdays and anniversaries are disabled for this workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Celebrations"
        subtitle="Birthdays & team work anniversaries"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 border border-pink-500/20 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <PartyPopper className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Celebrate Team Milestones
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send warm wishes & cheer to team members across your branch.
            </p>
          </div>
        </div>

        {/* Filter Period Chips */}
        <ChipFilterRow
          chips={[
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ]}
          selectedId={filterPeriod}
          onSelect={(id) => setFilterPeriod(id as any)}
        />

        {/* Celebrations List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border space-y-1">
              <Gift className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">No celebrations in this period</p>
              <p className="text-[10px] text-muted-foreground/70">
                Check "This Month" for upcoming birthdays and work anniversaries.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.employeeAvatar}
                      alt={item.employeeName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {item.employeeName}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.designation} • {item.department}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                      item.type === 'Birthday'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.type === 'Birthday' ? '🎂 Birthday' : `🎉 ${item.yearsCount} Years`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                    {item.isToday && (
                      <span className="font-bold text-rose-500 ml-1">Today!</span>
                    )}
                  </div>

                  {item.wished ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Wish Sent</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPerson(item)
                        setSelectedEmoji(item.type === 'Birthday' ? '🎂' : '🎉')
                        setCustomMessage(
                          item.type === 'Birthday'
                            ? `Happy Birthday ${item.employeeName.split(' ')[0]}! Have a stellar year! 🎂`
                            : `Happy ${item.yearsCount}th Work Anniversary ${item.employeeName.split(' ')[0]}! 🌟`
                        )
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Send Wish</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Wish Interactive Sheet with Emoji Picker */}
      <BottomSheet
        isOpen={Boolean(selectedPerson)}
        onClose={() => setSelectedPerson(null)}
        title={selectedPerson ? `Send Wish to ${selectedPerson.employeeName}` : 'Send Wish'}
        subtitle={selectedPerson ? `${selectedPerson.type} Celebration` : undefined}
      >
        {selectedPerson && (
          <form onSubmit={handleSendWish} className="space-y-4">
            {/* Emoji Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Choose Reaction Emoji
              </label>
              <div className="flex items-center justify-between gap-1 p-2 rounded-2xl bg-muted/40 border border-border">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-card shadow-md scale-110 border border-primary/40'
                        : 'hover:bg-card/50 active:scale-90'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Greeting Shortcuts */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Quick Greeting Suggestions
              </label>
              <div className="space-y-1.5">
                {quickMessages.map((msg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomMessage(msg)}
                    className="w-full text-left p-2.5 rounded-xl text-xs bg-card border border-border/70 hover:border-primary/50 text-foreground transition active:scale-[0.99] line-clamp-1"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Your Message
              </label>
              <textarea
                rows={3}
                required
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Send Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Send className="w-4 h-4" />
                <span>Send Wish with {selectedEmoji}</span>
              </button>
            </div>
          </form>
        )}
      </BottomSheet>
    </div>
  )
}
