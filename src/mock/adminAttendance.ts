import { MOCK_EMPLOYEES } from './employees'

export type AttendanceStatusCode = 'P' | 'A' | 'HD' | 'L' | 'WO' | 'H'

export interface AttendanceStatusInfo {
  code: AttendanceStatusCode
  label: string
  color: string
  bgColor: string
  borderColor: string
}

export const ATTENDANCE_STATUS_MAP: Record<AttendanceStatusCode, AttendanceStatusInfo> = {
  P: { code: 'P', label: 'Present', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', borderColor: 'border-emerald-300 dark:border-emerald-800' },
  A: { code: 'A', label: 'Absent', color: 'text-rose-700 dark:text-rose-300', bgColor: 'bg-rose-50 dark:bg-rose-950/40', borderColor: 'border-rose-300 dark:border-rose-800' },
  HD: { code: 'HD', label: 'Half Day', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950/40', borderColor: 'border-amber-300 dark:border-amber-800' },
  L: { code: 'L', label: 'Leave', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-950/40', borderColor: 'border-blue-300 dark:border-blue-800' },
  WO: { code: 'WO', label: 'Weekly Off', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800/60', borderColor: 'border-slate-300 dark:border-slate-700' },
  H: { code: 'H', label: 'Holiday', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950/40', borderColor: 'border-purple-300 dark:border-purple-800' },
}

export interface LiveEmployeePunch {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  designation: string
  status: 'Present' | 'Absent' | 'Late' | 'On Leave' | 'On Visit'
  punchInTime?: string
  punchOutTime?: string
  shiftName: string
  coordinates: { lat: number; lng: number }
  locationName: string
  batteryLevel?: number
  isOffline?: boolean
  lastSeen: string
}

export interface ShiftDefinition {
  id: string
  code: string
  name: string
  startTime: string // "09:00"
  endTime: string   // "18:00"
  breakDurationMinutes: number
  graceMinutes: number
  isNightShift: boolean
  crossesMidnight: boolean
  color: string
  description?: string
  assignedCount: number
}

export interface AttendancePolicy {
  id: string
  name: string
  code: string
  graceMinutes: number
  lateRule: {
    lateCountTrigger: number // e.g. 3
    deductionType: 'Half Day' | 'Full Day' | 'Loss of Pay'
    description: string
  }
  halfDayMinimumHours: number
  fullDayMinimumHours: number
  roundingMinutes: 5 | 10 | 15 | 30 | 0
  weeklyOffPattern: string[] // ['Saturday', 'Sunday'] or ['Sunday']
  rules: {
    geoRequired: boolean
    faceRequired: boolean
    selfieRequired: boolean
    offlineAllowed: boolean
  }
  appliesToType: 'Company' | 'Branch' | 'Department' | 'Profile' | 'Employee'
  appliesToTarget: string
  effectiveFrom: string
  status: 'Active' | 'Draft' | 'Archived'
}

export interface GeofenceZone {
  id: string
  name: string
  branchName: string
  shapeType: 'circle' | 'polygon'
  center: { lat: number; lng: number }
  radiusMeters: number // for circle
  polygonPoints?: { lat: number; lng: number }[]
  address: string
  isActive: boolean
  assignedEmployeeCount: number
  allowedToleranceMeters: number
}

export interface FaceEnrollmentRecord {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  status: 'Enrolled' | 'Pending' | 'Consent Withdrawn'
  enrolledAt?: string
  qualityScore?: number // 0-100
  photoCount: number
  fallbackMethod: 'Supervisor PIN' | 'QR Code' | 'Kiosk Passcode' | 'None'
  consentDate?: string
  notes?: string
}

export type SuspiciousFlag = 'Mock location' | 'Outside fence' | 'Low face score' | 'Offline' | 'Time mismatch'

export interface SuspiciousPunchItem {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  timestamp: string
  punchType: 'IN' | 'OUT'
  flags: SuspiciousFlag[]
  riskScore: number // 0 - 100
  faceMatchScore: number // 0 - 100
  distanceFromFenceMeters: number
  deviceModel: string
  ipAddress: string
  mockProviderDetected?: string
  selfieUrl: string
  coordinates: { lat: number; lng: number }
  fenceCoordinates: { lat: number; lng: number }
  status: 'Pending Review' | 'Accepted' | 'Rejected' | 'Explanation Requested'
  adminRemarks?: string
  explanation?: string
}

export interface BiometricDevice {
  id: string
  name: string
  type: 'Biometric Scanner' | 'Face Recognition Terminal' | 'Tablet Kiosk' | 'Turnstile Gate'
  model: string
  serialNumber: string
  ipAddress: string
  branch: string
  locationDescription: string
  status: 'Online' | 'Offline' | 'Syncing' | 'Warning'
  lastSyncAt: string
  firmwareVersion: string
  totalPunchesToday: number
  storageUsedPercent: number
}

export interface AdminRegularizationRequest {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  date: string
  issueType: 'Missed Punch In' | 'Missed Punch Out' | 'Both Punches Missed' | 'Biometric Glitch' | 'On Duty / Client Visit'
  originalIn?: string
  originalOut?: string
  requestedIn: string
  requestedOut: string
  reason: string
  managerApprovalStatus: 'Approved' | 'Pending' | 'Auto-Approved'
  submittedAt: string
  status: 'Pending' | 'Approved' | 'Rejected'
  reviewerRemarks?: string
}

// 1. Initial Live Employees (with branch GPS locations around Bengaluru, Mumbai, Pune)
export const INITIAL_LIVE_PUNCHES: LiveEmployeePunch[] = [
  {
    id: 'LP-01',
    employeeId: 'EMP-001',
    employeeName: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'People Operations',
    branch: 'Bengaluru HQ',
    designation: 'HR Lead',
    status: 'Present',
    punchInTime: '09:05 AM',
    shiftName: 'General Day (09:00 - 18:00)',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    locationName: 'Bengaluru HQ - 4th Floor',
    batteryLevel: 94,
    lastSeen: 'Just now',
  },
  {
    id: 'LP-02',
    employeeId: 'EMP-002',
    employeeName: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    designation: 'Engineering Manager',
    status: 'Late',
    punchInTime: '09:48 AM',
    shiftName: 'General Day (09:00 - 18:00)',
    coordinates: { lat: 12.9722, lng: 77.5952 },
    locationName: 'Bengaluru HQ - Tech Hub',
    batteryLevel: 78,
    lastSeen: '2 mins ago',
  },
  {
    id: 'LP-03',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    designation: 'Senior Frontend Engineer',
    status: 'Present',
    punchInTime: '09:12 AM',
    shiftName: 'General Day (09:00 - 18:00)',
    coordinates: { lat: 12.9719, lng: 77.5949 },
    locationName: 'Bengaluru HQ - Desk 32',
    batteryLevel: 88,
    lastSeen: '1 min ago',
  },
  {
    id: 'LP-04',
    employeeId: 'EMP-004',
    employeeName: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Marketing',
    branch: 'Mumbai Hub',
    designation: 'Brand Strategist',
    status: 'On Visit',
    punchInTime: '08:50 AM',
    shiftName: 'Flexible Day (08:30 - 17:30)',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    locationName: 'Client Office - Nariman Point',
    batteryLevel: 62,
    lastSeen: '5 mins ago',
  },
  {
    id: 'LP-05',
    employeeId: 'EMP-005',
    employeeName: 'Rohan Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Sales',
    branch: 'Mumbai Hub',
    designation: 'Enterprise Account Executive',
    status: 'On Visit',
    punchInTime: '09:20 AM',
    shiftName: 'Sales Field Shift',
    coordinates: { lat: 19.0600, lng: 72.8600 },
    locationName: 'Godrej One Client Complex',
    batteryLevel: 81,
    lastSeen: '4 mins ago',
  },
  {
    id: 'LP-06',
    employeeId: 'EMP-006',
    employeeName: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    designation: 'Assembly Supervisor',
    status: 'Present',
    punchInTime: '07:55 AM',
    shiftName: 'Morning Production (08:00 - 16:30)',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    locationName: 'Pune Plant - Shopfloor B',
    batteryLevel: 91,
    lastSeen: 'Just now',
  },
  {
    id: 'LP-07',
    employeeId: 'EMP-007',
    employeeName: 'Kavita Menon',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    department: 'Finance',
    branch: 'Bengaluru HQ',
    designation: 'Senior Accountant',
    status: 'On Leave',
    shiftName: 'General Day',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    locationName: 'Off Duty (Sick Leave)',
    lastSeen: 'Yesterday',
  },
  {
    id: 'LP-08',
    employeeId: 'EMP-008',
    employeeName: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    department: 'Logistics',
    branch: 'Pune Plant',
    designation: 'Warehouse Lead',
    status: 'Absent',
    shiftName: 'Morning Production',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    locationName: 'No Punch Recorded',
    lastSeen: 'Yesterday',
  },
  {
    id: 'LP-09',
    employeeId: 'EMP-009',
    employeeName: 'Rajesh Nair',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    designation: 'CNC Machine Operator',
    status: 'Present',
    punchInTime: '20:55 PM',
    shiftName: 'Night Shift C (21:00 - 06:00)',
    coordinates: { lat: 18.5210, lng: 73.8570 },
    locationName: 'Pune Plant - Line 4',
    batteryLevel: 75,
    lastSeen: '3 mins ago',
  },
]

// 2. Initial Shifts (including Night Shifts with cross midnight note)
export const INITIAL_SHIFTS: ShiftDefinition[] = [
  {
    id: 'SHIFT-01',
    code: 'GEN-DAY',
    name: 'General Day Shift',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMinutes: 60,
    graceMinutes: 15,
    isNightShift: false,
    crossesMidnight: false,
    color: '#3B82F6',
    description: 'Standard office hours with 60 mins lunch break',
    assignedCount: 24,
  },
  {
    id: 'SHIFT-02',
    code: 'MFG-MORN',
    name: 'Morning Plant Shift A',
    startTime: '06:00',
    endTime: '14:30',
    breakDurationMinutes: 45,
    graceMinutes: 10,
    isNightShift: false,
    crossesMidnight: false,
    color: '#10B981',
    description: 'Early morning factory shift with breakfast break',
    assignedCount: 16,
  },
  {
    id: 'SHIFT-03',
    code: 'MFG-EVE',
    name: 'Evening Plant Shift B',
    startTime: '14:00',
    endTime: '22:30',
    breakDurationMinutes: 45,
    graceMinutes: 10,
    isNightShift: false,
    crossesMidnight: false,
    color: '#F59E0B',
    description: 'Afternoon rotation shift',
    assignedCount: 12,
  },
  {
    id: 'SHIFT-04',
    code: 'MFG-NIGHT',
    name: 'Night Production Shift C',
    startTime: '21:00',
    endTime: '06:00',
    breakDurationMinutes: 60,
    graceMinutes: 15,
    isNightShift: true,
    crossesMidnight: true,
    color: '#8B5CF6',
    description: 'Rotational graveyard shift. Crosses midnight into next morning. Attendance credits to the shift start date.',
    assignedCount: 9,
  },
  {
    id: 'SHIFT-05',
    code: 'SUP-247',
    name: 'IT 24/7 Graveyard Support',
    startTime: '23:30',
    endTime: '08:00',
    breakDurationMinutes: 45,
    graceMinutes: 15,
    isNightShift: true,
    crossesMidnight: true,
    color: '#EC4899',
    description: 'Global infrastructure monitoring. Belongs to the start calendar date.',
    assignedCount: 5,
  },
]

// 3. Initial Attendance Policies
export const INITIAL_POLICIES: AttendancePolicy[] = [
  {
    id: 'POL-001',
    name: 'Standard Corporate Policy',
    code: 'CORP-STD',
    graceMinutes: 15,
    lateRule: {
      lateCountTrigger: 3,
      deductionType: 'Half Day',
      description: '3 late marks in a calendar month results in 0.5 Day deduction',
    },
    halfDayMinimumHours: 4.5,
    fullDayMinimumHours: 8.5,
    roundingMinutes: 15,
    weeklyOffPattern: ['Saturday', 'Sunday'],
    rules: {
      geoRequired: true,
      faceRequired: false,
      selfieRequired: true,
      offlineAllowed: false,
    },
    appliesToType: 'Company',
    appliesToTarget: 'Apex Global Corp',
    effectiveFrom: '2026-01-01',
    status: 'Active',
  },
  {
    id: 'POL-002',
    name: 'Plant & Factory Operations Policy',
    code: 'PLANT-STRICT',
    graceMinutes: 10,
    lateRule: {
      lateCountTrigger: 2,
      deductionType: 'Half Day',
      description: '2 late marks lead to 0.5 Day wage reduction for assembly line discipline',
    },
    halfDayMinimumHours: 4.0,
    fullDayMinimumHours: 8.0,
    roundingMinutes: 5,
    weeklyOffPattern: ['Sunday'],
    rules: {
      geoRequired: true,
      faceRequired: true,
      selfieRequired: true,
      offlineAllowed: true,
    },
    appliesToType: 'Branch',
    appliesToTarget: 'Pune Plant',
    effectiveFrom: '2026-03-01',
    status: 'Active',
  },
  {
    id: 'POL-003',
    name: 'Sales & Field Mobility Policy',
    code: 'FIELD-FLEX',
    graceMinutes: 45,
    lateRule: {
      lateCountTrigger: 5,
      deductionType: 'Loss of Pay',
      description: 'Relaxed grace for client travel; 5 late marks = 1 Day Loss of Pay',
    },
    halfDayMinimumHours: 4.0,
    fullDayMinimumHours: 7.5,
    roundingMinutes: 30,
    weeklyOffPattern: ['Sunday'],
    rules: {
      geoRequired: true,
      faceRequired: false,
      selfieRequired: true,
      offlineAllowed: true,
    },
    appliesToType: 'Department',
    appliesToTarget: 'Sales',
    effectiveFrom: '2026-02-15',
    status: 'Active',
  },
]

// 4. Initial Geofences
export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'GEO-01',
    name: 'Bengaluru HQ Campus',
    branchName: 'Bengaluru HQ',
    shapeType: 'circle',
    center: { lat: 12.9716, lng: 77.5946 },
    radiusMeters: 150,
    address: 'Embassy Tech Village, Outer Ring Road, Bengaluru 560103',
    isActive: true,
    assignedEmployeeCount: 22,
    allowedToleranceMeters: 25,
  },
  {
    id: 'GEO-02',
    name: 'Mumbai Central Office',
    branchName: 'Mumbai Hub',
    shapeType: 'circle',
    center: { lat: 19.0760, lng: 72.8777 },
    radiusMeters: 200,
    address: 'BKC Bandra Kurla Complex, Mumbai 400051',
    isActive: true,
    assignedEmployeeCount: 14,
    allowedToleranceMeters: 30,
  },
  {
    id: 'GEO-03',
    name: 'Pune Manufacturing Complex',
    branchName: 'Pune Plant',
    shapeType: 'polygon',
    center: { lat: 18.5204, lng: 73.8567 },
    radiusMeters: 450,
    polygonPoints: [
      { lat: 18.5230, lng: 73.8540 },
      { lat: 18.5240, lng: 73.8590 },
      { lat: 18.5180, lng: 73.8600 },
      { lat: 18.5170, lng: 73.8550 },
    ],
    address: 'MIDC Chakan Phase 2, Industrial Area, Pune 410501',
    isActive: true,
    assignedEmployeeCount: 28,
    allowedToleranceMeters: 50,
  },
]

// 5. Face Enrollment Directory
export const INITIAL_FACE_ENROLLMENTS: FaceEnrollmentRecord[] = [
  {
    id: 'FE-01',
    employeeId: 'EMP-001',
    employeeName: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    department: 'People Operations',
    branch: 'Bengaluru HQ',
    status: 'Enrolled',
    enrolledAt: '2026-02-10 11:20 AM',
    qualityScore: 98,
    photoCount: 5,
    fallbackMethod: 'Supervisor PIN',
    consentDate: '2026-02-10',
    notes: '3D biometric template verified',
  },
  {
    id: 'FE-02',
    employeeId: 'EMP-002',
    employeeName: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    status: 'Enrolled',
    enrolledAt: '2026-02-12 14:15 PM',
    qualityScore: 94,
    photoCount: 4,
    fallbackMethod: 'QR Code',
    consentDate: '2026-02-12',
    notes: 'Kiosk and mobile face enrolled',
  },
  {
    id: 'FE-03',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    status: 'Enrolled',
    enrolledAt: '2026-03-01 09:40 AM',
    qualityScore: 96,
    photoCount: 5,
    fallbackMethod: 'Supervisor PIN',
    consentDate: '2026-03-01',
  },
  {
    id: 'FE-04',
    employeeId: 'EMP-004',
    employeeName: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Marketing',
    branch: 'Mumbai Hub',
    status: 'Pending',
    photoCount: 0,
    fallbackMethod: 'Kiosk Passcode',
    notes: 'Invite sent; pending photo capture',
  },
  {
    id: 'FE-05',
    employeeId: 'EMP-005',
    employeeName: 'Rohan Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Sales',
    branch: 'Mumbai Hub',
    status: 'Consent Withdrawn',
    qualityScore: 0,
    photoCount: 0,
    fallbackMethod: 'Supervisor PIN',
    consentDate: 'Withdrawn 2026-03-15',
    notes: 'Employee opted out per privacy policy; uses QR fallback',
  },
  {
    id: 'FE-06',
    employeeId: 'EMP-006',
    employeeName: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    status: 'Enrolled',
    enrolledAt: '2026-01-20 08:30 AM',
    qualityScore: 91,
    photoCount: 4,
    fallbackMethod: 'Kiosk Passcode',
    consentDate: '2026-01-20',
  },
]

// 6. Suspicious Punches with Risk Scores & Multi-Flag Badges
export const INITIAL_SUSPICIOUS_PUNCHES: SuspiciousPunchItem[] = [
  {
    id: 'SP-101',
    employeeId: 'EMP-012',
    employeeName: 'Manish Kumar',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    timestamp: 'Today, 09:02 AM',
    punchType: 'IN',
    flags: ['Mock location', 'Time mismatch'],
    riskScore: 94,
    faceMatchScore: 98,
    distanceFromFenceMeters: 420,
    deviceModel: 'OnePlus Nord (Android 14)',
    ipAddress: '157.48.21.90 (Cellular)',
    mockProviderDetected: 'com.lexa.fakegps (Mock Location Provider API)',
    selfieUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    fenceCoordinates: { lat: 12.9680, lng: 77.5910 },
    status: 'Pending Review',
    explanation: 'I was in the basement elevator and GPS was fluctuating',
  },
  {
    id: 'SP-102',
    employeeId: 'EMP-015',
    employeeName: 'Deepak Joshi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Operations',
    branch: 'Mumbai Hub',
    timestamp: 'Today, 08:55 AM',
    punchType: 'IN',
    flags: ['Outside fence', 'Low face score'],
    riskScore: 82,
    faceMatchScore: 48,
    distanceFromFenceMeters: 1850,
    deviceModel: 'Samsung Galaxy A53',
    ipAddress: '115.112.44.12',
    selfieUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    coordinates: { lat: 19.0910, lng: 72.8620 },
    fenceCoordinates: { lat: 19.0760, lng: 72.8777 },
    status: 'Pending Review',
  },
  {
    id: 'SP-103',
    employeeId: 'EMP-019',
    employeeName: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    timestamp: 'Yesterday, 21:05 PM',
    punchType: 'IN',
    flags: ['Offline', 'Time mismatch'],
    riskScore: 68,
    faceMatchScore: 92,
    distanceFromFenceMeters: 30,
    deviceModel: 'Redmi Note 12 Pro',
    ipAddress: 'Offline Stored Queue',
    selfieUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    fenceCoordinates: { lat: 18.5204, lng: 73.8567 },
    status: 'Pending Review',
    explanation: 'Factory shopfloor wifi was disconnected during night shift entry',
  },
  {
    id: 'SP-104',
    employeeId: 'EMP-022',
    employeeName: 'Sunita Rao',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Logistics',
    branch: 'Bengaluru HQ',
    timestamp: 'Yesterday, 18:30 PM',
    punchType: 'OUT',
    flags: ['Outside fence'],
    riskScore: 55,
    faceMatchScore: 95,
    distanceFromFenceMeters: 850,
    deviceModel: 'iPhone 13',
    ipAddress: '106.195.12.3',
    selfieUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    coordinates: { lat: 12.9640, lng: 77.5890 },
    fenceCoordinates: { lat: 12.9716, lng: 77.5946 },
    status: 'Accepted',
    adminRemarks: 'Approved by Branch Manager: left early for vendor dispatch',
  },
]

// 7. Biometric & Kiosk Hardware
export const INITIAL_DEVICES: BiometricDevice[] = [
  {
    id: 'DEV-001',
    name: 'Bengaluru HQ Main Turnstile Gate 1',
    type: 'Face Recognition Terminal',
    model: 'Suprema FaceStation F2',
    serialNumber: 'FS2-98441029',
    ipAddress: '192.168.10.101',
    branch: 'Bengaluru HQ',
    locationDescription: 'Ground Floor Main Security Turnstiles',
    status: 'Online',
    lastSyncAt: '12 seconds ago',
    firmwareVersion: 'v2.4.1_b12',
    totalPunchesToday: 184,
    storageUsedPercent: 34,
  },
  {
    id: 'DEV-002',
    name: 'Bengaluru HQ Floor 4 Employee Kiosk',
    type: 'Tablet Kiosk',
    model: 'iPad Pro 11 (Kiosk Lockdown)',
    serialNumber: 'APL-KIO-8812',
    ipAddress: '192.168.10.145',
    branch: 'Bengaluru HQ',
    locationDescription: 'Cafeteria & Elevator Lobby',
    status: 'Online',
    lastSyncAt: '45 seconds ago',
    firmwareVersion: 'App v4.2.0',
    totalPunchesToday: 62,
    storageUsedPercent: 18,
  },
  {
    id: 'DEV-003',
    name: 'Mumbai BKC Reception Biometric',
    type: 'Biometric Scanner',
    model: 'ZKTeco SilkBio-101TC',
    serialNumber: 'ZK-7731920',
    ipAddress: '192.168.20.105',
    branch: 'Mumbai Hub',
    locationDescription: 'Tower B Level 3 Entrance',
    status: 'Syncing',
    lastSyncAt: '2 mins ago',
    firmwareVersion: 'v8.1.9',
    totalPunchesToday: 48,
    storageUsedPercent: 52,
  },
  {
    id: 'DEV-004',
    name: 'Pune Assembly Line Gate A',
    type: 'Turnstile Gate',
    model: 'eSSL MB20 Industrial Fingerprint/Face',
    serialNumber: 'ESSL-IND-5521',
    ipAddress: '192.168.30.201',
    branch: 'Pune Plant',
    locationDescription: 'Heavy Machinery Plant Entry 1',
    status: 'Online',
    lastSyncAt: 'Just now',
    firmwareVersion: 'v3.1.0_PRO',
    totalPunchesToday: 215,
    storageUsedPercent: 68,
  },
  {
    id: 'DEV-005',
    name: 'Pune Warehouse Rear Dispatch Kiosk',
    type: 'Tablet Kiosk',
    model: 'Samsung Galaxy Tab Active4 Pro',
    serialNumber: 'SAM-ACT-3041',
    ipAddress: '192.168.30.222',
    branch: 'Pune Plant',
    locationDescription: 'Loading Bay 3 Dock',
    status: 'Offline',
    lastSyncAt: '3 hours ago',
    firmwareVersion: 'App v4.1.8',
    totalPunchesToday: 19,
    storageUsedPercent: 41,
  },
]

// 8. Admin Regularization Queue
export const INITIAL_ADMIN_REGULARIZATIONS: AdminRegularizationRequest[] = [
  {
    id: 'REG-ADM-01',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    date: '2026-10-06',
    issueType: 'Biometric Glitch',
    originalIn: '—',
    originalOut: '06:35 PM',
    requestedIn: '09:15 AM',
    requestedOut: '06:35 PM',
    reason: 'Turnstile face scanner timed out during morning rush. Guard noted ID.',
    managerApprovalStatus: 'Approved',
    submittedAt: '2026-10-07 10:15 AM',
    status: 'Pending',
  },
  {
    id: 'REG-ADM-02',
    employeeId: 'EMP-005',
    employeeName: 'Rohan Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Sales',
    branch: 'Mumbai Hub',
    date: '2026-10-05',
    issueType: 'On Duty / Client Visit',
    originalIn: '—',
    originalOut: '—',
    requestedIn: '09:00 AM',
    requestedOut: '07:30 PM',
    reason: 'Full day at Tata Motors Procurement summit with VP Sales.',
    managerApprovalStatus: 'Approved',
    submittedAt: '2026-10-06 09:30 AM',
    status: 'Pending',
  },
  {
    id: 'REG-ADM-03',
    employeeId: 'EMP-009',
    employeeName: 'Rajesh Nair',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    date: '2026-10-04',
    issueType: 'Missed Punch Out',
    originalIn: '20:55 PM',
    originalOut: '—',
    requestedIn: '20:55 PM',
    requestedOut: '06:05 AM',
    reason: 'Night shift crossover. Rushed out due to power disruption at 6 AM.',
    managerApprovalStatus: 'Approved',
    submittedAt: '2026-10-05 14:00 PM',
    status: 'Pending',
  },
]

// 9. Generate Monthly Attendance Matrix (Employees x 31 Days)
export interface EmployeeMonthRow {
  employeeId: string
  name: string
  avatar: string
  department: string
  branch: string
  designation: string
  days: Record<number, AttendanceStatusCode> // day 1..31 -> 'P' | 'A' | 'HD' | 'L' | 'WO' | 'H'
  overrideReasons?: Record<number, { reason: string; updatedBy: string; updatedAt: string }>
}

export function generateEmployeeMonthRegister(): EmployeeMonthRow[] {
  // Use first 15 employees from MOCK_EMPLOYEES for rich table
  const sampleEmployees = MOCK_EMPLOYEES.slice(0, 15)

  return sampleEmployees.map((emp, index) => {
    const days: Record<number, AttendanceStatusCode> = {}

    for (let d = 1; d <= 31; d++) {
      const dayOfWeek = (d + 3) % 7 // offset so some are weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        days[d] = 'WO'
      } else if (d === 2) {
        days[d] = 'H' // Gandhi Jayanti
      } else if (d === 24) {
        days[d] = 'H' // Festival
      } else if ((index + d) % 17 === 0) {
        days[d] = 'A' // Absent
      } else if ((index + d) % 13 === 0) {
        days[d] = 'HD' // Half Day
      } else if ((index + d) % 11 === 0) {
        days[d] = 'L' // Leave
      } else {
        days[d] = 'P' // Present
      }
    }

    return {
      employeeId: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      department: emp.department,
      branch: emp.branch,
      designation: emp.designation,
      days,
    }
  })
}
