import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './AuthModal.jsx'

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Ét centralt sted for auth-state. Brug useAuth() i alle komponenter.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (u) => ({
    id:    u.id,
    email: u.email,
    name:  u.user_metadata?.full_name || u.email.split("@")[0],
  });

  useEffect(() => {
    // 1. Hent eksisterende session (sideopdatering)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    // 2. Lyt på alle fremtidige auth-ændringer
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    // user sættes til null automatisk via onAuthStateChange
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook til brug i komponenter
export function useAuth() {
  return useContext(AuthContext);
}
