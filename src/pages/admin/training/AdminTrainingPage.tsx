import React, { useState } from 'react'
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react'
import { useOptionalModules, TrainingCourseItem, EmployeeCertificationItem } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'
import { TableSkeleton, CardSkeleton } from '@/components/common/SkeletonLoader'
import { formatCurrency } from '@/lib/currency'
import { useTranslation } from 'react-i18next'

export const AdminTrainingPage: React.FC = () => {
  const { t } = useTranslation()
  const { courses, certifications, enrollInCourse } = useOptionalModules()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'courses' | 'certifications' | 'compliance'>('courses')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [loading, setLoading] = useState(false)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourseItem | null>(null)
  const [enrollEmployeeName, setEnrollEmployeeName] = useState('')

  // New course form state
  const [newCourse, setNewCourse] = useState<Omit<TrainingCourseItem, 'id' | 'enrolledCount' | 'completedCount'>>({
    courseTitle: '',
    category: 'Statutory & Compliance',
    isMandatory: true,
    durationHours: 4,
    format: 'E-Learning (Self-Paced)',
    passingScorePct: 80
  })

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast('Training catalog & certifications updated', 'info')
    }, 600)
  }

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredCerts = certifications.filter((cert) => {
    return cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return
    enrollInCourse(selectedCourse.id)
    showToast(`Successfully enrolled ${enrollEmployeeName || 'Employee'} in ${selectedCourse.courseTitle}`, 'success')
    setShowEnrollModal(false)
    setEnrollEmployeeName('')
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourse.courseTitle.trim()) {
      showToast('Course title is required', 'warning')
      return
    }
    showToast(`Course "${newCourse.courseTitle}" published successfully to LMS`, 'success')
    setShowAddCourseModal(false)
  }

  const mandatoryCourses = courses.filter((c) => c.isMandatory)
  const expiringCertsCount = certifications.filter((c) => c.status === 'Expiring in <30d').length
  const expiredCertsCount = certifications.filter((c) => c.status === 'Expired').length

  return (
    <div className="space-y-6">
      {/* Header & KPI ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Learning & Development (LMS)
              </h1>
              <p className="text-sm text-muted-foreground">
                Mandatory statutory training, skill accreditations, and certifications expiry engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-3.5 py-2 text-sm border border-border rounded-xl hover:bg-muted font-medium flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync LMS
          </button>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Course
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog</span>
            <BookOpen className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{courses.length} Modules</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-500">{mandatoryCourses.length}</span> Mandatory for compliance
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Enrollments</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {courses.reduce((acc, c) => acc + c.enrolledCount, 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Completion rate: <span className="font-semibold text-indigo-500">78.4%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Valid Certifications</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">
            {certifications.filter((c) => c.status === 'Valid').length} Active
          </div>
          <div className="text-xs text-muted-foreground mt-1">Audit-ready credentials</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Risk</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {expiringCertsCount} Expiring
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <span className="text-rose-500 font-semibold">{expiredCertsCount}</span> already expired
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'courses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Course Catalog ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'certifications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4" />
          Certifications & Expiry ({certifications.length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'compliance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Mandatory Safety Matrix
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder={activeTab === 'courses' ? 'Search course title or topic...' : 'Search employee, certificate...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {activeTab === 'courses' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Categories</option>
              <option value="Statutory & Compliance">Statutory & Compliance</option>
              <option value="Workplace Safety & Fire">Workplace Safety & Fire</option>
              <option value="Technical & Engineering">Technical & Engineering</option>
              <option value="Leadership & Soft Skills">Leadership & Soft Skills</option>
            </select>
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : activeTab === 'courses' ? (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const completionPct = Math.round((course.completedCount / (course.enrolledCount || 1)) * 100)
            return (
              <div
                key={course.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        course.category === 'Statutory & Compliance'
                          ? 'bg-rose-500/10 text-rose-500'
                          : course.category === 'Workplace Safety & Fire'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}
                    >
                      {course.category}
                    </span>
                    {course.isMandatory && (
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-md">
                        Mandatory
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-foreground mb-1 leading-snug">
                    {course.courseTitle}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.durationHours} Hours
                    </span>
                    <span>•</span>
                    <span>{course.format}</span>
                    <span>•</span>
                    <span>Pass: {course.passingScorePct}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Completion: {course.completedCount}/{course.enrolledCount} learners</span>
                      <span className="font-semibold text-foreground">{completionPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{course.id}</span>
                  <button
                    onClick={() => {
                      setSelectedCourse(course)
                      setShowEnrollModal(true)
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition"
                  >
                    Enroll Cohort
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : activeTab === 'certifications' ? (
        /* Certifications Table */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Accreditation / Course</th>
                  <th className="px-5 py-3.5">Certificate ID</th>
                  <th className="px-5 py-3.5">Issued Date</th>
                  <th className="px-5 py-3.5">Expiry Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                      No matching certification records found.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => (
                    <tr key={cert.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-3.5 font-medium">
                        <div>{cert.employeeName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{cert.employeeId}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {cert.courseName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {cert.certificateNumber}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{cert.issuedDate}</td>
                      <td className="px-5 py-3.5 font-medium">
                        <div>{cert.expiryDate}</div>
                        <div className="text-xs text-muted-foreground">
                          {cert.daysToExpiry > 0 ? `${cert.daysToExpiry} days left` : 'Expired'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1 ${
                            cert.status === 'Valid'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : cert.status === 'Expiring in <30d'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {cert.status === 'Valid' && <CheckCircle2 className="w-3 h-3" />}
                          {cert.status === 'Expiring in <30d' && <AlertTriangle className="w-3 h-3" />}
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => showToast(`Renewal notice dispatched to ${cert.employeeName}`, 'info')}
                          className="px-2.5 py-1 text-xs border border-border rounded-lg hover:bg-muted font-medium transition"
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mandatory Safety Compliance Matrix */
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Statutory & Workplace Safety Mandates</h2>
            <p className="text-sm text-muted-foreground">
              Indian Factories Act & OSHA statutory requirement tracker by plant location and role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-xl p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">Factories Act: Fire & Emergency Evacuation</span>
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">98% Compliant</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Mandatory for 100% of shop-floor and warehouse technicians every 12 months.
              </p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]" />
              </div>
            </div>

            <div className="border border-border rounded-xl p-4 bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-foreground">POSH (Prevention of Sexual Harassment)</span>
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">100% Compliant</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Mandatory annual refresher for all corporate and factory employees.
              </p>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Course */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Create New Training Module</h3>
              <button onClick={() => setShowAddCourseModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomics & Hazardous Material Handling"
                  value={newCourse.courseTitle}
                  onChange={(e) => setNewCourse({ ...newCourse, courseTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                  >
                    <option value="Statutory & Compliance">Statutory & Compliance</option>
                    <option value="Workplace Safety & Fire">Workplace Safety & Fire</option>
                    <option value="Technical & Engineering">Technical & Engineering</option>
                    <option value="Leadership & Soft Skills">Leadership & Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Format</label>
                  <select
                    value={newCourse.format}
                    onChange={(e) => setNewCourse({ ...newCourse, format: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                  >
                    <option value="E-Learning (Self-Paced)">E-Learning (Self-Paced)</option>
                    <option value="Virtual Classroom">Virtual Classroom</option>
                    <option value="In-Person Workshop">In-Person Workshop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCourse.durationHours}
                    onChange={(e) => setNewCourse({ ...newCourse, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Pass Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newCourse.passingScorePct}
                    onChange={(e) => setNewCourse({ ...newCourse, passingScorePct: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isMandatory"
                  checked={newCourse.isMandatory}
                  onChange={(e) => setNewCourse({ ...newCourse, isMandatory: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary/20"
                />
                <label htmlFor="isMandatory" className="text-sm text-foreground">
                  Mark as Mandatory Compliance Training
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Cohort */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Enroll in {selectedCourse.courseTitle}</h3>
            <p className="text-xs text-muted-foreground">
              Select an employee or target cohort to enroll into this training session.
            </p>
            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Employee / Cohort</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar (EMP-104) or 'All Factory Workers'"
                  value={enrollEmployeeName}
                  onChange={(e) => setEnrollEmployeeName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
