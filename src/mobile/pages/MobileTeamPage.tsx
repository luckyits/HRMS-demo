import React, { useState } from 'react'
import { Users, Phone, MessageSquare, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ListCard } from '@/mobile/components/ListCard'
import { useToast } from '@/context/ToastContext'

export const MobileTeamPage: React.FC = () => {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')

  const team = [
    { id: '1', name: 'Priya Sharma', role: 'QA Lead', status: 'On Duty', shift: '09:00 - 18:00', phone: '+91 98450 11920', statusVariant: 'success' as const },
    { id: '2', name: 'Rohan Mehta', role: 'Full Stack Engineer', status: 'On Duty', shift: '09:00 - 18:00', phone: '+91 98220 44102', statusVariant: 'success' as const },
    { id: '3', name: 'Deepak Patel', role: 'Plant Technician', status: 'On Leave', shift: 'Night Shift', phone: '+91 97123 55890', statusVariant: 'warning' as const },
    { id: '4', name: 'Kavita Iyer', role: 'Operations Associate', status: 'On Duty', shift: '10:00 - 19:00', phone: '+91 99001 88231', statusVariant: 'success' as const },
  ]

  const filtered = team.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader title="Team Attendance" subtitle="Direct reports daily presence" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-card border border-border">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total</span>
            <span className="text-base font-black text-foreground">{team.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <span className="text-[10px] block uppercase font-bold">On Duty</span>
            <span className="text-base font-black">3</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <span className="text-[10px] block uppercase font-bold">On Leave</span>
            <span className="text-base font-black">1</span>
          </div>
        </div>

        {/* Team List */}
        <div className="space-y-2.5">
          {filtered.map((member) => (
            <ListCard
              key={member.id}
              title={member.name}
              subtitle={member.role}
              status={member.status}
              statusVariant={member.statusVariant}
              fields={[
                { label: 'Shift Rule', value: member.shift },
                { label: 'Contact', value: member.phone },
              ]}
              actionButton={
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => showToast(`Calling ${member.name} (${member.phone})...`, 'info')}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Opening chat with ${member.name}...`, 'info')}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground"
                    title="Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}
