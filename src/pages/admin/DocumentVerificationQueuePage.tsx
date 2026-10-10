import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees, type EmployeeDocument } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const DocumentVerificationQueuePage: React.FC = () => {
  const { documentsQueue, verifyDocument } = useEmployees()

  const [statusFilter, setStatusFilter] = useState<string>('Pending')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Selected document for preview / action
  const [selectedDoc, setSelectedDoc] = useState<EmployeeDocument | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const filteredDocs = useMemo(() => {
    return documentsQueue.filter((doc) => {
      const matchStatus = statusFilter === 'All' || doc.status === statusFilter
      const matchType = typeFilter === 'All' || doc.docType === typeFilter
      const matchSearch =
        doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())

      return matchStatus && matchType && matchSearch
    })
  }, [documentsQueue, statusFilter, typeFilter, searchTerm])

  const pendingCount = documentsQueue.filter((d) => d.status === 'Pending').length
  const verifiedCount = documentsQueue.filter((d) => d.status === 'Verified').length
  const rejectedCount = documentsQueue.filter((d) => d.status === 'Rejected').length

  const handleVerify = (docId: string) => {
    verifyDocument(docId, 'Verified')
    setSelectedDoc(null)
  }

  const handleReject = () => {
    if (selectedDoc) {
      verifyDocument(selectedDoc.id, 'Rejected', rejectReason || 'Document unreadable or invalid')
      setShowRejectModal(false)
      setSelectedDoc(null)
      setRejectReason('')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/hr/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      <PageHeader
        title="Document Verification Queue"
        subtitle="Review, approve, or reject identity documents, degrees, and statutory certificates submitted by new joiners."
      />

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('Pending')}
          className={cn(
            'p-4 rounded-xl border text-left transition',
            statusFilter === 'Pending'
              ? 'border-amber-500 bg-amber-500/10'
              : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <p className="text-xs text-muted-foreground font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-500 mt-0.5">{pendingCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('Verified')}
          className={cn(
            'p-4 rounded-xl border text-left transition',
            statusFilter === 'Verified'
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <p className="text-xs text-muted-foreground font-medium">Verified & Compliant</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{verifiedCount}</p>
        </button>

        <button
          onClick={() => setStatusFilter('Rejected')}
          className={cn(
            'p-4 rounded-xl border text-left transition',
            statusFilter === 'Rejected'
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <p className="text-xs text-muted-foreground font-medium">Rejected Documents</p>
          <p className="text-2xl font-bold text-rose-500 mt-0.5">{rejectedCount}</p>
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by employee name or file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
          >
            <option value="All">All Document Types</option>
            <option value="National ID">National ID</option>
            <option value="Degree Certificate">Degree Certificate</option>
            <option value="Passport">Passport</option>
            <option value="Experience Letter">Experience Letter</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Document Type</th>
              <th className="p-3">File Name</th>
              <th className="p-3">Upload Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No documents found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/30 transition">
                  <td className="p-3">
                    <p className="font-semibold text-foreground">{doc.employeeName}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">{doc.employeeId}</span>
                  </td>
                  <td className="p-3 font-medium text-foreground">{doc.docType}</td>
                  <td className="p-3 font-mono text-muted-foreground">
                    {doc.fileName} <span className="text-[10px]">({doc.fileSize})</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{doc.uploadDate}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        doc.status === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : doc.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      )}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border hover:bg-muted text-foreground transition text-[11px]"
                      >
                        <Eye className="w-3 h-3 text-primary" />
                        <span>Inspect</span>
                      </button>

                      {doc.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleVerify(doc.id)}
                            className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition"
                            title="Quick Approve"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDoc(doc)
                              setShowRejectModal(true)
                            }}
                            className="p-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Inspect Modal */}
      {selectedDoc && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Document Review: {selectedDoc.docType}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee:</span>
                <strong className="text-foreground">{selectedDoc.employeeName} ({selectedDoc.employeeId})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Name:</span>
                <span className="font-mono text-foreground">{selectedDoc.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded:</span>
                <span>{selectedDoc.uploadDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-semibold">{selectedDoc.status}</span>
              </div>
              {selectedDoc.rejectReason && (
                <div className="flex justify-between text-rose-500">
                  <span>Rejection Reason:</span>
                  <span>{selectedDoc.rejectReason}</span>
                </div>
              )}
            </div>

            {/* Document preview simulation card */}
            <div className="h-44 border border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-background text-muted-foreground space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <p className="text-xs font-medium">Digital Signature & KYC Metadata Verified</p>
              <span className="text-[10px]">Mock PDF Stream Preview</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              {selectedDoc.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                  >
                    Reject Document
                  </button>
                  <button
                    onClick={() => handleVerify(selectedDoc.id)}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
                  >
                    Mark as Verified
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm">Reject Document: {selectedDoc.docType}</h3>
            <p className="text-xs text-muted-foreground">
              Provide feedback for {selectedDoc.employeeName}. The employee will receive a notification to re-upload.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason for Rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Scanned copy is blurry or signature is missing."
                rows={3}
                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Back
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
