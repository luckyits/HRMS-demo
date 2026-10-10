import React from 'react'
import { MapPin, Navigation, ShieldCheck } from 'lucide-react'

interface TrackingIndicatorProps {
  status?: 'active' | 'geofenced' | 'checking'
  label?: string
  distanceMeters?: number
}

export const TrackingIndicator: React.FC<TrackingIndicatorProps> = ({
  status = 'active',
  label,
  distanceMeters,
}) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'geofenced':
        return {
          icon: ShieldCheck,
          text: label || 'Inside Verified Geofence',
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
          textCol: 'text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500',
        }
      case 'checking':
        return {
          icon: Navigation,
          text: label || 'Checking GPS Location...',
          bg: 'bg-amber-500/10 dark:bg-amber-950/40',
          textCol: 'text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
        }
      default:
        return {
          icon: MapPin,
          text: label || 'Location in use • GPS Logged',
          bg: 'bg-indigo-500/10 dark:bg-indigo-950/40',
          textCol: 'text-indigo-600 dark:text-indigo-400',
          dot: 'bg-indigo-500',
        }
    }
  }

  const { icon: Icon, text, bg, textCol, dot } = getStatusDetails()

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${textCol} border border-current/10 shadow-2xs select-none`}
    >
      <div className="relative flex items-center justify-center">
        <span className={`w-2 h-2 rounded-full ${dot} animate-ping absolute`} />
        <span className={`w-2 h-2 rounded-full ${dot} relative`} />
      </div>
      <Icon className="w-3.5 h-3.5 stroke-[2.2px]" />
      <span className="truncate">{text}</span>
      {distanceMeters !== undefined && (
        <span className="text-[10px] opacity-80 font-normal">
          ({distanceMeters}m away)
        </span>
      )}
    </div>
  )
}
