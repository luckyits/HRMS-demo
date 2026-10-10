import { RootLayout } from '@/components/layout/RootLayout'
import { AccessDebugPage } from '@/pages/AccessDebugPage'
import { DashboardOverview } from '@/pages/DashboardOverview'
import { EssDashboardPage } from '@/pages/ess/EssDashboardPage'
import { MyAttendancePage } from '@/pages/ess/MyAttendancePage'
import { MyShiftRosterPage } from '@/pages/ess/MyShiftRosterPage'
import { AccessChangeHistoryPage } from '@/pages/features/AccessChangeHistoryPage'
import { AccessExplainerPage } from '@/pages/features/AccessExplainerPage'
import { FeatureAssignmentMatrixPage } from '@/pages/features/FeatureAssignmentMatrixPage'
import { FeatureCataloguePage } from '@/pages/features/FeatureCataloguePage'
import { ProfileManagerPage } from '@/pages/features/ProfileManagerPage'
import { LoginPage } from '@/pages/LoginPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { RoleListPage } from '@/pages/roles/RoleListPage'
import { RolePermissionEditorPage } from '@/pages/roles/RolePermissionEditorPage'
import { RolePreviewPage } from '@/pages/roles/RolePreviewPage'
import { UserRoleAssignmentPage } from '@/pages/roles/UserRoleAssignmentPage'
import { BirthdaysAnniversariesPage } from '@/pages/ess/BirthdaysAnniversariesPage'
import { CalendarHolidaysPage } from '@/pages/ess/CalendarHolidaysPage'
import { CompanyPoliciesPage } from '@/pages/ess/CompanyPoliciesPage'
import { EssSettingsPage } from '@/pages/ess/EssSettingsPage'
import { HelpdeskPage } from '@/pages/ess/HelpdeskPage'
import { LeaveManagementPage } from '@/pages/ess/LeaveManagementPage'
import { MyDocumentsPage } from '@/pages/ess/MyDocumentsPage'
import { MyProfilePage } from '@/pages/ess/MyProfilePage'
import { MyRequestsHubPage } from '@/pages/ess/MyRequestsHubPage'
import { NotificationsCenterPage } from '@/pages/ess/NotificationsCenterPage'
import { PayslipsPage } from '@/pages/ess/PayslipsPage'
import { WorkAgreementPage } from '@/pages/ess/WorkAgreementPage'
import { EmployeeListPage } from '@/pages/admin/EmployeeListPage'
import { AddEmployeeStepperPage } from '@/pages/admin/AddEmployeeStepperPage'
import { Employee360Page } from '@/pages/admin/Employee360Page'
import { BulkUpdatePage } from '@/pages/admin/BulkUpdatePage'
import { DocumentVerificationQueuePage } from '@/pages/admin/DocumentVerificationQueuePage'
import { OrgChartPage } from '@/pages/admin/OrgChartPage'
import { ProbationTrackerPage } from '@/pages/admin/ProbationTrackerPage'
import { OrganizationSetupPage } from '@/pages/admin/OrganizationSetupPage'
import { CompanySetupWizardPage } from '@/pages/admin/CompanySetupWizardPage'
import { TeamDashboardPage } from '@/pages/manager/TeamDashboardPage'
import { ApprovalInboxPage } from '@/pages/manager/ApprovalInboxPage'
import { TeamAttendancePage } from '@/pages/manager/TeamAttendancePage'
import { TeamCalendarPage } from '@/pages/manager/TeamCalendarPage'
import { TeamRosterPage } from '@/pages/manager/TeamRosterPage'
import { TeamLeaveBalancesPage } from '@/pages/manager/TeamLeaveBalancesPage'
import { TeamMembersPage } from '@/pages/manager/TeamMembersPage'
import { ProbationExitAlertsPage } from '@/pages/manager/ProbationExitAlertsPage'
import { DelegationSettingsPage } from '@/pages/manager/DelegationSettingsPage'
import { RaiseOnBehalfPage } from '@/pages/manager/RaiseOnBehalfPage'
import { TeamReportsPage } from '@/pages/manager/TeamReportsPage'
import { LiveDashboardPage } from '@/pages/admin/attendance/LiveDashboardPage'
import { AttendanceRegisterPage } from '@/pages/admin/attendance/AttendanceRegisterPage'
import { AttendancePolicyBuilderPage } from '@/pages/admin/attendance/AttendancePolicyBuilderPage'
import { ShiftBuilderPage } from '@/pages/admin/attendance/ShiftBuilderPage'
import { RosterPlannerPage } from '@/pages/admin/attendance/RosterPlannerPage'
import { GeofenceMapEditorPage } from '@/pages/admin/attendance/GeofenceMapEditorPage'
import { FaceEnrollmentPage } from '@/pages/admin/attendance/FaceEnrollmentPage'
import { RegularizationQueuePage } from '@/pages/admin/attendance/RegularizationQueuePage'
import { SuspiciousPunchReviewPage } from '@/pages/admin/attendance/SuspiciousPunchReviewPage'
import { DeviceManagementPage } from '@/pages/admin/attendance/DeviceManagementPage'
import { LeaveTypesPage } from '@/pages/admin/leaves/LeaveTypesPage'
import { LeavePoliciesPage } from '@/pages/admin/leaves/LeavePoliciesPage'
import { LeaveBalanceAdjustmentPage } from '@/pages/admin/leaves/LeaveBalanceAdjustmentPage'
import { HolidayProfileBuilderPage } from '@/pages/admin/leaves/HolidayProfileBuilderPage'
import { LeaveCalendarHeatmapPage } from '@/pages/admin/leaves/LeaveCalendarHeatmapPage'
import { CompOffEncashmentPage } from '@/pages/admin/leaves/CompOffEncashmentPage'
import { WorkflowDesignerPage } from '@/pages/admin/leaves/WorkflowDesignerPage'
import { NotificationTemplatesPage } from '@/pages/admin/leaves/NotificationTemplatesPage'
import { OvertimeBonusAdminPage } from '@/pages/admin/attendance/OvertimeBonusAdminPage'
import { MyOvertimePage } from '@/pages/ess/MyOvertimePage'
import { SupervisorOtApprovalPage } from '@/pages/manager/SupervisorOtApprovalPage'
import { AdminVisitsPage } from '@/pages/admin/visits/AdminVisitsPage'
import { MyVisitsPage } from '@/pages/ess/MyVisitsPage'
import { ManagerVisitsMonitoringPage } from '@/pages/manager/ManagerVisitsMonitoringPage'
import { AdminExpenseFinancePage } from '@/pages/admin/finance/AdminExpenseFinancePage'
import { MyExpenseClaimsPage } from '@/pages/ess/MyExpenseClaimsPage'
import { MyFinanceLoansPage } from '@/pages/ess/MyFinanceLoansPage'
import { AdminLifecyclePage } from '@/pages/admin/lifecycle/AdminLifecyclePage'
import { AdminAssetManagementPage } from '@/pages/admin/assets/AdminAssetManagementPage'
import { MyResignationPage } from '@/pages/ess/MyResignationPage'
import { ManagerResignationsPage } from '@/pages/manager/ManagerResignationsPage'
import { AdminPayrollPage } from '@/pages/admin/payroll/AdminPayrollPage'
import { AdminCompliancePage } from '@/pages/admin/compliance/AdminCompliancePage'
import { AdminReportsPage } from '@/pages/admin/reports/AdminReportsPage'
import { AdminSystemPage } from '@/pages/admin/system/AdminSystemPage'
import { AdminRecruitmentPage } from '@/pages/admin/recruitment/AdminRecruitmentPage'
import { AdminPerformancePage } from '@/pages/admin/performance/AdminPerformancePage'
import { AdminTrainingPage } from '@/pages/admin/training/AdminTrainingPage'
import { AdminEngagementPage } from '@/pages/admin/engagement/AdminEngagementPage'
import { MyTrainingPage } from '@/pages/ess/MyTrainingPage'
import { MyTimesheetsPage } from '@/pages/ess/MyTimesheetsPage'
import { EngagementPollsPage } from '@/pages/ess/EngagementPollsPage'
import { ManagerTimesheetsPage } from '@/pages/manager/ManagerTimesheetsPage'
import { DevQaPage } from '@/pages/dev/DevQaPage'
import { MobileMorePage } from '@/mobile/pages/MobileMorePage'
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Standalone Login Route */}
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RootLayout />}>
        {/* Default Redirect to HR overview */}
        <Route path="/" element={<Navigate to="/hr/dashboard" replace />} />

        {/* HR Admin Routes */}
        <Route path="/hr">
          <Route path="dashboard" element={<DashboardOverview />} />
          {/* Feature Control Routes */}
          <Route path="features">
            <Route index element={<Navigate to="/hr/features/catalogue" replace />} />
            <Route path="catalogue" element={<FeatureCataloguePage />} />
            <Route path="profiles" element={<ProfileManagerPage />} />
            <Route path="matrix" element={<FeatureAssignmentMatrixPage />} />
            <Route path="explainer" element={<AccessExplainerPage />} />
            <Route path="history" element={<AccessChangeHistoryPage />} />
          </Route>

          {/* Roles & Permissions Routes */}
          <Route path="roles">
            <Route index element={<Navigate to="/hr/roles/list" replace />} />
            <Route path="list" element={<RoleListPage />} />
            <Route path="editor" element={<RolePermissionEditorPage />} />
            <Route path="assignments" element={<UserRoleAssignmentPage />} />
            <Route path="preview" element={<RolePreviewPage />} />
          </Route>

          {/* Employee Directory & Workforce Routes */}
          <Route path="employees">
            <Route index element={<EmployeeListPage />} />
            <Route path="new" element={<AddEmployeeStepperPage />} />
            <Route path="bulk" element={<BulkUpdatePage />} />
            <Route path="probation" element={<ProbationTrackerPage />} />
            <Route path=":id" element={<Employee360Page />} />
          </Route>

          {/* Organization & Setup Routes */}
          <Route path="organization">
            <Route index element={<Navigate to="/hr/organization/chart" replace />} />
            <Route path="chart" element={<OrgChartPage />} />
            <Route path="setup" element={<OrganizationSetupPage />} />
            <Route path="documents-queue" element={<DocumentVerificationQueuePage />} />
            <Route path="wizard" element={<CompanySetupWizardPage />} />
          </Route>
          {/* Attendance & Biometrics Suite Routes */}
          <Route path="attendance">
            <Route index element={<Navigate to="/hr/attendance/live" replace />} />
            <Route path="live" element={<LiveDashboardPage />} />
            <Route path="register" element={<AttendanceRegisterPage />} />
            <Route path="policies" element={<AttendancePolicyBuilderPage />} />
            <Route path="shifts" element={<ShiftBuilderPage />} />
            <Route path="roster" element={<RosterPlannerPage />} />
            <Route path="geofence" element={<GeofenceMapEditorPage />} />
            <Route path="face-enrollment" element={<FaceEnrollmentPage />} />
            <Route path="regularizations" element={<RegularizationQueuePage />} />
            <Route path="suspicious-punches" element={<SuspiciousPunchReviewPage />} />
            <Route path="devices" element={<DeviceManagementPage />} />
            <Route path="overtime-bonus" element={<OvertimeBonusAdminPage />} />
          </Route>

          {/* Shifts & Rostering Direct Routes */}
          <Route path="shifts">
            <Route index element={<Navigate to="/hr/attendance/shifts" replace />} />
            <Route path="builder" element={<ShiftBuilderPage />} />
            <Route path="roster" element={<RosterPlannerPage />} />
          </Route>
          {/* Leave & Holiday Suite Routes */}
          <Route path="leaves">
            <Route index element={<Navigate to="/hr/leaves/types" replace />} />
            <Route path="types" element={<LeaveTypesPage />} />
            <Route path="policies" element={<LeavePoliciesPage />} />
            <Route path="adjustments" element={<LeaveBalanceAdjustmentPage />} />
            <Route path="holidays" element={<HolidayProfileBuilderPage />} />
            <Route path="calendar" element={<LeaveCalendarHeatmapPage />} />
            <Route path="comp-off-encashment" element={<CompOffEncashmentPage />} />
            <Route path="workflows" element={<Navigate to="/hr/workflows/designer" replace />} />
          </Route>

          {/* Holiday Direct Route */}
          <Route path="holidays" element={<HolidayProfileBuilderPage />} />

          {/* Workflow Designer & Notification Engine Routes */}
          <Route path="workflows">
            <Route index element={<Navigate to="/hr/workflows/designer" replace />} />
            <Route path="designer" element={<WorkflowDesignerPage />} />
            <Route path="notifications" element={<NotificationTemplatesPage />} />
          </Route>
          <Route path="visits" element={<AdminVisitsPage />} />
          <Route path="finance" element={<AdminExpenseFinancePage />} />
          <Route path="lifecycle" element={<AdminLifecyclePage />} />
          <Route path="assets" element={<AdminAssetManagementPage />} />
          <Route path="payroll" element={<AdminPayrollPage />} />
          <Route path="compliance" element={<AdminCompliancePage />} />
          <Route path="recruitment" element={<AdminRecruitmentPage />} />
          <Route path="performance" element={<AdminPerformancePage />} />
          <Route path="training" element={<AdminTrainingPage />} />
          <Route path="engagement" element={<AdminEngagementPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSystemPage />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager">
          <Route path="dashboard" element={<TeamDashboardPage />} />
          <Route path="approvals" element={<ApprovalInboxPage />} />
          <Route path="overtime-approvals" element={<SupervisorOtApprovalPage />} />
          <Route path="resignations" element={<ManagerResignationsPage />} />
          <Route path="attendance" element={<TeamAttendancePage />} />
          <Route path="calendar" element={<TeamCalendarPage />} />
          <Route path="roster" element={<TeamRosterPage />} />
          <Route path="shifts" element={<TeamRosterPage />} />
          <Route path="leaves" element={<TeamLeaveBalancesPage />} />
          <Route path="members" element={<TeamMembersPage />} />
          <Route path="alerts" element={<ProbationExitAlertsPage />} />
          <Route path="delegation" element={<DelegationSettingsPage />} />
          <Route path="on-behalf" element={<RaiseOnBehalfPage />} />
          <Route path="reports" element={<TeamReportsPage />} />
          <Route path="visits" element={<ManagerVisitsMonitoringPage />} />
          <Route path="timesheets" element={<ManagerTimesheetsPage />} />
          <Route path="performance" element={<AdminPerformancePage />} />
          <Route path="training" element={<AdminTrainingPage />} />
        </Route>

        {/* Employee Routes (ESS) */}
        <Route path="/employee">
          <Route path="dashboard" element={<EssDashboardPage />} />
          <Route path="attendance" element={<MyAttendancePage />} />
          <Route path="regularization" element={<MyAttendancePage />} />
          <Route path="overtime" element={<MyOvertimePage />} />
          <Route path="visits" element={<MyVisitsPage />} />
          <Route path="shifts" element={<MyShiftRosterPage />} />
          <Route path="requests" element={<MyRequestsHubPage />} />
          <Route path="leaves" element={<LeaveManagementPage />} />
          <Route path="calendar" element={<CalendarHolidaysPage />} />
          <Route path="celebrations" element={<BirthdaysAnniversariesPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="documents" element={<MyDocumentsPage />} />
          <Route path="policies" element={<CompanyPoliciesPage />} />
          <Route path="agreement" element={<WorkAgreementPage />} />
          <Route path="payslips" element={<PayslipsPage />} />
          <Route path="notifications" element={<NotificationsCenterPage />} />
          <Route path="helpdesk" element={<HelpdeskPage />} />
          <Route path="settings" element={<EssSettingsPage />} />
          <Route path="claims" element={<MyExpenseClaimsPage />} />
          <Route path="loans" element={<MyFinanceLoansPage />} />
          <Route path="resignation" element={<MyResignationPage />} />
          <Route path="training" element={<MyTrainingPage />} />
          <Route path="timesheets" element={<MyTimesheetsPage />} />
          <Route path="engagement" element={<EngagementPollsPage />} />
        </Route>

        {/* Diagnostic Access Engine & QA Routes */}
        <Route path="/mobile/more" element={<MobileMorePage />} />
        <Route path="/dev/qa" element={<DevQaPage />} />
        <Route path="/dev/access" element={<AccessDebugPage />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
