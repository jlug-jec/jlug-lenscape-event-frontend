import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import GalleryPage from './pages/GalleryPage'
import AuthLoginPage from './pages/AuthLoginPage'
import AuthSignupPage from './pages/AuthSignupPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import SubmitPage from './pages/SubmitPage'
import SmoothScroll from './components/SmoothScroll'
import RouteAnalytics from './components/RouteAnalytics'
import { AppProvider } from './context/AppContext'
import GrainOverlay from './components/GrainOverlay'

function App() {
  return (
    <AppProvider>
      <Router>
        <GrainOverlay />
        <RouteAnalytics />
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/auth" element={<Navigate to="/auth/signup" replace />} />
            <Route path="/auth/login" element={<AuthLoginPage />} />
            <Route path="/auth/signup" element={<AuthSignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/setup" element={<ProfileSetupPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            {/* Admin — no link from nav, direct URL only */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Routes>
        </SmoothScroll>
      </Router>
    </AppProvider>
  )
}

export default App
