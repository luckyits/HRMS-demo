import { BrowserRouter } from 'react-router-dom'
import { AdminAttendanceProvider } from './context/AdminAttendanceContext'
import { AdminLeavesProvider } from './context/AdminLeavesContext'
import { AttendanceProvider } from './context/AttendanceContext'
import { DemoProvider } from './context/DemoContext'
import { FeatureControlProvider } from './context/FeatureControlContext'
import { RoleProvider } from './context/RoleContext'
import { ThemeProvider } from './context/ThemeContext'
import { EssProvider } from './context/EssContext'
import { EmployeeProvider } from './context/EmployeeContext'
import { WorkflowProvider } from './context/WorkflowContext'
import { OvertimeBonusProvider } from './context/OvertimeBonusContext'
import { VisitProvider } from './context/VisitContext'
import { ExpenseFinanceProvider } from './context/ExpenseFinanceContext'
import { LifecycleProvider } from './context/LifecycleContext'
import { PayrollProvider } from './context/PayrollContext'
import { ComplianceEngagementProvider } from './context/ComplianceEngagementContext'
import { ReportsProvider } from './context/ReportsContext'
import { SystemSettingsProvider } from './context/SystemSettingsContext'
import { OptionalModulesProvider } from './context/OptionalModulesContext'
import { OfflineQueueProvider } from './context/OfflineQueueContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/common/ToastContainer'
import './i18n'
import { AppRoutes } from './routes'

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DemoProvider>
          <OfflineQueueProvider>
            <FeatureControlProvider>
            <RoleProvider>
              <AttendanceProvider>
                <AdminAttendanceProvider>
                  <AdminLeavesProvider>
                    <EssProvider>
                      <EmployeeProvider>
                        <WorkflowProvider>
                          <OvertimeBonusProvider>
                            <VisitProvider>
                              <ExpenseFinanceProvider>
                                <LifecycleProvider>
                                  <PayrollProvider>
                                    <ComplianceEngagementProvider>
                                      <ReportsProvider>
                                        <SystemSettingsProvider>
                                          <OptionalModulesProvider>
                                            <BrowserRouter>
                                              <AppRoutes />
                                              <ToastContainer />
                                            </BrowserRouter>
                                          </OptionalModulesProvider>
                                        </SystemSettingsProvider>
                                      </ReportsProvider>
                                    </ComplianceEngagementProvider>
                                  </PayrollProvider>
                                </LifecycleProvider>
                              </ExpenseFinanceProvider>
                            </VisitProvider>
                          </OvertimeBonusProvider>
                        </WorkflowProvider>
                      </EmployeeProvider>
                    </EssProvider>
                  </AdminLeavesProvider>
                </AdminAttendanceProvider>
              </AttendanceProvider>
            </RoleProvider>
          </FeatureControlProvider>
          </OfflineQueueProvider>
        </DemoProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
