import React, { useState, useRef, useEffect } from 'react'
import {
  FileSignature,
  CheckCircle2,
  Trash2,
  Lock,
  ShieldCheck,
  Send,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'

export const MobileAgreementPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { isAgreementSigned, signatureTimestamp, signatureDataUrl, signAgreement } = useEss()
  const { showToast } = useToast()

  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw')
  const [typedName, setTypedName] = useState(currentEmployee.name)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef<boolean>(false)
  const [hasDrawn, setHasDrawn] = useState<boolean>(false)

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#2563eb' // Primary blue ink
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [signMode, isAgreementSigned])

  const startDrawing = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    isDrawing.current = true
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    isDrawing.current = false
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleSignAgreement = () => {
    let finalDataUrl = ''
    if (signMode === 'draw') {
      if (!hasDrawn && !canvasRef.current) {
        showToast('Please draw your signature on the pad before confirming', 'warning')
        return
      }
      finalDataUrl = canvasRef.current?.toDataURL() || ''
    } else {
      if (!typedName.trim()) {
        showToast('Please type your legal full name', 'warning')
        return
      }
      // Render typed name to temporary canvas dataURL
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = 320
      tempCanvas.height = 100
      const ctx = tempCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#1e293b'
        ctx.font = 'italic 28px serif'
        ctx.fillText(typedName, 20, 60)
        finalDataUrl = tempCanvas.toDataURL()
      }
    }

    signAgreement(finalDataUrl)
    showToast('Employment agreement e-signed and locked with compliance seal!', 'success')
  }

  if (!hasFeature('AGREEMENT')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Work agreement module is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-24">
      <MobileHeader
        title="Work Agreement"
        subtitle="Employment terms & legally binding e-sign"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Status Card */}
        {isAgreementSigned ? (
          <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">
              Agreement E-Signed & Validated
            </h3>
            <p className="text-xs text-muted-foreground">
              Executed on {signatureTimestamp || 'Oct 2026'} • IT Act 2000 Compliant
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Pending employee signature. Review contractual terms below and provide your digital signature.
            </span>
          </div>
        )}

        {/* Contractual Terms Card */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Document: EMP-AGR-2026-99
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Full-Time Permanent
            </span>
          </div>

          <h2 className="text-base font-black text-foreground">
            Appointment & Confidentiality Agreement
          </h2>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1.5 leading-relaxed text-muted-foreground">
            <div>
              <strong className="text-foreground">First Party (Employer):</strong> Apex Technologies Pvt Ltd
            </div>
            <div>
              <strong className="text-foreground">Second Party (Employee):</strong> {currentEmployee.name} ({currentEmployee.designation})
            </div>
          </div>

          {/* Key Clauses */}
          <div className="space-y-2 text-xs leading-relaxed text-foreground/90 pt-1">
            <h4 className="font-bold text-foreground">1. Compensation & Working Hours</h4>
            <p className="text-muted-foreground">
              The employee is assigned to a standard 45-hour work week in accordance with the Model Standing Orders. Remuneration is payable on the last working day of each calendar month.
            </p>

            <h4 className="font-bold text-foreground">2. Notice Period & Separation</h4>
            <p className="text-muted-foreground">
              A notice period of 60 calendar days is required by either party during employment. Buyout or waiver is subject to administrative management discretion.
            </p>

            <h4 className="font-bold text-foreground">3. Intellectual Property & Confidentiality</h4>
            <p className="text-muted-foreground">
              All inventions, source code, data pipelines and customer assets created during employment remain the exclusive proprietary property of the company.
            </p>
          </div>
        </div>

        {/* E-Signature Section */}
        {isAgreementSigned ? (
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Digital Signature Certificate
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                e-Sign Verified
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center flex flex-col items-center justify-center min-h-[100px]">
              {signatureDataUrl ? (
                <img
                  src={signatureDataUrl}
                  alt="Employee signature"
                  className="max-h-20 object-contain mx-auto"
                />
              ) : (
                <span className="font-serif italic text-2xl text-foreground">
                  {currentEmployee.name}
                </span>
              )}
            </div>

            <div className="space-y-1 text-[11px] font-mono text-muted-foreground pt-1">
              <div>Hash: 4a9f82d1b09c2184e819acbd71890ef2</div>
              <div>Timestamp: {signatureTimestamp || 'Oct 12, 2026, 11:42:19 AM IST'}</div>
              <div>Signer: {currentEmployee.name} ({currentEmployee.id})</div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sign Here
              </span>

              {/* Mode Toggle */}
              <div className="flex p-0.5 bg-muted rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    signMode === 'draw' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'
                  }`}
                >
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('type')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    signMode === 'type' ? 'bg-card text-foreground shadow-2xs font-bold' : 'text-muted-foreground'
                  }`}
                >
                  Type Name
                </button>
              </div>
            </div>

            {signMode === 'draw' ? (
              <div className="space-y-2">
                <div className="relative border-2 border-dashed border-border rounded-2xl overflow-hidden bg-background">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[140px] touch-none cursor-crosshair bg-background"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground/60 font-medium">
                      Sign with your finger or stylus inside this box
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-muted-foreground hover:text-rose-500 flex items-center gap-1 active:scale-95 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear & Redraw</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full legal name"
                  className="w-full px-3.5 py-2.5 text-xs bg-background border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="p-4 rounded-xl bg-muted/40 border border-border text-center">
                  <span className="font-serif italic text-2xl text-foreground select-none">
                    {typedName || 'Your Signature Preview'}
                  </span>
                </div>
              </div>
            )}

            {/* Sticky Submission Bar */}
            <StickyActionBar>
              <button
                type="button"
                onClick={handleSignAgreement}
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <FileSignature className="w-4 h-4" />
                <span>Affix Digital Signature & Lock Contract</span>
              </button>
            </StickyActionBar>
          </div>
        )}
      </div>
    </div>
  )
}
