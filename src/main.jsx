import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './useAuth.jsx'
import LandingPage from './LandingPage.jsx'
import App from './App.jsx'
import ResetPassword from './ResetPassword.jsx'

// ─── Route guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  return user ? children : <Navigate to="/" replace />;
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#faf6ee" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🎓</div>
        <div style={{ fontSize:14, color:"#9e7060", fontFamily:"'DM Sans',sans-serif" }}>Indlæser...</div>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
function AppRouter() {
  const { loading } = useAuth();

  // Vis loader mens session tjekkes
  if (loading) return <Loader />;

  // Password-reset link fra e-mail — håndter INDEN normal routing
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace("#", ""));
  if (params.get("type") === "recovery") {
    return <ResetPassword />;
  }

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected route — kun adgang hvis logget ind */}
      <Route path="/chat" element={
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      } />

      {/* Alle ukendte URLs → forsiden */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/fagai">
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
