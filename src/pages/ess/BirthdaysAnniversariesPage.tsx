import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEss } from '@/context/EssContext'
import type { CelebrationItem } from '@/mock/essData'
import {
  Cake,
  Check,
  Gift,
  Heart,
  MessageSquare,
  PartyPopper,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'

export const BirthdaysAnniversariesPage: React.FC = () => {
  const { celebrations, sendWish } = useEss()
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const filtered = celebrations.filter((c) => {
    if (filterTab === 'today') return c.isToday
    if (filterTab === 'week') return c.isThisWeek
    return true
  })

  return (
    <FeatureGate feature="BIRTHDAY_ANNIV">
      <div className="space-y-6">
        <PageHeader
          title="Birthdays & Work Anniversaries"
          subtitle="Celebrate milestones, career anniversaries, and send warm wishes to team colleagues"
          scope="Self"
          breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Celebrations' }]}
          action={
            <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl text-xs">
              {(['all', 'today', 'week', 'month'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                    filterTab === tab
                      ? 'bg-primary text-primary-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'All Events' : tab === 'week' ? 'This Week' : tab === 'month' ? 'This Month' : 'Today'}
                </button>
              ))}
            </div>
          }
        />

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between text-xs relative overflow-hidden ${
                item.isToday
                  ? 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-300 dark:border-pink-800 shadow-xs'
                  : 'bg-card border-border shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.employeeAvatar}
                      alt={item.employeeName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-foreground text-sm">
                          {item.employeeName}
                        </h4>
                        {item.isToday && (
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-pink-500 text-white animate-pulse">
                            Today!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.designation} • {item.department}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`p-2 rounded-xl text-sm ${
                      item.type === 'Birthday'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                    }`}
                  >
                    {item.type === 'Birthday' ? '🎂' : '🏆'}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border/80">
                  <span className="font-bold text-foreground block">
                    {item.type === 'Birthday'
                      ? 'Celebrating Birthday'
                      : `Celebrating ${item.yearsCount} Years at Company!`}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono mt-0.5 block">
                    Date: {item.date}
                  </span>
                </div>
              </div>

              {/* Action Button: Send Wish */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {item.wished ? 'Greeting Sent' : 'Peer Greeting'}
                </span>

                <button
                  type="button"
                  disabled={item.wished}
                  onClick={() => sendWish(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition ${
                    item.wished
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-pink-600 hover:bg-pink-700 text-white'
                  }`}
                >
                  {item.wished ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Wished</span>
                    </>
                  ) : (
                    <>
                      <PartyPopper className="w-3.5 h-3.5" />
                      <span>Send Wish 🎉</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeatureGate>
  )
}
