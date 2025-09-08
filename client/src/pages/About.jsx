// pages/About.jsx
import './About.css'

const AboutPage = () => {
    return (
        <div className="about-page">
            <div className="about-container">
                <div className="about-header">
                    <h2>About Eyes in the Sky</h2>
                    <p className="lead">
                        A privacy-first machine learning system designed to identify potential illegal trafficking
                        activities using satellite imagery and related data.
                    </p>
                </div>

                <div className="about-content">
                    <section className="about-section">
                        <h3>Our Mission</h3>
                        <p>
                            Eyes in the Sky addresses a critical intelligence gap: the ability to identify and assess
                            trafficking-related risks at scale. We provide humanitarian actors, NGOs, and enforcement
                            agencies with a responsive tool augmenting their situational awareness without enabling
                            misuse or mass surveillance.
                        </p>
                    </section>

                    <section className="about-section">
                        <h3>Technology Stack</h3>
                        <div className="tech-grid">
                            <div className="tech-item">
                                <h4>Vessel Detection</h4>
                                <p>Advanced SAR and optical imagery analysis using Swin Transformers and FPN backbone</p>
                            </div>
                            <div className="tech-item">
                                <h4>AIS Analysis</h4>
                                <p>Graph Neural Networks identify unusual vessel movements and dark shipping patterns</p>
                            </div>
                            <div className="tech-item">
                                <h4>Change Detection</h4>
                                <p>Temporal analysis identifies new coastal launch sites and unusual beach activity</p>
                            </div>
                            <div className="tech-item">
                                <h4>Night Lights</h4>
                                <p>VIIRS data analysis detects unusual nighttime coastal activity patterns</p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Privacy First</h3>
                        <div className="privacy-features">
                            <div className="privacy-item">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" />
                                </svg>
                                <div>
                                    <h4>No Personal Data</h4>
                                    <p>No collection or processing of personally identifiable information</p>
                                </div>
                            </div>
                            <div className="privacy-item">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                                </svg>
                                <div>
                                    <h4>Event-Level Aggregation</h4>
                                    <p>All outputs aggregated to site or event level only</p>
                                </div>
                            </div>
                            <div className="privacy-item">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor" />
                                </svg>
                                <div>
                                    <h4>Human Verification</h4>
                                    <p>All detections require analyst verification before action</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h3>Team</h3>
                        <p>
                            Developed by UC Berkeley MIDS students as part of the Capstone Project (MIDS 210).
                            Led by Jasmol Singh Dhesi, our team combines expertise in machine learning, satellite
                            imagery analysis, and humanitarian technology.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}

export default AboutPage