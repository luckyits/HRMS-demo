import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useLifecycle, AssetRecord } from '@/context/LifecycleContext'
import {
  Laptop,
  Monitor,
  Smartphone,
  Key,
  Shield,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Tag,
  Hash,
  Layers,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react'

export const AdminAssetManagementPage: React.FC = () => {
  const { assets, issueAsset, returnAsset, addAsset } = useLifecycle()

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Modals
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false)
  const [selectedAssetForIssue, setSelectedAssetForIssue] = useState<AssetRecord | null>(null)
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<AssetRecord | null>(null)

  // Issue Form State
  const [issueEmpId, setIssueEmpId] = useState('EMP-104')
  const [issueEmpName, setIssueEmpName] = useState('Priya Sharma')

  // Return Form State
  const [returnCondition, setReturnCondition] = useState<AssetRecord['condition']>('Good')
  const [returnDamageFee, setReturnDamageFee] = useState<number>(0)

  // Add Asset Form State
  const [newTag, setNewTag] = useState('')
  const [newCat, setNewCat] = useState<AssetRecord['category']>('Laptop / MacBook')
  const [newBrand, setNewBrand] = useState('Apple')
  const [newModel, setNewModel] = useState('')
  const [newSerial, setNewSerial] = useState('')
  const [newCondition, setNewCondition] = useState<AssetRecord['condition']>('Brand New')

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = assets.length
    const inUse = assets.filter((a) => a.status === 'In Use').length
    const available = assets.filter((a) => a.status === 'Available in Stock').length
    const maintenance = assets.filter((a) => a.status === 'Under Maintenance').length

    return { total, inUse, available, maintenance }
  }, [assets])

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch =
        a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.assignedToEmployeeName && a.assignedToEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchCat = selectedCategory === 'All' || a.category === selectedCategory
      const matchStatus = selectedStatus === 'All' || a.status === selectedStatus

      return matchSearch && matchCat && matchStatus
    })
  }, [assets, searchTerm, selectedCategory, selectedStatus])

  // Handle Add Asset
  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModel.trim()) return

    addAsset({
      assetTag: newTag || `AST-${Date.now().toString().slice(-4)}`,
      category: newCat,
      brand: newBrand,
      model: newModel,
      serialNumber: newSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      condition: newCondition,
    })

    setIsAddAssetOpen(false)
    setNewTag('')
    setNewModel('')
    setNewSerial('')
  }

  // Handle Issue Asset
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetForIssue || !issueEmpId.trim()) return

    issueAsset(selectedAssetForIssue.id, issueEmpId, issueEmpName)
    setSelectedAssetForIssue(null)
  }

  // Handle Return Asset
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssetForReturn) return

    returnAsset(selectedAssetForReturn.id, returnCondition, returnDamageFee)
    setSelectedAssetForReturn(null)
    setReturnDamageFee(0)
  }

  return (
    <FeatureGate feature="ASSET">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Laptop className="w-3 h-3" />
                ASSET GOVERNANCE
              </span>
              <span className="text-xs text-slate-500">Hardware & Equipment Inventory</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Company Asset Registry & Lifecycle
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track hardware allocation, workstations, serial tags, issue/return inspections, and exit damage penalties.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNewTag(`AST-LPT-0${assets.length + 1}`)
                setIsAddAssetOpen(true)
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Register New Asset
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Assets</span>
              <Laptop className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">Total recorded company inventory</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Assigned / In Use</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.inUse}</div>
            <p className="text-xs text-slate-500 mt-1">Issued to active employees</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Available in Stock</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.available}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for new joiner provisioning</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Maintenance / Damage</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.maintenance}</div>
            <p className="text-xs text-slate-500 mt-1">Under repair or assessment</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tag, serial #, model, employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Categories</option>
              <option value="Laptop / MacBook">Laptops / MacBooks</option>
              <option value="Monitor / Display">Monitors / Displays</option>
              <option value="Company Smartphone">Company Smartphones</option>
              <option value="Access Card & Keys">Access Cards & Keys</option>
              <option value="Uniform & Safety Gear">Safety Gear</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="In Use">In Use</option>
              <option value="Available in Stock">Available in Stock</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>

        {/* Asset Inventory Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-3.5 px-4">Asset Tag</th>
                  <th className="py-3.5 px-4">Brand & Model</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Serial Number</th>
                  <th className="py-3.5 px-4">Condition</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {asset.assetTag}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{asset.model}</div>
                      <div className="text-[10px] text-slate-400">{asset.brand}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{asset.category}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{asset.serialNumber}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          asset.condition === 'Brand New'
                            ? 'bg-emerald-100 text-emerald-800'
                            : asset.condition === 'Good'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {asset.assignedToEmployeeName ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {asset.assignedToEmployeeName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Issued: {asset.assignedDate || '2025-04-01'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned (In IT Store)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 w-max ${
                          asset.status === 'In Use'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : asset.status === 'Available in Stock'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {asset.status === 'In Use' && <UserCheck className="w-3 h-3" />}
                        {asset.status === 'Available in Stock' && <CheckCircle2 className="w-3 h-3" />}
                        {asset.status === 'Under Maintenance' && <AlertTriangle className="w-3 h-3" />}
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {asset.status === 'Available in Stock' ? (
                        <button
                          onClick={() => setSelectedAssetForIssue(asset)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold"
                        >
                          Issue Asset
                        </button>
                      ) : asset.status === 'In Use' ? (
                        <button
                          onClick={() => {
                            setSelectedAssetForReturn(asset)
                            setReturnCondition(asset.condition)
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Return & Inspect
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">In Service</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: REGISTER NEW ASSET */}
        {isAddAssetOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Hardware Asset</h3>
                <button onClick={() => setIsAddAssetOpen(false)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAssetSubmit} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value as AssetRecord['category'])}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="Laptop / MacBook">Laptop / MacBook</option>
                      <option value="Monitor / Display">Monitor / Display</option>
                      <option value="Company Smartphone">Company Smartphone</option>
                      <option value="Access Card & Keys">Access Card & Keys</option>
                      <option value="Uniform & Safety Gear">Safety Gear</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand *</label>
                    <input
                      type="text"
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Model / Specs *</label>
                  <input
                    type="text"
                    placeholder="e.g. MacBook Pro 14 M3 18GB/512GB"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Serial Number *</label>
                  <input
                    type="text"
                    placeholder="Manufacturer Serial #"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAssetOpen(false)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Save Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ISSUE ASSET */}
        {selectedAssetForIssue && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Issue Asset to Employee</h3>
                  <p className="text-[11px] text-slate-400">{selectedAssetForIssue.assetTag} — {selectedAssetForIssue.model}</p>
                </div>
                <button onClick={() => setSelectedAssetForIssue(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleIssueSubmit} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Employee ID *</label>
                  <input
                    type="text"
                    value={issueEmpId}
                    onChange={(e) => setIssueEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Employee Name *</label>
                  <input
                    type="text"
                    value={issueEmpName}
                    onChange={(e) => setIssueEmpName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssetForIssue(null)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Confirm Issuance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RETURN ASSET & DAMAGE ASSESSMENT */}
        {selectedAssetForReturn && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Asset Return & Inspection</h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedAssetForReturn.assetTag} (Assigned to {selectedAssetForReturn.assignedToEmployeeName})
                  </p>
                </div>
                <button onClick={() => setSelectedAssetForReturn(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Returned Condition *
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value as AssetRecord['condition'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Brand New">Brand New / Flawless</option>
                    <option value="Good">Good (Normal wear & tear)</option>
                    <option value="Fair">Fair (Minor cosmetic scuffs)</option>
                    <option value="Damaged / Needs Repair">Damaged / Physical Breakage</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Damage Recovery / Penalty Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={returnDamageFee}
                    onChange={(e) => setReturnDamageFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Note: Any assessed damage amount feeds directly into the employee's Exit Clearance FnF deduction summary.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssetForReturn(null)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Confirm Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
