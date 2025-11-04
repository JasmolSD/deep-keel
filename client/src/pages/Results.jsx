// pages/Results.jsx
import './Results.css'
import { useLocation, useNavigate } from 'react-router-dom';

const Results = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state?.results;

    const handleNewAnalysis = () => {
        navigate('/upload');
    };

    const handleDownloadReport = () => {
        if (!results?.classification_data?.report_text) return;

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `warship_classification_report_${timestamp}.txt`;

        // Create blob and download
        const blob = new Blob([results.classification_data.report_text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getRiskLevel = (score) => {
        if (score < 0.3) return { level: 'Low', class: 'low' }
        if (score < 0.6) return { level: 'Medium', class: 'medium' }
        return { level: 'High', class: 'high' }
    }

    // Handle no results case
    if (!results) {
        return (
            <div className="results-page">
                <div className="results-header">
                    <h2>No Results Available</h2>
                    <button className="btn-primary" onClick={handleNewAnalysis}>
                        New Analysis
                    </button>
                </div>
            </div>
        );
    }

    const risk = getRiskLevel(results.risk_score)

    return (
        <div className="results-page">
            <div className="results-header">
                <h2>Analysis Complete</h2>
                <div className="header-actions">
                    {results.classification_data?.report_text && (
                        <button className="btn-secondary" onClick={handleDownloadReport}>
                            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                            </svg>
                            Download Report
                        </button>
                    )}
                    <button className="btn-secondary" onClick={handleNewAnalysis}>
                        New Analysis
                    </button>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="card-value">{results.vessels_detected}</div>
                    <div className="card-label">Vessels Detected</div>
                </div>

                <div className={`summary-card risk-card risk-${risk.class}`}>
                    <div className="risk-meter">
                        <svg viewBox="0 0 100 50">
                            <path
                                d="M 10 45 A 35 35 0 0 1 90 45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                opacity="0.2"
                            />
                            <path
                                d="M 10 45 A 35 35 0 0 1 90 45"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${results.risk_score * 110} 110`}
                            />
                        </svg>
                        <div className="risk-value">{(results.risk_score * 100).toFixed(0)}%</div>
                    </div>
                    <div className="card-label">{risk.level} Risk</div>
                </div>

                <div className="summary-card">
                    <div className="card-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="card-value">{results.processing_time}s</div>
                    <div className="card-label">Processing Time</div>
                </div>
            </div>

            {results.anomalies && results.anomalies.length > 0 && (
                <div className="anomalies-section">
                    <h3>Potential Matches</h3>
                    <div className="anomalies-grid">
                        {results.anomalies.map((anomaly) => (
                            <div key={anomaly.id} className="anomaly-card">
                                <div className="anomaly-header">
                                    <div className="anomaly-type">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" />
                                        </svg>
                                        {anomaly.type.replace('_', ' ')}
                                    </div>
                                    <div className="confidence-badge">
                                        {(anomaly.confidence * 100).toFixed(0)}%
                                    </div>
                                </div>

                                <div className="anomaly-location">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
                                    </svg>
                                    {anomaly.coordinates.lat.toFixed(4)}°, {anomaly.coordinates.lng.toFixed(4)}°
                                </div>

                                <div className="risk-factors">
                                    {anomaly.risk_factors.map((factor) => (
                                        <span key={factor} className="risk-tag">
                                            {factor.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.image_metadata && (
                <div className="metadata-section">
                    <h3>Analysis Details</h3>
                    <div className="metadata-card">
                        <div className="metadata-row">
                            <span className="metadata-label">Filename</span>
                            <span className="metadata-value">{results.image_metadata.filename}</span>
                        </div>
                        <div className="metadata-row">
                            <span className="metadata-label">File Size</span>
                            <span className="metadata-value">{results.image_metadata.size_mb} MB</span>
                        </div>
                        <div className="metadata-row">
                            <span className="metadata-label">Analyzed</span>
                            <span className="metadata-value">
                                {new Date(results.image_metadata.analysis_timestamp * 1000).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Results