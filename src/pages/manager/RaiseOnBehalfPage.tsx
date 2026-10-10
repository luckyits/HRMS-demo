import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow, type WorkflowRequestType } from '@/context/WorkflowContext'
import { cn } from '@/lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Receipt,
  UserCheck,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const RaiseOnBehalfPage: React.FC = () => {
  const navigate = useNavigate()
  const { employees } = useEmployees()
  const { createWorkflowRequest, currentManagerName } = useWorkflow()

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const [targetEmpId, setTargetEmpId] = useState(team[0]?.id || 'EMP-003')
  const [requestType, setRequestType] = useState<WorkflowRequestType>('Leave')
  const [title, setTitle] = useState('Medical Leave (Emergency)')
  const [amountOrDays, setAmountOrDays] = useState('2 Days')
  const [description, setDescription] = useState('Employee informed manager via phone due to sudden illness.')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const selectedEmployee = team.find((e) => e.id === targetEmpId) || team[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createWorkflowRequest({
      requestType,
      requesterId: selectedEmployee.id,
      requesterName: selectedEmployee.name,
      requesterAvatar: selectedEmployee.avatar,
      requesterDesignation: selectedEmployee.designation,
      requesterDepartment: selectedEmployee.department,
      requesterBranch: selectedEmployee.branch,
      date,
      title: `${title} (On Behalf)`,
      description: `${description} [Submitted on behalf by ${currentManagerName}]`,
      amountOrDays,
    })

    alert(`Successfully raised ${requestType} request on behalf of ${selectedEmployee.name}!`)
    navigate('/manager/approvals')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Raise Request on Behalf of Team Member"
        subtitle="Initiate leave applications, expense vouchers, or attendance regularizations on behalf of subordinates unable to access the web portal."
      />

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-5"
      >
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Request Details
        </h3>

        {/* Employee Picker */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Team Member *</label>
          <select
            value={targetEmpId}
            onChange={(e) => setTargetEmpId(e.target.value)}
            className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
          >
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.designation}) · {m.department}
              </option>
            ))}
          </select>
        </div>

        {/* Request Type Buttons */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Request Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Leave', 'Expense', 'Overtime', 'Regularization'] as WorkflowRequestType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRequestType(type)}
                className={cn(
                  'p-2.5 text-xs font-semibold rounded-lg border text-center transition',
                  requestType === type
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject / Short Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {requestType === 'Expense' ? 'Amount (₹)' : requestType === 'Overtime' ? 'Hours' : 'Days Count'} *
            </label>
            <input
              type="text"
              value={amountOrDays}
              onChange={(e) => setAmountOrDays(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Effective Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason & Justification *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
            required
          />
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Request on Behalf</span>
          </button>
        </div>
      </form>
    </div>
  )
}
