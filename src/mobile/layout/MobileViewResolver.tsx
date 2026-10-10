import React from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { MobileHomePage } from '@/mobile/pages/MobileHomePage'
import { MobileAttendancePage } from '@/mobile/pages/MobileAttendancePage'
import { MobileRequestsPage } from '@/mobile/pages/MobileRequestsPage'
import { MobileApprovalsPage } from '@/mobile/pages/MobileApprovalsPage'
import { MobilePayslipsPage } from '@/mobile/pages/MobilePayslipsPage'
import { MobileTeamPage } from '@/mobile/pages/MobileTeamPage'
import { MobileProfilePage } from '@/mobile/pages/MobileProfilePage'
import { MobileMorePage } from '@/mobile/pages/MobileMorePage'

import { MobileRegularizationPage } from '@/mobile/pages/MobileRegularizationPage'

export const MobileViewResolver: React.FC = () => {
  const location = useLocation()
  const path = location.pathname.toLowerCase()

  // 1. More screen
  if (path === '/mobile/more') {
    return <MobileMorePage />
  }

  // 2. Dashboards / Home
  if (
    path === '/' ||
    path === '/employee/dashboard' ||
    path === '/manager/dashboard' ||
    path === '/hr/dashboard'
  ) {
    return <MobileHomePage />
  }

  // 3. Attendance & Punch
  if (path === '/employee/attendance') {
    return <MobileAttendancePage />
  }

  // Regularization Form
  if (path === '/employee/regularization') {
    return <MobileRegularizationPage />
  }

  // 4. Requests Hub
  if (path === '/employee/requests') {
    return <MobileRequestsPage />
  }

  // 5. Manager Approvals Inbox
  if (path === '/manager/approvals') {
    return <MobileApprovalsPage />
  }

  // 6. Payslips
  if (path === '/employee/payslips') {
    return <MobilePayslipsPage />
  }

  // 7. Team Attendance / Members
  if (path === '/manager/attendance' || path === '/manager/members') {
    return <MobileTeamPage />
  }

  // 8. Profile
  if (path === '/employee/profile') {
    return <MobileProfilePage />
  }

  // 9. Fallback: render the matched route outlet inside the mobile container
  return (
    <div className="w-full min-h-full">
      <Outlet />
    </div>
  )
}
