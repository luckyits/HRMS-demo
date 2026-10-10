import React, { useState } from 'react'
import {
  GraduationCap,
  Award,
  PlayCircle,
  CheckCircle,
  Clock,
  Download,
  AlertCircle,
  BookOpen,
  Calendar
} from 'lucide-react'
import { useOptionalModules, TrainingCourseItem } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'

export const MyTrainingPage: React.FC = () => {
  const { courses, certifications, enrollInCourse } = useOptionalModules()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'my_courses' | 'certificates'>('my_courses')
  const [inProgressId, setInProgressId] = useState<string | null>(null)

  const handleStartCourse = (course: TrainingCourseItem) => {
    setInProgressId(course.id)
    showToast(`Launching interactive course: "${course.courseTitle}"`, 'info')
  }

  const handleDownloadCertificate = (certName: string) => {
    showToast(`Generating tamper-proof PDF certificate for ${certName}...`, 'success')
  }

  const myCertificates = certifications.filter((c) => c.employeeName.includes('Aarav') || c.employeeId === 'EMP-101')

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                My Learning & Certifications
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete your mandatory safety training, build career skills, and download accreditations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('my_courses')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'my_courses'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assigned Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'certificates'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Certifications ({myCertificates.length || 2})
          </button>
        </div>
      </div>

      {activeTab === 'my_courses' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const isMandatory = course.isMandatory
            return (
              <div
                key={course.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        isMandatory
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-500'
                      }`}
                    >
                      {isMandatory ? 'Required by Compliance' : 'Optional Upskilling'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {course.durationHours}h
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-foreground mb-2">{course.courseTitle}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Category: <span className="font-semibold text-foreground">{course.category}</span> • Delivery: {course.format}
                  </p>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span>Passing Score Threshold:</span>
                      <span className="font-semibold text-foreground">{course.passingScorePct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accreditation Validity:</span>
                      <span className="font-semibold text-foreground">12 Months</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{course.id}</span>
                  <button
                    onClick={() => handleStartCourse(course)}
                    className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Launch Module
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-1">Your Verified Digital Credentials</h2>
            <p className="text-xs text-muted-foreground mb-5">
              These digital certificates are cryptographically verifiable and registered with HR Compliance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-xl p-5 bg-gradient-to-br from-indigo-500/5 via-card to-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8 text-indigo-500" />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      Active
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-base mb-1">
                    Workplace Fire Safety & Evacuation
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ID: CERT-2026-FIRE-882</p>
                  <p className="text-xs text-muted-foreground">Valid until: 2027-09-15</p>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleDownloadCertificate('Fire Safety & Evacuation')}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="border border-border rounded-xl p-5 bg-gradient-to-br from-emerald-500/5 via-card to-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8 text-emerald-500" />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      Active
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-base mb-1">
                    Prevention of Sexual Harassment (POSH)
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono mb-2">ID: CERT-2026-POSH-104</p>
                  <p className="text-xs text-muted-foreground">Valid until: 2027-08-30</p>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex justify-end">
                  <button
                    onClick={() => handleDownloadCertificate('POSH Compliance')}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
