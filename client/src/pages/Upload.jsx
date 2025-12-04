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
    BuildInfoSection,
    MatchSettingsSection
} from '../components/upload/FormSections'
import { INITIAL_FORM_STATE } from '../components/upload/uploadConstants'
import { submitClassification } from '../api'
import './Upload.css'

const UploadPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [fieldErrors, setFieldErrors] = useState({})

    const {
        suggestions,
        showSuggestions,
        handleAutocomplete,
        selectSuggestion,
        hideAutocompleteSuggestions
    } = useAutocomplete()

    /**
     * Validate a single field in real-time
     */
    const validateField = (fieldName, value) => {
        // Don't validate empty values - just clear errors
        if (!value || value === '') {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[fieldName];
                return updated;
            });
            return;
        }

        const numValue = parseFloat(value);

        // Check for invalid number
        if (isNaN(numValue)) {
            setFieldErrors(prev => ({ ...prev, [fieldName]: 'Invalid number' }));
            return;
        }

        // Check for negative values (HTML min="0" should catch this, but double-check)
        if (numValue < 0) {
            setFieldErrors(prev => ({ ...prev, [fieldName]: 'Must be 0 or greater' }));
            return;
        }

        // Clear error if basic validation passes
        setFieldErrors(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
        });

        // ONLY validate range relationships for specific paired fields
        const rangeValidations = {
            'length_metres_min': { max: 'length_metres_max' },
            'length_metres_max': { min: 'length_metres_min' },
            'beam_metres_min': { max: 'beam_metres_max' },
            'beam_metres_max': { min: 'beam_metres_min' },
            'draught_metres_min': { max: 'draught_metres_max' },
            'draught_metres_max': { min: 'draught_metres_min' },
            'speed_knots_min': { max: 'speed_knots_max' },
            'speed_knots_max': { min: 'speed_knots_min' },
        };

        const validation = rangeValidations[fieldName];

        if (validation) {
            // Only validate if BOTH min and max are filled
            if (validation.max) {
                const maxValue = formData[validation.max];
                if (maxValue && maxValue !== '') {
                    const maxNum = parseFloat(maxValue);
                    if (!isNaN(maxNum) && maxNum < numValue) {
                        setFieldErrors(prev => ({
                            ...prev,
                            [fieldName]: 'Min cannot exceed Max'
                        }));
                        return;
                    }
                }
            } else if (validation.min) {
                const minValue = formData[validation.min];
                if (minValue && minValue !== '') {
                    const minNum = parseFloat(minValue);
                    if (!isNaN(minNum) && minNum > numValue) {
                        setFieldErrors(prev => ({
                            ...prev,
                            [fieldName]: 'Max cannot be less than Min'
                        }));
                        return;
                    }
                }
            }
        }

        // ONLY validate top_k specifically
        if (fieldName === 'top_k') {
            if (numValue < 1 || numValue > 10) {
                setFieldErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Must be between 1 and 10'
                }));
                return;
            }
        }

        // ONLY validate year fields specifically
        if (fieldName === 'launch_year' || fieldName === 'commission_year') {
            if (numValue < 1800 || numValue > 2050) {
                setFieldErrors(prev => ({
                    ...prev,
                    [fieldName]: 'Must be between 1800 and 2050'
                }));
                return;
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Only validate fields that have specific validation rules
        const fieldsToValidate = [
            // Range pairs
            'length_metres_min', 'length_metres_max',
            'beam_metres_min', 'beam_metres_max',
            'draught_metres_min', 'draught_metres_max',
            'speed_knots_min', 'speed_knots_max',
            // Special validations
            'launch_year', 'commission_year',
            'top_k'
        ];

        if (fieldsToValidate.includes(field)) {
            setTimeout(() => validateField(field, value), 0);
        }
    };

    const handleSubmit = async () => {
        console.log('Submit button clicked');
        console.log('Current fieldErrors:', fieldErrors);

        // Validate required fields first
        const requiredFields = {
            'Speed Min': formData.speed_knots_min,
            'Speed Max': formData.speed_knots_max,
            'Number of Matches': formData.top_k
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value || value === '')
            .map(([field, _]) => field);

        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields:\n- ${missingFields.join('\n- ')}`);
            return;
        }

        // Check if there are any field errors
        if (Object.keys(fieldErrors).length > 0) {
            setError('Please fix the validation errors shown in red before submitting');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('Starting classification...');
            console.log('Form data:', formData);

            // Prepare submission data with top_k as integer
            const submissionData = {
                ...formData,
                top_k: parseInt(formData.top_k)
            };

            // Call backend API
            const classificationResult = await submitClassification(submissionData);
            console.log('Backend response:', classificationResult);

            // Validate response
            if (!classificationResult.success) {
                throw new Error(classificationResult.error || 'Classification failed');
            }

            // Transform matches to display format
            const transformedMatches = transformMatchesToDisplay(classificationResult.matches);

            // Calculate average similarity
            const maxSimilarity = calculateMaxSimilarity(transformedMatches);

            // Get similarity level
            const similarityLevel = getSimilarityLevel(maxSimilarity);

            // Transform backend response to Results page format
            const resultsData = {
                vessels_detected: classificationResult.total_matches || 0,
                processing_time: classificationResult.processing_time || 0,
                average_similarity: maxSimilarity,
                similarity_level: similarityLevel,
                matches: transformedMatches,
                image_metadata: {
                    filename: formData.ship_name || 'classification_query',
                    size_mb: 0.01,
                    analysis_timestamp: classificationResult.timestamp || (Date.now() / 1000)
                },
                classification_data: {
                    report_text: classificationResult.report_text,
                    classification_id: classificationResult.classification_id,
                    matches: classificationResult.matches
                }
            };

            console.log('Transformed results:', resultsData);
            console.log('Navigating to /results...');

            // Navigate to results page
            navigate('/results', { state: { results: resultsData } });

        } catch (err) {
            console.error('Error during submission:', err);
            setError(err.message || 'An error occurred during classification. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    /**
     * Calculate max similarity from matches
     */
    const calculateMaxSimilarity = (matches) => {
        if (!matches || matches.length === 0) return 0;

        return Math.max(...matches.map(match => match.confidence * 100));
    }

    /**
     * Get similarity level based on score
     */
    const getSimilarityLevel = (score) => {
        if (score >= 80) return { level: 'High', class: 'high' }
        if (score >= 60) return { level: 'Medium', class: 'medium' }
        return { level: 'Low', class: 'low' }
    }

    /**
     * Transform backend matches into display format
     */
    /**
     * Transform backend matches into display format
     */
    const transformMatchesToDisplay = (matches) => {
        if (!matches || matches.length === 0) return [];

        // Use top_k value or default to 10
        const maxResults = parseInt(formData.top_k) || 10;

        return matches.slice(0, maxResults).map((match, index) => {
            const shipInfo = match.ship_info || {};

            return {
                id: `vessel-${index}`,
                name: shipInfo.name || 'Unknown Vessel',
                type: shipInfo.ship_type || 'Unknown Type',
                pages: shipInfo.pages || 'N/A',
                confidence: match.similarity_score / 100,
                match_factors: [
                    { label: 'Class', value: shipInfo.ship_class },
                    { label: 'Country', value: shipInfo.country }
                ].filter(item => item.value) // Only include items that have a value
            };
        });
    }

    const handleClearForm = () => {
        if (window.confirm('Clear all form data?')) {
            setFormData(INITIAL_FORM_STATE)
            setError(null)
            setFieldErrors({})
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
        hideAutocompleteSuggestions,
        fieldErrors
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
                    <MatchSettingsSection
                        formData={formData}
                        handleInputChange={handleInputChange}
                        fieldErrors={fieldErrors}
                    />
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
                            'Submit Classification'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadPage