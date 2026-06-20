import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLayout from './layouts/AuthLayout'
import StudentLoginPage from './pages/auth/StudentLoginPage'
import StudentRegisterPage from './pages/auth/StudentRegisterPage'
import LandlordLoginPage from './pages/auth/LandlordLoginPage'
import LandlordRegisterPage from './pages/auth/LandlordRegisterPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import StudentDashboardPage from './pages/dashboard/StudentDashboardPage'
import StudentHostelDetailPage from './pages/dashboard/StudentHostelDetailPage'
import SavedHostelsPage from './pages/dashboard/SavedHostelsPage'
import LandlordDashboardPage from './pages/dashboard/LandlordDashboardPage'
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage'
import { GuestOnlyRoute, RequireAdminAuth, RequireLandlordAuth, RequireStudentAuth } from './routes/RouteGuards'

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/student"
        element={
          <RequireStudentAuth>
            <StudentDashboardPage />
          </RequireStudentAuth>
        }
      />
      <Route
        path="/dashboard/student/saved"
        element={
          <RequireStudentAuth>
            <SavedHostelsPage />
          </RequireStudentAuth>
        }
      />
      <Route
        path="/dashboard/student/hostels/:id"
        element={
          <RequireStudentAuth>
            <StudentHostelDetailPage />
          </RequireStudentAuth>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <RequireAdminAuth>
            <AdminDashboardPage />
          </RequireAdminAuth>
        }
      />
      <Route
        path="/dashboard/landlord"
        element={
          <RequireLandlordAuth>
            <LandlordDashboardPage />
          </RequireLandlordAuth>
        }
      />
      <Route element={<AuthLayout />}>
        <Route
          path="/login/student"
          element={
            <GuestOnlyRoute>
              <StudentLoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register/student"
          element={
            <GuestOnlyRoute>
              <StudentRegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/login/landlord"
          element={
            <GuestOnlyRoute>
              <LandlordLoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register/landlord"
          element={
            <GuestOnlyRoute>
              <LandlordRegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/login/admin"
          element={
            <GuestOnlyRoute>
              <AdminLoginPage />
            </GuestOnlyRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login/student" replace />} />
    </Routes>
  )
}

export default App
