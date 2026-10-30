import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, persistenceReady } from '../services/firebase.js'

const AuthContext = createContext(null)

const AUTH_ERRORS = {
  'auth/invalid-email': 'El correo electrónico no es válido.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth/network-request-failed': 'No pudimos conectar con Firebase. Revisa tu conexión.',
  'auth/invalid-api-key': 'La configuración de Firebase no es válida.',
  'auth/configuration-not-found':
    'Firebase Authentication no está configurado en el proyecto.',
  'auth/operation-not-allowed':
    'El inicio de sesión con correo y contraseña no está habilitado.'
}

function mapUser(firebaseUser) {
  if (!firebaseUser) return null
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    username:
      firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Administrador'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let active = true
    persistenceReady.catch(() => undefined)

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!active) return
        setUser(mapUser(firebaseUser))
        setInitializing(false)
      },
      () => {
        if (!active) return
        setUser(null)
        setInitializing(false)
      }
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    await persistenceReady.catch(() => undefined)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const nextUser = mapUser(credential.user)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      throw new Error(
        AUTH_ERRORS[error?.code] || 'No pudimos iniciar sesión. Inténtalo de nuevo.'
      )
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
    } catch {
      void 0
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      logout
    }),
    [user, initializing, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
