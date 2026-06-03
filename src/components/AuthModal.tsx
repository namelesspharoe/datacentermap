import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSupabase } from '../services/supabaseClient'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInDemo, isMockAuth } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName || undefined)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {isMockAuth && (
          <p className="notice">
            Supabase is off. Use demo sign-in to try contributions locally, or set{' '}
            <code>VITE_USE_SUPABASE=true</code> in <code>.env</code>.
          </p>
        )}

        {useSupabase ? (
          <form className="contrib-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label>
                Display name
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => { signInDemo(); onClose() }}>
            Continue as demo contributor
          </button>
        )}

        {useSupabase && (
          <p className="auth-toggle">
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('signup')}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Have an account?{' '}
                <button type="button" className="link-btn" onClick={() => setMode('signin')}>
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
