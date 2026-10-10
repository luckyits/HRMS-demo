import React, { useState, useEffect, useRef } from 'react'
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Scan,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  WifiOff,
  Clock,
  ArrowRight,
  UserCheck,
  Compass,
  AlertCircle
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useAttendance } from '@/context/AttendanceContext'
import { useToast } from '@/context/ToastContext'
import { TrackingIndicator } from '@/mobile/components/TrackingIndicator'
import { BottomSheet } from '@/mobile/components/BottomSheet'

interface MobilePunchFlowModalProps {
  isOpen: boolean
  onClose: () => void
  punchType: 'IN' | 'OUT'
  onSuccess: (details: { time: string; location: string; offline: boolean }) => void
}

export const MobilePunchFlowModal: React.FC<MobilePunchFlowModalProps> = ({
  isOpen,
  onClose,
  punchType,
  onSuccess,
}) => {
  const { hasFeature, currentEmployee } = useAccess()
  const { settings } = useDemo()
  const { hasConsent, setConsent, recordPunch } = useAttendance()
  const { showToast } = useToast()

  // Steps: 'consent' -> 'selfie' -> 'geofence' -> 'success'
  const [currentStep, setCurrentStep] = useState<'consent' | 'selfie' | 'geofence' | 'success'>('consent')

  // Consent bottom sheet
  const [showConsentSheet, setShowConsentSheet] = useState(false)
  const [useNonBiometricFallback, setUseNonBiometricFallback] = useState(false)

  // Camera & Face scan state
  const [cameraActive, setCameraActive] = useState(false)
  const [faceScanProgress, setFaceScanProgress] = useState(0)
  const [livenessHint, setLivenessHint] = useState('Position your face inside the oval')
  const [faceMatchResult, setFaceMatchResult] = useState<'scanning' | 'matched' | 'retry'>('scanning')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Geofence state
  const [geofenceStatus, setGeofenceStatus] = useState<'Inside fence' | 'Outside fence' | 'Low accuracy'>('Inside fence')
  const [outsideFenceReason, setOutsideFenceReason] = useState('')

  // Success details
  const [punchTime, setPunchTime] = useState('')

  const isRemote = !hasFeature('GEOFENCE')
  const isFaceAllowed = hasFeature('FACE_SELFIE') && !useNonBiometricFallback

  // Initialize flow on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      setPunchTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )

      if (!hasConsent) {
        setCurrentStep('consent')
        setShowConsentSheet(true)
      } else if (isFaceAllowed) {
        setCurrentStep('selfie')
        startCamera()
      } else if (!isRemote) {
        setCurrentStep('geofence')
      } else {
        finishPunch()
      }
    } else {
      stopCamera()
      setFaceScanProgress(0)
      setFaceMatchResult('scanning')
    }
  }, [isOpen, hasConsent, useNonBiometricFallback])

  // Camera stream handler
  const startCamera = async () => {
    setCameraActive(true)
    setFaceScanProgress(10)
    setLivenessHint('Align face • Look straight')

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }
    } catch {
      // Fallback to simulated stream
    }

    // Simulate liveness detection progression
    setTimeout(() => {
      setFaceScanProgress(45)
      setLivenessHint('Blink twice to verify liveness')
    }, 1200)

    setTimeout(() => {
      setFaceScanProgress(80)
      setLivenessHint('Verifying facial feature map...')
    }, 2400)

    setTimeout(() => {
      setFaceScanProgress(100)
      setFaceMatchResult('matched')
      setLivenessHint('Face Matched (98.6% Confidence)')
    }, 3200)
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  const handleGrantConsent = () => {
    setConsent(true)
    setShowConsentSheet(false)
    showToast('Biometric & location consent granted', 'success')
    if (isFaceAllowed) {
      setCurrentStep('selfie')
      startCamera()
    } else if (!isRemote) {
      setCurrentStep('geofence')
    } else {
      finishPunch()
    }
  }

  const handleWithdrawConsent = () => {
    setConsent(false)
    setUseNonBiometricFallback(true)
    setShowConsentSheet(false)
    showToast('Switched to non-biometric manual PIN fallback', 'info')
    if (!isRemote) {
      setCurrentStep('geofence')
    } else {
      finishPunch()
    }
  }

  const proceedFromSelfie = () => {
    stopCamera()
    if (!isRemote) {
      setCurrentStep('geofence')
    } else {
      finishPunch()
    }
  }

  const finishPunch = () => {
    const isOffline = Boolean(settings.offlineMode)

    // Save offline or normal
    if (isOffline) {
      try {
        const existing = JSON.parse(localStorage.getItem('hrms_offline_punches') || '[]')
        existing.push({
          time: punchTime,
          type: punchType,
          employeeId: currentEmployee.id,
          location: isRemote ? 'Remote Home Location' : 'Bengaluru Tech Park - Gate 2',
          savedAt: new Date().toISOString(),
        })
        localStorage.setItem('hrms_offline_punches', JSON.stringify(existing))
      } catch {}
      showToast('Saved offline. Will sync automatically when network restores.', 'warning')
    } else {
      recordPunch({
        time: punchTime,
        type: punchType,
        location: isRemote ? 'Remote (Anywhere)' : 'Bengaluru Tech Park - Gate 2',
        accuracy: '6m',
        geofenceStatus: isRemote ? 'Not applicable' : geofenceStatus,
        selfieVerified: isFaceAllowed,
        outsideFenceReason: geofenceStatus === 'Outside fence' ? outsideFenceReason : undefined,
        status: geofenceStatus === 'Outside fence' ? 'Pending Approval' : 'Approved',
      })
      showToast(`${punchType === 'IN' ? 'Punch IN' : 'Punch OUT'} recorded successfully!`, 'success')
    }

    setCurrentStep('success')
    onSuccess({
      time: punchTime,
      location: isRemote ? 'Remote Work' : 'HQ Tech Park',
      offline: isOffline,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-background pointer-events-auto animate-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-md h-full flex flex-col bg-background select-none">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-card/95 backdrop-blur-md border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {punchType}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {punchType === 'IN' ? 'Punch In Verification' : 'Punch Out Verification'}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">
                {settings.currentUser.name} • {punchTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Tracking Indicator (Shown during active punch flow) */}
        {currentStep !== 'success' && (
          <div className="p-3 bg-muted/40 border-b border-border/60 flex items-center justify-between">
            <TrackingIndicator status="active" label="Location in use • Biometric scanning" />
            {settings.offlineMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
          </div>
        )}

        {/* Main Step Flow Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
          {/* STEP 2: FACE_SELFIE SCAN */}
          {currentStep === 'selfie' && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Step 1: Face Liveness Verification
                </span>
                <h4 className="text-base font-bold text-foreground">
                  Look directly into the camera
                </h4>
                <p className="text-xs text-muted-foreground">
                  Anti-spoofing audit active. Matches employee biometric enrollment profile.
                </p>
              </div>

              {/* Camera Face Guide Oval Frame */}
              <div className="relative w-64 h-80 mx-auto rounded-[50px] overflow-hidden bg-slate-900 border-4 border-primary/40 shadow-xl flex items-center justify-center">
                {/* Real or Simulated Video */}
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />

                {/* Simulated Avatar if camera unavailable */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-2xs">
                  <img
                    src={currentEmployee.avatar}
                    alt={currentEmployee.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-white/40 opacity-80"
                  />
                </div>

                {/* Face Oval Overlay */}
                <div className="absolute inset-4 rounded-[45px] border-2 border-dashed border-primary/60 pointer-events-none" />

                {/* Laser Scanning Animation Line */}
                {faceMatchResult === 'scanning' && (
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse top-1/2 -translate-y-1/2" />
                )}

                {/* Match Confirmation Badge */}
                {faceMatchResult === 'matched' && (
                  <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-emerald-400 p-4 space-y-2 animate-in zoom-in-95">
                    <CheckCircle2 className="w-14 h-14 stroke-[2.5px]" />
                    <span className="text-base font-black">Identity Verified!</span>
                    <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      Score: 98.6% Match
                    </span>
                  </div>
                )}
              </div>

              {/* Liveness Hint Pill */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-foreground shadow-xs">
                  {faceMatchResult === 'scanning' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span>{livenessHint}</span>
                </div>

                {/* Progress bar */}
                <div className="w-48 mx-auto h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${faceScanProgress}%` }}
                  />
                </div>

                {/* Continue Button */}
                {faceMatchResult === 'matched' && (
                  <button
                    type="button"
                    onClick={proceedFromSelfie}
                    className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition mt-2"
                  >
                    <span>Proceed to Geofence Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: GEOFENCE CHECK */}
          {currentStep === 'geofence' && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Step 2: Location & Geofence Check
                </span>
                <h4 className="text-base font-bold text-foreground">
                  Confirming Campus Perimeter
                </h4>
                <p className="text-xs text-muted-foreground">
                  Target location: Bengaluru Tech Park • Allowed Radius: 150m
                </p>
              </div>

              {/* Map Placeholder Card */}
              <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
                {/* Simulated Map View */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 overflow-hidden flex items-center justify-center">
                  {/* Radar Circles */}
                  <div className="absolute w-36 h-36 rounded-full border border-indigo-500/30 animate-ping" />
                  <div className="absolute w-28 h-28 rounded-full bg-indigo-500/10 border border-indigo-500/40" />

                  {/* Campus Center Pin */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] bg-slate-900/90 text-white px-2 py-0.5 rounded font-bold border border-slate-700">
                      HQ Gate 2 (Geofenced)
                    </span>
                  </div>

                  <span className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono">
                    12.9716° N, 77.5946° E
                  </span>
                </div>

                {/* Location Status Chips Switcher for Demo Testing */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">GPS Accuracy:</span>
                    <span className="font-bold text-foreground">High (±6 meters)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Fence Distance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      18m from center (Inside)
                    </span>
                  </div>
                </div>

                {/* Geofence Simulator Selector */}
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Simulate GPS:</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGeofenceStatus('Inside fence')}
                      className={`px-2 py-1 text-[11px] rounded-lg font-bold border transition ${
                        geofenceStatus === 'Inside fence'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      Inside Fence
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeofenceStatus('Outside fence')}
                      className={`px-2 py-1 text-[11px] rounded-lg font-bold border transition ${
                        geofenceStatus === 'Outside fence'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      Outside (340m)
                    </button>
                  </div>
                </div>
              </div>

              {/* Outside Fence Warning & Justification */}
              {geofenceStatus === 'Outside fence' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Outside Geofence: Requires Supervisor Approval</span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter reason (e.g. Working from client site / traffic delay)..."
                    value={outsideFenceReason}
                    onChange={(e) => setOutsideFenceReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Finish Punch Button */}
              <button
                type="button"
                onClick={finishPunch}
                className="w-full min-h-[48px] py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>
                  {geofenceStatus === 'Outside fence'
                    ? 'Submit Punch with Reason'
                    : `Confirm ${punchType === 'IN' ? 'Punch IN' : 'Punch OUT'}`}
                </span>
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION SCREEN */}
          {currentStep === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-4 animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 stroke-[2.5px] animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {settings.offlineMode ? 'Saved Locally (Offline)' : 'Attendance Recorded'}
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {punchType === 'IN' ? 'Punched IN Successfully' : 'Punched OUT Successfully'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {currentEmployee.name} • Shift: General (09:00 - 18:00)
                </p>
              </div>

              {/* Audit Summary Card */}
              <div className="w-full p-4 rounded-2xl bg-card border border-border space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-bold text-foreground">{punchTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold text-foreground">
                    {isRemote ? 'Remote Home Location' : 'Bengaluru Tech Park (Gate 2)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biometric Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {isFaceAllowed ? 'Face Matched (98.6%)' : 'Non-Biometric PIN Audit'}
                  </span>
                </div>
                {settings.offlineMode && (
                  <div className="flex justify-between text-amber-500 font-bold pt-1 border-t border-border/50">
                    <span>Sync Status:</span>
                    <span>Queued in Offline Storage</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STEP 1: PERMISSION & CONSENT BOTTOM SHEET */}
      <BottomSheet
        isOpen={showConsentSheet}
        onClose={() => setShowConsentSheet(false)}
        title="Biometric & GPS Consent"
        subtitle="Mandatory under Digital Personal Data Protection (DPDP) Act"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Why We Request Permissions:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Camera: Single-frame face match to prevent proxy punching.</li>
              <li>Location: Geo-fence verification within company boundary.</li>
              <li>Data Retention: Stored securely for 90 days as per company policy.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={handleWithdrawConsent}
              className="text-rose-500 font-semibold hover:underline"
            >
              Withdraw Consent / Use Manual PIN
            </button>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={handleWithdrawConsent}
              className="flex-1 py-3 px-3 border border-border rounded-xl font-bold text-foreground hover:bg-muted transition"
            >
              Use PIN Fallback
            </button>
            <button
              type="button"
              onClick={handleGrantConsent}
              className="flex-1 py-3 px-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-md hover:bg-primary/90 transition"
            >
              Grant & Continue
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
