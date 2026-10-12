import React from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { MobileHomePage } from '@/mobile/pages/MobileHomePage'
import { MobileManagerHomePage } from '@/mobile/pages/MobileManagerHomePage'
import { MobileAttendancePage } from '@/mobile/pages/MobileAttendancePage'
import { MobileRegularizationPage } from '@/mobile/pages/MobileRegularizationPage'
import { MobileRequestsPage } from '@/mobile/pages/MobileRequestsPage'
import { MobileLeavePage } from '@/mobile/pages/MobileLeavePage'
import { MobileCalendarPage } from '@/mobile/pages/MobileCalendarPage'
import { MobileCelebrationsPage } from '@/mobile/pages/MobileCelebrationsPage'
import { MobileProfilePage } from '@/mobile/pages/MobileProfilePage'
import { MobileDocumentsPage } from '@/mobile/pages/MobileDocumentsPage'
import { MobilePoliciesPage } from '@/mobile/pages/MobilePoliciesPage'
import { MobileAgreementPage } from '@/mobile/pages/MobileAgreementPage'
import { MobilePayslipsPage } from '@/mobile/pages/MobilePayslipsPage'
import { MobileNotificationsPage } from '@/mobile/pages/MobileNotificationsPage'
import { MobileHelpdeskPage } from '@/mobile/pages/MobileHelpdeskPage'
import { MobileSettingsPage } from '@/mobile/pages/MobileSettingsPage'
import { MobileApprovalsPage } from '@/mobile/pages/MobileApprovalsPage'
import { MobileTeamPage } from '@/mobile/pages/MobileTeamPage'
import { MobileTeamCalendarPage } from '@/mobile/pages/MobileTeamCalendarPage'
import { MobileTeamRosterPage } from '@/mobile/pages/MobileTeamRosterPage'
import { MobileManagerVisitsPage } from '@/mobile/pages/MobileManagerVisitsPage'
import { MobileDelegationPage } from '@/mobile/pages/MobileDelegationPage'
import { MobileRaiseOnBehalfPage } from '@/mobile/pages/MobileRaiseOnBehalfPage'
import { MobileTeamReportsPage } from '@/mobile/pages/MobileTeamReportsPage'
import { MobileTeamAlertsPage } from '@/mobile/pages/MobileTeamAlertsPage'
import { MobileMorePage } from '@/mobile/pages/MobileMorePage'
import { useDemo } from '@/context/DemoContext'

export const MobileViewResolver: React.FC = () => {
  const location = useLocation()
  const { settings } = useDemo()
  const path = location.pathname.toLowerCase()

  // 1. More Catalog Hub
  if (path === '/mobile/more') {
    return <MobileMorePage />
  }

  // 2. Manager Dedicated Dashboard
  if (path === '/manager/dashboard' || (path === '/' && settings.role === 'Manager')) {
    return <MobileManagerHomePage />
  }

  // 3. Employee / Default Home
  if (
    path === '/' ||
    path === '/employee/dashboard' ||
    path === '/hr/dashboard'
  ) {
    return <MobileHomePage />
  }

  // 4. Attendance & Punch
  if (path === '/employee/attendance') {
    return <MobileAttendancePage />
  }

  // 5. Regularization Form
  if (path === '/employee/regularization') {
    return <MobileRegularizationPage />
  }

  // 6. Requests Hub
  if (path === '/employee/requests') {
    return <MobileRequestsPage />
  }

  // 7. Leave Management
  if (path === '/employee/leaves') {
    return <MobileLeavePage />
  }

  // 8. Calendar & Holidays
  if (path === '/employee/calendar') {
    return <MobileCalendarPage />
  }

  // 9. Celebrations (Birthdays & Anniversaries)
  if (path === '/employee/celebrations') {
    return <MobileCelebrationsPage />
  }

  // 10. Profile
  if (path === '/employee/profile') {
    return <MobileProfilePage />
  }

  // 11. Documents & KYC Vault
  if (path === '/employee/documents') {
    return <MobileDocumentsPage />
  }

  // 12. Company Policies
  if (path === '/employee/policies') {
    return <MobilePoliciesPage />
  }

  // 13. Work Agreement
  if (path === '/employee/agreement') {
    return <MobileAgreementPage />
  }

  // 14. Payslips & Form 16
  if (path === '/employee/payslips') {
    return <MobilePayslipsPage />
  }

  // 15. Notifications Center
  if (path === '/employee/notifications') {
    return <MobileNotificationsPage />
  }

  // 16. Helpdesk & Grievance
  if (path === '/employee/helpdesk') {
    return <MobileHelpdeskPage />
  }

  // 17. App Settings & Privacy
  if (path === '/employee/settings') {
    return <MobileSettingsPage />
  }

  // 18. Manager Approvals Inbox
  if (path === '/manager/approvals') {
    return <MobileApprovalsPage />
  }

  // 19. Team Attendance / Members
  if (path === '/manager/attendance' || path === '/manager/members') {
    return <MobileTeamPage />
  }

  // 20. Team Calendar
  if (path === '/manager/calendar') {
    return <MobileTeamCalendarPage />
  }

  // 21. Team Roster / Shift Assignment
  if (path === '/manager/roster' || path === '/manager/shifts') {
    return <MobileTeamRosterPage />
  }

  // 22. Manager Field Visits Monitoring
  if (path === '/manager/visits') {
    return <MobileManagerVisitsPage />
  }

  // 23. Delegation Settings
  if (path === '/manager/delegation') {
    return <MobileDelegationPage />
  }

  // 24. Raise on Behalf
  if (path === '/manager/on-behalf') {
    return <MobileRaiseOnBehalfPage />
  }

  // 25. Team Analytics & Muster Reports
  if (path === '/manager/reports') {
    return <MobileTeamReportsPage />
  }

  // 26. Probation & Exit Alerts
  if (path === '/manager/alerts') {
    return <MobileTeamAlertsPage />
  }

  // Fallback: render the matched route outlet inside the mobile container
  return (
    <div className="w-full min-h-full">
      <Outlet />
    </div>
  )
}
