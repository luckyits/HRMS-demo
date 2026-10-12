import React, { useState } from 'react'
import {
  MapPin,
  Camera,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Settings,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useToast } from '@/context/ToastContext'

export const MobilePermissionsHelpPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [activeSheet, setActiveSheet] = useState<'camera' | 'location' | 'location-off' | null>(null)
  const [cameraGranted, setCameraGranted] = useState(true)
  const [locationGranted, setLocationGranted] = useState(false)

  const handleGrantCamera = () => {
    setCameraGranted(true)
    showToast('Camera permission enabled for selfie & receipts', 'success')
    setActiveSheet(null)
  }

  const handleGrantLocation = () => {
    setLocationGranted(true)
    showToast('Precise location permission enabled for branch geofence', 'success')
    setActiveSheet(null)
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Privacy & Permissions"
        subtitle="Device Hardware Access"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* DPDP Compliance Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Personal Data Protection (DPDP)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            HRMS accesses hardware sensors strictly during deliberate actions (clocking in or logging client visits). We never track background location when the app is closed.
          </p>
        </div>

        {/* Permission Cards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Sensor Permissions
          </h4>

          {/* Camera Permission Card */}
          <div
            onClick={() => setActiveSheet('camera')}
            className="p-4 rounded-3xl bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-foreground">
                  Camera Access
                </h5>
                <p className="text-[11px] text-muted-foreground">
                  Facial match selfie & expense receipt capture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cameraGranted
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {cameraGranted ? 'Allowed' : 'Not Allowed'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Location Permission Card */}
          <div
            onClick={() => setActiveSheet('location')}
            className="p-4 rounded-3xl bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-foreground">
                  Location (GPS)
                </h5>
                <p className="text-[11px] text-muted-foreground">
                  Geofence boundary verification & client visits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  locationGranted
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {locationGranted ? 'Allowed' : 'Action Required'}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Location Is Off Help Card */}
          <div
            onClick={() => setActiveSheet('location-off')}
            className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/30 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-500/50 active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-foreground">
                  "Location Is Off" Troubleshooting
                </h5>
                <p className="text-[11px] text-muted-foreground">
                  How to fix GPS accuracy & enable device sensors
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Friendly Camera Explanation Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'camera'}
        onClose={() => setActiveSheet(null)}
        title="Why HRMS Needs Camera Access"
      >
        <div className="space-y-4">
          <div className="flex justify-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Attendance Face Match:</strong> Verify you are on-site without buddy punching.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Expense Receipt Capture:</strong> Snap paper invoices on the fly for travel reimbursement.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Protected:</strong> Raw biometric embeddings are not shared with third parties.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGrantCamera}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition"
          >
            Allow Camera Access
          </button>
        </div>
      </BottomSheet>

      {/* Friendly Location Explanation Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'location'}
        onClose={() => setActiveSheet(null)}
        title="Why HRMS Needs Location Access"
      >
        <div className="space-y-4">
          <div className="flex justify-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Geofence Radius Check:</strong> Confirms you are within the registered office branch or plant fence.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Field Sales Check-In:</strong> Verifies arrival at scheduled client storefronts.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Zero 24/7 Tracking:</strong> Location is sampled only when you tap Punch or Check In.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGrantLocation}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition"
          >
            Allow Precise Location Access
          </button>
        </div>
      </BottomSheet>

      {/* "Location is off" Troubleshooting Help Sheet */}
      <BottomSheet
        isOpen={activeSheet === 'location-off'}
        onClose={() => setActiveSheet(null)}
        title="Location Services Are Off"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>
              Device GPS is disabled or browser permission was denied.
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-muted-foreground">
            <h5 className="font-bold text-foreground">
              How to enable location on your phone:
            </h5>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>
                Open phone <strong>Settings</strong> &gt; <strong>Location / Privacy</strong>.
              </li>
              <li>
                Turn on the master <strong>Location Services</strong> toggle.
              </li>
              <li>
                Select your browser (Chrome/Safari) and set permission to <strong>"While Using the App"</strong>.
              </li>
              <li>
                Enable <strong>"Precise Location"</strong> to pass the 50m branch geofence boundary.
              </li>
            </ol>
          </div>

          <button
            type="button"
            onClick={() => {
              showToast('GPS sensor re-checked. Ready for attendance!', 'success')
              setActiveSheet(null)
            }}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition"
          >
            I've Enabled GPS, Check Again
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
