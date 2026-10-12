import React, { useState } from 'react'
import {
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Camera,
  Calendar,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
  Radio,
  Building2,
  Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useOfflineQueue } from '@/context/OfflineQueueContext'
import { useVisit, type VisitPlan, type VisitOutcome } from '@/context/VisitContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'

export const MobileVisitsPage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature } = useAccess()
  const { settings } = useDemo()
  const { enqueueItem } = useOfflineQueue()
  const {
    visitPlans,
    clients,
    checkInVisit,
    checkOutVisit,
    addUnplannedVisit,
    expenseSuggestion,
    claimDistanceExpense,
    isGpsActive,
    setIsGpsActive,
  } = useVisit()
  const { showToast } = useToast()

  // Active check-in state
  const [checkingInPlan, setCheckingInPlan] = useState<VisitPlan | null>(null)
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [simulatedDistance, setSimulatedDistance] = useState(45) // meters from fence
  const isInsideFence = simulatedDistance <= 75

  // Active check-out state
  const [checkingOutPlan, setCheckingOutPlan] = useState<VisitPlan | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<VisitOutcome>('Order Placed')
  const [orderValue, setOrderValue] = useState('')
  const [visitNotes, setVisitNotes] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState('2026-10-22')

  // Unplanned visit modal state
  const [showUnplannedModal, setShowUnplannedModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '')
  const [unplannedPurpose, setUnplannedPurpose] = useState('Urgent stock replenishment query')

  if (!hasFeature('VISIT')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Client Visits" subtitle="Field Sales" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Navigation className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Field sales visit tracking is disabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  // Handle Check-in submit
  const handleConfirmCheckIn = () => {
    if (!checkingInPlan) return
    setIsGpsActive(true)

    if (settings.offlineMode) {
      enqueueItem({
        idempotencyKey: `visit-${checkingInPlan.id}-${Date.now().toString().slice(0, 8)}`,
        type: 'visit',
        title: `Offline Visit: ${checkingInPlan.clientName}`,
        subtitle: `${simulatedDistance}m from centroid • Photo attached`,
        payload: {
          visitId: checkingInPlan.id,
          clientName: checkingInPlan.clientName,
        },
      })
    }

    checkInVisit(checkingInPlan.id, {
      lat: checkingInPlan.clientLat + 0.0001,
      lng: checkingInPlan.clientLng + 0.0001,
      isInsideFence,
      distanceMeters: simulatedDistance,
      photo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=300&auto=format&fit=crop&q=80',
    })
    showToast(`Checked in at ${checkingInPlan.clientName}!`, 'success')
    setCheckingInPlan(null)
    setPhotoCaptured(false)
    setTimeout(() => setIsGpsActive(false), 3000)
  }

  // Handle Check-out submit
  const handleConfirmCheckOut = () => {
    if (!checkingOutPlan) return
    setIsGpsActive(true)
    checkOutVisit(checkingOutPlan.id, {
      outcome: selectedOutcome,
      orderValue: orderValue ? parseFloat(orderValue) : undefined,
      notes: visitNotes || 'Client discussion concluded satisfactorily.',
      nextVisitDate,
    })
    showToast(`Checked out from ${checkingOutPlan.clientName}!`, 'success')
    setCheckingOutPlan(null)
    setOrderValue('')
    setVisitNotes('')
    setTimeout(() => setIsGpsActive(false), 3000)
  }

  // Handle Unplanned visit creation
  const handleCreateUnplannedVisit = () => {
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return
    setIsGpsActive(true)
    addUnplannedVisit(
      {
        employeeId: 'EMP-003',
        employeeName: 'Aarav Patel',
        employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        clientId: client.id,
        clientName: client.name,
        clientAddress: client.address,
        clientLat: client.latitude,
        clientLng: client.longitude,
        geofenceRadiusMeters: client.geofenceRadiusMeters,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTimeSlot: 'Immediate (Ad-hoc)',
        beatRoute: client.beatRoute,
        priority: 'Medium',
        purpose: unplannedPurpose,
      },
      {
        lat: client.latitude + 0.0001,
        lng: client.longitude + 0.0001,
        isInsideFence: true,
        distanceMeters: 30,
        photo: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=300&auto=format&fit=crop&q=80',
      }
    )
    showToast(`Unplanned visit started at ${client.name}!`, 'success')
    setShowUnplannedModal(false)
    setTimeout(() => setIsGpsActive(false), 3000)
  }

  const completedVisits = visitPlans.filter((p) => p.status === 'Completed')

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Field Visits & Beats"
        subtitle="Today's Route Schedule"
        rightAction={
          <button
            type="button"
            onClick={() => setShowUnplannedModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ad-hoc</span>
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* GPS Live Tracking Banner - Only visible during check-in/out or when active */}
        {isGpsActive && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                GPS Tracking Active (Accuracy: ±4.2m)
              </span>
            </div>
            <Radio className="w-4 h-4 text-emerald-600 animate-spin" />
          </div>
        )}

        {/* Daily Route Summary Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Today's Distance Covered
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-black text-foreground">
                  {expenseSuggestion.totalDistanceKm}
                </span>
                <span className="text-xs font-bold text-muted-foreground">km</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Visits Done
              </span>
              <span className="text-base font-black text-foreground">
                {completedVisits.length} / {visitPlans.length}
              </span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground block">
                Travel Allowance (₹{expenseSuggestion.ratePerKm}/km)
              </span>
              <span className="text-xs font-bold text-foreground">
                ₹{expenseSuggestion.totalAllowance.toFixed(2)}
              </span>
            </div>

            {expenseSuggestion.isClaimed ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Claimed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  claimDistanceExpense()
                  showToast('Reimbursement claim submitted to accounts!', 'success')
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Create Expense</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Ordered Beat Cards */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Planned Beat Schedule ({visitPlans.length})
          </h3>

          <div className="space-y-2.5">
            {visitPlans.map((plan, index) => {
              const isCompleted = plan.status === 'Completed'
              const isInProgress = plan.status === 'In Progress'

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-3xl border transition shadow-xs ${
                    isInProgress
                      ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                      : isCompleted
                      ? 'bg-card border-border opacity-85'
                      : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted text-foreground font-black text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {plan.clientName}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {plan.beatRoute} • {plan.scheduledTimeSlot}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isInProgress
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{plan.clientAddress}</span>
                  </div>

                  {/* Distance & ETA info */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        ~{((index + 1) * 2.8).toFixed(1)} km
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ETA: {10 + index}:15 AM
                      </span>
                    </div>

                    {/* Action buttons */}
                    {plan.status === 'Planned' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCheckingInPlan(plan)
                          setPhotoCaptured(false)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold active:scale-95 transition flex items-center gap-1 shadow-xs"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Check In</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => setCheckingOutPlan(plan)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold active:scale-95 transition flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Check Out</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{plan.outcome || 'Concluded'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Check-In Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(checkingInPlan)}
        onClose={() => setCheckingInPlan(null)}
        title="Field Check-In"
      >
        {checkingInPlan && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border">
              <h4 className="text-sm font-bold text-foreground">
                {checkingInPlan.clientName}
              </h4>
              <p className="text-xs text-muted-foreground">
                {checkingInPlan.clientAddress}
              </p>
            </div>

            {/* Geofence verification status */}
            <div
              className={`p-3 rounded-2xl border flex items-center gap-3 ${
                isInsideFence
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              }`}
            >
              <MapPin className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">
                  {isInsideFence
                    ? `Inside Geofence (${simulatedDistance}m from centroid)`
                    : `Outside Fence (${simulatedDistance}m / limit 75m)`}
                </span>
                <span className="opacity-80">
                  {isInsideFence
                    ? 'Verified by device GPS radius check'
                    : 'Requires supervisor exception audit'}
                </span>
              </div>
            </div>

            {/* Photo Capture */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2">
                Storefront / Visit Selfie
              </label>
              {photoCaptured ? (
                <div className="relative rounded-2xl overflow-hidden border border-border h-36 bg-black flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=80"
                    alt="Capture"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoCaptured(false)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-black/60 text-white text-[10px] font-bold"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhotoCaptured(true)}
                  className="w-full py-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition active:scale-[0.99]"
                >
                  <Camera className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Tap to Capture Client Photo</span>
                </button>
              )}
            </div>

            {/* Confirm Check-in Button */}
            <button
              type="button"
              disabled={!photoCaptured}
              onClick={handleConfirmCheckIn}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md disabled:opacity-50 active:scale-[0.99] transition"
            >
              Confirm Visit Check-In
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Check-Out Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(checkingOutPlan)}
        onClose={() => setCheckingOutPlan(null)}
        title="Conclude Visit & Check-Out"
      >
        {checkingOutPlan && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Visit Outcome
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(
                  [
                    'Order Placed',
                    'Follow-up Required',
                    'No Meeting / Decision Maker Absent',
                    'Payment Collected',
                  ] as VisitOutcome[]
                ).map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => setSelectedOutcome(outcome)}
                    className={`p-2.5 rounded-2xl text-xs font-semibold text-left border transition ${
                      selectedOutcome === outcome
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 border-border text-foreground'
                    }`}
                  >
                    {outcome}
                  </button>
                ))}
              </div>
            </div>

            {selectedOutcome === 'Order Placed' && (
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Order Value (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={orderValue}
                  onChange={(e) => setOrderValue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Meeting Notes & Follow-up Items
              </label>
              <textarea
                rows={2}
                placeholder="Discussed seasonal pricing, agreed on next delivery..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Next Follow-Up Date
              </label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="button"
              onClick={handleConfirmCheckOut}
              className="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-md active:scale-[0.99] transition"
            >
              Complete Visit & Record Check-Out
            </button>
          </div>
        )}
      </BottomSheet>

      {/* Add Unplanned Visit Bottom Sheet */}
      <BottomSheet
        isOpen={showUnplannedModal}
        onClose={() => setShowUnplannedModal(false)}
        title="Add Ad-Hoc / Unplanned Visit"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Select Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">
              Purpose of Visit
            </label>
            <input
              type="text"
              value={unplannedPurpose}
              onChange={(e) => setUnplannedPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateUnplannedVisit}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-[0.99] transition"
          >
            Start & Check-In Ad-Hoc Visit
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
