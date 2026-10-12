import React, { useState } from 'react'
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Tag,
  Calendar,
  ChevronRight,
  HardDrive
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import { useLifecycle, type AssetRecord } from '@/context/LifecycleContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'

export const MobileAssetsPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { assets } = useLifecycle()
  const { showToast } = useToast()

  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null)
  const [returnReason, setReturnReason] = useState('Hardware upgrade / project role transition')

  if (!hasFeature('ASSET')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Company Assets" subtitle="Hardware & Equipment" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Laptop className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Company asset inventory is not enabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  // Filter assets assigned to employee or provide active samples
  const myAssets = assets.filter(
    (a) => a.assignedToEmployeeId === currentEmployee.id || a.status === 'In Use'
  )

  const handleInitiateReturn = () => {
    if (!selectedAsset) return
    showToast(`Return handover request initiated for ${selectedAsset.model}!`, 'success')
    setSelectedAsset(null)
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Assigned Assets"
        subtitle={`${myAssets.length} company devices & tools`}
      />

      <div className="p-4 space-y-4">
        {/* Custody Information Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Hardware Custody & IT Policy
              </h4>
              <span className="text-[10px] text-muted-foreground">
                All assigned devices are company property and encrypted
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground pt-1 border-t border-border">
            Please report lost, stolen, or damaged devices immediately to IT Support to avoid policy penalties.
          </p>
        </div>

        {/* Assigned Asset Cards */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            My Inventory Items ({myAssets.length})
          </h4>

          <div className="space-y-2.5">
            {myAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className="p-4 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center text-foreground shrink-0 font-bold">
                      {asset.category.includes('Laptop') ? (
                        <Laptop className="w-5 h-5 text-indigo-500" />
                      ) : asset.category.includes('Smartphone') ? (
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <HardDrive className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-foreground">
                        {asset.model}
                      </h5>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {asset.brand} • S/N: {asset.serialNumber}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === 'In Use'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>Allocated: {asset.assignedDate || '2024-02-01'}</span>
                  </div>

                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <span>Condition: {asset.condition}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Detail & Return Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        title="Asset Custody Details"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
              <h5 className="text-sm font-bold text-foreground">
                {selectedAsset.model}
              </h5>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Serial Number</span>
                  <span className="font-bold text-foreground">{selectedAsset.serialNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Manufacturer</span>
                  <span className="font-bold text-foreground">{selectedAsset.brand}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Physical Health</span>
                  <span className="font-bold text-foreground">{selectedAsset.condition}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Status</span>
                  <span className="font-bold text-emerald-600">{selectedAsset.status}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Handover / Return Reason
              </label>
              <textarea
                rows={2}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleInitiateReturn}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md active:scale-[0.99] transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Initiate Asset Handover / Return</span>
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
