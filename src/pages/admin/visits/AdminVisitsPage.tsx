import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useVisit,
  type ClientAccount,
  type VisitPlan,
} from '@/context/VisitContext'
import {
  MapPin,
  Navigation,
  Building,
  Calendar,
  Users,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Crosshair,
  Compass,
  AlertTriangle,
  Phone,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  Target,
} from 'lucide-react'

export const AdminVisitsPage: React.FC = () => {
  const { clients, addClient, visitPlans, assignVisitPlan } = useVisit()

  const [activeTab, setActiveTab] = useState<'clients' | 'assignment' | 'map' | 'reports'>('clients')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Client Master search & filter
  const [clientSearch, setClientSearch] = useState('')
  const [clientCategoryFilter, setClientCategoryFilter] = useState<string>('All')
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)

  // New Client Form State
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    category: 'A - Key Account' as ClientAccount['category'],
    city: 'Ahmedabad',
    address: '',
    contactPerson: '',
    contactPhone: '',
    latitude: 23.0338,
    longitude: 72.5614,
    geofenceRadiusMeters: 100,
    beatRoute: 'Ahmedabad CG Road Beat',
  })

  // Plan Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clientId: 'CLI-001',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: '11:00 AM - 12:00 PM',
    priority: 'High' as 'High' | 'Medium' | 'Low',
    purpose: 'Quarterly stock review and promotional campaign audit',
  })

  // Map Filter
  const [mapEmployeeFilter, setMapEmployeeFilter] = useState<string>('All')
  const [selectedMapPin, setSelectedMapPin] = useState<VisitPlan | null>(null)

  // Report Search & Filter
  const [reportSearch, setReportSearch] = useState('')
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('All')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientForm.name.trim() || !newClientForm.address.trim()) {
      showToast('Please fill in client outlet name and physical address.')
      return
    }

    addClient(newClientForm)
    setIsAddClientModalOpen(false)
    setNewClientForm({
      name: '',
      category: 'A - Key Account',
      city: 'Ahmedabad',
      address: '',
      contactPerson: '',
      contactPhone: '',
      latitude: 23.0338,
      longitude: 72.5614,
      geofenceRadiusMeters: 100,
      beatRoute: 'Ahmedabad CG Road Beat',
    })
    showToast('New client account added with custom geo-fence boundary.')
  }

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault()
    const targetClient = clients.find((c) => c.id === assignmentForm.clientId)
    if (!targetClient) return

    assignVisitPlan({
      employeeId: assignmentForm.employeeId,
      employeeName: assignmentForm.employeeName,
      employeeAvatar: assignmentForm.employeeAvatar,
      clientId: targetClient.id,
      clientName: targetClient.name,
      clientAddress: targetClient.address,
      clientLat: targetClient.latitude,
      clientLng: targetClient.longitude,
      geofenceRadiusMeters: targetClient.geofenceRadiusMeters,
      scheduledDate: assignmentForm.scheduledDate,
      scheduledTimeSlot: assignmentForm.scheduledTimeSlot,
      beatRoute: targetClient.beatRoute,
      priority: assignmentForm.priority,
      purpose: assignmentForm.purpose,
      isUnplanned: false,
    })

    showToast(`Assigned beat schedule to ${assignmentForm.employeeName} for ${targetClient.name}.`)
  }

  const filteredClients = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.beatRoute.toLowerCase().includes(clientSearch.toLowerCase())
    const matchCategory =
      clientCategoryFilter === 'All' || c.category.startsWith(clientCategoryFilter)
    return matchSearch && matchCategory
  })

  const filteredMapPlans = visitPlans.filter((p) => {
    if (mapEmployeeFilter === 'All') return true
    return p.employeeName === mapEmployeeFilter
  })

  const filteredReportPlans = visitPlans.filter((p) => {
    const matchSearch =
      p.employeeName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      p.clientName.toLowerCase().includes(reportSearch.toLowerCase()) ||
      p.purpose.toLowerCase().includes(reportSearch.toLowerCase())
    const matchStatus = reportStatusFilter === 'All' || p.status === reportStatusFilter
    return matchSearch && matchStatus
  })

  // Computed metrics
  const completedCount = visitPlans.filter((p) => p.status === 'Completed').length
  const missedCount = visitPlans.filter((p) => p.status === 'Missed').length
  const inProgressCount = visitPlans.filter((p) => p.status === 'In Progress').length
  const totalDistanceKm = visitPlans
    .filter((p) => p.distanceCoveredKm)
    .reduce((sum, p) => sum + (p.distanceCoveredKm || 0), 0)

  return (
    <FeatureGate
      feature="VISIT"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs">
          <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold">Feature Gated: Client Visit & Field Tracking</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            This module requires the <strong>VISIT</strong> feature entitlement to be active for your company template.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Field Sales & Client Visit Administration"
          subtitle="Manage client accounts, geo-fence boundaries, beat route assignments, live GPS telemetry, and field analytics"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                FeatureGate Active: VISIT • GPS Geo-Fence Telemetry
              </span>
            </div>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Client Master & Geo-Fence</span>
          </button>

          <button
            onClick={() => setActiveTab('assignment')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assignment'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Visit Plan Assignment</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'map'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Live Team Telemetry Map</span>
            {inProgressCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-extrabold animate-pulse">
                {inProgressCount} Live
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Visit Reports & Metrics</span>
          </button>
        </div>

        {/* TAB 1: CLIENT MASTER */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by client name, address, contact or beat..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['All', 'A', 'B', 'C'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setClientCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      clientCategoryFilter === cat
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat === 'All' ? 'All Tiers' : `Tier ${cat}`}
                  </button>
                ))}

                <button
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm ml-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Client Account</span>
                </button>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Account & ID</th>
                      <th className="px-4 py-3">Tier Category</th>
                      <th className="px-4 py-3">Address & City</th>
                      <th className="px-4 py-3">Contact Person</th>
                      <th className="px-4 py-3">Assigned Beat Route</th>
                      <th className="px-4 py-3">Geo-Fence Check-In Radius</th>
                      <th className="px-4 py-3">Visits YTD</th>
                      <th className="px-4 py-3 text-right">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground block">{client.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{client.id}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              client.category.startsWith('A')
                                ? 'bg-purple-500/10 text-purple-600'
                                : client.category.startsWith('B')
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {client.category}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 max-w-[220px]">
                          <span className="truncate block font-medium text-foreground">{client.address}</span>
                          <span className="text-[11px] text-muted-foreground">{client.city}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-medium text-foreground block">{client.contactPerson}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.contactPhone}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-medium text-foreground">{client.beatRoute}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                              {client.geofenceRadiusMeters} meters
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground">{client.totalVisitsYTD} visits</span>
                        </td>

                        <td className="px-4 py-3.5 text-right font-mono text-[11px] text-muted-foreground">
                          {client.latitude.toFixed(4)}, {client.longitude.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISIT PLAN ASSIGNMENT */}
        {activeTab === 'assignment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignment Form */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Assign Beat & Scheduled Visit
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allocate client outlet visits to field executives with priorities and objectives.
                </p>
              </div>

              <form onSubmit={handleAssignPlan} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Field Sales Representative</label>
                  <select
                    value={assignmentForm.employeeName}
                    onChange={(e) => {
                      const name = e.target.value
                      const isHardik = name === 'Hardik Trivedi'
                      setAssignmentForm({
                        ...assignmentForm,
                        employeeName: name,
                        employeeId: isHardik ? 'EMP-018' : 'EMP-019',
                        employeeAvatar: isHardik
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
                      })
                    }}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl font-medium"
                  >
                    <option value="Hardik Trivedi">Hardik Trivedi (Senior Area Sales Exec)</option>
                    <option value="Jayesh Patel">Jayesh Patel (Retail Route Sales Officer)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Client Account Outlet</label>
                  <select
                    value={assignmentForm.clientId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl font-medium"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city} - {c.geofenceRadiusMeters}m fence)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={assignmentForm.scheduledDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, scheduledDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Time Slot</label>
                    <select
                      value={assignmentForm.scheduledTimeSlot}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, scheduledTimeSlot: e.target.value })}
                      className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                    >
                      <option value="09:00 - 10:00 AM">09:00 - 10:00 AM</option>
                      <option value="10:00 - 11:00 AM">10:00 - 11:00 AM</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                      <option value="02:00 - 03:00 PM">02:00 - 03:00 PM</option>
                      <option value="04:00 - 05:00 PM">04:00 - 05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Visit Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['High', 'Medium', 'Low'] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setAssignmentForm({ ...assignmentForm, priority: p })}
                        className={`py-1.5 rounded-lg border text-center text-xs font-bold transition ${
                          assignmentForm.priority === p
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-card border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Visit Objective / Instructions</label>
                  <textarea
                    rows={3}
                    required
                    value={assignmentForm.purpose}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl resize-none"
                    placeholder="Enter targets, product sampling SKU, or payment collection notes..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:opacity-90 shadow-sm"
                >
                  Confirm & Dispatch Beat Schedule
                </button>
              </form>
            </div>

            {/* Assignments Ledger */}
            <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">Active Visit Allocations</h4>
                  <p className="text-xs text-muted-foreground">Current beat queue across field sales team</p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {visitPlans.length} Total Visits
                </span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Sales Rep</th>
                      <th className="px-4 py-3">Client Outlet</th>
                      <th className="px-4 py-3">Slot & Priority</th>
                      <th className="px-4 py-3">Purpose</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visitPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={plan.employeeAvatar}
                              alt={plan.employeeName}
                              className="w-7 h-7 rounded-full object-cover border border-border"
                            />
                            <div>
                              <span className="font-bold text-foreground block">{plan.employeeName}</span>
                              <span className="text-[10px] text-muted-foreground">{plan.employeeId}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{plan.clientName}</span>
                          <span className="text-[10px] text-muted-foreground">{plan.beatRoute}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{plan.scheduledTimeSlot}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              plan.priority === 'High'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }`}
                          >
                            {plan.priority} Priority
                          </span>
                        </td>

                        <td className="px-4 py-3 max-w-[200px]">
                          <span className="truncate block text-foreground" title={plan.purpose}>
                            {plan.purpose}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              plan.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : plan.status === 'In Progress'
                                ? 'bg-sky-500/10 text-sky-600'
                                : plan.status === 'Missed'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {plan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE TEAM MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3">
                <Compass className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Territory Beat Map & Telemetry</h4>
                  <p className="text-xs text-muted-foreground">Real-time GPS coordinate trace and route vectors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground">Filter by Sales Rep:</span>
                <select
                  value={mapEmployeeFilter}
                  onChange={(e) => setMapEmployeeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-background border border-input rounded-xl font-bold"
                >
                  <option value="All">All Field Executives</option>
                  <option value="Hardik Trivedi">Hardik Trivedi (Ahmedabad Territory)</option>
                  <option value="Jayesh Patel">Jayesh Patel (Surat Territory)</option>
                </select>
              </div>
            </div>

            {/* Interactive Simulated Vector Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Canvas Visualizer */}
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between min-h-[440px] relative overflow-hidden bg-slate-900 text-white">
                {/* Simulated Street Grid Lines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                      backgroundSize: '32px 32px',
                    }}
                  />
                </div>

                {/* Map Header Overlay */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-emerald-400 font-bold">GPS TELEMETRY STREAM LIVE</span>
                    <span className="text-white/40">|</span>
                    <span className="text-white/80">Territory: Western Region</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                    <span className="text-white/60">Pins Tracked:</span>
                    <span className="font-bold text-white">{filteredMapPlans.length}</span>
                  </div>
                </div>

                {/* Simulated Map Nodes & Route Vectors */}
                <div className="relative z-10 my-8 py-10 px-6">
                  {/* Visual SVG Connecting Vector Route */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 80 180 Q 240 70 380 130 T 680 190"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Client & Rep Pins Layout */}
                  <div className="grid grid-cols-4 gap-4 relative">
                    {filteredMapPlans.map((plan, idx) => {
                      const isCompleted = plan.status === 'Completed'
                      const isInProgress = plan.status === 'In Progress'
                      const isMissed = plan.status === 'Missed'

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedMapPin(plan)}
                          className={`cursor-pointer p-3 rounded-2xl backdrop-blur-md border transition-all transform hover:-translate-y-1 hover:shadow-lg ${
                            isInProgress
                              ? 'bg-sky-950/80 border-sky-400 ring-2 ring-sky-400/50 shadow-sky-500/20'
                              : isCompleted
                              ? 'bg-emerald-950/60 border-emerald-500/60'
                              : isMissed
                              ? 'bg-rose-950/60 border-rose-500/60'
                              : 'bg-black/60 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                isInProgress
                                  ? 'bg-sky-400 text-black animate-pulse font-black'
                                  : isCompleted
                                  ? 'bg-emerald-500 text-black font-black'
                                  : isMissed
                                  ? 'bg-rose-500 text-white font-black'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              {plan.status}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs truncate text-white" title={plan.clientName}>
                            {plan.clientName}
                          </h5>
                          <p className="text-[10px] text-white/60 truncate mt-0.5">{plan.scheduledTimeSlot}</p>

                          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                            <span className="text-white/60">Fence: {plan.geofenceRadiusMeters}m</span>
                            <span className="text-sky-300 font-mono">
                              {isInProgress ? '📍 INSIDE' : isCompleted ? '✓ CHECKED' : 'WAITING'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Map Footer Legend */}
                <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs">
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" /> In Progress (Active Check-in)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Scheduled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Missed
                    </span>
                  </div>

                  <span className="text-[11px] text-white/60 font-mono">Simulated GPS Polling (every 30s)</span>
                </div>
              </div>

              {/* Pin Detail Inspector Panel */}
              <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
                <div className="border-b border-border pb-3">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-primary" />
                    GPS Telemetry & Pin Inspector
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any node on the map to inspect live verification data.
                  </p>
                </div>

                {selectedMapPin ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-1">
                      <span className="text-[10px] font-mono text-primary uppercase font-bold">
                        {selectedMapPin.id}
                      </span>
                      <h5 className="font-bold text-sm text-foreground">{selectedMapPin.clientName}</h5>
                      <p className="text-[11px] text-muted-foreground">{selectedMapPin.clientAddress}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Assigned Sales Rep:</span>
                        <span className="font-bold text-foreground">{selectedMapPin.employeeName}</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Geo-Fence Check-In Radius:</span>
                        <span className="font-bold text-foreground">{selectedMapPin.geofenceRadiusMeters} meters</span>
                      </div>

                      <div className="flex items-center justify-between py-1 border-b border-border">
                        <span className="text-muted-foreground">Check-in Status:</span>
                        <span className="font-bold text-sky-600">{selectedMapPin.status}</span>
                      </div>

                      {selectedMapPin.checkInTime && (
                        <>
                          <div className="flex items-center justify-between py-1 border-b border-border">
                            <span className="text-muted-foreground">Check-in Timestamp:</span>
                            <span className="font-bold text-foreground">{selectedMapPin.checkInTime}</span>
                          </div>

                          <div className="flex items-center justify-between py-1 border-b border-border">
                            <span className="text-muted-foreground">Distance to Center:</span>
                            <span className="font-bold text-emerald-600">
                              {selectedMapPin.checkInDistanceMeters}m (Within Fence)
                            </span>
                          </div>
                        </>
                      )}

                      {selectedMapPin.visitDurationMinutes && (
                        <div className="flex items-center justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">Meeting Duration:</span>
                          <span className="font-bold text-foreground">
                            {selectedMapPin.visitDurationMinutes} minutes
                          </span>
                        </div>
                      )}

                      {selectedMapPin.outcome && (
                        <div className="flex items-center justify-between py-1 border-b border-border">
                          <span className="text-muted-foreground">Reported Outcome:</span>
                          <span className="font-bold text-emerald-600">{selectedMapPin.outcome}</span>
                        </div>
                      )}
                    </div>

                    {selectedMapPin.checkInPhoto && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Check-in Storefront Photo:</span>
                        <img
                          src={selectedMapPin.checkInPhoto}
                          alt="Storefront"
                          className="w-full h-32 object-cover rounded-xl border border-border"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    Select any map waypoint pin to inspect live telemetry coordinates, storefront photo, and fence validity.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VISIT REPORTS & METRICS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Completed Client Visits
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">{completedCount}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">GPS verified check-ins</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Missed / Skipped Stops
                </span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">{missedCount}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">Alerts dispatched to managers</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Average Time per Meeting
                </span>
                <span className="text-2xl font-black text-foreground mt-1 block">41 mins</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">Target: 30-45 mins</span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Travel Distance
                </span>
                <span className="text-2xl font-black text-primary mt-1 block">{totalDistanceKm.toFixed(1)} km</span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">Eligible for travel allowance</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search reports by rep, client name, or notes..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['All', 'Completed', 'In Progress', 'Planned', 'Missed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      reportStatusFilter === st
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Rep & ID</th>
                      <th className="px-4 py-3">Client Outlet</th>
                      <th className="px-4 py-3">Scheduled Slot</th>
                      <th className="px-4 py-3">Check-In / Out</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Geo-Fence Match</th>
                      <th className="px-4 py-3">Outcome & Order Value</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReportPlans.map((rep) => (
                      <tr key={rep.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground block">{rep.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground">{rep.employeeId}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground block">{rep.clientName}</span>
                          <span className="text-[10px] text-muted-foreground">{rep.beatRoute}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-medium text-foreground block">{rep.scheduledDate}</span>
                          <span className="text-[11px] text-muted-foreground">{rep.scheduledTimeSlot}</span>
                        </td>

                        <td className="px-4 py-3.5">
                          {rep.checkInTime ? (
                            <div>
                              <span className="font-mono text-foreground font-bold">{rep.checkInTime}</span>
                              {rep.checkOutTime && (
                                <span className="font-mono text-muted-foreground block text-[10px]">
                                  out {rep.checkOutTime}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {rep.visitDurationMinutes ? (
                            <span className="font-bold text-foreground">{rep.visitDurationMinutes} mins</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {rep.isInsideGeofence !== undefined ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                              Inside Fence ({rep.checkInDistanceMeters}m / {rep.geofenceRadiusMeters}m)
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Pending Check-in</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {rep.outcome ? (
                            <div>
                              <span className="font-bold text-foreground block">{rep.outcome}</span>
                              {rep.orderValue && (
                                <span className="text-emerald-600 font-bold text-[11px]">
                                  ₹{rep.orderValue.toLocaleString()} booked
                                </span>
                              )}
                            </div>
                          ) : rep.status === 'Missed' ? (
                            <span className="text-rose-600 font-medium text-[11px]">{rep.notes}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              rep.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : rep.status === 'In Progress'
                                ? 'bg-sky-500/10 text-sky-600'
                                : rep.status === 'Missed'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {rep.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD CLIENT ACCOUNT MODAL */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Add New Client Outlet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Client Store / Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalby Hospital Medical Store"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Tier Category</label>
                  <select
                    value={newClientForm.category}
                    onChange={(e) => setNewClientForm({ ...newClientForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  >
                    <option value="A - Key Account">A - Key Account</option>
                    <option value="B - Growth">B - Growth</option>
                    <option value="C - Standard">C - Standard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Territory City</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.city}
                    onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Full Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="Shop No, Landmark, Road name..."
                  value={newClientForm.address}
                  onChange={(e) => setNewClientForm({ ...newClientForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Joshi"
                    value={newClientForm.contactPerson}
                    onChange={(e) => setNewClientForm({ ...newClientForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98..."
                    value={newClientForm.contactPhone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              {/* Geo-fence Check-in Radius Setting per client */}
              <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    Geo-Fence Check-In Radius (Meters)
                  </label>
                  <span className="font-mono font-bold text-primary text-xs">
                    {newClientForm.geofenceRadiusMeters} meters
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The field executive must be physically within this perimeter circle to validate a check-in.
                </p>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[50, 75, 100, 150, 200].map((rad) => (
                    <button
                      type="button"
                      key={rad}
                      onClick={() => setNewClientForm({ ...newClientForm, geofenceRadiusMeters: rad })}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition ${
                        newClientForm.geofenceRadiusMeters === rad
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {rad}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Assigned Beat Route</label>
                <select
                  value={newClientForm.beatRoute}
                  onChange={(e) => setNewClientForm({ ...newClientForm, beatRoute: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                >
                  <option value="Ahmedabad CG Road Beat">Ahmedabad CG Road Beat</option>
                  <option value="SG Highway FMCG Beat">SG Highway FMCG Beat</option>
                  <option value="Drive-in Medical Beat">Drive-in Medical Beat</option>
                  <option value="Surat Ring Road Beat">Surat Ring Road Beat</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  Save Client Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
