// App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import NavigationBar from './components/NavigationBar'
import HomePage from './pages/Home'
import UploadPage from './pages/Upload'
import ResultsPage from './pages/Results'
import AboutPage from './pages/About'
import './App.css'

// Import local images - these should be in your src/assets folder
// If these don't exist, you can use the fallback URLs or create placeholder images
import bgImage1 from './assets/destroyer.jpg'
import bgImage2 from './assets/earth.jpg'
import bgImage3 from './assets/whirlwind.jpg'

// Wrapper component to handle routing logic
function AppContent() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('home')
  const [bgImageIndex, setBgImageIndex] = useState(0)

  // Try to use local images
  const backgroundImages = [
    bgImage1,
    bgImage2,
    bgImage3
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handlePageChange = (page) => {
    setActivePage(page)
    navigate(`/${page === 'home' ? '' : page}`)
  }

  return (
    <div className="app">
      {/* Background slideshow */}
      <div className="background-container">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`background-image ${index === bgImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="app-content">
        <NavigationBar
          activePage={activePage}
          setActivePage={handlePageChange}
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/upload"
              element={<UploadPage />}
            />

            <Route
              path="/results"
              element={<ResultsPage />}
            />

            <Route
              path="/about"
              element={<AboutPage />}
            />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Deep Keel</h3>
              <p>AI Warship Classification</p>
            </div>
            <div className="footer-info">
              <p>© 2025 UC Berkeley MIDS Capstone Project</p>
              <p>Identifying warships with AI</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Main App component with Router wrapper
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App