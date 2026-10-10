import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAccess } from '@/access/useAccess'
import { useEss } from '@/context/EssContext'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
  FileText,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const MyProfilePage: React.FC = () => {
  const { currentEmployee } = useAccess()
  const { pendingProfileEdit, submitProfileEditRequest } = useEss()

  const [editModal, setEditModal] = useState({
    isOpen: false,
    phone: '+91 98765 43210',
    emergencyContact: 'Meera Patel (Spouse) - +91 98220 11223',
    currentAddress: 'Apartment 402, Green Glen Layout, Bellandur, Bengaluru',
    reason: '',
  })

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitProfileEditRequest(
      {
        phone: editModal.phone,
        emergencyContact: editModal.emergencyContact,
        address: editModal.currentAddress,
      },
      editModal.reason || 'Self-service contact address correction'
    )
    setEditModal((prev) => ({ ...prev, isOpen: false }))
    alert('Profile edit request submitted for HR Operations approval.')
  }

  return (
    <FeatureGate feature="PROFILE">
      <div className="space-y-6">
        <PageHeader
          title="My Employment Profile & Master Portfolio"
          subtitle="View personal, statutory, banking, and organizational details with masked confidentiality"
          scope="Self"
          breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Profile' }]}
          action={
            <button
              type="button"
              onClick={() => setEditModal((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Profile Update</span>
            </button>
          }
        />

        {/* Pending Edit Notice */}
        {pendingProfileEdit && (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Profile Change Request Pending HR Review:</strong> Updates on {Object.keys(pendingProfileEdit).join(', ')} currently under verification.
              </span>
            </div>
            <StatusBadge status="pending" label="Under Verification" />
          </div>
        )}

        {/* Profile Identity Hero */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={currentEmployee.avatar}
            alt={currentEmployee.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20 shadow-sm shrink-0"
          />

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {currentEmployee.name}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {currentEmployee.designation} • Grade {currentEmployee.grade}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <StatusBadge status="active" label={currentEmployee.status} />
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-primary/10 text-primary">
                  {currentEmployee.id}
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground justify-center sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-primary" />
                {currentEmployee.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {currentEmployee.branch}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" />
                {currentEmployee.email}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Job & Organization Reporting */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2 pb-2 border-b border-border">
              <Building className="w-4 h-4 text-primary" />
              <span>Job & Organizational Reporting</span>
            </h4>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <span className="text-muted-foreground block text-[11px]">Reporting Manager</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {currentEmployee.reportingManagerName || 'Sarah Jenkins (Executive)'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Date of Joining</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {currentEmployee.joiningDate}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Employment Type</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {currentEmployee.profileType} (Full-Time)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Work Location</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {currentEmployee.branch}
                </span>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-3 border-t border-border">
              <span className="text-muted-foreground block text-[11px]">Emergency Contact Person</span>
              <span className="font-semibold text-foreground text-xs mt-0.5 block">
                Meera Patel (Spouse) • +91 98220 11223
              </span>
            </div>
          </div>

          {/* Right Column: Confidential Banking & Statutory IDs (Masked with SensitiveField) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4 text-xs">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-2 pb-2 border-b border-border">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Statutory IDs & Masked Banking Details</span>
            </h4>

            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground block text-[11px] mb-0.5">Bank Account Number</span>
                <SensitiveField value="HDFC 50100492817291" maskedDisplay="HDFC ••••••••••7291" />
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-0.5">IFSC Code</span>
                <span className="font-mono text-foreground font-semibold">HDFC0000240</span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-0.5">Permanent Account Number (PAN)</span>
                <SensitiveField value="ABCDE1234F" maskedDisplay="ABCDE••••F" />
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px] mb-0.5">Aadhaar Unique ID</span>
                <SensitiveField value="8492 1102 9942" maskedDisplay="•••• •••• 9942" />
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-bold text-foreground block">
                Custom Enterprise Fields:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">Blood Group:</span>
                  <span className="font-semibold text-foreground">B Positive (B+)</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border">
                  <span className="text-muted-foreground block">T-Shirt / Uniform Size:</span>
                  <span className="font-semibold text-foreground">Medium (M)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Request Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 relative text-xs">
              <button
                type="button"
                onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Request Profile Information Update</span>
              </h3>
              <p className="text-muted-foreground mt-0.5">
                Changes will be sent to HR Operations for compliance sign-off.
              </p>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editModal.phone}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Emergency Contact & Relationship
                  </label>
                  <input
                    type="text"
                    required
                    value={editModal.emergencyContact}
                    onChange={(e) =>
                      setEditModal((prev) => ({ ...prev, emergencyContact: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Current Residential Address
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editModal.currentAddress}
                    onChange={(e) =>
                      setEditModal((prev) => ({ ...prev, currentAddress: e.target.value }))
                    }
                    className="w-full p-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Reason for Change
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Relocated to new residence in Bellandur..."
                    value={editModal.reason}
                    onChange={(e) => setEditModal((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs"
                  >
                    Submit For Approval
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
