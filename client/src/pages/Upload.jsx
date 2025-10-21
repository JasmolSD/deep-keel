// pages/Upload.jsx
import { useState } from 'react'
import { useAutocomplete } from '../components/upload/useAutocomplete'
import { AISSection, VisualSection, BehavioralSection, ContextSection } from '../components/upload/FormSections'
import { INITIAL_FORM_STATE, SECTIONS, QUICK_FILL_TEMPLATES } from '../components/upload/uploadConstants'
import './Upload.css'

const UploadPage = ({ onFileUpload, uploading, error }) => {
    const [activeSection, setActiveSection] = useState('ais')
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)

    const {
        suggestions,
        showSuggestions,
        handleAutocomplete,
        selectSuggestion,
        hideAutocompleteSuggestions
    } = useAutocomplete()

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    const toggleArrayValue = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }))
    }

    const handleSubmit = () => {
        if (!formData.mmsi || !formData.vesselName) {
            alert('Please fill in at least MMSI and Vessel Name')
            return
        }
        onFileUpload(formData)
    }

    const applyQuickFill = (template) => {
        setFormData(prev => ({
            ...prev,
            ...QUICK_FILL_TEMPLATES[template]
        }))
    }

    const handleClearForm = () => {
        if (window.confirm('Clear all form data?')) {
            setFormData(INITIAL_FORM_STATE)
            setActiveSection('ais')
        }
    }

    const renderActiveSection = () => {
        const props = {
            formData,
            handleInputChange,
            toggleArrayValue,
            handleAutocomplete,
            suggestions,
            showSuggestions,
            selectSuggestion,
            hideAutocompleteSuggestions
        }

        switch (activeSection) {
            case 'ais':
                return <AISSection {...props} />
            case 'visual':
                return <VisualSection {...props} />
            case 'behavioral':
                return <BehavioralSection {...props} />
            case 'context':
                return <ContextSection {...props} />
            default:
                return null
        }
    }

    return (
        <div className="upload-page">
            <div className="classification-container">
                <div className="classification-header">
                    <h2>Warship Classification System</h2>
                    <p>Enter observed features for vessel identification and classification</p>
                </div>

                <div className="quick-fill-bar">
                    <label>Quick Templates:</label>
                    {Object.keys(QUICK_FILL_TEMPLATES).map(template => (
                        <button
                            key={template}
                            className="quick-fill-btn"
                            onClick={() => applyQuickFill(template)}
                        >
                            {template}
                        </button>
                    ))}
                </div>

                <div className="section-tabs">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="tab-icon">{section.icon}</span>
                            <span className="tab-label">{section.label}</span>
                        </button>
                    ))}
                </div>

                <div className="form-content">
                    {renderActiveSection()}
                </div>

                {error && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                        </svg>
                        <span>{error}</span>
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
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={uploading || !formData.mmsi || !formData.vesselName}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner"></div>
                                Classifying...
                            </>
                        ) : (
                            'Run Classification'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadPage