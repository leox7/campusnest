import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthField from '../../components/auth/AuthField'
import { ROLE_ROUTES, ROUTE_META } from '../../constants/auth.constants'
import { loginUser, registerUser } from '../../services/auth.service'

function AuthPage({ routePath }) {
  const navigate = useNavigate()
  const page = ROUTE_META[routePath] ?? ROUTE_META['/login/student']
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
        const { token, user } = await loginUser({
          email: fields.email,
          password: fields.password,
          expectedRole: page.role,
        })

        if (user.role !== page.role) {
          setSubmitError(`This account is not allowed for ${page.role} login.`)
          return
        }

        const storage = fields.rememberMe ? localStorage : sessionStorage
        storage.setItem('campusnest_token', token)
        storage.setItem('campusnest_user', JSON.stringify(user))
        setSubmitMessage(`Welcome back! Logged in as ${user.role}.`)
        if (user.role === 'student') {
          navigate('/dashboard/student')
        } else if (user.role === 'landlord') {
          navigate('/dashboard/landlord')
        }
      } else {
        await registerUser({
          fullName: fields.fullName,
          email: fields.email,
          password: fields.password,
          userRole: page.role,
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
          <AuthField
            label="Full Name"
            name="fullName"
            value={fields.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.fullName}
          />
        )}

        <AuthField
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

        <AuthField
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
          <AuthField
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

export default AuthPage
