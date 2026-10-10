import React, { createContext, useContext, useState } from 'react'

export interface ClientAccount {
  id: string
  name: string
  category: 'A - Key Account' | 'B - Growth' | 'C - Standard'
  city: string
  address: string
  contactPerson: string
  contactPhone: string
  latitude: number
  longitude: number
  geofenceRadiusMeters: number // e.g. 50, 100, 150, 200
  beatRoute: string
  totalVisitsYTD: number
}

export type VisitOutcome =
  | 'Order Placed'
  | 'Follow-up Required'
  | 'No Meeting / Decision Maker Absent'
  | 'Payment Collected'

export interface VisitPlan {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  clientId: string
  clientName: string
  clientAddress: string
  clientLat: number
  clientLng: number
  geofenceRadiusMeters: number
  scheduledDate: string
  scheduledTimeSlot: string
  beatRoute: string
  priority: 'High' | 'Medium' | 'Low'
  purpose: string
  isUnplanned: boolean
  status: 'Planned' | 'In Progress' | 'Completed' | 'Missed'
  checkInTime?: string
  checkInLat?: number
  checkInLng?: number
  checkInAccuracyMeters?: number
  checkInPhoto?: string
  isInsideGeofence?: boolean
  checkInDistanceMeters?: number
  checkOutTime?: string
  visitDurationMinutes?: number
  outcome?: VisitOutcome
  orderValue?: number
  notes?: string
  nextVisitDate?: string
  distanceCoveredKm?: number
}

export interface ExpenseAllowanceSuggestion {
  totalDistanceKm: number
  ratePerKm: number
  totalAllowance: number
  isClaimed: boolean
  claimedAt?: string
}

interface VisitContextType {
  clients: ClientAccount[]
  addClient: (client: Omit<ClientAccount, 'id' | 'totalVisitsYTD'>) => void
  updateClient: (id: string, client: Partial<ClientAccount>) => void
  visitPlans: VisitPlan[]
  assignVisitPlan: (plan: Omit<VisitPlan, 'id' | 'status'>) => void
  checkInVisit: (
    visitId: string,
    data: {
      lat: number
      lng: number
      isInsideFence: boolean
      distanceMeters: number
      photo: string
    }
  ) => void
  checkOutVisit: (
    visitId: string,
    data: {
      outcome: VisitOutcome
      orderValue?: number
      notes: string
      nextVisitDate?: string
    }
  ) => void
  addUnplannedVisit: (
    plan: Omit<VisitPlan, 'id' | 'status' | 'isUnplanned'>,
    checkInData: {
      lat: number
      lng: number
      isInsideFence: boolean
      distanceMeters: number
      photo: string
    }
  ) => void
  expenseSuggestion: ExpenseAllowanceSuggestion
  claimDistanceExpense: () => void
  isGpsActive: boolean
  setIsGpsActive: (active: boolean) => void
}

const INITIAL_CLIENTS: ClientAccount[] = [
  {
    id: 'CLI-001',
    name: 'Apollo Pharmacy Superstore',
    category: 'A - Key Account',
    city: 'Ahmedabad',
    address: 'Ground Floor, CG Road, Navrangpura',
    contactPerson: 'Dr. Ramesh Patel',
    contactPhone: '+91 98250 11223',
    latitude: 23.0338,
    longitude: 72.5614,
    geofenceRadiusMeters: 75,
    beatRoute: 'Ahmedabad CG Road Beat',
    totalVisitsYTD: 24,
  },
  {
    id: 'CLI-002',
    name: 'Reliance Freshmart Retail',
    category: 'A - Key Account',
    city: 'Ahmedabad',
    address: 'Iscon Mega Mall, SG Highway, Bodakdev',
    contactPerson: 'Sunil Mehta (Store Manager)',
    contactPhone: '+91 98790 44556',
    latitude: 23.0298,
    longitude: 72.5074,
    geofenceRadiusMeters: 100,
    beatRoute: 'SG Highway FMCG Beat',
    totalVisitsYTD: 19,
  },
  {
    id: 'CLI-003',
    name: 'Zydus Wellness Clinic & Depot',
    category: 'B - Growth',
    city: 'Ahmedabad',
    address: 'Drive-in Road, Near Sterling Hospital, Thaltej',
    contactPerson: 'Pooja Shah',
    contactPhone: '+91 94260 77889',
    latitude: 23.0512,
    longitude: 72.5289,
    geofenceRadiusMeters: 50,
    beatRoute: 'Drive-in Medical Beat',
    totalVisitsYTD: 14,
  },
  {
    id: 'CLI-004',
    name: 'D-Mart Wholesale Supercenter',
    category: 'A - Key Account',
    city: 'Ahmedabad',
    address: 'Science City Road, Sola',
    contactPerson: 'Mahesh Thakkar (Procurement)',
    contactPhone: '+91 99090 33221',
    latitude: 23.0782,
    longitude: 72.5165,
    geofenceRadiusMeters: 150,
    beatRoute: 'SG Highway FMCG Beat',
    totalVisitsYTD: 22,
  },
  {
    id: 'CLI-005',
    name: 'MedPlus Pharmacy & Health Hub',
    category: 'C - Standard',
    city: 'Ahmedabad',
    address: 'Ellisbridge Crossroad, Ashram Road',
    contactPerson: 'Kiran Desai',
    contactPhone: '+91 97120 55667',
    latitude: 23.0211,
    longitude: 72.5712,
    geofenceRadiusMeters: 50,
    beatRoute: 'Ahmedabad CG Road Beat',
    totalVisitsYTD: 9,
  },
  {
    id: 'CLI-006',
    name: 'Surat Diamond City Medicos',
    category: 'B - Growth',
    city: 'Surat',
    address: 'Ring Road, Surat Textile Market Plaza',
    contactPerson: 'Hasmukh Gada',
    contactPhone: '+91 98241 88990',
    latitude: 21.1959,
    longitude: 72.8302,
    geofenceRadiusMeters: 100,
    beatRoute: 'Surat Ring Road Beat',
    totalVisitsYTD: 12,
  },
]

const INITIAL_VISIT_PLANS: VisitPlan[] = [
  {
    id: 'VIS-101',
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-001',
    clientName: 'Apollo Pharmacy Superstore',
    clientAddress: 'Ground Floor, CG Road, Navrangpura',
    clientLat: 23.0338,
    clientLng: 72.5614,
    geofenceRadiusMeters: 75,
    scheduledDate: '2026-10-09',
    scheduledTimeSlot: '10:00 - 11:00 AM',
    beatRoute: 'Ahmedabad CG Road Beat',
    priority: 'High',
    purpose: 'Monthly FMCG stocking & promotional display setup',
    isUnplanned: false,
    status: 'Completed',
    checkInTime: '10:04 AM',
    checkInLat: 23.0339,
    checkInLng: 72.5615,
    checkInAccuracyMeters: 6,
    checkInPhoto: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
    isInsideGeofence: true,
    checkInDistanceMeters: 18,
    checkOutTime: '10:48 AM',
    visitDurationMinutes: 44,
    outcome: 'Order Placed',
    orderValue: 24500,
    notes: 'Booked festive season energy drink order. Shelf banner deployed at front counter.',
    nextVisitDate: '2026-10-23',
    distanceCoveredKm: 7.4,
  },
  {
    id: 'VIS-102',
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-002',
    clientName: 'Reliance Freshmart Retail',
    clientAddress: 'Iscon Mega Mall, SG Highway, Bodakdev',
    clientLat: 23.0298,
    clientLng: 72.5074,
    geofenceRadiusMeters: 100,
    scheduledDate: '2026-10-09',
    scheduledTimeSlot: '11:30 AM - 12:30 PM',
    beatRoute: 'SG Highway FMCG Beat',
    priority: 'High',
    purpose: 'Quarterly FMCG volume rebate discussion & payment collection',
    isUnplanned: false,
    status: 'In Progress',
    checkInTime: '11:32 AM',
    checkInLat: 23.0299,
    checkInLng: 72.5076,
    checkInAccuracyMeters: 8,
    checkInPhoto: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
    isInsideGeofence: true,
    checkInDistanceMeters: 32,
    distanceCoveredKm: 8.9,
  },
  {
    id: 'VIS-103',
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-003',
    clientName: 'Zydus Wellness Clinic & Depot',
    clientAddress: 'Drive-in Road, Near Sterling Hospital, Thaltej',
    clientLat: 23.0512,
    clientLng: 72.5289,
    geofenceRadiusMeters: 50,
    scheduledDate: '2026-10-09',
    scheduledTimeSlot: '02:00 - 03:00 PM',
    beatRoute: 'Drive-in Medical Beat',
    priority: 'Medium',
    purpose: 'Product sampling for new nutrition drink line',
    isUnplanned: false,
    status: 'Planned',
  },
  {
    id: 'VIS-104',
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-004',
    clientName: 'D-Mart Wholesale Supercenter',
    clientAddress: 'Science City Road, Sola',
    clientLat: 23.0782,
    clientLng: 72.5165,
    geofenceRadiusMeters: 150,
    scheduledDate: '2026-10-09',
    scheduledTimeSlot: '04:00 - 05:00 PM',
    beatRoute: 'SG Highway FMCG Beat',
    priority: 'High',
    purpose: 'Stock replenishment & invoice audit',
    isUnplanned: false,
    status: 'Planned',
  },
  {
    id: 'VIS-105',
    employeeId: 'EMP-019',
    employeeName: 'Jayesh Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-006',
    clientName: 'Surat Diamond City Medicos',
    clientAddress: 'Ring Road, Surat Textile Market Plaza',
    clientLat: 21.1959,
    clientLng: 72.8302,
    geofenceRadiusMeters: 100,
    scheduledDate: '2026-10-09',
    scheduledTimeSlot: '11:00 AM - 12:00 PM',
    beatRoute: 'Surat Ring Road Beat',
    priority: 'High',
    purpose: 'Key distributor agreement signature',
    isUnplanned: false,
    status: 'Missed',
    notes: 'Delayed due to regional supply depot vehicle breakdown. Alert dispatched to manager.',
  },
]

const INITIAL_EXPENSE_SUGGESTION: ExpenseAllowanceSuggestion = {
  totalDistanceKm: 34.2,
  ratePerKm: 4.5,
  totalAllowance: 153.9,
  isClaimed: false,
}

const VisitContext = createContext<VisitContextType | undefined>(undefined)

export const VisitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS)
  const [visitPlans, setVisitPlans] = useState<VisitPlan[]>(INITIAL_VISIT_PLANS)
  const [expenseSuggestion, setExpenseSuggestion] = useState<ExpenseAllowanceSuggestion>(INITIAL_EXPENSE_SUGGESTION)
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false)

  const addClient = (newClient: Omit<ClientAccount, 'id' | 'totalVisitsYTD'>) => {
    const id = `CLI-${(clients.length + 1).toString().padStart(3, '0')}`
    setClients((prev) => [{ ...newClient, id, totalVisitsYTD: 0 }, ...prev])
  }

  const updateClient = (id: string, updated: Partial<ClientAccount>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
  }

  const assignVisitPlan = (newPlan: Omit<VisitPlan, 'id' | 'status'>) => {
    const id = `VIS-${Date.now().toString().slice(-4)}`
    setVisitPlans((prev) => [{ ...newPlan, id, status: 'Planned' }, ...prev])
  }

  const checkInVisit = (
    visitId: string,
    data: {
      lat: number
      lng: number
      isInsideFence: boolean
      distanceMeters: number
      photo: string
    }
  ) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setVisitPlans((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v
        return {
          ...v,
          status: 'In Progress',
          checkInTime: timeStr,
          checkInLat: data.lat,
          checkInLng: data.lng,
          checkInAccuracyMeters: 5,
          isInsideGeofence: data.isInsideFence,
          checkInDistanceMeters: data.distanceMeters,
          checkInPhoto: data.photo,
        }
      })
    )
  }

  const checkOutVisit = (
    visitId: string,
    data: {
      outcome: VisitOutcome
      orderValue?: number
      notes: string
      nextVisitDate?: string
    }
  ) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setVisitPlans((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v
        return {
          ...v,
          status: 'Completed',
          checkOutTime: timeStr,
          visitDurationMinutes: 38,
          outcome: data.outcome,
          orderValue: data.orderValue,
          notes: data.notes,
          nextVisitDate: data.nextVisitDate,
          distanceCoveredKm: v.distanceCoveredKm || 8.5,
        }
      })
    )

    // Update client total visit count
    const targetPlan = visitPlans.find((v) => v.id === visitId)
    if (targetPlan) {
      setClients((prev) =>
        prev.map((c) => (c.id === targetPlan.clientId ? { ...c, totalVisitsYTD: c.totalVisitsYTD + 1 } : c))
      )
    }
  }

  const addUnplannedVisit = (
    plan: Omit<VisitPlan, 'id' | 'status' | 'isUnplanned'>,
    checkInData: {
      lat: number
      lng: number
      isInsideFence: boolean
      distanceMeters: number
      photo: string
    }
  ) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const id = `VIS-UNP-${Date.now().toString().slice(-4)}`

    const newVisit: VisitPlan = {
      ...plan,
      id,
      isUnplanned: true,
      status: 'In Progress',
      checkInTime: timeStr,
      checkInLat: checkInData.lat,
      checkInLng: checkInData.lng,
      checkInAccuracyMeters: 7,
      isInsideGeofence: checkInData.isInsideFence,
      checkInDistanceMeters: checkInData.distanceMeters,
      checkInPhoto: checkInData.photo,
    }

    setVisitPlans((prev) => [newVisit, ...prev])
  }

  const claimDistanceExpense = () => {
    setExpenseSuggestion((prev) => ({
      ...prev,
      isClaimed: true,
      claimedAt: new Date().toLocaleString(),
    }))
  }

  return (
    <VisitContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        visitPlans,
        assignVisitPlan,
        checkInVisit,
        checkOutVisit,
        addUnplannedVisit,
        expenseSuggestion,
        claimDistanceExpense,
        isGpsActive,
        setIsGpsActive,
      }}
    >
      {children}
    </VisitContext.Provider>
  )
}

export const useVisit = () => {
  const context = useContext(VisitContext)
  if (!context) {
    throw new Error('useVisit must be used within a VisitProvider')
  }
  return context
}
