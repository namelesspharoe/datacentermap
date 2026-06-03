import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase, useSupabase } from '../services/supabaseClient'

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isMockAuth: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_USER: AuthUser = {
  id: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo Contributor',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isMockAuth = !useSupabase

  useEffect(() => {
    if (!useSupabase || !supabase) {
      const stored = localStorage.getItem('dc-map-demo-user')
      if (stored === '1') setUser(DEMO_USER)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          displayName:
            (session.user.user_metadata?.display_name as string) ??
            session.user.email ??
            'User',
        })
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          displayName:
            (session.user.user_metadata?.display_name as string) ??
            session.user.email ??
            'User',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInDemo = useCallback(() => {
    localStorage.setItem('dc-map-demo-user', '1')
    setUser(DEMO_USER)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!useSupabase || !supabase) {
      signInDemo()
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [signInDemo])

  const signUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      if (!useSupabase || !supabase) {
        signInDemo()
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName ?? email.split('@')[0] },
        },
      })
      if (error) throw error
    },
    [signInDemo],
  )

  const signOut = useCallback(async () => {
    if (!useSupabase || !supabase) {
      localStorage.removeItem('dc-map-demo-user')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isMockAuth,
      signIn,
      signUp,
      signInDemo,
      signOut,
    }),
    [user, loading, isMockAuth, signIn, signUp, signInDemo, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
