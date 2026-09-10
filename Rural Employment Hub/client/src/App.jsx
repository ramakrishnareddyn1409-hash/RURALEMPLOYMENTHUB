import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingAssistant from "./components/FloatingAssistant";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import About from "./pages/About";
import { Features, Contact, FAQ, PrivacyPolicy, Terms, NotFound, Unauthorized } from "./pages/StaticPages";

// Worker Pages
import {
  WorkerDashboard,
  WorkerAttendanceCalendar,
  WorkerPaymentHistory,
  WorkerSMSFeed,
  EmployeeProfile,
} from "./pages/Employee";

// Admin & Hierarchy Pages
import {
  StateAdminDashboard,
  ManageAssistantAdmins,
  StateReports,
  AssistantAdminDashboard,
  ManageFieldAdmins,
  AssistantReports,
  FieldAdminDashboard,
  ManageWorkers,
  FaceAttendance,
  FingerprintAttendance,
  FieldAdminPayments,
  AdminAttendance,
  AdminPayments,
  AdminSettings,
  AdminAnalytics,
} from "./pages/Admin";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* 1. State Admin Routes (Top Level Authority) */}
              <Route
                path="/admin/state-admin"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "superadmin"]}>
                    <StateAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/superadmin"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "superadmin"]}>
                    <StateAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assistant-admins"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "superadmin"]}>
                    <ManageAssistantAdmins />
                  </ProtectedRoute>
                }
              />

              {/* 2. Assistant Admin Routes (Divisional Level) */}
              <Route
                path="/admin/assistant-admin"
                element={
                  <ProtectedRoute allowedRoles={["assistant_admin", "state_admin", "superadmin"]}>
                    <AssistantAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/field-admins"
                element={
                  <ProtectedRoute allowedRoles={["assistant_admin", "state_admin", "superadmin"]}>
                    <ManageFieldAdmins />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assistant-reports"
                element={
                  <ProtectedRoute allowedRoles={["assistant_admin", "state_admin", "superadmin"]}>
                    <AssistantReports />
                  </ProtectedRoute>
                }
              />

              {/* 3. Field Admin Routes (Mandal Level) */}
              <Route
                path="/admin/field-admin"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <FieldAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <FieldAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/face-attendance"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <FaceAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workers"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <ManageWorkers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <ManageWorkers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/fingerprint-attendance"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <FingerprintAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/field-payments"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <FieldAdminPayments />
                  </ProtectedRoute>
                }
              />

              {/* Shared Administrative Reports & Settings */}
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <AdminAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={["field_admin", "admin", "assistant_admin", "state_admin", "superadmin"]}>
                    <AdminPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "assistant_admin", "superadmin", "admin"]}>
                    <StateReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "assistant_admin", "superadmin", "admin"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={["state_admin", "assistant_admin", "field_admin", "admin", "superadmin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* 4. Worker Routes (Personal Portal) */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/attendance"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerAttendanceCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/attendance-history"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerAttendanceCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/payments"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerPaymentHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/sms-feed"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerSMSFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/notifications"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <WorkerSMSFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute allowedRoles={["worker", "employee"]}>
                    <EmployeeProfile />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingAssistant />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
