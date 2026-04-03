import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './pages/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/reports/DashboardPage';
import ReportsPage from './pages/reports/ReportsPage';
import ReportDetailPage from './pages/reports/ReportDetailPage';
import ManageReportsPage from './pages/reports/ManageReportsPage';
import ReportEditorPage from './pages/reports/ReportEditorPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:id" element={<ReportDetailPage />} />

              <Route
                path="admin/reports"
                element={
                  <ProtectedRoute requireAdmin>
                    <ManageReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reports/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <ReportEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/reports/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <ReportEditorPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
