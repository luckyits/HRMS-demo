import React from 'react'
import { Outlet } from 'react-router-dom'
import { BottomTabBar } from '@/mobile/components/BottomTabBar'
import { OfflineBanner } from '@/mobile/components/OfflineBanner'

interface MobileLayoutProps {
  children?: React.ReactNode
  showTabBar?: boolean
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showTabBar = true,
}) => {
  return (
    <div className="relative flex-1 flex flex-col w-full h-full min-h-full bg-background text-foreground overflow-x-hidden antialiased selection:bg-primary/20">
      {/* Offline Alert Banner */}
      <OfflineBanner />

      {/* Main Mobile Screen Canvas */}
      <main className={`flex-1 w-full overflow-y-auto ${showTabBar ? 'pb-20' : 'pb-safe'}`}>
        {children || <Outlet />}
      </main>

      {/* Bottom 5-Tab Navigation Bar */}
      {showTabBar && <BottomTabBar />}
    </div>
  )
}
