// pages/Home.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const HomePage = () => {
    const navigate = useNavigate()
    const statsRef = useRef(null)
    const featuresRef = useRef(null)
    const [isStatsVisible, setIsStatsVisible] = useState(false)
    const [isFeaturesVisible, setIsFeaturesVisible] = useState(false)

    useEffect(() => {
        const observerOptions = { threshold: 0.1 }

        const statsObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsStatsVisible(true)
        }, observerOptions)

        const featuresObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setIsFeaturesVisible(true)
        }, observerOptions)

        if (statsRef.current) statsObserver.observe(statsRef.current)
        if (featuresRef.current) featuresObserver.observe(featuresRef.current)

        return () => {
            statsObserver.disconnect()
            featuresObserver.disconnect()
        }
    }, [])

    const handleStart = () => {
        navigate('/upload')
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot" />
                        Naval Intelligence System
                    </div>
                    <h1 className="hero-title">
                        Deep Keel
                        <span className="hero-highlight">Classification Engine</span>
                    </h1>
                    <p className="hero-description">
                        A real-time warship identification system powered by multi-parameter
                        similarity matching. Input observed vessel characteristics from hull
                        dimensions to radar configuration and receive instant classification
                        results with confidence scores and reference documentation.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary btn-large" onClick={handleStart}>
                            <span>Begin Classification</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button
                            className="btn-secondary btn-large"
                            onClick={() => document.getElementById('learn-more').scrollIntoView({ behavior: 'smooth' })}
                        >
                            System Overview
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} className="stats-section">
                <div className="section-container">
                    <div className={`stats-grid ${isStatsVisible ? 'animate-in' : ''}`}>
                        <div className="stat-card">
                            <div className="stat-number">3,000+</div>
                            <div className="stat-label">Naval Vessels in Database</div>
                            <div className="stat-sublabel">Active & historical warships</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">&lt;6s</div>
                            <div className="stat-label">Classification Speed</div>
                            <div className="stat-sublabel">Real-time identification</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">98.3%</div>
                            <div className="stat-label">Match Accuracy</div>
                            <div className="stat-sublabel">Multi-parameter similarity</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">30+</div>
                            <div className="stat-label">Search Parameters</div>
                            <div className="stat-sublabel">Physical & systems data</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="learn-more" ref={featuresRef} className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-tag">SYSTEM CAPABILITIES</span>
                        <h2 className="section-title">Multi-Parameter Classification</h2>
                        <p className="section-description">
                            Deep Keel analyzes vessel characteristics across four distinct feature categories,
                            computing weighted similarity scores to identify matching ship classes.
                        </p>
                    </div>
                    <div className={`features-grid ${isFeaturesVisible ? 'animate-in' : ''}`}>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                            <h3>Physical Dimensions</h3>
                            <p>
                                Analyze hull length, beam width, draught, displacement tonnage,
                                and speed characteristics with range-based matching.
                            </p>
                            <div className="feature-tags">
                                <span>Length</span>
                                <span>Beam</span>
                                <span>Draught</span>
                                <span>Speed</span>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3>Hull &amp; Superstructure</h3>
                            <p>
                                Hull form, bow shape, superstructure layout, funnel arrangement,
                                and mast configuration patterns.
                            </p>
                            <div className="feature-tags">
                                <span>Hull Form</span>
                                <span>Bow Shape</span>
                                <span>Funnels</span>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                </svg>
                            </div>
                            <h3>Weapons &amp; Sensors</h3>
                            <p>
                                Gun mount positions and sizes, missile systems, CIWS placement,
                                torpedo tubes, and radar configuration.
                            </p>
                            <div className="feature-tags">
                                <span>Armament</span>
                                <span>CIWS</span>
                                <span>Radar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="process-section">
                <div className="section-container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-grid">
                        <div className="process-card">
                            <div className="process-number">1</div>
                            <h3>Input Observations</h3>
                            <p>
                                Enter observed vessel characteristics through an intuitive form.
                                Specify physical dimensions, visual features, and identifiable systems.
                            </p>
                        </div>
                        <div className="process-card">
                            <div className="process-number">2</div>
                            <h3>Similarity Analysis</h3>
                            <p>
                                The engine computes weighted similarity scores across numerical,
                                categorical, and binary feature spaces.
                            </p>
                        </div>
                        <div className="process-card">
                            <div className="process-number">3</div>
                            <h3>Classification Report</h3>
                            <p>
                                Receive ranked matches with confidence percentages, ship class
                                identification, and reference page numbers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to Begin Classification?</h2>
                    <p>
                        Access the Deep Keel classification engine and identify
                        naval vessels with multi-parameter similarity matching.
                    </p>
                    <button className="btn-primary btn-large" onClick={handleStart}>
                        <span>Launch Classification</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </section>
        </div>
    )
}

export default HomePage