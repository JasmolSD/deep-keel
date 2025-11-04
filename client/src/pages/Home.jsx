// pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const HomePage = () => {
    const navigate = useNavigate()
    const statsRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (statsRef.current) {
            observer.observe(statsRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const handleStart = () => {
        navigate('/upload')
    }

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">AI-Powered Detection</div>
                    <h1 className="hero-title">
                        Protecting The Seas with
                        <span className="hero-highlight"> Machine Learning and AI</span>
                    </h1>
                    <p className="hero-description">
                        The sea-sentinel engine is a real-time classification engine designed for decision support.
                        Users supply defining operational characteristics, and the system rapidly
                        returns the most probable warship identification and class,
                        streamlining situational awareness tasks.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary btn-large" onClick={handleStart}>
                            Start Analysis
                        </button>
                        <button className="btn-secondary btn-large" onClick={() => document.getElementById('learn-more').scrollIntoView({ behavior: 'smooth' })}>
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            <section id="learn-more" className="features-section">
                <div className="section-container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                                </svg>
                            </div>
                            <h3>Upload Observations</h3>
                            <p>Upload ship descriptors using a user-friendly form.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor" />
                                </svg>
                            </div>
                            <h3>AI Analysis</h3>
                            <p>Our ML models take in user data, compare characteristics to ship classification data, and identifies similar vessels.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor" />
                                </svg>
                            </div>
                            <h3>Risk Assessment</h3>
                            <p>Get detailed risk scores and anomaly reports with confidence levels and page numbers from your manual.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section ref={statsRef} className="stats-section">
                <div className="section-container">
                    <div className={`stats-grid ${isVisible ? 'animate-in' : ''}`}>
                        <div className="stat-card">
                            <div className="stat-number">47K+</div>
                            <div className="stat-label">Naval Vessels Tracked Globally</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">98.3%</div>
                            <div className="stat-label">Ship Classification Accuracy</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">&lt;2 sec</div>
                            <div className="stat-label">Real-time Identification Speed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Maritime Surveillance Coverage</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomePage