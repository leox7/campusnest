import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './App.css'

const GALLERY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern student room with desk',
  },
  {
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    alt: 'Bright shared student apartment',
  },
  {
    src: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cozy accommodation bedroom',
  },
  {
    src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    alt: 'Contemporary room near campus',
  },
  {
    src: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Comfortable student interior',
  },
]

const ROUTE_META = {
  '/login/student': { title: 'Student Login', role: 'student', mode: 'login' },
  '/register/student': { title: 'Student Registration', role: 'student', mode: 'register' },
  '/register/landlord': { title: 'Landlord Registration', role: 'landlord', mode: 'register' },
  '/login/admin': { title: 'Admin Login', role: 'admin', mode: 'login' },
}

const ROLE_ROUTES = {
  student: { login: '/login/student', register: '/register/student' },
  landlord: { register: '/register/landlord' },
  admin: { login: '/login/admin' },
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function App() {
  return (
    <div className="auth-shell">
      <div className="auth-container">
        <ImageGallery />
        <main className="form-panel">
          <FormTransitionContainer />
        </main>
      </div>
    </div>
  )
}

function ImageGallery() {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((prev) => (prev + 1) % GALLERY_IMAGES.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <aside className="gallery-panel">
      {GALLERY_IMAGES.map((image, index) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          className={`gallery-image ${index === activeImage ? 'active' : ''}`}
        />
      ))}
      <div className="gallery-overlay">
        <div className="gallery-copy">
          <h2>Find Your Perfect Campus Home</h2>
          <div className="gallery-dots" aria-label="Gallery indicators">
            {GALLERY_IMAGES.map((image, index) => (
              <button
                type="button"
                key={image.src}
                className={`gallery-dot ${index === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function FormTransitionContainer() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="form-card transition-wrapper is-visible">
      <Routes>
        <Route path="/login/student" element={<AuthPage key="/login/student" />} />
        <Route path="/register/student" element={<AuthPage key="/register/student" />} />
        <Route path="/register/landlord" element={<AuthPage key="/register/landlord" />} />
        <Route path="/login/admin" element={<AuthPage key="/login/admin" />} />
        <Route path="*" element={<Navigate to="/login/student" replace />} />
      </Routes>
    </div>
  )
}

function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = ROUTE_META[location.pathname] ?? ROUTE_META['/login/student']
  const isLogin = page.mode === 'login'

  const [fields, setFields] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const resolveRolePath = (targetRole) => {
    const targetRoutes = ROLE_ROUTES[targetRole]
    if (targetRoutes[page.mode]) {
      return targetRoutes[page.mode]
    }
    return targetRoutes.login ?? targetRoutes.register
  }

  const roleOptions = [
    { label: 'Student', role: 'student', path: resolveRolePath('student') },
    { label: 'Landlord', role: 'landlord', path: resolveRolePath('landlord') },
    { label: 'Admin', role: 'admin', path: resolveRolePath('admin') },
  ]

  const routes = ROLE_ROUTES[page.role]
  const modeOptions = [
    {
      label: 'Login',
      mode: 'login',
      path: routes.login,
      disabled: !routes.login,
    },
    {
      label: 'Register',
      mode: 'register',
      path: routes.register,
      disabled: !routes.register,
    },
  ]

  const validate = () => {
    const nextErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!isLogin && page.role !== 'admin' && !fields.fullName.trim()) {
      nextErrors.fullName = 'Please enter your full name.'
    }
    if (!emailRegex.test(fields.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }
    if (fields.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(fields.password)) {
      nextErrors.password = 'Use uppercase, lowercase, and at least one number.'
    }
    if (!isLogin && fields.password !== fields.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    return nextErrors
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
    setSubmitMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')

    try {
      if (isLogin) {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: fields.email,
          password: fields.password,
        })
        const { token, user } = response.data
        const storage = fields.rememberMe ? localStorage : sessionStorage
        storage.setItem('campusnest_token', token)
        storage.setItem('campusnest_user', JSON.stringify(user))

        setSubmitMessage(`Welcome back! Logged in as ${user.role}.`)
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/register`, {
          full_name: fields.fullName,
          email: fields.email,
          password: fields.password,
          user_role: page.role,
        })
        setSubmitMessage('Registration successful. Please sign in with your new account.')
        navigate(ROLE_ROUTES[page.role].login ?? '/login/student')
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message
      setSubmitError(apiMessage || 'Request failed. Please check backend server and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <p className="brand-tag">CampusNest AI</p>
      <h1>{page.title}</h1>
      <p className="supporting-copy">
        Secure access for your university accommodation experience.
      </p>

      <div className="role-selector" aria-label="Role selector">
        {roleOptions.map((option) => (
          <button
            key={option.path}
            type="button"
            className={`pill-button ${page.role === option.role ? 'active' : ''}`}
            onClick={() => navigate(option.path)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mode-selector" aria-label="Authentication mode selector">
        {modeOptions.map((option) => (
          <button
            key={option.mode}
            type="button"
            className={`pill-button mode-pill ${page.mode === option.mode ? 'active' : ''}`}
            onClick={() => option.path && navigate(option.path)}
            disabled={option.disabled}
          >
            {option.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {!isLogin && page.role !== 'admin' && (
          <Field
            label="Full Name"
            name="fullName"
            value={fields.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.fullName}
          />
        )}

        <Field
          label="Email Address"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
        />
        {page.role === 'student' && (
          <p className="helper-text">
            School email is recommended (for example: <span>@students.kcau.ac.ke</span>), but any
            valid email is accepted.
          </p>
        )}

        <Field
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={fields.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          withToggle
          onToggle={() => setShowPassword((prev) => !prev)}
          isVisible={showPassword}
        />

        {!isLogin && (
          <Field
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={fields.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
            withToggle
            onToggle={() => setShowConfirmPassword((prev) => !prev)}
            isVisible={showConfirmPassword}
          />
        )}

        {isLogin && (
          <div className="form-row">
            <label className="remember-check">
              <input
                type="checkbox"
                name="rememberMe"
                checked={fields.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="/" onClick={(event) => event.preventDefault()} className="forgot-link">
              Forgot password?
            </a>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
        </button>
        {submitMessage ? <p className="submit-message">{submitMessage}</p> : null}
        {submitError ? <p className="submit-error">{submitError}</p> : null}
      </form>

      <p className="footer-switch">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            const fallbackPath = isLogin ? '/register/student' : '/login/student'
            const preferredPath = isLogin
              ? ROLE_ROUTES[page.role].register
              : ROLE_ROUTES[page.role].login
            navigate(preferredPath ?? fallbackPath)
          }}
        >
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </section>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  withToggle = false,
  onToggle,
  isVisible = false,
}) {
  return (
    <div className="field-group">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrap">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'input-error' : ''}
        />
        {withToggle && (
          <button
            type="button"
            className="toggle-visibility"
            onClick={onToggle}
            aria-label={isVisible ? 'Hide password' : 'Show password'}
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}

export default App
