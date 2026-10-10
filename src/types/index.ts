export type Role = 'HR Admin' | 'Manager' | 'Employee'

export type EmployeeType = 
  | 'Office Staff' 
  | 'Field Sales' 
  | 'Factory Worker' 
  | 'Remote' 
  | 'Intern' 
  | 'Contractor' 
  | 'Manager'

export type CompanyType = 
  | 'IT' 
  | 'Manufacturing' 
  | 'Retail' 
  | 'Hospital' 
  | 'School' 
  | 'Field Sales' 
  | 'Construction' 
  | 'Logistics' 
  | 'Small Shop'

export type Scope = 'Self' | 'Team' | 'Dept' | 'Branch' | 'All'

export type StatusVariant = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'on-leave' 
  | 'draft' 
  | 'processing' 
  | 'warning'

export interface DemoSettings {
  role: Role
  employeeType: EmployeeType
  companyType: CompanyType
  phonePreview?: boolean
  offlineMode?: boolean
  currentUser: {
    name: string
    title: string
    email: string
    avatar: string
    empId: string
    department: string
    branch: string
  }
}
