// components/NavigationBar.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import binocularsIcon from '../assets/binoculars.png'
import './NavigationBar.css'

const NavigationBar = ({ hasResults }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Derive active page from current route
    const getActivePageFromPath = (pathname) => {
        if (pathname === '/' || pathname === '/home') return 'home'
        if (pathname === '/upload') return 'upload'
        if (pathname === '/results') return 'results'
        if (pathname === '/about') return 'about'
        return 'home'
    }

    const activePage = getActivePageFromPath(location.pathname)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && !event.target.closest('.navigation')) {
                setMobileMenuOpen(false)
            }
        }

        if (mobileMenuOpen) {
            document.addEventListener('click', handleClickOutside)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
            document.body.style.overflow = 'unset'
        }
    }, [mobileMenuOpen])

    // Close menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleNavClick = (page) => {
        if (page === 'results' && !hasResults) {
            return // Don't navigate if no results
        }

        // Navigate using React Router
        const routes = {
            'home': '/',
            'upload': '/upload',
            'results': '/results',
            'about': '/about'
        }

        navigate(routes[page])
        setMobileMenuOpen(false)
    }

    const handleMenuToggle = (e) => {
        e.stopPropagation()
        setMobileMenuOpen(!mobileMenuOpen)
    }

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <div className="logo-wrapper">
                        <img
                            src={binocularsIcon}
                            alt="Eyes in the Sky Shield"
                            className="logo-icon"
                        />
                        <div className="brand-text">
                            <h1>Deep Keel</h1>
                            <p>AI Warship Classification</p>
                        </div>
                    </div>
                </div>

                <button
                    className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={handleMenuToggle}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span className="bar bar-1"></span>
                    <span className="bar bar-2"></span>
                    <span className="bar bar-3"></span>
                </button>

                <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <li>
                        <button
                            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
                            onClick={() => handleNavClick('home')}
                            type="button"
                        >
                            Home
                        </button>
                    </li>
                    <li>
                        <button
                            className={`nav-link ${activePage === 'upload' ? 'active' : ''}`}
                            onClick={() => handleNavClick('upload')}
                            type="button"
                        >
                            Upload
                        </button>
                    </li>
                    <li>
                        <button
                            className={`nav-link ${activePage === 'results' ? 'active' : ''} ${!hasResults ? 'disabled' : ''}`}
                            onClick={() => handleNavClick('results')}
                            disabled={!hasResults}
                            type="button"
                        >
                            Results
                        </button>
                    </li>
                    <li>
                        <button
                            className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
                            onClick={() => handleNavClick('about')}
                            type="button"
                        >
                            About
                        </button>
                    </li>
                </ul>

                {mobileMenuOpen && (
                    <div
                        className="mobile-menu-overlay"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
            </div>
        </nav>
    )
}

export default NavigationBar