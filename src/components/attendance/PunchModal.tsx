import { useAccess } from '@/access/useAccess'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAttendance } from '@/context/AttendanceContext'
import { useDemo } from '@/context/DemoContext'
import {
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  KeyRound,
  Lock,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface PunchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PunchModal: React.FC<PunchModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useDemo()
  const { hasFeature } = useAccess()
  const {
    isPunchedIn,
    recordPunch,
    hasConsent,
    setConsent,
    setIsScanInProgress,
  } = useAttendance()

  // Feature checks for modal components
  const isFaceAllowed = hasFeature('FACE_SELFIE')
  const isGeofenceAllowed = hasFeature('GEOFENCE') && settings.employeeType !== 'Remote'

  // Modal Flow Step: 'consent' | 'scan' | 'outsideFenceReason' | 'pinFallback' | 'success'
  const [step, setStep] = useState<
    'consent' | 'scan' | 'outsideFenceReason' | 'pinFallback' | 'success'
  >('scan')

  // Simulated scan state
  const [scanProgress, setScanProgress] = useState(0)
  const [livenessHint, setLivenessHint] = useState('Position face inside the frame')
  const [simulatedLocationStatus, setSimulatedLocationStatus] = useState<
    'Inside fence' | 'Outside fence' | 'Low accuracy'
  >('Inside fence')
  const [outsideReason, setOutsideReason] = useState('')
  const [pinInput, setPinInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      if ((isFaceAllowed || isGeofenceAllowed) && !hasConsent) {
        setStep('consent')
      } else {
        startScanFlow()
      }
    } else {
      setIsScanInProgress(false)
    }
  }, [isOpen, hasConsent, isFaceAllowed, isGeofenceAllowed])

  const startScanFlow = () => {
    setStep('scan')
    setScanProgress(0)
    setIsScanInProgress(true)
    setLivenessHint('Position face inside frame')

    // Simulate Location Check
    if (isGeofenceAllowed) {
      // 80% inside fence, 20% outside fence simulation
      const isInside = Math.random() > 0.2
      setSimulatedLocationStatus(isInside ? 'Inside fence' : 'Outside fence')
    } else {
      setSimulatedLocationStatus('Inside fence')
    }

    // Simulate animated scanning progression
    let current = 0
    const interval = setInterval(() => {
      current += 20
      setScanProgress(current)

      if (current === 40) {
        setLivenessHint('✨ Liveness Check: Blink twice now')
      } else if (current === 80) {
        setLivenessHint('Scanning facial landmark biometrics...')
      } else if (current >= 100) {
        clearInterval(interval)
        setIsScanInProgress(false)

        // Check if outside fence
        if (isGeofenceAllowed && simulatedLocationStatus === 'Outside fence') {
          setStep('outsideFenceReason')
        } else {
          executeCompletePunch('Inside fence')
        }
      }
    }, 450)
  }

  const executeCompletePunch = (
    geofenceStatus: 'Inside fence' | 'Outside fence' | 'Low accuracy',
    reason?: string
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const nextType = isPunchedIn ? 'OUT' : 'IN'

    recordPunch({
      time,
      type: nextType,
      location:
        geofenceStatus === 'Inside fence'
          ? 'Bengaluru Tech Park - Building A'
          : 'Client Onsite / Field Area (Outside Fence)',
      accuracy: '6 meters',
      geofenceStatus: isGeofenceAllowed ? geofenceStatus : 'Not applicable',
      selfieVerified: isFaceAllowed,
      outsideFenceReason: reason,
      status: geofenceStatus === 'Outside fence' ? 'Pending Approval' : 'Approved',
    })

    setStep('success')
  }

  const handleConsentAccept = () => {
    setConsent(true)
    startScanFlow()
  }

  const handleOutsideReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!outsideReason) return
    executeCompletePunch('Outside fence', outsideReason)
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput.length < 4) return
    executeCompletePunch('Inside fence', 'Biometric Fallback: Verified with 4-Digit Employee PIN')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden text-xs">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. CONSENT DIALOG STEP */}
        {step === 'consent' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-foreground">
                Biometric & Geo-Location Consent
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                To mark your attendance, this system utilizes browser selfie verification and GPS boundary checks as mandated by enterprise policy.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Facial Selfie & Liveness Check</span>
              </div>
              <p>Selfie is stored temporarily for supervisor audit trail matching.</p>

              <div className="flex items-center gap-2 text-foreground font-medium pt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Geofence Proximity Check</span>
              </div>
              <p>Your coordinates are checked solely during check-in and check-out.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConsentAccept}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 transition text-xs"
              >
                I Consent & Proceed
              </button>

              <button
                type="button"
                onClick={() => setStep('pinFallback')}
                className="w-full py-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground text-[11px] font-medium transition"
              >
                Use Non-Biometric Fallback (PIN / Approval)
              </button>
            </div>
          </div>
        )}

        {/* 2. SCANNING & WEBCAM VIEW STEP */}
        {step === 'scan' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  {isPunchedIn ? 'Punch Out Verification' : 'Punch In Verification'}
                </h3>
              </div>

              {/* Location in use chip */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse">
                <MapPin className="w-3 h-3 text-indigo-600" />
                <span>Location in use</span>
              </div>
            </div>

            {/* Simulated Camera Viewfinder */}
            {isFaceAllowed ? (
              <div className="relative w-full h-56 rounded-2xl bg-slate-900 border-2 border-dashed border-primary/40 overflow-hidden flex flex-col items-center justify-center text-white">
                {/* User avatar behind viewfinder simulation */}
                <img
                  src={settings.currentUser.avatar}
                  alt={settings.currentUser.name}
                  className="w-28 h-28 rounded-full object-cover filter brightness-90 contrast-105"
                />

                {/* Animated Scanner Bar */}
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/50 transition-all duration-300"
                  style={{ top: `${scanProgress}%` }}
                />

                {/* Viewfinder Reticle Corners */}
                <div className="absolute inset-4 border-2 border-cyan-400/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                </div>

                {/* Hint banner */}
                <div className="absolute bottom-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-medium text-cyan-200">
                  {livenessHint}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-muted/40 border border-border text-center space-y-2">
                <Clock className="w-8 h-8 text-primary mx-auto animate-spin" />
                <p className="font-semibold text-foreground">
                  Verifying Web Timestamp & Session
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Selfie verification is not required for your employee profile.
                </p>
              </div>
            )}

            {/* Geofence Proximity Status Chip */}
            {isGeofenceAllowed && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground">
                    Office Geofence Status:
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    simulatedLocationStatus === 'Inside fence'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {simulatedLocationStatus} (Within 250m radius)
                </span>
              </div>
            )}

            {/* Non-biometric switch option */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep('pinFallback')}
                className="text-xs text-primary hover:underline"
              >
                Webcam issue? Use Employee PIN Fallback
              </button>
            </div>
          </div>
        )}

        {/* 3. OUTSIDE FENCE REASON STEP */}
        {step === 'outsideFenceReason' && (
          <form onSubmit={handleOutsideReasonSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-foreground text-sm">
                Outside Geofenced Perimeter
              </h3>
            </div>

            <p className="text-muted-foreground text-xs leading-relaxed">
              Your location coordinates indicate you are outside the designated office boundary. Under company policy, this punch requires a stated business justification and will be forwarded to your supervisor for approval.
            </p>

            <div>
              <label className="font-semibold text-foreground block mb-1">
                Reason for Outside Punch
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Attending morning client sprint kickoff at client site..."
                value={outsideReason}
                onChange={(e) => setOutsideReason(e.target.value)}
                className="w-full p-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-border bg-card text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
              >
                Submit for Manager Approval
              </button>
            </div>
          </form>
        )}

        {/* 4. PIN FALLBACK STEP */}
        {step === 'pinFallback' && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-sm">
                Non-Biometric PIN Verification
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Enter your 4-digit employee security PIN to authorize this punch.
              </p>
            </div>

            <div>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center tracking-widest text-lg py-2.5 font-mono bg-background border border-input rounded-xl text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90"
              >
                Verify & Punch
              </button>
              <button
                type="button"
                onClick={() => setStep('scan')}
                className="w-full py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Return to Webcam Scan
              </button>
            </div>
          </form>
        )}

        {/* 5. SUCCESS RESULT STEP */}
        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">
                Attendance Recorded Successfully!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isPunchedIn ? 'Punch Out' : 'Punch In'} logged at{' '}
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 transition text-xs"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
