import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees, type CustomFieldDefinition } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  Building,
  Calendar,
  CreditCard,
  Layers,
  MapPin,
  Plus,
  Sliders,
  Trash2,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const OrganizationSetupPage: React.FC = () => {
  const { masterData, customFields, addCustomField, deleteCustomField } = useEmployees()

  const [activeTab, setActiveTab] = useState<
    'entities' | 'departments' | 'grades' | 'cost_centers' | 'custom_fields' | 'calendars'
  >('entities')

  // Custom Field form modal
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [newField, setNewField] = useState<Omit<CustomFieldDefinition, 'id'>>({
    module: 'Employee',
    fieldName: '',
    fieldKey: '',
    fieldType: 'text',
    required: false,
    visibleToRole: 'All',
    appliesToProfile: 'All',
    options: [],
  })

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newField.fieldName) return
    const key = newField.fieldKey || newField.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    addCustomField({
      ...newField,
      fieldKey: key,
    })
    setShowFieldModal(false)
    setNewField({
      module: 'Employee',
      fieldName: '',
      fieldKey: '',
      fieldType: 'text',
      required: false,
      visibleToRole: 'All',
      appliesToProfile: 'All',
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Organization Master Setup"
        subtitle="Manage legal entities, operational branches, designation ladders, cost centers, and dynamic custom attributes."
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {[
          { key: 'entities', label: 'Entities & Branches', icon: Building, count: masterData.branches.length },
          { key: 'departments', label: 'Departments', icon: Users, count: masterData.departments.length },
          { key: 'grades', label: 'Designations & Grades', icon: Layers, count: masterData.grades.length },
          { key: 'cost_centers', label: 'Cost Centers', icon: CreditCard, count: masterData.costCenters.length },
          { key: 'custom_fields', label: 'Custom Field Builder', icon: Sliders, count: customFields.length },
          { key: 'calendars', label: 'Working Calendars', icon: Calendar, count: masterData.workingCalendars.length },
        ].map((t) => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition -mb-px',
                isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted text-muted-foreground font-mono">
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Entities & Branches */}
      {activeTab === 'entities' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Legal Entities (Holding & Subsidiaries)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {masterData.entities.map((ent) => (
                <div key={ent.id} className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <span className="font-mono text-[10px] text-primary font-bold">{ent.code}</span>
                  <h4 className="font-bold text-foreground text-sm">{ent.name}</h4>
                  <p className="text-xs text-muted-foreground">HQ: {ent.hq}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground">Operational Physical Branches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {masterData.branches.map((br) => (
                <div key={br.id} className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">{br.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{br.city}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{br.employeeCount} Staff</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Departments */}
      {activeTab === 'departments' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Department Code</th>
                  <th className="p-3">Department Name</th>
                  <th className="p-3">Department Head</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {masterData.departments.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono text-primary font-semibold">{d.code}</td>
                    <td className="p-3 font-semibold text-foreground">{d.name}</td>
                    <td className="p-3 text-muted-foreground">{d.headName}</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Grades */}
      {activeTab === 'grades' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Grade Tier</th>
                  <th className="p-3">Hierarchy Level</th>
                  <th className="p-3">Standard Designation Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {masterData.grades.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-foreground">{g.grade}</td>
                    <td className="p-3 text-muted-foreground">Level {g.level}</td>
                    <td className="p-3 font-medium text-foreground">{g.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Cost Centers */}
      {activeTab === 'cost_centers' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {masterData.costCenters.map((cc) => (
              <div key={cc.id} className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{cc.code}</span>
                  <span className="text-xs font-bold font-mono text-emerald-600">{cc.budget}</span>
                </div>
                <h4 className="font-bold text-foreground text-sm">{cc.name}</h4>
                <p className="text-[11px] text-muted-foreground">Operating Expenditure Ledger Unit</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Custom Field Builder */}
      {activeTab === 'custom_fields' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Dynamic Custom Schema Builder</h3>
              <p className="text-xs text-muted-foreground">
                Extend Employee, Leave, Expense, or Visit records with business-specific custom metadata attributes.
              </p>
            </div>
            <button
              onClick={() => setShowFieldModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Field</span>
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Target Module</th>
                  <th className="p-3">Field Label</th>
                  <th className="p-3">Identifier Key</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Applies To</th>
                  <th className="p-3">Required</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customFields.map((cf) => (
                  <tr key={cf.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                        {cf.module}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-foreground">{cf.fieldName}</td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{cf.fieldKey}</td>
                    <td className="p-3 uppercase font-mono text-[10px] text-muted-foreground">{cf.fieldType}</td>
                    <td className="p-3 text-muted-foreground">{cf.appliesToProfile}</td>
                    <td className="p-3">
                      {cf.required ? (
                        <span className="text-rose-500 font-bold text-[10px]">Mandatory</span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Optional</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteCustomField(cf.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete custom field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Calendars */}
      {activeTab === 'calendars' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {masterData.workingCalendars.map((cal) => (
              <div key={cal.id} className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{cal.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Days: {cal.workDays}</p>
                </div>
                <div className="pt-2 border-t border-border text-xs flex justify-between text-muted-foreground">
                  <span>Standard Shift:</span>
                  <strong className="text-foreground">{cal.standardHours} Hours/Day</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <form
            onSubmit={handleCreateField}
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4"
          >
            <h3 className="font-bold text-foreground text-sm">Add New Custom Metadata Field</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Module *</label>
              <select
                value={newField.module}
                onChange={(e) => setNewField({ ...newField, module: e.target.value as any })}
                className="w-full text-xs p-2 bg-background border border-input rounded-lg"
              >
                <option value="Employee">Employee Record</option>
                <option value="Leave">Leave Request</option>
                <option value="Expense">Expense Claim</option>
                <option value="Visit">Client Visit Log</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Field Display Label *</label>
              <input
                type="text"
                placeholder="e.g. Shoe Size or Passport Expiry"
                value={newField.fieldName}
                onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Field Data Type</label>
                <select
                  value={newField.fieldType}
                  onChange={(e) => setNewField({ ...newField, fieldType: e.target.value as any })}
                  className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                >
                  <option value="text">Text String</option>
                  <option value="number">Numeric</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown Select</option>
                  <option value="boolean">Yes/No Boolean</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Applies To Profile</label>
                <select
                  value={newField.appliesToProfile}
                  onChange={(e) => setNewField({ ...newField, appliesToProfile: e.target.value })}
                  className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                >
                  <option value="All">All Profiles</option>
                  <option value="Office Staff">Office Staff</option>
                  <option value="Field Sales">Field Sales</option>
                  <option value="Factory Worker">Factory Worker</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="rounded border-input text-primary"
              />
              <span>Mark as Mandatory Field</span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowFieldModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Field
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
