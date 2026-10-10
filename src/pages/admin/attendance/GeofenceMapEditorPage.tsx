import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { GeofenceZone } from '@/mock/adminAttendance'
import {
  MapPin,
  CircleDot,
  Hexagon,
  Sliders,
  Building,
  Save,
  CheckCircle2,
  Trash2,
  Users,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'

export const GeofenceMapEditorPage: React.FC = () => {
  const { geofences, addGeofence, updateGeofence, deleteGeofence } = useAdminAttendance()

  const [selectedFenceId, setSelectedFenceId] = useState<string>(geofences[0]?.id || '')
  const selectedFence = geofences.find((g) => g.id === selectedFenceId) || geofences[0]

  // Editor form state
  const [name, setName] = useState(selectedFence?.name || '')
  const [branchName, setBranchName] = useState(selectedFence?.branchName || 'Bengaluru HQ')
  const [shapeType, setShapeType] = useState<'circle' | 'polygon'>(selectedFence?.shapeType || 'circle')
  const [radiusMeters, setRadiusMeters] = useState(selectedFence?.radiusMeters || 150)
  const [lat, setLat] = useState(selectedFence?.center.lat || 12.9716)
  const [lng, setLng] = useState(selectedFence?.center.lng || 77.5946)
  const [tolerance, setTolerance] = useState(selectedFence?.allowedToleranceMeters || 25)
  const [address, setAddress] = useState(selectedFence?.address || '')
  const [zoomLevel, setZoomLevel] = useState(16)
  const [saveToast, setSaveToast] = useState(false)

  // Sync state when fence changes
  const handleSelectFence = (fence: GeofenceZone) => {
    setSelectedFenceId(fence.id)
    setName(fence.name)
    setBranchName(fence.branchName)
    setShapeType(fence.shapeType)
    setRadiusMeters(fence.radiusMeters)
    setLat(fence.center.lat)
    setLng(fence.center.lng)
    setTolerance(fence.allowedToleranceMeters)
    setAddress(fence.address)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFence) return

    updateGeofence(selectedFence.id, {
      name,
      branchName,
      shapeType,
      radiusMeters,
      center: { lat, lng },
      allowedToleranceMeters: tolerance,
      address,
    })

    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 3000)
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Geo-fence Boundary Editor"
        subtitle="Establish circular and polygon perimeter fences with radius calibration and branch assignment"
        action={
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Boundary Changes</span>
          </button>
        }
      />

      {saveToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Geofence parameters successfully updated in central registry!</span>
        </div>
      )}

      {/* Main Map Visual Canvas + Configuration Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{name}</span>
              <span className="text-xs text-muted-foreground font-mono">
                ({lat.toFixed(4)}, {lng.toFixed(4)})
              </span>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(19, z + 1))}
                className="p-1 hover:bg-card rounded text-muted-foreground hover:text-foreground"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
                className="p-1 hover:bg-card rounded text-muted-foreground hover:text-foreground"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-1.5 text-muted-foreground">
                {zoomLevel}x
              </span>
            </div>
          </div>

          {/* Map Surface Simulation */}
          <div className="relative flex-1 min-h-[480px] bg-slate-950 overflow-hidden select-none flex items-center justify-center">
            {/* High-tech vector grid */}
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #0ea5e9 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                backgroundSize: '24px 24px, 72px 72px, 72px 72px',
              }}
            />

            {/* Compass / Location HUD */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-slate-300 text-xs shadow-xl z-10 space-y-1">
              <div className="font-bold text-sky-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> GPS Target Coordinates
              </div>
              <p className="font-mono text-[11px] text-slate-400">
                Lat: {lat} &bull; Lng: {lng}
              </p>
              <p className="text-[10px] text-slate-500">
                Coverage Radius: {radiusMeters}m (+/- {tolerance}m tolerance)
              </p>
            </div>

            {/* The Geofence Shape Rendered dynamically */}
            {shapeType === 'circle' ? (
              <div className="relative flex items-center justify-center">
                {/* Outer GPS Tolerance Ring */}
                <div
                  style={{
                    width: `${Math.min(380, radiusMeters * 1.5 + tolerance * 2)}px`,
                    height: `${Math.min(380, radiusMeters * 1.5 + tolerance * 2)}px`,
                  }}
                  className="rounded-full border-2 border-dashed border-sky-400/30 animate-pulse pointer-events-none absolute"
                />

                {/* Primary Circle Geofence */}
                <div
                  style={{
                    width: `${Math.min(340, radiusMeters * 1.5)}px`,
                    height: `${Math.min(340, radiusMeters * 1.5)}px`,
                  }}
                  className="rounded-full bg-sky-500/15 border-2 border-sky-400 flex items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.25)] transition-all duration-300"
                >
                  {/* Center Branch Anchor Pin */}
                  <div className="w-9 h-9 rounded-full bg-sky-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
                    <Building className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ) : (
              /* Polygon Geofence Render */
              <div className="relative flex items-center justify-center">
                <svg width="340" height="340" viewBox="0 0 340 340" className="overflow-visible">
                  <polygon
                    points="70,50 270,70 300,260 90,290"
                    fill="rgba(14, 165, 233, 0.15)"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="shadow-xl"
                  />
                  {/* Polygon Vertices */}
                  <circle cx="70" cy="50" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="270" cy="70" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="300" cy="260" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="90" cy="290" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                </svg>
                <div className="absolute w-9 h-9 rounded-full bg-sky-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
                  <Building className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Bottom Map Info */}
            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Boundary Locked & Active</span>
            </div>
          </div>
        </div>

        {/* Configuration & Sliders Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Geofence Selector List */}
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Select Branch Perimeter
            </h4>
            <div className="space-y-2">
              {geofences.map((fence) => {
                const isSelected = fence.id === selectedFenceId
                return (
                  <button
                    key={fence.id}
                    onClick={() => handleSelectFence(fence)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary ring-1 ring-primary'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-foreground">{fence.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3" /> {fence.branchName} &bull; {fence.radiusMeters}m
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-card border border-border">
                      {fence.assignedEmployeeCount} staff
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Calibration Sliders */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> Boundary Calibration
            </h4>

            {/* Shape toggle */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Perimeter Geometry:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShapeType('circle')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    shapeType === 'circle'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <CircleDot className="w-4 h-4" />
                  <span>Circle (Radius)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShapeType('polygon')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    shapeType === 'polygon'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <Hexagon className="w-4 h-4" />
                  <span>Custom Polygon</span>
                </button>
              </div>
            </div>

            {/* Radius Slider */}
            {shapeType === 'circle' && (
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Enclosure Radius:</span>
                  <span className="text-primary font-bold">{radiusMeters} Meters</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={radiusMeters}
                  onChange={(e) => setRadiusMeters(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>50m (Room/Gate)</span>
                  <span>500m</span>
                  <span>1000m (Campus)</span>
                </div>
              </div>
            )}

            {/* Tolerance Margin */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>GPS Drift Tolerance:</span>
                <span className="text-amber-600 font-bold">{tolerance} Meters</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Prevents false punch rejections caused by mobile satellite drift indoors.
              </p>
            </div>

            {/* GPS Latitude / Longitude */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Postal Campus Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2 bg-muted/40 border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
