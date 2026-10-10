import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves, type SimulationResult } from '@/context/AdminLeavesContext'
import type { CustomWorkflowDefinition, WorkflowStepRule } from '@/mock/adminLeaves'
import {
  GitFork,
  Plus,
  Play,
  Save,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Layers,
  Sparkles,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react'

export const WorkflowDesignerPage: React.FC = () => {
  const { workflowDefinitions, saveWorkflowDefinition, simulateWorkflow } = useAdminLeaves()

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(
    workflowDefinitions[0]?.id || ''
  )
  const activeDef =
    workflowDefinitions.find((w) => w.id === selectedWorkflowId) || workflowDefinitions[0]

  // Editable workflow state
  const [name, setName] = useState(activeDef?.name || '')
  const [description, setDescription] = useState(activeDef?.description || '')
  const [minDays, setMinDays] = useState(activeDef?.conditions.minDays || 5)
  const [minAmount, setMinAmount] = useState(activeDef?.conditions.minAmount || 5000)
  const [steps, setSteps] = useState<WorkflowStepRule[]>(activeDef?.steps || [])
  const [saveToast, setSaveToast] = useState(false)

  // Simulator Sandbox State
  const [simRequestType, setSimRequestType] = useState<string>(activeDef?.requestType || 'Leave')
  const [simAmountOrDays, setSimAmountOrDays] = useState<number>(6)
  const [simRequesterName, setSimRequesterName] = useState('Aarav Patel (Senior Engineer)')
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)

  const handleSelectWorkflow = (def: CustomWorkflowDefinition) => {
    setSelectedWorkflowId(def.id)
    setName(def.name)
    setDescription(def.description)
    setMinDays(def.conditions.minDays || 5)
    setMinAmount(def.conditions.minAmount || 5000)
    setSteps(def.steps)
    setSimRequestType(def.requestType)
    setSimulationResult(null)
  }

  const handleAddStep = () => {
    const newStep: WorkflowStepRule = {
      id: `WS-${Date.now().toString().slice(-4)}`,
      title: `Approval Tier ${steps.length + 1}`,
      approverType: 'dept_head',
      executionMode: 'sequential',
      consensusRule: 'anyone',
      slaHours: 24,
      escalationTarget: 'VP / Director',
      fallbackApprover: 'People Operations (Central HR)',
      timeoutAction: 'escalate',
    }
    setSteps([...steps, newStep])
  }

  const handleUpdateStep = (index: number, partial: Partial<WorkflowStepRule>) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], ...partial }
    setSteps(updated)
  }

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!activeDef) return
    const updated: CustomWorkflowDefinition = {
      ...activeDef,
      name,
      description,
      conditions: {
        ...activeDef.conditions,
        minDays: activeDef.requestType === 'Leave' ? minDays : undefined,
        minAmount:
          activeDef.requestType === 'Expense' || activeDef.requestType === 'Loan/Advance'
            ? minAmount
            : undefined,
      },
      steps,
      version: activeDef.version + 1,
      lastUpdatedAt: new Date().toLocaleString(),
    }
    saveWorkflowDefinition(updated)
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  const handleRunSimulator = () => {
    const res = simulateWorkflow(simRequestType, {
      amountOrDays: simAmountOrDays,
      requesterName: simRequesterName,
    })
    setSimulationResult(res)
  }

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Visual Approval Workflow Designer"
        subtitle="Architect multi-tier escalation chains with conditional branching, parallel consensus, SLAs, and real-time execution sandboxing"
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Deploy Workflow Changes</span>
          </button>
        }
      />

      {saveToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Workflow rules successfully updated and hot-deployed to the approval engine!
          </span>
        </div>
      )}

      {/* Workflow Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-card border border-border p-2 rounded-xl">
        <span className="text-xs font-bold text-muted-foreground mr-1">Select Workflow:</span>
        {workflowDefinitions.map((w) => {
          const isSelected = w.id === selectedWorkflowId
          return (
            <button
              key={w.id}
              onClick={() => handleSelectWorkflow(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {w.requestType} ({w.name.split(' ')[0]})
            </button>
          )
        })}
      </div>

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visual Step Builder */}
        <div className="lg:col-span-7 space-y-5">
          {/* Workflow Header & Conditions */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h4 className="font-bold text-base text-foreground">{name}</h4>
                <p className="text-xs text-muted-foreground">
                  Version {activeDef.version} &bull; Type: <strong>{activeDef.requestType}</strong>
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Engine Active
              </span>
            </div>

            {/* Conditions Builder */}
            <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Trigger Criteria & Rules:
              </span>

              {activeDef.requestType === 'Leave' && (
                <div className="flex items-center justify-between text-xs">
                  <span>Threshold Days (&gt; N days triggers multi-tier):</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={minDays}
                    onChange={(e) => setMinDays(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-card border border-border rounded-lg text-right font-bold"
                  />
                </div>
              )}

              {(activeDef.requestType === 'Expense' || activeDef.requestType === 'Loan/Advance') && (
                <div className="flex items-center justify-between text-xs">
                  <span>Amount Ceiling (&gt; ₹X requires Department Head & Finance):</span>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-28 px-2 py-1 bg-card border border-border rounded-lg text-right font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Visual Step Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Execution Graph ({steps.length} Steps)
              </h4>
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary bg-primary/5 rounded-xl text-xs font-semibold hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            {steps.map((step, idx) => {
              return (
                <div key={step.id} className="relative">
                  {idx > 0 && (
                    <div className="flex justify-center my-1.5">
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3 relative hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(idx, { title: e.target.value })}
                          className="font-bold text-xs bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none text-foreground"
                        />
                      </div>

                      {steps.length > 1 && (
                        <button
                          onClick={() => handleDeleteStep(idx)}
                          className="text-muted-foreground hover:text-rose-600 p-1 rounded"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Step Properties Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Approver Type
                        </label>
                        <select
                          value={step.approverType}
                          onChange={(e) =>
                            handleUpdateStep(idx, { approverType: e.target.value as any })
                          }
                          className="w-full text-xs px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg"
                        >
                          <option value="reporting_manager">Direct Reporting Manager</option>
                          <option value="skip_level">Skip-Level Manager (Director)</option>
                          <option value="dept_head">Department Head</option>
                          <option value="hr">Central HR (People Ops)</option>
                          <option value="role">Specific Role (e.g. Finance Lead)</option>
                          <option value="person">Specific Person</option>
                          <option value="group">Consensus Group / Committee</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Execution & Consensus
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            value={step.executionMode}
                            onChange={(e) =>
                              handleUpdateStep(idx, { executionMode: e.target.value as any })
                            }
                            className="text-xs px-2 py-1.5 bg-muted/30 border border-border rounded-lg"
                          >
                            <option value="sequential">Sequential</option>
                            <option value="parallel">Parallel</option>
                          </select>
                          <select
                            value={step.consensusRule}
                            onChange={(e) =>
                              handleUpdateStep(idx, { consensusRule: e.target.value as any })
                            }
                            className="text-xs px-2 py-1.5 bg-muted/30 border border-border rounded-lg"
                          >
                            <option value="anyone">Any-one</option>
                            <option value="all">All Must Approve</option>
                            <option value="majority">Majority</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          SLA & Escalation
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="4"
                            max="168"
                            value={step.slaHours}
                            onChange={(e) =>
                              handleUpdateStep(idx, { slaHours: Number(e.target.value) })
                            }
                            className="w-16 px-2 py-1.5 bg-muted/30 border border-border rounded-lg font-mono text-center"
                          />
                          <span className="text-[10px] text-muted-foreground">hrs &rarr; escalate to:</span>
                          <input
                            type="text"
                            value={step.escalationTarget}
                            onChange={(e) =>
                              handleUpdateStep(idx, { escalationTarget: e.target.value })
                            }
                            className="flex-1 px-2 py-1.5 bg-muted/30 border border-border rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                          Fallback (Self-Approval Block)
                        </label>
                        <input
                          type="text"
                          value={step.fallbackApprover}
                          onChange={(e) =>
                            handleUpdateStep(idx, { fallbackApprover: e.target.value })
                          }
                          placeholder="e.g. Central HR Desk"
                          className="w-full text-xs px-2.5 py-1.5 bg-muted/30 border border-border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Live Interactive Sandbox Simulator */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" />
                &ldquo;Test This Workflow&rdquo; Simulator
              </h4>
              <span className="text-[11px] font-mono text-muted-foreground">Sandbox</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter test parameters below to see the exact execution chain and SLA triggers generated by this workflow definition.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Sample Requester
                </label>
                <input
                  type="text"
                  value={simRequesterName}
                  onChange={(e) => setSimRequesterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Request Type
                </label>
                <select
                  value={simRequestType}
                  onChange={(e) => setSimRequestType(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                >
                  <option value="Leave">Leave Request</option>
                  <option value="Expense">Expense Claim</option>
                  <option value="Loan/Advance">Salary Loan / Advance</option>
                  <option value="Overtime">Overtime Authorization</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  {simRequestType === 'Leave' ? 'Days Count' : 'Financial Amount (₹)'}
                </label>
                <input
                  type="number"
                  value={simAmountOrDays}
                  onChange={(e) => setSimAmountOrDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl font-bold"
                />
              </div>

              <button
                onClick={handleRunSimulator}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate & Generate Chain</span>
              </button>
            </div>
          </div>

          {/* Generated Chain Preview */}
          {simulationResult && (
            <div className="bg-card border-2 border-emerald-500/40 p-5 rounded-2xl shadow-md space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Generated Approval Chain
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {simulationResult.generatedChain.length} Levels
                </span>
              </div>

              {/* Conditions Evaluated */}
              <div className="space-y-1">
                {simulationResult.evaluatedConditions.map((cond, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono"
                  >
                    &bull; {cond}
                  </div>
                ))}
              </div>

              {/* Chain Steps */}
              <div className="space-y-2.5 pt-2">
                {simulationResult.generatedChain.map((step) => {
                  return (
                    <div
                      key={step.stepIndex}
                      className="p-3 bg-muted/30 border border-border rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Tier {step.stepIndex}: {step.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                          {step.slaHours}h SLA
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground">
                        Assigned Approver: <strong className="text-foreground">{step.approverName}</strong> ({step.approverRole})
                      </div>

                      <div className="text-[10px] text-amber-700 dark:text-amber-400">
                        Escalates to: {step.escalationTarget} &bull; Fallback: {step.fallback}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
