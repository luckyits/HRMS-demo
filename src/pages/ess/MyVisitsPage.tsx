import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import {
  useVisit,
  type VisitOutcome,
  type VisitPlan,
} from '@/context/VisitContext'
import {
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Camera,
  Plus,
  Compass,
  TrendingUp,
  Receipt,
  Crosshair,
  Sparkles,
  Phone,
  Calendar,
  Check,
  X,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Lock,
} from 'lucide-react'

export const MyVisitsPage: React.FC = () => {
  const { currentEmployee, hasFeature } = useAccess()
  const { setEmployeeType } = useDemo()
  const {
    clients,
    visitPlans,
    checkInVisit,
    checkOutVisit,
    addUnplannedVisit,
    expenseSuggestion,
    claimDistanceExpense,
    isGpsActive,
    setIsGpsActive,
  } = useVisit()

  // Modal states
  const [checkInModalPlan, setCheckInModalPlan] = useState<VisitPlan | null>(null)
  const [checkOutModalPlan, setCheckOutModalPlan] = useState<VisitPlan | null>(null)
  const [isUnplannedModalOpen, setIsUnplannedModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Check-in form state
  const [simulatedDistanceOption, setSimulatedDistanceOption] = useState<'inside' | 'outside'>('inside')
  const [capturedPhoto, setCapturedPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80'
  )

  // Check-out form state
  const [checkOutForm, setCheckOutForm] = useState({
    outcome: 'Order Placed' as VisitOutcome,
    orderValue: 18500,
    notes: '',
    nextVisitDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  })

  // Unplanned visit form state
  const [unplannedForm, setUnplannedForm] = useState({
    clientId: 'CLI-003',
    purpose: 'Urgent stock inquiry while on beat route',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  })

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Filter today's plans for current field sales user
  const myPlans = visitPlans.filter(
    (p) => p.employeeId === currentEmployee.id || p.employeeName.includes('Hardik')
  )

  // Open Check-in: activates GPS location indicator
  const handleOpenCheckIn = (plan: VisitPlan) => {
    setCheckInModalPlan(plan)
    setIsGpsActive(true) // "Location in use" indicator turns ON
  }

  const handleCloseCheckIn = () => {
    setCheckInModalPlan(null)
    setIsGpsActive(false) // "Location in use" indicator turns OFF
  }

  // Open Check-out: activates GPS location indicator
  const handleOpenCheckOut = (plan: VisitPlan) => {
    setCheckOutModalPlan(plan)
    setIsGpsActive(true) // "Location in use" indicator turns ON
  }

  const handleCloseCheckOut = () => {
    setCheckOutModalPlan(null)
    setIsGpsActive(false) // "Location in use" indicator turns OFF
  }

  const handleConfirmCheckIn = () => {
    if (!checkInModalPlan) return

    const isInside = simulatedDistanceOption === 'inside'
    const distanceMeters = isInside ? 28 : checkInModalPlan.geofenceRadiusMeters + 120

    checkInVisit(checkInModalPlan.id, {
      lat: checkInModalPlan.clientLat + 0.0001,
      lng: checkInModalPlan.clientLng + 0.0001,
      isInsideFence: isInside,
      distanceMeters,
      photo: capturedPhoto,
    })

    handleCloseCheckIn()
    showToast(
      isInside
        ? `Checked in at ${checkInModalPlan.clientName}. Inside geo-fence (${distanceMeters}m).`
        : `Checked in with geo-fence deviation alert (${distanceMeters}m). Supervisor notified.`
    )
  }

  const handleConfirmCheckOut = () => {
    if (!checkOutModalPlan) return

    checkOutVisit(checkOutModalPlan.id, {
      outcome: checkOutForm.outcome,
      orderValue: checkOutForm.outcome === 'Order Placed' ? checkOutForm.orderValue : undefined,
      notes: checkOutForm.notes || 'Meeting completed with store decision maker.',
      nextVisitDate: checkOutForm.nextVisitDate,
    })

    handleCloseCheckOut()
    showToast(
      `Checked out from ${checkOutModalPlan.clientName}. Outcome recorded: ${checkOutForm.outcome}.`
    )
  }

  const handleConfirmUnplannedVisit = () => {
    const targetClient = clients.find((c) => c.id === unplannedForm.clientId)
    if (!targetClient) return

    setIsGpsActive(true)
    addUnplannedVisit(
      {
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        employeeAvatar: currentEmployee.avatar,
        clientId: targetClient.id,
        clientName: targetClient.name,
        clientAddress: targetClient.address,
        clientLat: targetClient.latitude,
        clientLng: targetClient.longitude,
        geofenceRadiusMeters: targetClient.geofenceRadiusMeters,
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTimeSlot: 'Ad-Hoc / Impromptu',
        beatRoute: targetClient.beatRoute,
        priority: unplannedForm.priority,
        purpose: unplannedForm.purpose,
      },
      {
        lat: targetClient.latitude,
        lng: targetClient.longitude,
        isInsideFence: true,
        distanceMeters: 30,
        photo: capturedPhoto,
      }
    )

    setTimeout(() => setIsGpsActive(false), 2000)
    setIsUnplannedModalOpen(false)
    showToast(`Unplanned visit initiated for ${targetClient.name}. Checked-in.`)
  }

  const completedCount = myPlans.filter((p) => p.status === 'Completed').length
  const totalPlanned = myPlans.length

  return (
    <FeatureGate
      feature="VISIT"
      fallback={
        <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Client Visit Tracking Gated</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              The <strong>VISIT</strong> feature is only active for the <strong>Field Sales</strong> profile. Office Staff and Factory Worker profiles do not have client visit tracking enabled.
            </p>
          </div>
          <div className="p-4 bg-muted/40 rounded-xl max-w-md mx-auto text-left text-xs space-y-2 border border-border">
            <div className="flex items-center justify-between font-bold">
              <span>Your Profile: {currentEmployee.profileType}</span>
              <span className="text-rose-600">Entitlement: OFF</span>
            </div>
            <button
              onClick={() => setEmployeeType('Field Sales')}
              className="w-full mt-2 py-2 px-3 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:opacity-90"
            >
              Switch to Field Sales Persona (Hardik Trivedi)
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ACTIVE "LOCATION IN USE" PULSE INDICATOR (Only visible during check-in/out) */}
        {isGpsActive && (
          <div className="p-3.5 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Navigation className="w-4 h-4 animate-spin text-white" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wide flex items-center gap-1.5 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                  Location in use
                </span>
                <p className="text-[11px] text-white/90 mt-0.5">
                  High-accuracy GPS telemetry active • Verifying proximity to client geo-fence radius
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-black/20 text-[10px] font-mono font-bold tracking-wider">
              LAT: 23.0338° N • LNG: 72.5614° E (±5m)
            </span>
          </div>
        )}

        <PageHeader
          title="Today's Field Client Beats & Visits"
          subtitle="Execute scheduled store calls, GPS check-in/check-out with geo-fence verification, and record sales orders"
          action={
            <button
              onClick={() => setIsUnplannedModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Unplanned Visit</span>
            </button>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 3 SUMMARY KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Beat Progress</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-foreground">
                {completedCount} / {totalPlanned} Stops
              </span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {Math.round((completedCount / (totalPlanned || 1)) * 100)}% route completion today
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Distance Covered</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-foreground">{expenseSuggestion.totalDistanceKm} km</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Odometer telemetry logged by mobile GPS
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Orders Booked</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-purple-600">₹24,500</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                1 FMCG distributor order placed
              </span>
            </div>
          </div>
        </div>

        {/* EXPENSE ALLOWANCE LINK (Distance-Based Allowance Suggestion) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/5 to-card border border-emerald-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-foreground">
                  Distance Travel Allowance Suggestion • Automated Reimbursement
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  ₹{expenseSuggestion.ratePerKm}/km Policy
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Logged <strong>{expenseSuggestion.totalDistanceKm} km</strong> today across retail client stops ={' '}
                <strong className="text-emerald-600 font-bold">₹{expenseSuggestion.totalAllowance.toFixed(2)}</strong> allowance.
              </p>
            </div>
          </div>

          <div>
            {expenseSuggestion.isClaimed ? (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                <Check className="w-4 h-4" />
                <span>Claimed (Voucher #EXP-204 Submitted)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  claimDistanceExpense()
                  showToast(
                    `Created Travel Allowance claim for ₹${expenseSuggestion.totalAllowance.toFixed(2)} based on ${expenseSuggestion.totalDistanceKm}km covered!`
                  )
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Expense Claim (₹{expenseSuggestion.totalAllowance.toFixed(2)})</span>
              </button>
            )}
          </div>
        </div>

        {/* TODAY'S PLAN LIST */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Today's Beat Itinerary (Sequential Route)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check in upon arrival at client premises. Geofence radius is verified against your GPS position.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {myPlans.map((plan, idx) => (
              <div
                key={plan.id}
                className="p-5 flex items-start justify-between flex-wrap gap-4 hover:bg-muted/20 transition"
              >
                {/* Left: Stop Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-[260px]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground">{plan.clientName}</h4>
                      {plan.isUnplanned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Unplanned Stop
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {plan.scheduledTimeSlot}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">{plan.clientAddress}</p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Crosshair className="w-3.5 h-3.5 text-primary" />
                        Fence Radius: {plan.geofenceRadiusMeters}m
                      </span>
                      <span>•</span>
                      <span className="font-medium text-foreground">Objective: {plan.purpose}</span>
                    </div>

                    {/* Outcome notes if completed */}
                    {plan.status === 'Completed' && plan.outcome && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] space-y-0.5">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                          Outcome: {plan.outcome} {plan.orderValue && `(₹${plan.orderValue.toLocaleString()})`}
                        </span>
                        <p className="text-muted-foreground italic">“{plan.notes}”</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status & Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  {plan.status === 'Completed' && (
                    <div className="text-right space-y-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 inline-block">
                        Completed ({plan.visitDurationMinutes} mins)
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Checked out at {plan.checkOutTime}
                      </span>
                    </div>
                  )}

                  {plan.status === 'In Progress' && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20 inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                          In Progress
                        </span>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          Since {plan.checkInTime}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenCheckOut(plan)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Check-Out Now
                      </button>
                    </div>
                  )}

                  {plan.status === 'Planned' && (
                    <button
                      type="button"
                      onClick={() => handleOpenCheckIn(plan)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm transition"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Start Check-In</span>
                    </button>
                  )}

                  {plan.status === 'Missed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      Missed / Skipped
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHECK-IN DIALOG (Simulated Location + Photo Upload + Fence Check) */}
      {checkInModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">GPS Location Check-In</h3>
              </div>
              <button type="button" onClick={handleCloseCheckIn} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LOCATION IN USE ACTIVE BADGE */}
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Location In Use</span>
              </div>
              <span className="font-mono text-[11px]">GPS Precision: High (±4m)</span>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Target Outlet</span>
                <h4 className="font-bold text-sm text-foreground">{checkInModalPlan.clientName}</h4>
                <p className="text-[11px] text-muted-foreground">{checkInModalPlan.clientAddress}</p>
              </div>

              {/* Geo-fence Proximity Check Simulation */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  Client Geo-Fence Parameter ({checkInModalPlan.geofenceRadiusMeters} meters)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulatedDistanceOption('inside')}
                    className={`p-3 rounded-xl border text-left transition ${
                      simulatedDistanceOption === 'inside'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="block text-xs">✓ Inside Fence (28m away)</span>
                    <span className="text-[10px] text-muted-foreground">Within allowed 75m perimeter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimulatedDistanceOption('outside')}
                    className={`p-3 rounded-xl border text-left transition ${
                      simulatedDistanceOption === 'outside'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="block text-xs">⚠ Outside Fence (195m away)</span>
                    <span className="text-[10px] text-muted-foreground">Triggers geo-deviation warning</span>
                  </button>
                </div>
              </div>

              {/* Photo Upload (Simulated Storefront / Shelf Capture) */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground flex items-center justify-between">
                  <span>Storefront Photo Verification</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Photo Attached ✓</span>
                </label>
                <div className="relative rounded-xl overflow-hidden border border-border group">
                  <img
                    src={capturedPhoto}
                    alt="Storefront Captured"
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                      <Camera className="w-4 h-4" /> Change Photo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCloseCheckIn}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckIn}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Validate & Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-OUT DIALOG (Outcome + Order + Next Visit + Notes) */}
      {checkOutModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-foreground">Complete Visit & Check-Out</h3>
              </div>
              <button type="button" onClick={handleCloseCheckOut} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LOCATION IN USE ACTIVE BADGE */}
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Location In Use</span>
              </div>
              <span className="font-mono text-[11px]">Check-out Departure Timestamp Registered</span>
            </div>

            <div className="text-xs space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Client</span>
                  <h4 className="font-bold text-sm text-foreground">{checkOutModalPlan.clientName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Elapsed Duration</span>
                  <span className="font-bold text-sm text-foreground block">38 minutes</span>
                </div>
              </div>

              {/* Outcome Selector */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Visit Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      'Order Placed',
                      'Follow-up Required',
                      'No Meeting / Decision Maker Absent',
                      'Payment Collected',
                    ] as VisitOutcome[]
                  ).map((oc) => (
                    <button
                      key={oc}
                      type="button"
                      onClick={() => setCheckOutForm({ ...checkOutForm, outcome: oc })}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        checkOutForm.outcome === oc
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {oc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Value (Conditional if Order Placed) */}
              {checkOutForm.outcome === 'Order Placed' && (
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Booked Order Value (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">₹</span>
                    <input
                      type="number"
                      required
                      value={checkOutForm.orderValue}
                      onChange={(e) =>
                        setCheckOutForm({ ...checkOutForm, orderValue: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-background border border-input rounded-xl font-bold text-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Next Visit Date */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Next Scheduled Follow-Up Date</label>
                <input
                  type="date"
                  value={checkOutForm.nextVisitDate}
                  onChange={(e) => setCheckOutForm({ ...checkOutForm, nextVisitDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                />
              </div>

              {/* Visit Notes */}
              <div className="space-y-1">
                <label className="font-bold text-foreground">Meeting Summary Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Discussed festive discount slabs; stock replenishing on Monday..."
                  value={checkOutForm.notes}
                  onChange={(e) => setCheckOutForm({ ...checkOutForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleCloseCheckOut}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckOut}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Confirm Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD UNPLANNED VISIT MODAL */}
      {isUnplannedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Add Ad-Hoc / Unplanned Visit</h3>
              <button
                type="button"
                onClick={() => setIsUnplannedModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-muted-foreground">
                Spotted a prospect on your beat route? Check in immediately to claim travel distance and log orders.
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Select Client Outlet</label>
                <select
                  value={unplannedForm.clientId}
                  onChange={(e) => setUnplannedForm({ ...unplannedForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Meeting Purpose</label>
                <input
                  type="text"
                  value={unplannedForm.purpose}
                  onChange={(e) => setUnplannedForm({ ...unplannedForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsUnplannedModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnplannedVisit}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
              >
                Start Unplanned Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
