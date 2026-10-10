import React, { createContext, useContext, useState } from 'react'
import { AuditLogService } from '@/services/auditLogService'
import { useToast } from '@/context/ToastContext'

// 1. RECRUITMENT / ATS TYPES
export interface JobRequisitionItem {
  id: string
  jobTitle: string
  department: string
  branch: string
  openingsCount: number
  hiredCount: number
  targetCloseDate: string
  budgetCtcMax: number
  priority: 'Urgent' | 'High' | 'Normal'
  status: 'Open & Sourcing' | 'Interviews in Progress' | 'Offers Extended' | 'Fulfilled & Closed'
  hiringManager: string
}

export type CandidateStage = 'Applied' | 'Screening' | 'Technical Round' | 'Manager Interview' | 'Offer Extended' | 'Hired & Converted'

export interface CandidateItem {
  id: string
  requisitionId: string
  fullName: string
  email: string
  phone: string
  experienceYears: number
  currentCompany?: string
  expectedCtc: number
  stage: CandidateStage
  rating: number // 1 to 5
  resumeUrl: string
  interviewDate?: string
  offerCtc?: number
  isConvertedToEmployee?: boolean
}

// 2. PERFORMANCE TYPES
export interface OkrGoalItem {
  id: string
  employeeId: string
  employeeName: string
  title: string
  category: 'Revenue & Business Growth' | 'Operational Excellence' | 'Innovation & Tech' | 'Team & Culture'
  targetMetric: string
  currentProgressPct: number
  weightagePct: number
  cycleYear: string // "2026-27"
}

export interface AppraisalReviewCycle {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  cycleName: string
  selfRating: number
  managerRating: number
  finalCalibratedScore: number
  nineBoxGridPosition: 'High Potential - Star' | 'Core Performer' | 'Growth Needed' | 'High Performer'
  selfComments: string
  managerFeedback: string
  status: 'Draft Self Review' | 'Submitted for Manager Rating' | 'Completed & Calibrated'
  feedback360Count: number
}

// 3. TRAINING & LMS TYPES
export interface TrainingCourseItem {
  id: string
  courseTitle: string
  category: 'Statutory & Compliance' | 'Workplace Safety & Fire' | 'Technical & Engineering' | 'Leadership & Soft Skills'
  isMandatory: boolean
  durationHours: number
  format: 'E-Learning (Self-Paced)' | 'Virtual Classroom' | 'In-Person Workshop'
  enrolledCount: number
  completedCount: number
  passingScorePct: number
}

export interface EmployeeCertificationItem {
  id: string
  employeeId: string
  employeeName: string
  courseName: string
  issuedDate: string
  expiryDate: string
  certificateNumber: string
  status: 'Valid' | 'Expiring in <30d' | 'Expired'
  daysToExpiry: number
}

// 4. TIMESHEET TYPES
export interface ProjectTaskItem {
  id: string
  projectName: string
  clientName: string
  taskName: string
  isBillable: boolean
  hourlyBillingRateInr: number
}

export interface WeeklyTimesheetEntry {
  id: string
  employeeId: string
  employeeName: string
  weekStartDate: string // e.g. "2026-10-05"
  projectName: string
  taskName: string
  isBillable: boolean
  dailyHours: {
    mon: number
    tue: number
    wed: number
    thu: number
    fri: number
    sat: number
    sun: number
  }
  totalHours: number
  billableHours: number
  nonBillableHours: number
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  managerComments?: string
}

// 5. EMPLOYEE ENGAGEMENT & POLLS TYPES
export interface QuickPollItem {
  id: string
  question: string
  options: {
    id: string
    text: string
    votesCount: number
  }[]
  totalVotes: number
  expiresAt: string
  isActive: boolean
  userHasVoted?: boolean
  selectedOptionId?: string
}

export interface SurveyPulseItem {
  id: string
  title: string
  description: string
  totalResponses: number
  sentimentScorePct: number
  questionsCount: number
  status: 'Live & Collecting' | 'Closed'
}

interface OptionalModulesContextType {
  // Recruitment
  jobRequisitions: JobRequisitionItem[]
  candidates: CandidateItem[]
  moveCandidateStage: (candidateId: string, newStage: CandidateStage) => void
  convertCandidateToEmployee: (candidateId: string) => void
  createJobRequisition: (req: Omit<JobRequisitionItem, 'id' | 'hiredCount'>) => void

  // Performance
  okrGoals: OkrGoalItem[]
  appraisalReviews: AppraisalReviewCycle[]
  updateAppraisalReview: (reviewId: string, updated: Partial<AppraisalReviewCycle>) => void
  submit360Feedback: (reviewId: string, feedbackText: string, rating: number) => void

  // Training
  courses: TrainingCourseItem[]
  certifications: EmployeeCertificationItem[]
  enrollInCourse: (courseId: string) => void

  // Timesheets
  projects: ProjectTaskItem[]
  weeklyTimesheets: WeeklyTimesheetEntry[]
  submitWeeklyTimesheet: (entry: Omit<WeeklyTimesheetEntry, 'id' | 'totalHours' | 'billableHours' | 'nonBillableHours'>) => void
  approveTimesheet: (timesheetId: string) => void
  rejectTimesheet: (timesheetId: string, reason: string) => void

  // Engagement
  quickPolls: QuickPollItem[]
  surveys: SurveyPulseItem[]
  voteInPoll: (pollId: string, optionId: string) => void
  createQuickPoll: (poll: Omit<QuickPollItem, 'id' | 'totalVotes' | 'isActive'>) => void
}

const OptionalModulesContext = createContext<OptionalModulesContextType | undefined>(undefined)

// INITIAL MOCK DATA
const INITIAL_REQUISITIONS: JobRequisitionItem[] = [
  {
    id: 'REQ-2026-01',
    jobTitle: 'Senior Cloud Platform Engineer',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    openingsCount: 3,
    hiredCount: 1,
    targetCloseDate: '2026-11-15',
    budgetCtcMax: 2800000,
    priority: 'Urgent',
    status: 'Interviews in Progress',
    hiringManager: 'Deepa Ramachandran',
  },
  {
    id: 'REQ-2026-02',
    jobTitle: 'Territory Sales Lead (West Zone)',
    department: 'Field Sales',
    branch: 'Mumbai Tech Park',
    openingsCount: 2,
    hiredCount: 0,
    targetCloseDate: '2026-11-30',
    budgetCtcMax: 1600000,
    priority: 'High',
    status: 'Open & Sourcing',
    hiringManager: 'Priya Sharma',
  },
]

const INITIAL_CANDIDATES: CandidateItem[] = [
  {
    id: 'CAND-101',
    requisitionId: 'REQ-2026-01',
    fullName: 'Aditya Deshmukh',
    email: 'aditya.deshmukh@gmail.com',
    phone: '+91 98231 44510',
    experienceYears: 6.5,
    currentCompany: 'Infosys Cloud Labs',
    expectedCtc: 2400000,
    stage: 'Technical Round',
    rating: 4.5,
    resumeUrl: 'aditya_deshmukh_resume.pdf',
    interviewDate: '2026-10-14 11:00 AM',
  },
  {
    id: 'CAND-102',
    requisitionId: 'REQ-2026-01',
    fullName: 'Sneha Ranganathan',
    email: 'sneha.ranga@outlook.com',
    phone: '+91 98450 11920',
    experienceYears: 7,
    currentCompany: 'Wipro Digital',
    expectedCtc: 2600000,
    stage: 'Offer Extended',
    rating: 5.0,
    resumeUrl: 'sneha_resume.pdf',
    offerCtc: 2550000,
  },
  {
    id: 'CAND-103',
    requisitionId: 'REQ-2026-02',
    fullName: 'Rahul Kulkarni',
    email: 'rahul.kulkarni@yahoo.com',
    phone: '+91 97654 88120',
    experienceYears: 4,
    currentCompany: 'Pidilite FMCG',
    expectedCtc: 1400000,
    stage: 'Screening',
    rating: 4.0,
    resumeUrl: 'rahul_sales_resume.pdf',
  },
]

const INITIAL_OKRS: OkrGoalItem[] = [
  {
    id: 'OKR-01',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    title: 'Achieve ₹4.5 Crore Regional Q3-Q4 Pipeline Revenue',
    category: 'Revenue & Business Growth',
    targetMetric: '₹4,50,00,000 Payout / Orders',
    currentProgressPct: 78,
    weightagePct: 40,
    cycleYear: '2026-27',
  },
  {
    id: 'OKR-02',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    title: 'Drive Client Visit Adherence & Zero Beat Miss Rate',
    category: 'Operational Excellence',
    targetMetric: '95% Check-in Inside Geo-Fence',
    currentProgressPct: 92,
    weightagePct: 30,
    cycleYear: '2026-27',
  },
  {
    id: 'OKR-03',
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    title: 'Reduce Cloud Infra Latency by 30% & Zero P1 Outages',
    category: 'Innovation & Tech',
    targetMetric: '99.99% Core Service SLA',
    currentProgressPct: 85,
    weightagePct: 50,
    cycleYear: '2026-27',
  },
]

const INITIAL_APPRAISALS: AppraisalReviewCycle[] = [
  {
    id: 'APR-2026-104',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    designation: 'Regional Sales Manager',
    department: 'Field Sales',
    cycleName: 'Annual Performance Appraisal 2026-27',
    selfRating: 4.5,
    managerRating: 4.8,
    finalCalibratedScore: 4.7,
    nineBoxGridPosition: 'High Potential - Star',
    selfComments: 'Delivered 118% against sales quota. Expanded dealer distribution in Hubballi and Belagavi.',
    managerFeedback: 'Exceptional sales leadership and client relationship mastery. Recommended for promotion.',
    status: 'Completed & Calibrated',
    feedback360Count: 4,
  },
  {
    id: 'APR-2026-115',
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    designation: 'Lead Cloud Architect',
    department: 'Engineering',
    cycleName: 'Annual Performance Appraisal 2026-27',
    selfRating: 4.0,
    managerRating: 4.2,
    finalCalibratedScore: 4.1,
    nineBoxGridPosition: 'High Performer',
    selfComments: 'Led Kubernetes migration with zero downtime. Mentored 4 junior engineers.',
    managerFeedback: 'Strong engineering rigor. Continue expanding cross-department architectural sync.',
    status: 'Submitted for Manager Rating',
    feedback360Count: 3,
  },
]

const INITIAL_COURSES: TrainingCourseItem[] = [
  {
    id: 'TRN-01',
    courseTitle: 'Prevention of Sexual Harassment (PoSH) Compliance 2026',
    category: 'Statutory & Compliance',
    isMandatory: true,
    durationHours: 2,
    format: 'E-Learning (Self-Paced)',
    enrolledCount: 340,
    completedCount: 298,
    passingScorePct: 80,
  },
  {
    id: 'TRN-02',
    courseTitle: 'ISO-27001 Information Security & Hardware Safety Standard',
    category: 'Statutory & Compliance',
    isMandatory: true,
    durationHours: 3,
    format: 'E-Learning (Self-Paced)',
    enrolledCount: 340,
    completedCount: 312,
    passingScorePct: 85,
  },
  {
    id: 'TRN-03',
    courseTitle: 'Factory Floor Fire Safety, Hazardous Gas & Evacuation Protocol',
    category: 'Workplace Safety & Fire',
    isMandatory: true,
    durationHours: 4,
    format: 'In-Person Workshop',
    enrolledCount: 95,
    completedCount: 92,
    passingScorePct: 90,
  },
  {
    id: 'TRN-04',
    courseTitle: 'Executive Consultative Selling & Key Account Management',
    category: 'Leadership & Soft Skills',
    isMandatory: false,
    durationHours: 6,
    format: 'Virtual Classroom',
    enrolledCount: 45,
    completedCount: 38,
    passingScorePct: 75,
  },
]

const INITIAL_CERTIFICATIONS: EmployeeCertificationItem[] = [
  {
    id: 'CERT-01',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    courseName: 'Prevention of Sexual Harassment (PoSH) Certification',
    issuedDate: '2026-08-10',
    expiryDate: '2027-08-09',
    certificateNumber: 'CERT-POSH-8819',
    status: 'Valid',
    daysToExpiry: 300,
  },
  {
    id: 'CERT-02',
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    courseName: 'Industrial Boiler Operation Safety Certificate',
    issuedDate: '2025-11-01',
    expiryDate: '2026-10-31',
    certificateNumber: 'CERT-BOILER-4412',
    status: 'Expiring in <30d',
    daysToExpiry: 21,
  },
]

const INITIAL_PROJECTS: ProjectTaskItem[] = [
  { id: 'PRJ-01', projectName: 'HDFC Bank Cloud Migration', clientName: 'HDFC Bank Ltd', taskName: 'Core DB Architecture', isBillable: true, hourlyBillingRateInr: 3200 },
  { id: 'PRJ-02', projectName: 'Tata Steel ERP Modernization', clientName: 'Tata Steel', taskName: 'Supply Chain Integration', isBillable: true, hourlyBillingRateInr: 2800 },
  { id: 'PRJ-03', projectName: 'Internal HRMS 2.0 Development', clientName: 'Internal Enterprise', taskName: 'Feature Development', isBillable: false, hourlyBillingRateInr: 0 },
]

const INITIAL_TIMESHEETS: WeeklyTimesheetEntry[] = [
  {
    id: 'TS-2026-W41-115',
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    weekStartDate: '2026-10-05',
    projectName: 'HDFC Bank Cloud Migration',
    taskName: 'Core DB Architecture',
    isBillable: true,
    dailyHours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
    totalHours: 40,
    billableHours: 40,
    nonBillableHours: 0,
    status: 'Approved',
    managerComments: 'Approved by Vikram Malhotra. Weekly client billing confirmed.',
  },
  {
    id: 'TS-2026-W41-104',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    weekStartDate: '2026-10-05',
    projectName: 'Tata Steel ERP Modernization',
    taskName: 'Client Technical Account Reviews',
    isBillable: true,
    dailyHours: { mon: 7, tue: 8, wed: 8, thu: 7, fri: 8, sat: 0, sun: 0 },
    totalHours: 38,
    billableHours: 38,
    nonBillableHours: 0,
    status: 'Submitted',
  },
]

const INITIAL_POLLS: QuickPollItem[] = [
  {
    id: 'POLL-01',
    question: 'Which optional festive festival holiday would you prefer to observe in November 2026?',
    options: [
      { id: 'OPT-1', text: 'Govardhan Puja (Nov 02)', votesCount: 142 },
      { id: 'OPT-2', text: 'Bhai Dooj (Nov 03)', votesCount: 98 },
      { id: 'OPT-3', text: 'Chhath Puja (Nov 07)', votesCount: 45 },
    ],
    totalVotes: 285,
    expiresAt: 'Oct 20, 2026',
    isActive: true,
  },
]

const INITIAL_SURVEYS: SurveyPulseItem[] = [
  {
    id: 'SURV-01',
    title: 'Q3 Enterprise Employee Happiness & Workplace Pulse Survey',
    description: 'Quarterly confidential pulse assessing hybrid work flexibility, managerial support, and team tools.',
    totalResponses: 278,
    sentimentScorePct: 88,
    questionsCount: 6,
    status: 'Live & Collecting',
  },
]

export const OptionalModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast()

  const [jobRequisitions, setJobRequisitions] = useState<JobRequisitionItem[]>(INITIAL_REQUISITIONS)
  const [candidates, setCandidates] = useState<CandidateItem[]>(INITIAL_CANDIDATES)

  const [okrGoals] = useState<OkrGoalItem[]>(INITIAL_OKRS)
  const [appraisalReviews, setAppraisalReviews] = useState<AppraisalReviewCycle[]>(INITIAL_APPRAISALS)

  const [courses] = useState<TrainingCourseItem[]>(INITIAL_COURSES)
  const [certifications, setCertifications] = useState<EmployeeCertificationItem[]>(INITIAL_CERTIFICATIONS)

  const [projects] = useState<ProjectTaskItem[]>(INITIAL_PROJECTS)
  const [weeklyTimesheets, setWeeklyTimesheets] = useState<WeeklyTimesheetEntry[]>(INITIAL_TIMESHEETS)

  const [quickPolls, setQuickPolls] = useState<QuickPollItem[]>(INITIAL_POLLS)
  const [surveys] = useState<SurveyPulseItem[]>(INITIAL_SURVEYS)

  // Recruitment actions
  const moveCandidateStage = (candidateId: string, newStage: CandidateStage) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    )
    toast.success(`Candidate moved to stage: ${newStage}`)
  }

  const convertCandidateToEmployee = (candidateId: string) => {
    const cand = candidates.find((c) => c.id === candidateId)
    if (!cand) return

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: 'Hired & Converted', isConvertedToEmployee: true } : c))
    )

    AuditLogService.addLog({
      action: 'Candidate Converted to Employee',
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      module: 'Lifecycle',
      targetType: 'Employee',
      targetId: cand.id,
      targetName: cand.fullName,
      featureCode: 'RECRUITMENT',
      beforeValue: `Candidate in ATS (${cand.stage})`,
      afterValue: 'Employee Master Record Created & Onboarding Triggered',
      reason: 'Offer accepted. Transferred to Employee Directory.',
    })

    toast.success(`Candidate ${cand.fullName} converted to employee! Onboarding workflow initialized.`)
  }

  const createJobRequisition = (req: Omit<JobRequisitionItem, 'id' | 'hiredCount'>) => {
    const id = `REQ-2026-${String(jobRequisitions.length + 1).padStart(2, '0')}`
    setJobRequisitions((prev) => [{ ...req, id, hiredCount: 0 }, ...prev])
    toast.success(`Job Requisition created: ${req.jobTitle}`)
  }

  // Performance actions
  const updateAppraisalReview = (reviewId: string, updated: Partial<AppraisalReviewCycle>) => {
    setAppraisalReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r))
    )
    toast.success('Appraisal score & feedback saved successfully!')
  }

  const submit360Feedback = (reviewId: string, feedbackText: string, rating: number) => {
    setAppraisalReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r
        return {
          ...r,
          feedback360Count: r.feedback360Count + 1,
        }
      })
    )
    toast.success('360-degree peer feedback submitted anonymously!')
  }

  // Training actions
  const enrollInCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course) return
    const newCert: EmployeeCertificationItem = {
      id: `CERT-${Date.now().toString().slice(-4)}`,
      employeeId: 'EMP-104',
      employeeName: 'Priya Sharma',
      courseName: course.courseTitle,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      certificateNumber: `CERT-${course.id}-${Date.now().toString().slice(-4)}`,
      status: 'Valid',
      daysToExpiry: 365,
    }
    setCertifications((prev) => [newCert, ...prev])
    toast.success(`Enrolled & Completed course: ${course.courseTitle}! Certificate issued.`)
  }

  // Timesheet actions
  const submitWeeklyTimesheet = (entry: Omit<WeeklyTimesheetEntry, 'id' | 'totalHours' | 'billableHours' | 'nonBillableHours'>) => {
    const total = Object.values(entry.dailyHours).reduce((a, b) => a + b, 0)
    const billable = entry.isBillable ? total : 0
    const nonBillable = entry.isBillable ? 0 : total

    const newTs: WeeklyTimesheetEntry = {
      ...entry,
      id: `TS-${Date.now().toString().slice(-6)}`,
      totalHours: total,
      billableHours: billable,
      nonBillableHours: nonBillable,
      status: 'Submitted',
    }

    setWeeklyTimesheets((prev) => [newTs, ...prev])
    toast.success(`Weekly timesheet (${total} hours) submitted for manager approval!`)
  }

  const approveTimesheet = (timesheetId: string) => {
    setWeeklyTimesheets((prev) =>
      prev.map((ts) =>
        ts.id === timesheetId ? { ...ts, status: 'Approved', managerComments: 'Approved by Supervisor' } : ts
      )
    )
    toast.success(`Timesheet ${timesheetId} approved for client invoicing!`)
  }

  const rejectTimesheet = (timesheetId: string, reason: string) => {
    setWeeklyTimesheets((prev) =>
      prev.map((ts) =>
        ts.id === timesheetId ? { ...ts, status: 'Rejected', managerComments: reason } : ts
      )
    )
    toast.warning(`Timesheet ${timesheetId} returned with comments.`)
  }

  // Engagement actions
  const voteInPoll = (pollId: string, optionId: string) => {
    setQuickPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          userHasVoted: true,
          selectedOptionId: optionId,
          options: p.options.map((opt) => (opt.id === optionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt)),
        }
      })
    )
    toast.success('Your vote has been cast anonymously!')
  }

  const createQuickPoll = (poll: Omit<QuickPollItem, 'id' | 'totalVotes' | 'isActive'>) => {
    const id = `POLL-${String(quickPolls.length + 1).padStart(2, '0')}`
    setQuickPolls((prev) => [{ ...poll, id, totalVotes: 0, isActive: true }, ...prev])
    toast.success('New employee poll published to company feed!')
  }

  return (
    <OptionalModulesContext.Provider
      value={{
        jobRequisitions,
        candidates,
        moveCandidateStage,
        convertCandidateToEmployee,
        createJobRequisition,
        okrGoals,
        appraisalReviews,
        updateAppraisalReview,
        submit360Feedback,
        courses,
        certifications,
        enrollInCourse,
        projects,
        weeklyTimesheets,
        submitWeeklyTimesheet,
        approveTimesheet,
        rejectTimesheet,
        quickPolls,
        surveys,
        voteInPoll,
        createQuickPoll,
      }}
    >
      {children}
    </OptionalModulesContext.Provider>
  )
}

export const useOptionalModules = () => {
  const context = useContext(OptionalModulesContext)
  if (!context) {
    throw new Error('useOptionalModules must be used within an OptionalModulesProvider')
  }
  return context
}
