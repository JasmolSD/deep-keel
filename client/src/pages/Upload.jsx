// pages/Upload.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutocomplete } from '../components/upload/useAutocomplete'
import {
    IdentificationSection,
    DimensionsSection,
    HullSection,
    SuperstructureSection,
    WeaponsSection,
    AviationSection,
    BuildInfoSection
} from '../components/upload/FormSections'
import { INITIAL_FORM_STATE } from '../components/upload/uploadConstants'
import { submitClassification } from '../api'
import { generateMockReport } from '../utils/mockReport'
import './Upload.css'

const UploadPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)

    const {
        suggestions,
        showSuggestions,
        handleAutocomplete,
        selectSuggestion,
        hideAutocompleteSuggestions
    } = useAutocomplete()

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async () => {
        console.log('Submit button clicked');

        // Validate required fields
        const requiredFields = {
            'Length Min': formData.length_metres_min,
            'Length Max': formData.length_metres_max,
            'Beam Min': formData.beam_metres_min,
            'Beam Max': formData.beam_metres_max,
            'Draught Min': formData.draught_metres_min,
            'Draught Max': formData.draught_metres_max,
            'Hull Form': formData.hull_form,
            'Hull Shape': formData.hull_shape,
            'Bow Shape': formData.bow_shape
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field, _]) => field);

        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields:\n- ${missingFields.join('\n- ')}`);
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('Starting classification...');

            // Try real API first, fall back to mock if backend not available
            let classificationResult;
            try {
                classificationResult = await submitClassification(formData);
                console.log('Backend response:', classificationResult);
            } catch (apiError) {
                console.warn('Backend not available, using mock data:', apiError.message);
                // Use mock report for development
                classificationResult = generateMockReport(formData);
                console.log('Mock data generated:', classificationResult);
            }

            // Transform classification results to match existing Results page format
            const resultsData = {
                vessels_detected: classificationResult.total_matches || 0,
                risk_score: calculateRiskScore(classificationResult.matches),
                processing_time: classificationResult.processing_time || (Math.random() * 3 + 1).toFixed(2),
                anomalies: transformMatchesToAnomalies(classificationResult.matches),
                image_metadata: {
                    filename: 'classification_query.json',
                    size_mb: 0.01,
                    analysis_timestamp: Date.now() / 1000
                },
                // Store original classification data for report download
                classification_data: classificationResult
            };

            console.log('Transformed results:', resultsData);
            console.log('Navigating to /results...');

            // Navigate to existing results page
            navigate('/results', { state: { results: resultsData } });

        } catch (err) {
            console.error('Error during submission:', err);
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    // Calculate risk score based on number and confidence of matches
    const calculateRiskScore = (matches) => {
        if (!matches || matches.length === 0) return 0.1;

        // More matches with high confidence = lower risk (known vessels)
        // Few matches with low confidence = higher risk (unknown vessels)
        const avgConfidence = matches.reduce((sum, m) => sum + (m.confidence || 0.5), 0) / matches.length;
        const normalizedCount = Math.min(matches.length / 10, 1);

        // Inverse relationship: high confidence + many matches = low risk
        return Math.max(0, Math.min(1, 1 - (avgConfidence * normalizedCount * 0.8)));
    }

    // Transform matches into anomaly format for existing Results page
    const transformMatchesToAnomalies = (matches) => {
        if (!matches || matches.length === 0) return [];

        // Take top 5 matches and format as anomalies
        return matches.slice(0, 5).map((match, index) => ({
            id: `vessel-${index}`,
            type: match.ship_type || 'unknown_vessel',
            confidence: match.confidence || 0.85,
            coordinates: {
                lat: 0.0, // Could be added from form if location data is collected
                lng: 0.0
            },
            risk_factors: [
                match.ship_class || 'unknown_class',
                match.country || 'unknown_country',
                ...(match.ship_role ? [match.ship_role] : [])
            ].filter(Boolean)
        }));
    }

    const handleClearForm = () => {
        if (window.confirm('Clear all form data?')) {
            setFormData(INITIAL_FORM_STATE)
            setError(null)
        }
    }

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(formData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${formData.ship_name || 'ship_data'}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const sectionProps = {
        formData,
        handleInputChange,
        handleAutocomplete,
        suggestions,
        showSuggestions,
        selectSuggestion,
        hideAutocompleteSuggestions
    }

    return (
        <div className="upload-page">
            <div className="classification-container single-page">
                <div className="classification-header">
                    <h2>Warship Classification System</h2>
                    <p>Enter observed features for vessel identification and classification</p>
                </div>

                <div className="form-content-single-page">
                    <IdentificationSection {...sectionProps} />
                    <DimensionsSection {...sectionProps} />
                    <HullSection {...sectionProps} />
                    <SuperstructureSection {...sectionProps} />
                    <WeaponsSection {...sectionProps} />
                    <AviationSection {...sectionProps} />
                    <BuildInfoSection {...sectionProps} />
                </div>

                {error && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                        </svg>
                        <span style={{ whiteSpace: 'pre-line' }}>{error}</span>
                    </div>
                )}

                <div className="form-actions">
                    <button
                        className="btn-secondary"
                        onClick={handleClearForm}
                        disabled={uploading}
                    >
                        Clear Form
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleExportJSON}
                        disabled={uploading}
                    >
                        Export JSON
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            'Submit Query'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadPage