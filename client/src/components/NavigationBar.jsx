// components/NavigationBar.jsx
import { useState } from 'react'
import './NavigationBar.css'

const NavigationBar = ({ activePage, setActivePage, hasResults }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-brand">
                    <div className="logo-wrapper">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V12C2 16.5 4.73 20.61 9 21.84V19.79C5.86 18.64 4 15.54 4 12.03V8.27L12 4.44L20 8.27V12.03C20 12.63 19.94 13.22 19.84 13.79L21.8 15.74C21.93 15.17 22 14.59 22 14V7L12 2Z" fill="currentColor" />
                            <path d="M19.07 16.17L21.09 18.19L22.16 17.12L20.14 15.1L19.07 16.17ZM17.65 17.59L15.63 15.57L14.56 16.64L16.58 18.66L17.65 17.59ZM19.07 21.32L17.05 19.3L15.98 20.37L18 22.39L19.07 21.32ZM22.16 20.25L20.14 18.23L19.07 19.3L21.09 21.32L22.16 20.25Z" fill="currentColor" />
                        </svg>
                        <div className="brand-text">
                            <h1>Eyes in the Sky</h1>
                            <p>Maritime Security Analysis</p>
                        </div>
                    </div>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <li>
                        <a
                            className={activePage === 'home' ? 'active' : ''}
                            onClick={() => { setActivePage('home'); setMobileMenuOpen(false) }}
                        >
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            className={activePage === 'upload' ? 'active' : ''}
                            onClick={() => { setActivePage('upload'); setMobileMenuOpen(false) }}
                        >
                            Upload
                        </a>
                    </li>
                    <li>
                        <a
                            className={`${activePage === 'results' ? 'active' : ''} ${!hasResults ? 'disabled' : ''}`}
                            onClick={() => { if (hasResults) { setActivePage('results'); setMobileMenuOpen(false) } }}
                        >
                            Results
                        </a>
                    </li>
                    <li>
                        <a
                            className={activePage === 'about' ? 'active' : ''}
                            onClick={() => { setActivePage('about'); setMobileMenuOpen(false) }}
                        >
                            About
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default NavigationBar