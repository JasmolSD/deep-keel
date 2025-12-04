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
        if (!results?.classification_data?.report_text) {
            console.error('No report text available');
            return;
        }

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

    // Handle no results case
    if (!results) {
        return (
            <div className="results-page">
                <div className="results-header">
                    <h2>No Results Available</h2>
                    <p>Please submit a classification query first.</p>
                    <button className="btn-primary" onClick={handleNewAnalysis}>
                        New Analysis
                    </button>
                </div>
            </div>
        );
    }

    const avgSimilarity = results.average_similarity || 0;
    const similarity = results.similarity_level || { level: 'Low', class: 'low' };

    return (
        <div className="results-page">
            <div className="results-header">
                <h2>Classification Complete</h2>
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
                            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="card-value">{results.vessels_detected}</div>
                    <div className="card-label">Matching Vessels</div>
                </div>

                <div className={`summary-card similarity-card similarity-${similarity.class}`}>
                    <div className="similarity-meter">
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
                                strokeDasharray={`${(avgSimilarity / 100) * 110} 110`}
                            />
                        </svg>
                        <div className="similarity-value">{avgSimilarity.toFixed(0)}%</div>
                    </div>
                    <div className="card-label">{similarity.level} Similarity of Top Match</div>
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

            {results.matches && results.matches.length > 0 && (
                <div className="matches-section">
                    <h3>Top Matching Vessels</h3>
                    <p className="section-description">
                        These vessels most closely match your search criteria based on similarity analysis
                    </p>
                    <div className="matches-grid">
                        {results.matches.map((match, index) => (
                            <div key={match.id} className="match-card">
                                <div className="match-header">
                                    <div className="match-type">
                                        <div className="match-rank">#{index + 1}</div>
                                        {match.type}
                                    </div>
                                    <div className="confidence-badge">
                                        {(match.confidence * 100).toFixed(1)}%
                                    </div>
                                </div>

                                <div className="match-ship-name">
                                    {match.name}
                                </div>

                                <div className="match-pages">
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                                    </svg>
                                    Pages: {match.pages}
                                </div>

                                <div className="match-factors">
                                    {match.match_factors.map((factor, idx) => (
                                        <span key={idx} className="match-tag">
                                            {factor.label}: {factor.value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {results.vessels_detected === 0 && (
                <div className="no-matches-section">
                    <div className="no-matches-card">
                        <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" opacity="0.5" />
                        </svg>
                        <h3>No Matching Vessels Found</h3>
                        <p>
                            Your search criteria did not match any vessels in the database.
                            Try adjusting your parameters or broadening your search.
                        </p>
                        <button className="btn-primary" onClick={handleNewAnalysis}>
                            Adjust Search Criteria
                        </button>
                    </div>
                </div>
            )}

            {results.image_metadata && (
                <div className="metadata-section">
                    <h3>Search Details</h3>
                    <div className="metadata-card">
                        <div className="metadata-row">
                            <span className="metadata-label">Query Name</span>
                            <span className="metadata-value">{results.image_metadata.filename}</span>
                        </div>
                        <div className="metadata-row">
                            <span className="metadata-label">DateTime</span>
                            <span className="metadata-value">
                                {new Date(results.image_metadata.analysis_timestamp * 1000).toLocaleString()}
                            </span>
                        </div>
                        {results.classification_data?.classification_id && (
                            <div className="metadata-row">
                                <span className="metadata-label">Classification ID</span>
                                <span className="metadata-value code">
                                    {results.classification_data.classification_id.slice(0, 8)}...
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Results