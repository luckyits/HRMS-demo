import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { useEss } from '@/context/EssContext'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FileX2,
  FolderOpen,
  Info,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const MyDocumentsPage: React.FC = () => {
  const { documents, uploadDocument } = useEss()

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [previewDoc, setPreviewDoc] = useState<string | null>(null)

  // Status counts
  const verifiedCount = documents.filter((d) => d.status === 'Verified').length
  const pendingCount = documents.filter((d) => d.status === 'Pending').length
  const uploadedCount = documents.filter((d) => d.status === 'Uploaded').length
  const rejectedCount = documents.filter((d) => d.status === 'Rejected').length

  // Documents nearing expiry (within next 365 days or expired)
  const expiringDocuments = useMemo(() => {
    return documents.filter((d) => d.expiryDate)
  }, [documents])

  const categories = ['All', 'Identity', 'Academic', 'Experience', 'Legal']

  const filteredDocs = useMemo(() => {
    if (selectedCategory === 'All') return documents
    return documents.filter((d) => d.category === selectedCategory)
  }, [documents, selectedCategory])

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeUploadDocId) return

    setIsUploading(true)
    setTimeout(() => {
      uploadDocument(activeUploadDocId, selectedFileName || 'signed_credentials_upload.pdf')
      setIsUploading(false)
      setActiveUploadDocId(null)
      setSelectedFileName('')
    }, 800)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        )
      case 'Uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            Under Verification
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
            <FileX2 className="w-3.5 h-3.5" />
            Action Required
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Upload
          </span>
        )
    }
  }

  return (
    <FeatureGate feature="DOC_VAULT">
      <div className="space-y-6">
        <PageHeader
          title="My Documents & Joining Vault"
          subtitle="Compliant document repository, identity proof checklist, and digital credentials verification"
        />

        {/* Expiry Alerts Banner if any */}
        {expiringDocuments.length > 0 && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Document Validity & Renewal Tracking
              </h4>
              <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                {expiringDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <span>• <strong>{doc.name}</strong> valid until {doc.expiryDate}. Please ensure updated renewal filings are completed before the expiration date.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total Checklists</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {documents.length}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {verifiedCount}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Under Review
            </span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {uploadedCount}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Pending Upload
            </span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount + rejectedCount}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Document Checklist List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    doc.status === 'Verified'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                      : doc.status === 'Uploaded'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
                  }`}>
                    {doc.status === 'Verified' ? (
                      <FileCheck2 className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {doc.name}
                      </h3>
                      {doc.isMandatory && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          Mandatory
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Category: {doc.category}
                      </span>
                      {doc.fileName && (
                        <span>• File: <code className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">{doc.fileName}</code></span>
                      )}
                      {doc.uploadedAt && <span>• Uploaded: {doc.uploadedAt}</span>}
                      {doc.expiryDate && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          • Expires: {doc.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(doc.status)}

                  {doc.status === 'Verified' || doc.status === 'Uploaded' ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc.fileName || doc.name)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                        title="Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">View</span>
                      </button>
                      <button
                        onClick={() => alert(`Simulating download of ${doc.fileName || 'file.pdf'}`)}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveUploadDocId(doc.id)
                        setSelectedFileName(`${doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scan.pdf`)
                      }}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      Upload Document
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & GDPR Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>
            Uploaded documents are stored in an encrypted vault complying with ISO 27001 data protection standards. Documents are reviewed by the Compliance & HR Operations team within 24 to 48 business hours.
          </span>
        </div>

        {/* Upload Simulation Modal */}
        {activeUploadDocId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Credential Document
                  </h3>
                </div>
                <button
                  onClick={() => setActiveUploadDocId(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 text-center space-y-2">
                  <FolderOpen className="w-8 h-8 mx-auto text-indigo-500" />
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Drag and drop file or browse
                  </div>
                  <div className="text-[11px] text-slate-500">
                    PDF, JPEG, or PNG up to 10 MB
                  </div>
                  <input
                    type="text"
                    value={selectedFileName}
                    onChange={(e) => setSelectedFileName(e.target.value)}
                    placeholder="document_filename.pdf"
                    className="w-full mt-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Document Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    defaultValue="2032-12-31"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveUploadDocId(null)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Confirm & Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Document Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Document Viewer Preview
                  </h3>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <FileCheck2 className="w-12 h-12 mx-auto text-emerald-500" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {previewDoc}
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Document has been digitally indexed with cryptographic checksum verification and certified by HR Governance.
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                  SHA256: 4e9d0a...f8812c
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
export default MyDocumentsPage
