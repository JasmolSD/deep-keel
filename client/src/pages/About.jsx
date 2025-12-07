// pages/About.jsx
import './About.css'
import jasmolPhoto from '../assets/team_photos/jasmol.JPG'
import sarahPhoto from '../assets/team_photos/sarah.jpg'
import wesleyPhoto from '../assets/team_photos/wesley.JPEG'
import daniellePhoto from '../assets/team_photos/danielle.jpg'

const AboutPage = () => {
    return (
        <div className="about-page">
            <div className="about-container">
                <div className="about-header">
                    <span className="about-tag">ABOUT THE PROJECT</span>
                    <h2>Deep Keel</h2>
                    <p className="lead">
                        A real-time warship classification engine designed for maritime decision support.
                        Input observed vessel characteristics and receive instant identification with
                        confidence scores and reference documentation.
                    </p>
                </div>

                <div className="about-content">
                    <section className="about-section">
                        <h3>The Challenge</h3>
                        <p>
                            Maritime situational awareness requires rapid identification of naval vessels
                            from partial observations. Traditional methods rely on manual reference lookups
                            across extensive documentation, a time-consuming process that delays critical
                            decision-making. Deep Keel automates this classification workflow, enabling
                            analysts to match observed characteristics against a comprehensive database of
                            over 3,000 naval vessels in seconds.
                        </p>
                    </section>

                    <section className="about-section">
                        <h3>How It Works</h3>
                        <div className="tech-grid">
                            <div className="tech-item">
                                <div className="tech-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                        <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                    </svg>
                                </div>
                                <h4>Multi-Parameter Input</h4>
                                <p>
                                    Enter observed characteristics including physical dimensions, hull form,
                                    superstructure layout, weapons systems, and radar configuration
                                </p>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                    </svg>
                                </div>
                                <h4>Similarity Computation</h4>
                                <p>
                                    Weighted similarity scores computed across numerical, categorical,
                                    text, and binary feature spaces using cosine similarity and range matching
                                </p>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14,2 14,8 20,8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10,9 9,9 8,9" />
                                    </svg>
                                </div>
                                <h4>Classification Report</h4>
                                <p>
                                    Ranked results with match confidence percentages, ship class identification,
                                    country of origin, and reference page numbers for verification
                                </p>
                            </div>
                            <div className="tech-item">
                                <div className="tech-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="9" y1="21" x2="9" y2="9" />
                                    </svg>
                                </div>
                                <h4>Aggregated Results</h4>
                                <p>
                                    Results grouped by ship class with individual vessel names listed,
                                    enabling both class-level and specific vessel identification
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Feature Categories</h3>
                        <div className="feature-categories">
                            <div className="category-item">
                                <div className="category-header">
                                    <span className="category-weight">30%</span>
                                    <h4>Numerical Features</h4>
                                </div>
                                <p>
                                    Length, beam, draught, speed, and
                                    other quantitative features.
                                </p>
                            </div>
                            <div className="category-item">
                                <div className="category-header">
                                    <span className="category-weight">10%</span>
                                    <h4>Categorical and Text Features</h4>
                                </div>
                                <p>
                                    Hull form, bow shape, superstructure layout, funnel arrangement,
                                    and other descriptive categorical and text fields analyzed
                                    using TF-IDF vectorization.
                                </p>
                            </div>
                            <div className="category-item">
                                <div className="category-header">
                                    <span className="category-weight">60%</span>
                                    <h4>Binary Features</h4>
                                </div>
                                <p>
                                    Flight deck presence, helicopter platform, hangar facilities,
                                    and other boolean characteristics.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>System Capabilities</h3>
                        <div className="capabilities-list">
                            <div className="capability-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                <div>
                                    <h4>Range-Based Matching</h4>
                                    <p>Specify minimum and maximum values for numerical parameters to accommodate observational uncertainty</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                <div>
                                    <h4>Dynamic Weight Normalization</h4>
                                    <p>Weights automatically adjusted based on which feature categories are provided in the query</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                <div>
                                    <h4>Hybrid Search Mode</h4>
                                    <p>Combine exact filters with similarity search to fill remaining result slots when filter matches are limited</p>
                                </div>
                            </div>
                            <div className="capability-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12" />
                                </svg>
                                <div>
                                    <h4>Reference Documentation</h4>
                                    <p>Each result includes page numbers linking to source documentation for analyst verification</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Database Coverage</h3>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-value">3,000+</span>
                                <span className="stat-desc">Naval Vessels</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">100+</span>
                                <span className="stat-desc">Countries</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">30+</span>
                                <span className="stat-desc">Parameters</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">30%</span>
                                <span className="stat-desc">Confidence Threshold</span>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Team</h3>
                        <p>
                            Developed by UC Berkeley Master of Information and Data Science (MIDS) students
                            as part of the Capstone Project (DATASCI 210). Our team combines expertise in
                            machine learning, similarity search algorithms, and maritime domain knowledge.
                        </p>
                        <div className="team-grid">
                            <div className="team-card">
                                <div className="team-avatar">
                                    <img src={jasmolPhoto} alt="Jasmol Dhesi" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    <span className="avatar-fallback">JD</span>
                                </div>
                                <div className="team-info">
                                    <h4>Jasmol Dhesi</h4>
                                    <span className="team-role">Project Manager & DevOps</span>
                                    <p>Leading project coordination, delivery milestones, and product deployment to production</p>
                                    <a href="https://www.linkedin.com/in/jasmoldhesi/" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                            <div className="team-card">
                                <div className="team-avatar">
                                    <img src={sarahPhoto} alt="Sarah Farooq" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    <span className="avatar-fallback">SF</span>
                                </div>
                                <div className="team-info">
                                    <h4>Sarah Farooq</h4>
                                    <span className="team-role">AI Engineer</span>
                                    <p>Developing similarity search algorithms and machine learning classification models</p>
                                    <a href="https://www.linkedin.com/in/sarah-farooq/" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                            <div className="team-card">
                                <div className="team-avatar">
                                    <img src={wesleyPhoto} alt="Wesley Thomas" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    <span className="avatar-fallback">WT</span>
                                </div>
                                <div className="team-info">
                                    <h4>Wesley Thomas</h4>
                                    <span className="team-role">AWS Architect & AI Engineer</span>
                                    <p>Designing cloud infrastructure and implementing scalable ML pipelines</p>
                                    <a href="http://linkedin.com/in/wesley-thomas-76b9ab155" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                            <div className="team-card">
                                <div className="team-avatar">
                                    <img src={daniellePhoto} alt="Danielle Yoseloff" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    <span className="avatar-fallback">DY</span>
                                </div>
                                <div className="team-info">
                                    <h4>Danielle Yoseloff</h4>
                                    <span className="team-role">Research Scientist & SME Liaison</span>
                                    <p>Conducting domain research and coordinating with naval subject matter experts</p>
                                    <a href="https://www.linkedin.com/in/danielleyoseloff/" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Acknowledgements</h3>
                        <p>
                            We extend our sincere gratitude to the subject matter experts and advisors
                            who provided invaluable guidance throughout this project.
                        </p>

                        <div className="acknowledgements-container">
                            <div className="acknowledgement-group">
                                <h4>Subject Matter Experts</h4>
                                <div className="acknowledgement-list">
                                    <div className="acknowledgement-item">
                                        <div className="ack-icon sme">
                                            {/* Anchor icon */}
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <circle cx="12" cy="5" r="3" />
                                                <line x1="12" y1="8" x2="12" y2="21" />
                                                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                                                <line x1="8" y1="8" x2="16" y2="8" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>LT Jacqueline Loyola</strong>
                                            <span>U.S. Navy Surface Warfare Officer & MIDS Alumni</span>
                                        </div>
                                    </div>
                                    <div className="acknowledgement-item">
                                        <div className="ack-icon sme">
                                            {/* Anchor icon */}
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <circle cx="12" cy="5" r="3" />
                                                <line x1="12" y1="8" x2="12" y2="21" />
                                                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                                                <line x1="8" y1="8" x2="16" y2="8" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>LCDR Michael Tomsic</strong>
                                            <span>U.S. Navy Surface Warfare Officer</span>
                                        </div>
                                    </div>
                                    <div className="acknowledgement-item">
                                        <div className="ack-icon sme">
                                            {/* Ship/boat icon for Coast Guard */}
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M2 20a2 2 0 0 0 2-2c0-1.5 1.5-2 3-2s2.5.5 3 2c.5 1.5 1.5 2 3 2s2.5-.5 3-2c.5-1.5 1.5-2 3-2s3 .5 3 2" />
                                                <path d="M4 16l-1-6h18l-1 6" />
                                                <path d="M7 10V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v4" />
                                                <line x1="12" y1="5" x2="12" y2="2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Karl Gunther</strong>
                                            <span>U.S. Coast Guard Chief</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="acknowledgement-group">
                                <h4>Advisors</h4>
                                <div className="acknowledgement-list">
                                    <div className="acknowledgement-item">
                                        <div className="ack-icon advisor">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Joyce J. Shen</strong>
                                            <span>MIDS Capstone Instructor</span>
                                        </div>
                                    </div>
                                    <div className="acknowledgement-item">
                                        <div className="ack-icon advisor">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Morgan G. Ames</strong>
                                            <span>MIDS Capstone Instructor</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default AboutPage