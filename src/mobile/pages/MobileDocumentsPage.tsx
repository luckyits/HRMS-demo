import React, { useState } from 'react'
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'
import type { DocumentChecklistItem } from '@/mock/essData'

export const MobileDocumentsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { documents, uploadDocument } = useEss()
  const { showToast } = useToast()

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedDoc, setSelectedDoc] = useState<DocumentChecklistItem | null>(null)
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState<boolean>(false)

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'Identity', label: 'Identity (KYC)' },
    { id: 'Academic', label: 'Academic' },
    { id: 'Experience', label: 'Experience' },
    { id: 'Legal', label: 'Legal & Agreement' },
  ]

  const filteredDocs = documents.filter((d) => {
    if (activeCategory === 'all') return true
    return d.category === activeCategory
  })

  // Check for documents with expiring validity (within 90 days)
  const expiringDocs = documents.filter((d) => d.expiryDate)

  const handleSimulatedUpload = (mode: 'camera' | 'file') => {
    if (!selectedDoc) return

    const mockFileName = mode === 'camera'
      ? `${selectedDoc.name.toLowerCase().replace(/\s+/g, '_')}_camera_snap.jpg`
      : `${selectedDoc.name.toLowerCase().replace(/\s+/g, '_')}_scanned.pdf`

    uploadDocument(selectedDoc.id, mockFileName)
    showToast(`Document uploaded successfully via ${mode === 'camera' ? 'camera capture' : 'file manager'}!`, 'success')
    setIsUploadSheetOpen(false)
  }

  const getStatusChip = (status: DocumentChecklistItem['status']) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'Uploaded':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    }
  }

  if (!hasFeature('JOINING_DOCS')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Joining documents module is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Document Vault"
        subtitle="Onboarding checklist & compliance KYC"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Expiry Alerts Banner if any document expires */}
        {expiringDocs.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Document Expiry Alert</span>
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
              Passport / Driving license expires on <strong>{expiringDocs[0].expiryDate}</strong>. Please upload renewed copy before expiry to maintain payroll compliance.
            </p>
          </div>
        )}

        {/* Category Filters */}
        <ChipFilterRow
          chips={categories}
          selectedId={activeCategory}
          onSelect={(id) => setActiveCategory(id)}
        />

        {/* Documents Checklist */}
        <div className="space-y-2.5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc)
                setIsUploadSheetOpen(true)
              }}
              className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {doc.name}
                  </h4>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusChip(doc.status)}`}>
                  {doc.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span>Category: {doc.category}</span>
                {doc.isMandatory && (
                  <span className="text-rose-500 font-semibold text-[10px]">Mandatory</span>
                )}
              </div>

              {doc.fileName && (
                <div className="flex items-center justify-between text-[11px] bg-muted/40 p-2 rounded-xl text-foreground">
                  <span className="truncate max-w-[200px] font-mono text-[10px]">
                    📄 {doc.fileName}
                  </span>
                  <span className="text-primary font-bold">View / Replace</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Bottom Sheet */}
      <BottomSheet
        isOpen={isUploadSheetOpen}
        onClose={() => setIsUploadSheetOpen(false)}
        title={selectedDoc?.name}
        subtitle={`Category: ${selectedDoc?.category} • Status: ${selectedDoc?.status}`}
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
              <span className="text-muted-foreground block">Compliance Guidance:</span>
              <p className="text-foreground">
                Upload clear color photo or PDF (max 5MB). Ensure name matches employee record.
              </p>
            </div>

            {selectedDoc.fileName && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold block">
                    Current Document on File
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {selectedDoc.fileName}
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSimulatedUpload('camera')}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo with Camera</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatedUpload('file')}
                className="w-full py-3.5 px-4 rounded-2xl bg-card border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition hover:bg-muted"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Select from File Gallery / PDF</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
