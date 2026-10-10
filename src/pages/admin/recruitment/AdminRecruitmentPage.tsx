import React, { useState } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useOptionalModules,
  type CandidateStage,
  type CandidateItem,
} from '@/context/OptionalModulesContext'
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  User,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'

export const AdminRecruitmentPage: React.FC = () => {
  const {
    jobRequisitions,
    candidates,
    moveCandidateStage,
    convertCandidateToEmployee,
    createJobRequisition,
  } = useOptionalModules()

  const [activeTab, setActiveTab] = useState<'pipeline' | 'requisitions'>('pipeline')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null)
  const [isNewReqOpen, setIsNewReqOpen] = useState(false)

  // New Requisition Form State
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [branch, setBranch] = useState('Bengaluru HQ')
  const [openings, setOpenings] = useState(2)
  const [budgetCtc, setBudgetCtc] = useState(2000000)
  const [hiringManager, setHiringManager] = useState('Deepa Ramachandran')

  const stages: CandidateStage[] = [
    'Applied',
    'Screening',
    'Technical Round',
    'Manager Interview',
    'Offer Extended',
    'Hired & Converted',
  ]

  const handleCreateReq = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle) return
    createJobRequisition({
      jobTitle,
      department,
      branch,
      openingsCount: Number(openings),
      targetCloseDate: '2026-11-30',
      budgetCtcMax: Number(budgetCtc),
      priority: 'High',
      status: 'Open & Sourcing',
      hiringManager,
    })
    setIsNewReqOpen(false)
    setJobTitle('')
  }

  return (
    <FeatureGate feature="RECRUITMENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                TALENT ACQUISITION & ATS
              </span>
              <span className="text-xs text-slate-500">Pipeline Kanban, Scorecards & Onboarding</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Recruitment & Candidate Pipeline Desk
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage open requisitions, progress candidate stages across the hiring funnel, conduct structured interviews, and convert hired candidates directly into Employee Master records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewReqOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Requisition
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Open Requisitions</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{jobRequisitions.length} Active Positions</div>
            <p className="text-xs text-slate-500 mt-1">Across Engineering, Sales & Operations</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Candidate Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{candidates.length} In Process</div>
            <p className="text-xs text-slate-500 mt-1">Screening, Technical & Final Offer stages</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Offers Extended</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {candidates.filter((c) => c.stage === 'Offer Extended' || c.stage === 'Hired & Converted').length} Hires
            </div>
            <p className="text-xs text-slate-500 mt-1">Ready for Employee Master onboarding</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Avg Time-to-Fill</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">22 Days</div>
            <p className="text-xs text-slate-500 mt-1">8 days faster than industry median</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Candidate Funnel Kanban</span>
          </button>

          <button
            onClick={() => setActiveTab('requisitions')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'requisitions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Job Requisitions Master ({jobRequisitions.length})</span>
          </button>
        </div>

        {/* TAB 1: CANDIDATE PIPELINE KANBAN */}
        {activeTab === 'pipeline' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1200px]">
              {stages.map((stage) => {
                const stageCandidates = candidates.filter((c) => c.stage === stage)
                return (
                  <div
                    key={stage}
                    className="flex-1 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 px-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{stage}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        {stageCandidates.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[400px]">
                      {stageCandidates.map((cand) => (
                        <div
                          key={cand.id}
                          className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cand.fullName}</h4>
                            <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span>{cand.rating}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500">{cand.currentCompany} • {cand.experienceYears}y exp</div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            Exp: ₹{(cand.expectedCtc / 100000).toFixed(1)} LPA
                          </div>

                          {cand.interviewDate && (
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-700 dark:text-indigo-300 text-[10px] font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              <span>Round: {cand.interviewDate}</span>
                            </div>
                          )}

                          {cand.offerCtc && (
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <DollarSign className="w-3 h-3 shrink-0" />
                              <span>Offer: ₹{(cand.offerCtc / 100000).toFixed(2)} LPA CTC</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                            {stage !== 'Hired & Converted' ? (
                              <>
                                <select
                                  value={cand.stage}
                                  onChange={(e) => moveCandidateStage(cand.id, e.target.value as CandidateStage)}
                                  className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border-none outline-none"
                                >
                                  {stages.map((s) => (
                                    <option key={s} value={s}>
                                      Move: {s}
                                    </option>
                                  ))}
                                </select>

                                {stage === 'Offer Extended' && !cand.isConvertedToEmployee && (
                                  <button
                                    onClick={() => convertCandidateToEmployee(cand.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    <span>Convert</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Onboarding Active
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: JOB REQUISITIONS MASTER */}
        {activeTab === 'requisitions' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Headcount Requisitions</h3>
              <span className="text-xs text-slate-500">{jobRequisitions.length} Positions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4">Requisition & ID</th>
                    <th className="py-3 px-4">Department & Branch</th>
                    <th className="py-3 px-4">Openings</th>
                    <th className="py-3 px-4">Budgeted CTC</th>
                    <th className="py-3 px-4">Hiring Manager</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobRequisitions.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{req.jobTitle}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {req.department} • {req.branch}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {req.hiredCount}/{req.openingsCount} Filled
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        ₹{(req.budgetCtcMax / 100000).toFixed(1)} LPA
                      </td>
                      <td className="py-3 px-4 font-medium">{req.hiringManager}</td>
                      <td className="py-3 px-4 text-slate-500">{req.targetCloseDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: CREATE REQUISITION */}
        {isNewReqOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Job Requisition</h3>

              <form onSubmit={handleCreateReq} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Full Stack Architect"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Field Sales">Field Sales</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Branch Location</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Bengaluru HQ">Bengaluru HQ</option>
                      <option value="Mumbai Tech Park">Mumbai Tech Park</option>
                      <option value="Pune Plant">Pune Plant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Number of Openings</label>
                    <input
                      type="number"
                      value={openings}
                      onChange={(e) => setOpenings(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Max Budget (₹ CTC)</label>
                    <input
                      type="number"
                      value={budgetCtc}
                      onChange={(e) => setBudgetCtc(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewReqOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Publish Requisition
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

export default AdminRecruitmentPage
