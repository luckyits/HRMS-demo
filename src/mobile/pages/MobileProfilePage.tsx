import React, { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Briefcase,
  Users,
  AlertCircle,
  FileEdit,
  Send,
  Lock,
  CheckCircle2,
  Calendar,
  HeartHandshake
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useAccess } from '@/access/useAccess'
import { useEss } from '@/context/EssContext'
import { useToast } from '@/context/ToastContext'

export const MobileProfilePage: React.FC = () => {
  const { currentEmployee, hasFeature } = useAccess()
  const { pendingProfileEdit, submitProfileEditRequest } = useEss()
  const { showToast } = useToast()

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    job: false,
    manager: false,
    emergency: false,
    bank: false,
    ids: false,
  })

  // Edit Request State
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editField, setEditField] = useState('emergencyPhone')
  const [editValue, setEditValue] = useState('+91 98450 99881')
  const [editReason, setEditReason] = useState('Updated active emergency mobile number')

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitProfileEditRequest({ [editField]: editValue }, editReason)
    showToast('Profile correction request submitted to HR Operations for approval!', 'success')
    setIsEditSheetOpen(false)
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Employee Profile"
        subtitle="Credentials & verified records"
        showBack={false}
      />

      <div className="p-4 space-y-4">
        {/* Profile Header Card */}
        <div className="p-6 rounded-3xl bg-card border border-border text-center shadow-xs space-y-3 relative overflow-hidden">
          <div className="relative inline-block">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-primary/20 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-card">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-foreground">{currentEmployee.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentEmployee.designation} • {currentEmployee.department}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">
                ID: {currentEmployee.id}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {currentEmployee.branch}
              </span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC & Aadhaar Verified</span>
            </span>
          </div>

          {/* Pending Edit Alert */}
          {pendingProfileEdit && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Profile edit request pending HR approval</span>
            </div>
          )}
        </div>

        {/* Accordion Sections */}
        <div className="space-y-2.5">
          {/* 1. Personal Information */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('personal')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Personal Details
                </span>
              </div>
              {openSections.personal ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.personal && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-semibold text-foreground">14 Aug 1994</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-semibold text-foreground">Male</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Blood Group:</span>
                  <span className="font-semibold text-foreground">O Positive (O+)</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Marital Status:</span>
                  <span className="font-semibold text-foreground">Single</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Current Residence:</span>
                  <span className="font-semibold text-foreground text-right max-w-[200px]">
                    Indiranagar 2nd Stage, Bengaluru 560038
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Job & Work Profile */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('job')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Job & Employment
                </span>
              </div>
              {openSections.job ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.job && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-semibold text-foreground">{currentEmployee.designation}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold text-foreground">{currentEmployee.department}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Date of Joining:</span>
                  <span className="font-semibold text-foreground">12 Jan 2023</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Employment Nature:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Full-Time Permanent
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Assigned Shift:</span>
                  <span className="font-semibold text-foreground">General (09:30 AM – 06:30 PM)</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. Reporting Manager */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('manager')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Reporting Manager
                </span>
              </div>
              {openSections.manager ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.manager && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Manager Name:</span>
                  <span className="font-bold text-foreground">Vikram Malhotra</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-semibold text-foreground">Engineering Director / HOD</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold text-primary truncate max-w-[200px]">
                    vikram.malhotra@apextech.com
                  </span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-semibold text-foreground">+91 98201 54321</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Emergency Contact */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('emergency')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Emergency Contact
                </span>
              </div>
              {openSections.emergency ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.emergency && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="font-semibold text-foreground">Rajesh Patel</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Relationship:</span>
                  <span className="font-semibold text-foreground">Father</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Emergency Number:</span>
                  <span className="font-semibold text-foreground">+91 98450 11223</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Bank Details (Sensitive) */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('bank')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Bank Account (Salary Credit)
                </span>
              </div>
              {openSections.bank ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.bank && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Bank Name:</span>
                  <span className="font-semibold text-foreground">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-semibold text-foreground">Koramangala 5th Block, Bengaluru</span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Account Number:</span>
                  <SensitiveField
                    value="50100492817293"
                    maskedDisplay="••••••••••7293"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <SensitiveField
                    value="HDFC0000492"
                    maskedDisplay="HDFC••••492"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. Statutory IDs (Sensitive) */}
          <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('ids')}
              className="w-full p-4 flex items-center justify-between text-left active:bg-muted/40 transition"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Statutory & Identity IDs
                </span>
              </div>
              {openSections.ids ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {openSections.ids && (
              <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-border/50 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">PAN Number:</span>
                  <SensitiveField
                    value="ABCDE1234F"
                    maskedDisplay="••••••1234F"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Aadhaar Card:</span>
                  <SensitiveField
                    value="8492 1048 2910"
                    maskedDisplay="•••• •••• 2910"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">UAN (Provident Fund):</span>
                  <SensitiveField
                    value="100928374651"
                    maskedDisplay="••••••••4651"
                  />
                </div>
                <div className="flex items-center justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">ESIC Insurance No:</span>
                  <SensitiveField
                    value="3190284756"
                    maskedDisplay="••••••4756"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Request Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsEditSheetOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/50 text-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <FileEdit className="w-4 h-4 text-primary" />
            <span>Request Profile Correction (HR Sign-off)</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Correction Bottom Sheet */}
      <BottomSheet
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        title="Request Profile Correction"
        subtitle="Forwarded to HR Operations for document verification"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Field to Update
            </label>
            <select
              value={editField}
              onChange={(e) => setEditField(e.target.value)}
              className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
            >
              <option value="emergencyPhone">Emergency Contact Number</option>
              <option value="currentAddress">Current Residential Address</option>
              <option value="bankAccount">Bank Account Number (Attach Cheque)</option>
              <option value="maritalStatus">Marital Status</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              New Requested Value
            </label>
            <input
              type="text"
              required
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Justification / Reason
            </label>
            <textarea
              rows={3}
              required
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Correction for HR Review</span>
          </button>
        </form>
      </BottomSheet>
    </div>
  )
}
