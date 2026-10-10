export interface PunchRecord {
  id: string
  time: string
  type: 'IN' | 'OUT'
  location: string
  accuracy: string
  geofenceStatus: 'Inside fence' | 'Outside fence' | 'Low accuracy' | 'Not applicable'
  selfieVerified: boolean
  outsideFenceReason?: string
  status: 'Approved' | 'Pending Approval' | 'Regularized'
}

export interface DayAttendance {
  date: string // YYYY-MM-DD
  dayNumber: number
  status: 'Present' | 'Absent' | 'Half day' | 'Leave' | 'Weekly off' | 'Holiday'
  shiftName: string
  shiftTiming: string
  shiftBelongsToDate?: string // for night shifts
  inTime?: string
  outTime?: string
  workHours?: string
  overtimeHours?: string
  isLate?: boolean
  isEarlyExit?: boolean
  punches: PunchRecord[]
}

export interface RegularizationItem {
  id: string
  date: string
  issueType: 'Missed Punch In' | 'Missed Punch Out' | 'Both Punches Missed' | 'Biometric Device Glitch' | 'Wrong Punch Recorded'
  requestedInTime: string
  requestedOutTime: string
  reason: string
  attachmentName?: string
  submittedAt: string
  status: 'approved' | 'pending' | 'rejected'
  comments?: string
}

export interface ShiftRosterDay {
  date: string
  dayName: string
  shiftCode: string
  shiftName: string
  timings: string
  isNightShift: boolean
  isWeeklyOff: boolean
}

// Generate realistic monthly calendar for Current Month (October 2026)
export function generateMockMonthAttendance(): DayAttendance[] {
  const days: DayAttendance[] = []
  const totalDays = 31

  for (let d = 1; d <= totalDays; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`
    const date = `2026-10-${dayStr}`
    const dayOfWeek = (d + 3) % 7 // arbitrary weekday offset

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend / Weekly off
      days.push({
        date,
        dayNumber: d,
        status: 'Weekly off',
        shiftName: 'Weekly Off',
        shiftTiming: 'Off Duty',
        punches: [],
      })
    } else if (d === 2) {
      // National Holiday (Gandhi Jayanti)
      days.push({
        date,
        dayNumber: d,
        status: 'Holiday',
        shiftName: 'National Holiday',
        shiftTiming: 'Off Duty',
        punches: [],
      })
    } else if (d === 7) {
      // Casual Leave
      days.push({
        date,
        dayNumber: d,
        status: 'Leave',
        shiftName: 'General Shift',
        shiftTiming: '09:30 AM - 06:30 PM',
        punches: [],
      })
    } else if (d === 14) {
      // Half Day
      days.push({
        date,
        dayNumber: d,
        status: 'Half day',
        shiftName: 'General Shift',
        shiftTiming: '09:30 AM - 06:30 PM',
        inTime: '09:28 AM',
        outTime: '01:45 PM',
        workHours: '4h 17m',
        punches: [
          { id: `p-${d}-1`, time: '09:28 AM', type: 'IN', location: 'Tech Park Campus', accuracy: '12m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
          { id: `p-${d}-2`, time: '01:45 PM', type: 'OUT', location: 'Tech Park Campus', accuracy: '15m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
        ],
      })
    } else if (d === 5) {
      // NIGHT SHIFT EXAMPLE
      days.push({
        date,
        dayNumber: d,
        status: 'Present',
        shiftName: 'Night Shift C',
        shiftTiming: '10:00 PM - 06:00 AM (+1)',
        shiftBelongsToDate: '5th October',
        inTime: '09:55 PM',
        outTime: '06:05 AM',
        workHours: '8h 10m',
        overtimeHours: '0h 10m',
        punches: [
          { id: `p-${d}-1`, time: '09:55 PM', type: 'IN', location: 'Plant Gate 2', accuracy: '8m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
          { id: `p-${d}-2`, time: '06:05 AM', type: 'OUT', location: 'Plant Gate 2', accuracy: '10m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
        ],
      })
    } else if (d === 8) {
      // Late arrival
      days.push({
        date,
        dayNumber: d,
        status: 'Present',
        shiftName: 'General Shift',
        shiftTiming: '09:30 AM - 06:30 PM',
        inTime: '10:14 AM',
        outTime: '06:40 PM',
        workHours: '8h 26m',
        isLate: true,
        punches: [
          { id: `p-${d}-1`, time: '10:14 AM', type: 'IN', location: 'Tech Park Main Gate', accuracy: '14m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
          { id: `p-${d}-2`, time: '06:40 PM', type: 'OUT', location: 'Tech Park Main Gate', accuracy: '11m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
        ],
      })
    } else {
      // Standard On-time Present
      days.push({
        date,
        dayNumber: d,
        status: 'Present',
        shiftName: 'General Shift',
        shiftTiming: '09:30 AM - 06:30 PM',
        inTime: '09:22 AM',
        outTime: '06:35 PM',
        workHours: '9h 13m',
        punches: [
          { id: `p-${d}-1`, time: '09:22 AM', type: 'IN', location: 'Bengaluru Tech Park', accuracy: '9m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
          { id: `p-${d}-2`, time: '06:35 PM', type: 'OUT', location: 'Bengaluru Tech Park', accuracy: '12m', geofenceStatus: 'Inside fence', selfieVerified: true, status: 'Approved' },
        ],
      })
    }
  }

  return days
}

export const INITIAL_REGULARIZATIONS: RegularizationItem[] = [
  {
    id: 'REG-2041',
    date: '2026-10-06',
    issueType: 'Missed Punch Out',
    requestedInTime: '09:25 AM',
    requestedOutTime: '06:30 PM',
    reason: 'Biometric fingerprint turnstile server timed out during evening rush.',
    attachmentName: 'bus_ticket_receipt.pdf',
    submittedAt: 'Oct 07, 09:15 AM',
    status: 'approved',
    comments: 'Verified with security desk turnstile camera logs. Approved.',
  },
  {
    id: 'REG-2042',
    date: '2026-10-08',
    issueType: 'Biometric Device Glitch',
    requestedInTime: '09:30 AM',
    requestedOutTime: '06:45 PM',
    reason: 'Outdoor geo-tagging lost GPS lock due to heavy rains.',
    submittedAt: 'Oct 08, 10:45 AM',
    status: 'pending',
    comments: 'Forwarded to direct manager for attendance regularisation review.',
  },
]
