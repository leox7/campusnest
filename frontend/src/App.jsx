import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLayout from './layouts/AuthLayout'
import StudentLoginPage from './pages/auth/StudentLoginPage'
import StudentRegisterPage from './pages/auth/StudentRegisterPage'
import LandlordRegisterPage from './pages/auth/LandlordRegisterPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/register/student" element={<StudentRegisterPage />} />
        <Route path="/register/landlord" element={<LandlordRegisterPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login/student" replace />} />
    </Routes>
  )
}

export default App
