import { Outlet } from 'react-router-dom'
import ImageGallery from '../components/auth/ImageGallery'

function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-container">
        <ImageGallery />
        <main className="form-panel">
          <div className="form-card transition-wrapper is-visible">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
