import { useAuth } from '../context/AuthContext'
import { useSupabase } from '../services/supabaseClient'

interface HeaderProps {
  onSignInClick: () => void
}

export function Header({ onSignInClick }: HeaderProps) {
  const { user, signOut, isMockAuth } = useAuth()

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>Data Center & County Officials Map</h1>
          <p className="tagline">US facilities · community-sourced official contacts</p>
        </div>
      </div>
      <div className="header-actions">
        {user ? (
          <>
            <span className="user-chip">
              <span className="user-chip-avatar" aria-hidden="true">
                {user.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="user-chip-name">{user.displayName}</span>
              {isMockAuth && <span className="badge badge-demo">Demo</span>}
            </span>
            <button type="button" className="btn btn-secondary" onClick={() => void signOut()}>
              Sign out
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onSignInClick}>
            <span className="btn-icon-left" aria-hidden="true">+</span>
            Sign in to contribute
          </button>
        )}
        {!useSupabase && (
          <span className="env-hint" title="Enable Supabase in .env for real accounts">
            Local mode
          </span>
        )}
      </div>
    </header>
  )
}
