import React from 'react'
import { Wifi, Battery, Signal, Smartphone, X } from 'lucide-react'
import { useDemo } from '@/context/DemoContext'

interface PhoneFrameProps {
  children: React.ReactNode
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { setPhonePreview, settings } = useDemo()

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900/90 dark:bg-black/95 backdrop-blur-md select-none">
      {/* Top Floating Control Bar */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[390px] px-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Mobile Preview</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
            390 × 844
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPhonePreview(false)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 text-xs font-medium border border-slate-700"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Preview</span>
        </button>
      </div>

      {/* Realistic Phone Shell (390 x 844) */}
      <div className="relative w-[390px] h-[844px] rounded-[50px] p-[10px] bg-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-slate-700/80 flex flex-col shrink-0">
        {/* Outer Phone Bezel Buttons Simulation */}
        <div className="absolute -left-[13px] top-[115px] w-[3px] h-[26px] bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[13px] top-[160px] w-[3px] h-[45px] bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[13px] top-[215px] w-[3px] h-[45px] bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[13px] top-[170px] w-[3px] h-[65px] bg-slate-700 rounded-r-sm" />

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full bg-background rounded-[40px] overflow-hidden flex flex-col text-foreground">
          {/* iOS / Mobile Status Bar with Dynamic Island */}
          <div className="sticky top-0 z-50 h-11 px-6 bg-card/90 backdrop-blur-md flex items-center justify-between text-xs font-semibold shrink-0">
            {/* Time */}
            <span className="font-bold text-[12px] tracking-tight">09:41</span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-center gap-1 px-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-foreground">
              <Signal className="w-3.5 h-3.5 stroke-[2.2px]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2.2px]" />
              <Battery className="w-4 h-4 stroke-[2.2px]" />
            </div>
          </div>

          {/* Mobile Screen App Body */}
          <div className="flex-1 w-full overflow-y-auto relative flex flex-col">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-foreground/25 pointer-events-none z-50" />
        </div>
      </div>
    </div>
  )
}
