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
import { MobileVisitsPage } from '@/mobile/pages/MobileVisitsPage'
import { MobileExpensePage } from '@/mobile/pages/MobileExpensePage'
import { MobileOvertimePage } from '@/mobile/pages/MobileOvertimePage'
import { MobileLoansPage } from '@/mobile/pages/MobileLoansPage'
import { MobileIncentivePage } from '@/mobile/pages/MobileIncentivePage'
import { MobileTimesheetPage } from '@/mobile/pages/MobileTimesheetPage'
import { MobileResignationPage } from '@/mobile/pages/MobileResignationPage'
import { MobileAssetsPage } from '@/mobile/pages/MobileAssetsPage'
import { MobileTrainingPerformancePage } from '@/mobile/pages/MobileTrainingPerformancePage'
import { MobilePendingSyncPage } from '@/mobile/pages/MobilePendingSyncPage'
import { MobilePinLockPage } from '@/mobile/pages/MobilePinLockPage'
import { MobileSessionExpiredPage } from '@/mobile/pages/MobileSessionExpiredPage'
import { MobilePermissionsHelpPage } from '@/mobile/pages/MobilePermissionsHelpPage'
import { MobileQaPage } from '@/pages/dev/MobileQaPage'

// HR Mobile Dedicated Pages
import { MobileHrHomePage } from '@/mobile/pages/hr/MobileHrHomePage'
import { MobileHrApprovalsPage } from '@/mobile/pages/hr/MobileHrApprovalsPage'
import { MobileHrAttendancePage } from '@/mobile/pages/hr/MobileHrAttendancePage'
import { MobileHrEmployeesPage } from '@/mobile/pages/hr/MobileHrEmployeesPage'
import { MobileHrFeaturesPage } from '@/mobile/pages/hr/MobileHrFeaturesPage'
import { MobileHrAnnouncementsPage } from '@/mobile/pages/hr/MobileHrAnnouncementsPage'
import { MobileHrQueuesPage } from '@/mobile/pages/hr/MobileHrQueuesPage'
import { MobileHrAuditPage } from '@/mobile/pages/hr/MobileHrAuditPage'
import { MobileDesktopOnlyPage } from '@/mobile/pages/hr/MobileDesktopOnlyPage'

import { useDemo } from '@/context/DemoContext'

export const MobileViewResolver: React.FC = () => {
  const location = useLocation()
  const { settings } = useDemo()
  const path = location.pathname.toLowerCase()

  // 1. More Catalog Hub
  if (path === '/mobile/more') {
    return <MobileMorePage />
  }

  // Mobile QA Center
  if (path === '/dev/mobile-qa') {
    return <MobileQaPage />
  }

  // 2. HR Admin & Branch HR Dedicated Mobile Home Dashboard
  if (
    path === '/hr/dashboard' ||
    path === '/mobile/hr' ||
    (path === '/' && (settings.role === 'HR Admin' || settings.role === 'Branch HR'))
  ) {
    return <MobileHrHomePage />
  }

  // 3. HR Mobile Screens
  if (path === '/hr/approvals') {
    return <MobileHrApprovalsPage />
  }

  if (
    path === '/hr/attendance' ||
    path === '/mobile/hr/attendance' ||
    path === '/admin/attendance/live' ||
    path === '/admin/attendance/suspicious'
  ) {
    return <MobileHrAttendancePage />
  }

  if (path === '/hr/employees' || path === '/mobile/hr/employees') {
    return <MobileHrEmployeesPage />
  }

  if (path === '/hr/features' || path === '/mobile/hr/features') {
    return <MobileHrFeaturesPage />
  }

  if (path === '/hr/announcements' || path === '/mobile/hr/announcements') {
    return <MobileHrAnnouncementsPage />
  }

  if (path === '/hr/queues' || path === '/mobile/hr/queues') {
    return <MobileHrQueuesPage />
  }

  if (path === '/hr/audit' || path === '/mobile/hr/audit') {
    return <MobileHrAuditPage />
  }

  // 4. Manager Dedicated Dashboard
  if (path === '/manager/dashboard' || (path === '/' && settings.role === 'Manager')) {
    return <MobileManagerHomePage />
  }

  // 5. Employee / Default Home
  if (
    path === '/' ||
    path === '/employee/dashboard'
  ) {
    return <MobileHomePage />
  }

  // 6. Attendance & Punch
  if (path === '/employee/attendance') {
    return <MobileAttendancePage />
  }

  // 7. Regularization Form
  if (path === '/employee/regularization') {
    return <MobileRegularizationPage />
  }

  // 8. Requests Hub
  if (path === '/employee/requests') {
    return <MobileRequestsPage />
  }

  // 9. Leave Management
  if (path === '/employee/leaves') {
    return <MobileLeavePage />
  }

  // 10. Calendar & Holidays
  if (path === '/employee/calendar') {
    return <MobileCalendarPage />
  }

  // 11. Celebrations (Birthdays & Anniversaries)
  if (path === '/employee/celebrations') {
    return <MobileCelebrationsPage />
  }

  // 12. Profile
  if (path === '/employee/profile') {
    return <MobileProfilePage />
  }

  // 13. Documents & KYC Vault
  if (path === '/employee/documents') {
    return <MobileDocumentsPage />
  }

  // 14. Company Policies
  if (path === '/employee/policies') {
    return <MobilePoliciesPage />
  }

  // 15. Work Agreement
  if (path === '/employee/agreement') {
    return <MobileAgreementPage />
  }

  // 16. Payslips & Form 16
  if (path === '/employee/payslips') {
    return <MobilePayslipsPage />
  }

  // 17. Notifications Center
  if (path === '/employee/notifications' || path === '/mobile/notifications') {
    return <MobileNotificationsPage />
  }

  // 18. Helpdesk & Grievance
  if (path === '/employee/helpdesk') {
    return <MobileHelpdeskPage />
  }

  // 19. App Settings & Privacy
  if (path === '/employee/settings' || path === '/mobile/settings') {
    return <MobileSettingsPage />
  }

  // 20. Manager Approvals Inbox
  if (path === '/manager/approvals') {
    return <MobileApprovalsPage />
  }

  // 21. Team Attendance / Members
  if (path === '/manager/attendance' || path === '/manager/members') {
    return <MobileTeamPage />
  }

  // 22. Team Calendar
  if (path === '/manager/calendar') {
    return <MobileTeamCalendarPage />
  }

  // 23. Team Roster / Shift Assignment
  if (path === '/manager/roster' || path === '/manager/shifts') {
    return <MobileTeamRosterPage />
  }

  // 24. Manager Field Visits Monitoring
  if (path === '/manager/visits') {
    return <MobileManagerVisitsPage />
  }

  // 25. Delegation Settings
  if (path === '/manager/delegation') {
    return <MobileDelegationPage />
  }

  // 26. Raise on Behalf
  if (path === '/manager/on-behalf') {
    return <MobileRaiseOnBehalfPage />
  }

  // 27. Team Analytics & Muster Reports
  if (path === '/manager/reports') {
    return <MobileTeamReportsPage />
  }

  // 28. Probation & Exit Alerts
  if (path === '/manager/alerts') {
    return <MobileTeamAlertsPage />
  }

  // 29. Field Sales Visits
  if (path === '/employee/visits' || path === '/mobile/visits') {
    return <MobileVisitsPage />
  }

  // 30. Expense Reimbursements
  if (path === '/employee/claims' || path === '/employee/expenses' || path === '/employee/expense') {
    return <MobileExpensePage />
  }

  // 31. Overtime & Comp-Off
  if (path === '/employee/overtime' || path === '/employee/ot') {
    return <MobileOvertimePage />
  }

  // 32. Loans & Salary Advances
  if (path === '/employee/loans' || path === '/employee/advances') {
    return <MobileLoansPage />
  }

  // 33. Sales Incentives
  if (path === '/employee/incentive' || path === '/employee/incentives') {
    return <MobileIncentivePage />
  }

  // 34. Project Timesheets
  if (path === '/employee/timesheets' || path === '/employee/timesheet') {
    return <MobileTimesheetPage />
  }

  // 35. Resignation & Separation
  if (path === '/employee/resignation' || path === '/employee/exit') {
    return <MobileResignationPage />
  }

  // 36. Assigned Assets
  if (path === '/employee/assets' || path === '/employee/asset') {
    return <MobileAssetsPage />
  }

  // 37. Training LMS & Performance Appraisals
  if (
    path === '/employee/training' ||
    path === '/employee/courses' ||
    path === '/employee/performance' ||
    path === '/employee/okrs' ||
    path === '/employee/appraisal'
  ) {
    return <MobileTrainingPerformancePage />
  }

  // 38. Offline Pending Sync Queue
  if (path === '/mobile/sync' || path === '/employee/sync') {
    return <MobilePendingSyncPage />
  }

  // 39. App Security PIN Lock
  if (path === '/mobile/lock' || path === '/employee/lock') {
    return <MobilePinLockPage />
  }

  // 40. Security Session Expired
  if (path === '/mobile/session-expired' || path === '/employee/session-expired') {
    return <MobileSessionExpiredPage />
  }

  // 41. Permissions & Hardware Privacy Help
  if (path === '/mobile/permissions' || path === '/employee/permissions') {
    return <MobilePermissionsHelpPage />
  }

  // 42. HEAVY DESKTOP-ONLY ADMIN WORKSTATION SCREENS GATEKEEPER
  // "Do NOT put heavy admin screens on mobile; the desktop-only screens show a message 'Best used on a larger screen' with a link."
  if (
    path.startsWith('/admin/') ||
    path.startsWith('/roles/') ||
    path.startsWith('/features/') ||
    path.startsWith('/hr/employees/add') ||
    path.startsWith('/hr/employees/bulk') ||
    path.startsWith('/hr/employees/documents') ||
    path.startsWith('/hr/employees/org-chart') ||
    path.startsWith('/hr/company-setup') ||
    path.startsWith('/hr/organization')
  ) {
    let title = 'Enterprise Admin Workstation'
    let suggestedMobileRoute = '/hr/dashboard'
    let suggestedMobileLabel = 'Open Mobile HR Dashboard'

    if (path.includes('attendance') || path.includes('roster') || path.includes('shift') || path.includes('geofence')) {
      title = 'Attendance Policy & Roster Workstation'
      suggestedMobileRoute = '/hr/attendance'
      suggestedMobileLabel = 'Open Live Attendance'
    } else if (path.includes('leave') || path.includes('holiday') || path.includes('workflow')) {
      title = 'Leave Rules & Workflow Designer'
      suggestedMobileRoute = '/hr/approvals'
      suggestedMobileLabel = 'Open Mobile Approvals'
    } else if (path.includes('payroll') || path.includes('finance') || path.includes('compliance')) {
      title = 'Statutory Payroll & Finance Engine'
      suggestedMobileRoute = '/hr/dashboard'
      suggestedMobileLabel = 'Open HR Dashboard'
    } else if (path.includes('features') || path.includes('roles')) {
      title = 'Feature Matrix & Permission Editor'
      suggestedMobileRoute = '/hr/features'
      suggestedMobileLabel = 'Open Feature Access Quick View'
    } else if (path.includes('employee')) {
      title = 'Employee Administration & Setup'
      suggestedMobileRoute = '/hr/employees'
      suggestedMobileLabel = 'Open Employee 360'
    }

    return (
      <MobileDesktopOnlyPage
        title={title}
        suggestedMobileRoute={suggestedMobileRoute}
        suggestedMobileLabel={suggestedMobileLabel}
      />
    )
  }

  // Fallback: render the matched route outlet inside the mobile container
  return (
    <div className="w-full min-h-full">
      <Outlet />
    </div>
  )
}
