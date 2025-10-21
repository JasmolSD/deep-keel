// App.jsx
import { useState, useEffect } from 'react'
import { uploadFile } from './api'
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

function App() {
  const [activePage, setActivePage] = useState('home')
  const [results, setResults] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [bgImageIndex, setBgImageIndex] = useState(0)

  // Try to use local images, fallback to URLs
  const backgroundImages = [
    bgImage1 || bgImages[0],
    bgImage2 || bgImages[1],
    bgImage3 || bgImages[2]
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleFileUpload = async (file) => {
    setUploading(true)
    setError(null)

    try {
      const response = await uploadFile(file)
      setResults(response.results)
      setActivePage('results')
    } catch (err) {
      setError(err.message || 'Failed to analyze file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleNewAnalysis = () => {
    setResults(null)
    setError(null)
    setActivePage('upload')
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
          setActivePage={setActivePage}
          hasResults={!!results}
        />

        <main className="main-content">
          {activePage === 'home' && (
            <HomePage onStart={() => setActivePage('upload')} />
          )}

          {activePage === 'upload' && (
            <UploadPage
              onFileUpload={handleFileUpload}
              uploading={uploading}
              error={error}
            />
          )}

          {activePage === 'results' && results && (
            <ResultsPage
              results={results}
              onNewAnalysis={handleNewAnalysis}
            />
          )}

          {activePage === 'about' && (
            <AboutPage />
          )}
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

export default App