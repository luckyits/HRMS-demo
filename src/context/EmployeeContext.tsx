import type { FeatureGrant } from '@/access/types'
import { MOCK_COMPANIES, type CompanyEntity, getCompanyTemplateToggles } from '@/mock/companies'
import { MOCK_EMPLOYEES, type MockEmployee } from '@/mock/employees'
import { AuditLogService } from '@/services/auditLogService'
import type { CompanyType, EmployeeType } from '@/types'
import React, { createContext, useContext, useEffect, useState } from 'react'

export interface JobHistoryEntry {
  id: string
  effectiveDate: string
  changeType: 'Hired' | 'Promotion' | 'Transfer' | 'Salary Revision' | 'Manager Change'
  previousValue?: string
  newValue: string
  reason?: string
  approvedBy: string
}

export interface EmployeeDocument {
  id: string
  employeeId: string
  employeeName: string
  docType: 'National ID' | 'Passport' | 'Degree Certificate' | 'Experience Letter' | 'Offer Letter' | 'Medical Certificate'
  fileName: string
  fileSize: string
  uploadDate: string
  status: 'Pending' | 'Verified' | 'Rejected'
  verifiedBy?: string
  verificationDate?: string
  rejectReason?: string
}

export interface AssignedAsset {
  id: string
  employeeId: string
  assetName: string
  assetType: 'Laptop' | 'Monitor' | 'Mobile Phone' | 'Access Card' | 'Vehicle'
  serialNumber: string
  allocatedDate: string
  status: 'Allocated' | 'Returned' | 'Repair'
}

export interface CustomFieldDefinition {
  id: string
  module: 'Employee' | 'Leave' | 'Expense' | 'Visit'
  fieldName: string
  fieldKey: string
  fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean'
  options?: string[]
  required: boolean
  visibleToRole: string
  appliesToProfile: string
}

export interface OrganizationMasterData {
  entities: { id: string; name: string; code: string; hq: string }[]
  branches: { id: string; name: string; city: string; entityId: string; employeeCount: number }[]
  departments: { id: string; name: string; headName: string; code: string }[]
  grades: { id: string; grade: string; level: number; designation: string }[]
  costCenters: { id: string; code: string; name: string; budget: string }[]
  workingCalendars: { id: string; name: string; workDays: string; standardHours: number }[]
}

export interface ExtendedEmployee extends MockEmployee {
  phone?: string
  dateOfBirth?: string
  gender?: 'Male' | 'Female' | 'Other'
  probationEndDate?: string
  confirmationDate?: string
  noticePeriodDays?: number
  panNumber?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  basicSalary?: string
  hra?: string
  allowances?: string
  jobHistory?: JobHistoryEntry[]
  documents?: EmployeeDocument[]
  assets?: AssignedAsset[]
  customFieldValues?: Record<string, any>
}

interface EmployeeContextType {
  employees: ExtendedEmployee[]
  activeCompany: CompanyEntity
  masterData: OrganizationMasterData
  documentsQueue: EmployeeDocument[]
  customFields: CustomFieldDefinition[]
  addEmployee: (employee: Partial<ExtendedEmployee>) => ExtendedEmployee
  updateEmployee: (id: string, updates: Partial<ExtendedEmployee>) => void
  bulkUpdateEmployees: (ids: string[], updates: Partial<ExtendedEmployee>, reason: string) => void
  deleteEmployee: (id: string) => void
  confirmProbation: (id: string, remarks?: string) => void
  extendProbation: (id: string, additionalDays: number, reason: string) => void
  verifyDocument: (docId: string, status: 'Verified' | 'Rejected', reason?: string) => void
  addCustomField: (field: Omit<CustomFieldDefinition, 'id'>) => void
  deleteCustomField: (id: string) => void
  applyIndustryTemplate: (companyType: CompanyType) => void
  getEmployeeById: (id: string) => ExtendedEmployee | undefined
  logSensitiveFieldReveal: (empId: string, empName: string, fieldName: string) => void
}

const STORAGE_KEY_EMPLOYEES = 'hrms_admin_employees_v1'
const STORAGE_KEY_MASTER_DATA = 'hrms_admin_master_data_v1'
const STORAGE_KEY_CUSTOM_FIELDS = 'hrms_admin_custom_fields_v1'
const STORAGE_KEY_DOCS_QUEUE = 'hrms_admin_docs_queue_v1'

const INITIAL_MASTER_DATA: OrganizationMasterData = {
  entities: [
    { id: 'ENT-001', name: 'Apex Technologies Pvt Ltd', code: 'APEX', hq: 'Bengaluru Tech Park' },
    { id: 'ENT-002', name: 'Bharat Heavy Forge & Tooling Ltd', code: 'BHARAT', hq: 'Pune Industrial Area' },
    { id: 'ENT-003', name: 'Zenith FMCG Logistics Distributors', code: 'ZENITH', hq: 'Ahmedabad Logistics Park' },
  ],
  branches: [
    { id: 'BR-01', name: 'Bengaluru HQ', city: 'Bengaluru', entityId: 'ENT-001', employeeCount: 22 },
    { id: 'BR-02', name: 'Pune Dev Center', city: 'Pune', entityId: 'ENT-001', employeeCount: 12 },
    { id: 'BR-03', name: 'Hyderabad Hub', city: 'Hyderabad', entityId: 'ENT-001', employeeCount: 6 },
    { id: 'BR-04', name: 'Pune Plant 1', city: 'Pune', entityId: 'ENT-002', employeeCount: 45 },
    { id: 'BR-05', name: 'Ahmedabad Hub', city: 'Ahmedabad', entityId: 'ENT-003', employeeCount: 30 },
  ],
  departments: [
    { id: 'DEP-01', name: 'Engineering', headName: 'Vikram Malhotra', code: 'ENG' },
    { id: 'DEP-02', name: 'Product & Design', headName: 'Sarah Jenkins', code: 'PROD' },
    { id: 'DEP-03', name: 'People Operations', headName: 'Sarah Jenkins', code: 'HR' },
    { id: 'DEP-04', name: 'Field Sales', headName: 'Rajesh Sharma', code: 'SALES' },
    { id: 'DEP-05', name: 'Plant Operations', headName: 'Sanjay Verma', code: 'PLANT' },
  ],
  grades: [
    { id: 'GR-1', grade: 'L1', level: 1, designation: 'Intern / Associate' },
    { id: 'GR-2', grade: 'L2', level: 2, designation: 'Junior Engineer / Executive' },
    { id: 'GR-3', grade: 'L3', level: 3, designation: 'Software Engineer / Officer' },
    { id: 'GR-4', grade: 'L4', level: 4, designation: 'Senior Engineer / Lead Specialist' },
    { id: 'GR-5', grade: 'L5', level: 5, designation: 'Engineering Manager / Functional Lead' },
    { id: 'GR-6', grade: 'L6', level: 6, designation: 'Director / VP / C-Suite' },
  ],
  costCenters: [
    { id: 'CC-101', code: 'CC-ENG-01', name: 'R&D Product Engineering', budget: '₹ 1,50,00,000' },
    { id: 'CC-102', code: 'CC-OPS-02', name: 'Central Administration & HR', budget: '₹ 45,00,000' },
    { id: 'CC-103', code: 'CC-SALES-03', name: 'Domestic Market Acquisition', budget: '₹ 80,00,000' },
    { id: 'CC-104', code: 'CC-PLANT-04', name: 'Manufacturing Unit Operations', budget: '₹ 2,20,00,000' },
  ],
  workingCalendars: [
    { id: 'CAL-01', name: 'Standard IT 5-Day (Mon-Fri)', workDays: 'Mon, Tue, Wed, Thu, Fri', standardHours: 8 },
    { id: 'CAL-02', name: 'Plant 6-Day Rotational (Mon-Sat)', workDays: 'Mon, Tue, Wed, Thu, Fri, Sat', standardHours: 8 },
    { id: 'CAL-03', name: 'Hospital Continuous 24x7', workDays: '7 Days Rotational', standardHours: 8 },
  ],
}

const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'CF-1',
    module: 'Employee',
    fieldName: 'T-Shirt / Uniform Size',
    fieldKey: 'uniform_size',
    fieldType: 'select',
    options: ['S', 'M', 'L', 'XL', 'XXL'],
    required: false,
    visibleToRole: 'All',
    appliesToProfile: 'All',
  },
  {
    id: 'CF-2',
    module: 'Employee',
    fieldName: 'Blood Group',
    fieldKey: 'blood_group',
    fieldType: 'select',
    options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    required: true,
    visibleToRole: 'All',
    appliesToProfile: 'All',
  },
  {
    id: 'CF-3',
    module: 'Employee',
    fieldName: 'Vehicle Registration Number',
    fieldKey: 'vehicle_reg_no',
    fieldType: 'text',
    required: false,
    visibleToRole: 'Admin/HR',
    appliesToProfile: 'Field Sales',
  },
  {
    id: 'CF-4',
    module: 'Visit',
    fieldName: 'Odometer Start Reading',
    fieldKey: 'odometer_start',
    fieldType: 'number',
    required: true,
    visibleToRole: 'Field Sales',
    appliesToProfile: 'Field Sales',
  },
]

function generateInitialExtendedEmployees(): ExtendedEmployee[] {
  return MOCK_EMPLOYEES.map((emp, index) => {
    const isProbation = emp.status === 'Probation' || index % 6 === 2
    const status = isProbation ? 'Probation' : emp.status
    const joiningDate = emp.joiningDate || '2023-01-15'
    const joinYear = new Date(joiningDate).getFullYear()

    return {
      ...emp,
      status,
      phone: `+91 98${index.toString().padStart(2, '0')} 44${(99 - index).toString().padStart(2, '0')}1`,
      dateOfBirth: `199${(index % 9) + 1}-0${(index % 8) + 1}-15`,
      gender: index % 3 === 0 ? 'Female' : 'Male',
      probationEndDate: isProbation ? '2026-11-15' : undefined,
      confirmationDate: isProbation ? undefined : `${joinYear}-07-15`,
      noticePeriodDays: 60,
      panNumber: `ABCDE${1000 + index}F`,
      bankAccountNumber: `50100${450000 + index}`,
      bankName: index % 2 === 0 ? 'HDFC Bank Ltd' : 'ICICI Bank',
      ifscCode: index % 2 === 0 ? 'HDFC0001234' : 'ICIC0005678',
      basicSalary: '₹ ' + (parseInt(emp.ctc.replace(/[^0-9]/g, '')) * 0.5 / 100).toLocaleString('en-IN'),
      hra: '₹ ' + (parseInt(emp.ctc.replace(/[^0-9]/g, '')) * 0.25 / 100).toLocaleString('en-IN'),
      allowances: '₹ ' + (parseInt(emp.ctc.replace(/[^0-9]/g, '')) * 0.25 / 100).toLocaleString('en-IN'),
      jobHistory: [
        {
          id: `JH-${index}-1`,
          effectiveDate: joiningDate,
          changeType: 'Hired',
          newValue: `${emp.designation} (${emp.grade}) at ${emp.branch}`,
          approvedBy: 'Sarah Jenkins (HR)',
        },
        ...(index % 4 === 0
          ? [
              {
                id: `JH-${index}-2`,
                effectiveDate: '2025-04-01',
                changeType: 'Salary Revision' as const,
                previousValue: 'Previous CTC',
                newValue: `Revised to ${emp.ctc}`,
                reason: 'Annual Performance Appraisal Cycle',
                approvedBy: 'Vikram Malhotra',
              },
            ]
          : []),
      ],
      documents: [
        {
          id: `DOC-${index}-1`,
          employeeId: emp.id,
          employeeName: emp.name,
          docType: 'National ID',
          fileName: `aadhaar_card_${emp.id.toLowerCase()}.pdf`,
          fileSize: '1.4 MB',
          uploadDate: joiningDate,
          status: 'Verified',
          verifiedBy: 'Sarah Jenkins',
          verificationDate: joiningDate,
        },
        {
          id: `DOC-${index}-2`,
          employeeId: emp.id,
          employeeName: emp.name,
          docType: 'Degree Certificate',
          fileName: `degree_convocation_${emp.id.toLowerCase()}.pdf`,
          fileSize: '2.1 MB',
          uploadDate: joiningDate,
          status: index % 5 === 0 ? 'Pending' : 'Verified',
          verifiedBy: index % 5 === 0 ? undefined : 'Sarah Jenkins',
        },
      ],
      assets: [
        {
          id: `AST-${index}-1`,
          employeeId: emp.id,
          assetName: 'Apple MacBook Pro 14" M3 / Dell Latitude',
          assetType: 'Laptop',
          serialNumber: `SN-${emp.id}-2024-X`,
          allocatedDate: joiningDate,
          status: 'Allocated',
        },
      ],
      customFieldValues: {
        uniform_size: 'L',
        blood_group: index % 2 === 0 ? 'O+' : 'B+',
      },
    }
  })
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<ExtendedEmployee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load saved employees:', e)
      }
    }
    return generateInitialExtendedEmployees()
  })

  const [masterData, setMasterData] = useState<OrganizationMasterData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MASTER_DATA)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_MASTER_DATA
  })

  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_FIELDS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_CUSTOM_FIELDS
  })

  const [activeCompany, setActiveCompany] = useState<CompanyEntity>(MOCK_COMPANIES[0])

  // Extract all pending documents across employees for the verification queue
  const documentsQueue = employees.flatMap((emp) => emp.documents || [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees))
  }, [employees])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MASTER_DATA, JSON.stringify(masterData))
  }, [masterData])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_FIELDS, JSON.stringify(customFields))
  }, [customFields])

  const getEmployeeById = (id: string) => {
    return employees.find((e) => e.id === id)
  }

  const addEmployee = (newEmpData: Partial<ExtendedEmployee>): ExtendedEmployee => {
    const id = `EMP-${(employees.length + 1).toString().padStart(3, '0')}`
    const newEmployee: ExtendedEmployee = {
      id,
      name: newEmpData.name || 'New Employee',
      email: newEmpData.email || `${id.toLowerCase()}@apex.internal`,
      avatar: newEmpData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      designation: newEmpData.designation || 'Associate Specialist',
      grade: newEmpData.grade || 'L2',
      department: newEmpData.department || 'Engineering',
      branch: newEmpData.branch || 'Bengaluru HQ',
      companyId: activeCompany.id,
      profileType: newEmpData.profileType || 'Office Staff',
      joiningDate: newEmpData.joiningDate || new Date().toISOString().split('T')[0],
      status: newEmpData.status || 'Probation',
      ctc: newEmpData.ctc || '₹ 8,50,000',
      probationEndDate: newEmpData.probationEndDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      reportingManagerName: newEmpData.reportingManagerName || 'Vikram Malhotra',
      reportingManagerId: newEmpData.reportingManagerId || 'EMP-002',
      phone: newEmpData.phone || '+91 98000 00000',
      panNumber: newEmpData.panNumber || 'ABCDE1234F',
      bankAccountNumber: newEmpData.bankAccountNumber || '50100998877',
      bankName: newEmpData.bankName || 'HDFC Bank',
      jobHistory: [
        {
          id: `JH-${id}-init`,
          effectiveDate: new Date().toISOString().split('T')[0],
          changeType: 'Hired',
          newValue: `${newEmpData.designation || 'Associate'} at ${newEmpData.branch || 'Bengaluru HQ'}`,
          approvedBy: 'HR Admin',
        },
      ],
      documents: [
        {
          id: `DOC-${id}-1`,
          employeeId: id,
          employeeName: newEmpData.name || 'New Employee',
          docType: 'National ID',
          fileName: `national_id_${id.toLowerCase()}.pdf`,
          fileSize: '1.2 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
        },
      ],
      assets: [
        {
          id: `AST-${id}-1`,
          employeeId: id,
          assetName: 'Standard Workstation Equipment',
          assetType: 'Laptop',
          serialNumber: `SN-${id}-AUTO`,
          allocatedDate: new Date().toISOString().split('T')[0],
          status: 'Allocated',
        },
      ],
      ...newEmpData,
    }

    setEmployees((prev) => [newEmployee, ...prev])

    AuditLogService.addLog({
      action: 'ADD_EMPLOYEE',
      targetType: 'Employee',
      targetId: id,
      targetName: newEmployee.name,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'None',
      afterValue: 'Enrolled',
      reason: `Added new employee ${newEmployee.name} (${newEmployee.designation}) in ${newEmployee.department}`,
    })

    return newEmployee
  }

  const updateEmployee = (id: string, updates: Partial<ExtendedEmployee>) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp
        return { ...emp, ...updates }
      })
    )

    AuditLogService.addLog({
      action: 'UPDATE_EMPLOYEE',
      targetType: 'Employee',
      targetId: id,
      targetName: id,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'Current',
      afterValue: 'Updated',
      reason: `Updated employee record for ${id}`,
    })
  }

  const bulkUpdateEmployees = (ids: string[], updates: Partial<ExtendedEmployee>, reason: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (!ids.includes(emp.id)) return emp

        const updatedHistory = emp.jobHistory ? [...emp.jobHistory] : []
        if (updates.reportingManagerName) {
          updatedHistory.push({
            id: `JH-BLK-${Date.now()}-${emp.id}`,
            effectiveDate: new Date().toISOString().split('T')[0],
            changeType: 'Manager Change',
            previousValue: emp.reportingManagerName,
            newValue: updates.reportingManagerName,
            reason,
            approvedBy: 'HR Admin (Bulk Action)',
          })
        }
        if (updates.branch) {
          updatedHistory.push({
            id: `JH-BLK-${Date.now()}-${emp.id}`,
            effectiveDate: new Date().toISOString().split('T')[0],
            changeType: 'Transfer',
            previousValue: emp.branch,
            newValue: updates.branch,
            reason,
            approvedBy: 'HR Admin (Bulk Action)',
          })
        }

        return {
          ...emp,
          ...updates,
          jobHistory: updatedHistory,
        }
      })
    )

    AuditLogService.addLog({
      action: 'BULK_UPDATE_EMPLOYEES',
      targetType: 'Bulk Employee',
      targetId: `${ids.length} Employees`,
      targetName: `${ids.length} Employees`,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'Multiple',
      afterValue: 'Bulk Updated',
      reason: `Bulk updated ${ids.length} employees. Reason: ${reason}`,
    })
  }

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id)
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    AuditLogService.addLog({
      action: 'DELETE_EMPLOYEE',
      targetType: 'Employee',
      targetId: id,
      targetName: target?.name || id,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'Active Record',
      afterValue: 'Deleted',
      reason: `Deleted employee record for ${target?.name || id}`,
    })
  }

  const confirmProbation = (id: string, remarks?: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp
        return {
          ...emp,
          status: 'Active',
          confirmationDate: new Date().toISOString().split('T')[0],
          probationEndDate: undefined,
          jobHistory: [
            ...(emp.jobHistory || []),
            {
              id: `JH-CONF-${Date.now()}`,
              effectiveDate: new Date().toISOString().split('T')[0],
              changeType: 'Promotion',
              newValue: 'Employment Confirmed (Probation Completed)',
              reason: remarks || 'Satisfactory probation performance review',
              approvedBy: 'HR Admin',
            },
          ],
        }
      })
    )

    AuditLogService.addLog({
      action: 'CONFIRM_PROBATION',
      targetType: 'Employee',
      targetId: id,
      targetName: id,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'Probation',
      afterValue: 'Active Permanent',
      reason: remarks || 'Confirmed employee probation status',
    })
  }

  const extendProbation = (id: string, additionalDays: number, reason: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== id) return emp
        const currentEnd = emp.probationEndDate ? new Date(emp.probationEndDate) : new Date()
        const newEnd = new Date(currentEnd.getTime() + additionalDays * 86400000).toISOString().split('T')[0]
        return {
          ...emp,
          probationEndDate: newEnd,
          jobHistory: [
            ...(emp.jobHistory || []),
            {
              id: `JH-EXT-${Date.now()}`,
              effectiveDate: new Date().toISOString().split('T')[0],
              changeType: 'Salary Revision',
              newValue: `Probation Extended by ${additionalDays} days (New End: ${newEnd})`,
              reason,
              approvedBy: 'HR Admin',
            },
          ],
        }
      })
    )

    AuditLogService.addLog({
      action: 'EXTEND_PROBATION',
      targetType: 'Employee',
      targetId: id,
      targetName: id,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PROFILE',
      beforeValue: 'Current End Date',
      afterValue: `Extended by ${additionalDays} Days`,
      reason,
    })
  }

  const verifyDocument = (docId: string, status: 'Verified' | 'Rejected', reason?: string) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (!emp.documents) return emp
        const hasDoc = emp.documents.some((d) => d.id === docId)
        if (!hasDoc) return emp
        return {
          ...emp,
          documents: emp.documents.map((d) => {
            if (d.id !== docId) return d
            return {
              ...d,
              status,
              verifiedBy: 'Sarah Jenkins (HR Admin)',
              verificationDate: new Date().toISOString().split('T')[0],
              rejectReason: reason,
            }
          }),
        }
      })
    )

    AuditLogService.addLog({
      action: `DOCUMENT_${status.toUpperCase()}`,
      targetType: 'Employee',
      targetId: docId,
      targetName: docId,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'DOC_VAULT',
      beforeValue: 'Pending',
      afterValue: status,
      reason: reason || 'Document verification decision',
    })
  }

  const addCustomField = (field: Omit<CustomFieldDefinition, 'id'>) => {
    const id = `CF-${Date.now()}`
    const newField: CustomFieldDefinition = { ...field, id }
    setCustomFields((prev) => [...prev, newField])
  }

  const deleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id))
  }

  const applyIndustryTemplate = (companyType: CompanyType) => {
    const toggles = getCompanyTemplateToggles(companyType)
    const matchingCompany = MOCK_COMPANIES.find((c) => c.industry === companyType) || {
      id: `COMP-CUSTOM-${companyType}`,
      name: `${companyType} Enterprise Corp`,
      code: companyType.substring(0, 4).toUpperCase(),
      industry: companyType,
      headquarters: 'Central HQ',
      branches: ['Main Branch', 'Secondary Depot'],
      departments: ['Operations', 'Administration', 'Support'],
      featureToggles: toggles,
    }

    setActiveCompany({
      ...matchingCompany,
      featureToggles: toggles,
    })

    AuditLogService.addLog({
      action: 'APPLY_INDUSTRY_TEMPLATE',
      targetType: 'Company',
      targetId: companyType,
      targetName: matchingCompany.name,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'ORG_CHART',
      beforeValue: 'Default',
      afterValue: companyType,
      reason: `Applied ${companyType} industry archetype to ${matchingCompany.name}`,
    })
  }

  const logSensitiveFieldReveal = (empId: string, empName: string, fieldName: string) => {
    AuditLogService.addLog({
      action: 'REVEAL_SENSITIVE_DATA',
      targetType: 'Employee',
      targetId: empId,
      targetName: empName,
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      featureCode: 'PAYROLL',
      beforeValue: 'Masked (••••••••)',
      afterValue: 'Unmasked for Viewing',
      reason: `User inspected sensitive attribute "${fieldName}"`,
    })
  }

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        activeCompany,
        masterData,
        documentsQueue,
        customFields,
        addEmployee,
        updateEmployee,
        bulkUpdateEmployees,
        deleteEmployee,
        confirmProbation,
        extendProbation,
        verifyDocument,
        addCustomField,
        deleteCustomField,
        applyIndustryTemplate,
        getEmployeeById,
        logSensitiveFieldReveal,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export const useEmployees = () => {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider')
  }
  return context
}
