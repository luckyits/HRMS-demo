import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { useEss } from '@/context/EssContext'
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eraser,
  FileCheck,
  FileSignature,
  FileText,
  Lock,
  PenTool,
  Printer,
  ShieldCheck,
  Type,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

export const WorkAgreementPage: React.FC = () => {
  const { isAgreementSigned, signatureTimestamp, signatureDataUrl, signAgreement } = useEss()

  const [signMode, setSignMode] = useState<'draw' | 'type'>('type')
  const [typedName, setTypedName] = useState('Priya Sharma')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#312e81'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, [signMode])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasDrawn(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleExecuteSignature = () => {
    setIsSubmitting(true)

    let finalDataUrl = ''
    if (signMode === 'draw' && canvasRef.current) {
      finalDataUrl = canvasRef.current.toDataURL()
    } else {
      // Create a canvas with typed signature
      const offscreen = document.createElement('canvas')
      offscreen.width = 360
      offscreen.height = 100
      const ctx = offscreen.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 360, 100)
        ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif'
        ctx.fillStyle = '#1e1b4b'
        ctx.fillText(typedName, 20, 60)
        finalDataUrl = offscreen.toDataURL()
      }
    }

    setTimeout(() => {
      signAgreement(finalDataUrl || 'typed_signature')
      setIsSubmitting(false)
    }, 700)
  }

  return (
    <FeatureGate feature="AGREEMENT">
      <div className="space-y-6">
        <PageHeader
          title="Employment & Work Agreement"
          subtitle="Legally binding employment terms, intellectual property assignment, and digital execution record"
          action={
            <div className="flex items-center gap-2">
              {isAgreementSigned ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Executed & Legally Certified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  Pending E-Signature
                </span>
              )}

              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          }
        />

        {/* Contract Viewer Document Paper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Document Header Letterhead */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Universal Enterprise HRMS
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Standard Employment Terms Agreement
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Agreement Ref: <code>EMP-AGR-2026-0814</code> • Classification: Highly Confidential
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Effective Date</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                15 August 2026
              </div>
            </div>
          </div>

          {/* Document Clauses Text */}
          <div className="p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500">Employee Name:</span>{' '}
                <strong className="text-slate-900 dark:text-white">Priya Sharma</strong>
              </div>
              <div>
                <span className="text-slate-500">Designation:</span>{' '}
                <strong className="text-slate-900 dark:text-white">Regional Sales Manager</strong>
              </div>
              <div>
                <span className="text-slate-500">Department / Branch:</span>{' '}
                <strong className="text-slate-900 dark:text-white">Field Sales / Bengaluru HQ</strong>
              </div>
              <div>
                <span className="text-slate-500">Notice Period:</span>{' '}
                <strong className="text-slate-900 dark:text-white">60 Calendar Days</strong>
              </div>
            </div>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Duties, Devotion of Time and Station of Work
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The Employee agrees to faithfully, diligently, and to the best of their ability, experience, and talents perform all duties assigned to this role. The Employee shall devote full business time, attention, and energies to the business and interests of the Company.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Compensation, Statutory Benefits, and Deductions
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                The Company shall compensate the Employee in accordance with the individualized Compensation and Benefit Annexure provided at the time of appointment. All remuneration shall be subject to statutory deductions including Provident Fund, ESI, Professional Tax, and Income Tax withholding (TDS).
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Intellectual Property Assignment & Non-Disclosure
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All inventions, software code, research, trade secrets, processes, customer records, and marketing strategies conceived or developed during the tenure of employment shall remain the sole and exclusive proprietary property of the Company. The Employee irrevocably assigns all right, title, and interest therein.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                4. Non-Compete & Non-Solicitation
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                During the term of employment and for twelve (12) months following separation, the Employee covenants not to directly or indirectly solicit any customer, client, or recruit any existing employee of the Company.
              </p>
            </section>

            {/* Execution / Signature Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              {isAgreementSigned ? (
                /* Signed Certificate Stamp View */
                <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300">
                        <Award className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                            Cryptographically Certified E-Signature
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                            VALID
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                          Executed in compliance with Information Technology (IT) Act, 2000.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert('Simulating download of legally sealed signed agreement.')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      Download Signed PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <div>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
                        Employee Signature Affixed:
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-900 inline-block">
                        {signatureDataUrl && signatureDataUrl.startsWith('data:') ? (
                          <img
                            src={signatureDataUrl}
                            alt="Signature"
                            className="h-12 object-contain"
                          />
                        ) : (
                          <div className="font-serif italic text-xl text-slate-800 dark:text-slate-200 px-4 py-1">
                            Priya Sharma
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-400">
                      <div><strong>Signed Timestamp:</strong> {signatureTimestamp || '2026-10-09 10:15 AM'}</div>
                      <div><strong>Certificate Serial:</strong> <code>CERT-9821-4402-IT</code></div>
                      <div><strong>Integrity Check:</strong> <code>SHA256: 7f2e1b...90d4aa</code></div>
                      <div><strong>IP Address Stamp:</strong> <code>103.21.144.18 (Bengaluru, IN)</code></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unsigned - E-Sign Simulation Form */
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Affix Digital E-Signature
                      </h4>
                    </div>

                    {/* Mode switcher */}
                    <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        onClick={() => setSignMode('type')}
                        className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                          signMode === 'type'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        Type
                      </button>
                      <button
                        onClick={() => setSignMode('draw')}
                        className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors ${
                          signMode === 'draw'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        Draw
                      </button>
                    </div>
                  </div>

                  {signMode === 'type' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Type Full Legal Name
                        </label>
                        <input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                          className="mt-1 w-full max-w-md px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="Your Legal Name"
                        />
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-md">
                        <div className="text-[11px] text-slate-400 mb-1">Generated Signature Preview</div>
                        <div className="font-serif italic text-2xl text-indigo-900 dark:text-indigo-200 py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                          {typedName || 'Your Name'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Digitally Verified Font Simulation
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Draw your signature in the box below using trackpad or mouse:</span>
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                        >
                          <Eraser className="w-3.5 h-3.5" /> Clear
                        </button>
                      </div>

                      <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl overflow-hidden bg-white dark:bg-slate-900 w-full max-w-md">
                        <canvas
                          ref={canvasRef}
                          width={440}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="cursor-crosshair w-full h-[120px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Legal Consent Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-2">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                      I hereby confirm that I have read all clauses in this Employment Agreement. I agree that my digital signature constitutes an authorized, legally binding execution equivalent to a physical pen-and-paper execution.
                    </span>
                  </label>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      disabled={
                        !agreedToTerms ||
                        (signMode === 'type' && !typedName.trim()) ||
                        (signMode === 'draw' && !hasDrawn) ||
                        isSubmitting
                      }
                      onClick={handleExecuteSignature}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Certifying E-Signature...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Affix Digital Signature & Seal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}
export default WorkAgreementPage
