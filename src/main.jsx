import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'

function Root() {
  const [showApp, setShowApp] = useState(false);
  return showApp
    ? <App />
    : <LandingPage onEnter={() => setShowApp(true)} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
