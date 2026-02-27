function AuthField({
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

export default AuthField
