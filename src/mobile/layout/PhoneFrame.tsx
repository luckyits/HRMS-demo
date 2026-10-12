import React, { useState } from 'react'
import { Wifi, Battery, Signal, Smartphone, X, RotateCw, Monitor } from 'lucide-react'
import { useDemo } from '@/context/DemoContext'

interface PhoneFrameProps {
  children: React.ReactNode
}

export type PhoneWidth = 360 | 390 | 430

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const { setPhonePreview } = useDemo()
  const [phoneWidth, setPhoneWidth] = useState<PhoneWidth>(390)
  const [isLandscape, setIsLandscape] = useState(false)

  // Derive frame dimensions
  const getDimensions = () => {
    if (isLandscape) {
      if (phoneWidth === 360) return { w: 780, h: 360 }
      if (phoneWidth === 430) return { w: 932, h: 430 }
      return { w: 844, h: 390 }
    }
    if (phoneWidth === 360) return { w: 360, h: 780 }
    if (phoneWidth === 430) return { w: 430, h: 932 }
    return { w: 390, h: 844 }
  }

  const { w, h } = getDimensions()

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-900/95 dark:bg-black/95 backdrop-blur-md select-none overflow-x-hidden">
      {/* Top Floating Control Bar */}
      <div
        className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 w-full transition-all duration-300"
        style={{ maxWidth: `${w}px` }}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-white">Mobile Viewport</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
            {w} × {h} {isLandscape ? 'Landscape' : 'Portrait'}
          </span>
        </div>

        {/* Viewport Width Controls: 360px, 390px, 430px */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
          {([360, 390, 430] as PhoneWidth[]).map((widthVal) => (
            <button
              key={widthVal}
              type="button"
              onClick={() => setPhoneWidth(widthVal)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                phoneWidth === widthVal
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {widthVal}px
            </button>
          ))}

          {/* Landscape Orientation Toggle */}
          <button
            type="button"
            onClick={() => setIsLandscape(!isLandscape)}
            className={`p-1 rounded-lg text-[11px] transition ml-0.5 ${
              isLandscape
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Landscape / Portrait"
            aria-label="Toggle Landscape Orientation"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPhonePreview(false)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 text-xs font-medium border border-slate-700"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      {/* Realistic Phone Shell */}
      <div
        className="relative rounded-[46px] p-[10px] bg-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-slate-700/80 flex flex-col shrink-0 transition-all duration-300"
        style={{ width: `${w}px`, height: `${h}px` }}
      >
        {/* Outer Phone Bezel Buttons Simulation (hidden in landscape) */}
        {!isLandscape && (
          <>
            <div className="absolute -left-[13px] top-[115px] w-[3px] h-[26px] bg-slate-700 rounded-l-sm" />
            <div className="absolute -left-[13px] top-[160px] w-[3px] h-[45px] bg-slate-700 rounded-l-sm" />
            <div className="absolute -left-[13px] top-[215px] w-[3px] h-[45px] bg-slate-700 rounded-l-sm" />
            <div className="absolute -right-[13px] top-[170px] w-[3px] h-[65px] bg-slate-700 rounded-r-sm" />
          </>
        )}

        {/* Inner Phone Screen */}
        <div className="relative w-full h-full bg-background rounded-[36px] overflow-hidden flex flex-col text-foreground">
          {/* iOS / Mobile Status Bar with Dynamic Island */}
          <div className="sticky top-0 z-50 h-10 px-5 bg-card/90 backdrop-blur-md flex items-center justify-between text-xs font-semibold shrink-0 select-none">
            {/* Time */}
            <span className="font-bold text-[12px] tracking-tight">09:41</span>

            {/* Dynamic Island Pill */}
            {!isLandscape && (
              <div className="w-20 h-4.5 rounded-full bg-black flex items-center justify-center gap-1 px-2 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>
            )}

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-foreground">
              <Signal className="w-3.5 h-3.5 stroke-[2.2px]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2.2px]" />
              <Battery className="w-4 h-4 stroke-[2.2px]" />
            </div>
          </div>

          {/* Mobile Screen App Body */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-foreground/20 pointer-events-none z-50" />
        </div>
      </div>
    </div>
  )
}
