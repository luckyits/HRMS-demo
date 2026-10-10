import { DemoSwitcher } from '@/components/common/DemoSwitcher'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { useIsMobile } from '@/hooks/useIsMobile'
import { PhoneFrame } from '@/mobile/layout/PhoneFrame'
import { MobileLayout } from '@/mobile/layout/MobileLayout'
import { MobileViewResolver } from '@/mobile/layout/MobileViewResolver'
import React from 'react'
import { Outlet } from 'react-router-dom'

export const RootLayout: React.FC = () => {
  const { isMobile, isPhonePreview } = useIsMobile()

  // 1. Phone Preview Mode on Desktop (Centered 390x844 frame for laptop demo)
  if (isPhonePreview) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-auto">
        <PhoneFrame>
          <MobileLayout>
            <MobileViewResolver />
          </MobileLayout>
        </PhoneFrame>

        {/* Floating Demo Persona Switcher */}
        <DemoSwitcher />
      </div>
    )
  }

  // 2. Real Mobile Viewport (< 768px screen width)
  if (isMobile) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased">
        <MobileLayout>
          <MobileViewResolver />
        </MobileLayout>

        {/* Floating Demo Persona Switcher */}
        <DemoSwitcher />
      </div>
    )
  }

  // 3. Desktop Web Layout (768px and above, phone preview off)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Left Collapsible Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Top Bar */}
        <TopBar />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Demo Persona Switcher */}
      <DemoSwitcher />
    </div>
  )
}
