// pages/Upload.jsx
import { useState, useRef } from 'react'
import './Upload.css'

const UploadPage = ({ onFileUpload, uploading, error }) => {
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const fileInputRef = useRef(null)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFile = (selectedFile) => {
        setFile(selectedFile)

        // Create preview for image files
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
        }
    }

    const handleSubmit = () => {
        if (file) {
            onFileUpload(file)
        }
    }

    return (
        <div className="upload-page">
            <div className="upload-container">
                <div className="upload-header">
                    <h2>Upload Satellite Imagery</h2>
                    <p>Upload satellite images for trafficking detection analysis</p>
                </div>

                <div
                    className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.tiff,.tif,.geotiff,.jp2"
                        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />

                    {file ? (
                        <div className="file-preview">
                            {preview && (
                                <div className="image-preview">
                                    <img src={preview} alt="Preview" />
                                </div>
                            )}
                            <div className="file-details">
                                <svg className="file-icon" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                                </svg>
                                <div className="file-info">
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                                <button
                                    className="remove-file"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFile(null)
                                        setPreview(null)
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="dropzone-content">
                            <svg className="upload-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" fill="currentColor" />
                            </svg>
                            <h3>Drop your satellite image here</h3>
                            <p>or click to browse</p>
                            <div className="supported-formats">
                                <span>PNG</span>
                                <span>JPG</span>
                                <span>TIFF</span>
                                <span>GeoTIFF</span>
                                <span>JP2</span>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="upload-actions">
                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setFile(null)
                            setPreview(null)
                        }}
                        disabled={!file || uploading}
                    >
                        Clear
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={!file || uploading}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                Run Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UploadPage