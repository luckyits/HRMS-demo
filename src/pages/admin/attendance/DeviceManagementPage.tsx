import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { BiometricDevice } from '@/mock/adminAttendance'
import {
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Power,
  Server,
  Building,
  CheckCircle2,
  HardDrive,
  Activity,
  Layers,
  Search,
} from 'lucide-react'

export const DeviceManagementPage: React.FC = () => {
  const { devices, syncDevice, rebootDevice } = useAdminAttendance()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredDevices = devices.filter((d) => {
    const matchesBranch = selectedBranch === 'All' || d.branch === selectedBranch
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ipAddress.includes(searchQuery)
    return matchesBranch && matchesSearch
  })

  const onlineCount = devices.filter((d) => d.status === 'Online').length
  const offlineCount = devices.filter((d) => d.status === 'Offline').length
  const syncingCount = devices.filter((d) => d.status === 'Syncing').length
  const totalPunchesToday = devices.reduce((sum, d) => sum + d.totalPunchesToday, 0)

  const handleSync = (id: string, name: string) => {
    syncDevice(id)
    setToastMessage(`Pushed immediate sync command to ${name}.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleReboot = (id: string, name: string) => {
    rebootDevice(id)
    setToastMessage(`Soft reboot signal transmitted to ${name}.`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Biometric & Kiosk Device Fleet"
        subtitle="Hardware telemetry, turnstile face terminals, iPad attendance kiosks, and real-time punch synchronization"
        action={
          <button
            onClick={() => {
              devices.forEach((d) => syncDevice(d.id))
              setToastMessage('Triggered fleet-wide punch synchronization.')
              setTimeout(() => setToastMessage(null), 3000)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync All Terminals</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fleet KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Online & Active
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {onlineCount} Terminals
          </div>
          <span className="text-[11px] text-muted-foreground">Streaming punches</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Syncing Queue
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            {syncingCount} Nodes
          </div>
          <span className="text-[11px] text-muted-foreground">Biometric push active</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Offline Devices
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <WifiOff className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {offlineCount} Nodes
          </div>
          <span className="text-[11px] text-muted-foreground">Needs IT inspection</span>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Hardware Punches
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-primary mt-2">{totalPunchesToday}</div>
          <span className="text-[11px] text-muted-foreground">Synced today</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search terminal model, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5"
          >
            <option value="All">All Branches</option>
            <option value="Bengaluru HQ">Bengaluru HQ</option>
            <option value="Mumbai Hub">Mumbai Hub</option>
            <option value="Pune Plant">Pune Plant</option>
          </select>
        </div>
      </div>

      {/* Devices Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const isOnline = device.status === 'Online'
          const isSyncing = device.status === 'Syncing'

          return (
            <div
              key={device.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isOnline
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : isSyncing
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{device.name}</h4>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        SN: {device.serialNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isOnline
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isSyncing
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? 'bg-emerald-500 animate-pulse' : isSyncing ? 'bg-blue-500 animate-spin' : 'bg-rose-500'
                      }`}
                    />
                    {device.status}
                  </span>
                </div>

                {/* Specs */}
                <div className="mt-4 p-3 bg-muted/20 border border-border/50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Device Model:</span>
                    <span className="font-semibold text-foreground">{device.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="font-mono text-foreground">{device.ipAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Branch & Zone:</span>
                    <span className="font-medium text-foreground">
                      {device.branch} &bull; {device.locationDescription}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Firmware:</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {device.firmwareVersion}
                    </span>
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-card border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground block">Punches Today</span>
                    <span className="text-base font-bold text-foreground">
                      {device.totalPunchesToday}
                    </span>
                  </div>

                  <div className="p-2.5 bg-card border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                      <HardDrive className="w-3 h-3" /> Storage Buffer
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {device.storageUsedPercent}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Last Sync: {device.lastSyncAt}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    TLS 1.3 Secure
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  onClick={() => handleReboot(device.id, device.name)}
                  className="px-3 py-1.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  title="Remote Soft Reboot"
                >
                  <Power className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reboot</span>
                </button>

                <button
                  onClick={() => handleSync(device.id, device.name)}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
