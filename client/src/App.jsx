// ./App.jsx

import { useState } from 'react'
import { uploadFile } from './api'
import './App.css'

function App() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setError(null)
    setResults(null)
  }

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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const response = await uploadFile(file)
      setResults(response.results)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze file')
      setResults(null)
    } finally {
      setUploading(false)
    }
  }

  const formatRiskScore = (score) => {
    if (score < 0.3) return { level: 'Low', color: '#10b981', class: 'risk-low' }
    if (score < 0.6) return { level: 'Medium', color: '#f59e0b', class: 'risk-medium' }
    return { level: 'High', color: '#ef4444', class: 'risk-high' }
  }

  const reset = () => {
    setFile(null)
    setResults(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🛰️ Eyes in the Sky</h1>
          <p>Satellite Imagery Analysis for Maritime Security</p>
        </div>
      </header>

      <main className="main-content">
        {!results ? (
          <div className="upload-section">
            <div className="upload-container">
              <h2>Upload Satellite Imagery</h2>
              <p>Upload satellite images to detect potential trafficking activities</p>

              <div
                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".png,.jpg,.jpeg,.tiff,.tif,.geotiff,.jp2"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                {file ? (
                  <div className="file-selected">
                    <div className="file-icon">📄</div>
                    <div className="file-info">
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="drop-zone-content">
                    <div className="upload-icon">📁</div>
                    <p>Drop your satellite image here or <span className="click-text">click to browse</span></p>
                    <p className="supported-formats">Supported: PNG, JPG, TIFF, GeoTIFF, JP2</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <div className="upload-actions">
                {file && (
                  <button className="btn btn-secondary" onClick={reset}>
                    Clear
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="spinner"></span>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <button className="btn btn-secondary" onClick={reset}>
                New Analysis
              </button>
            </div>

            <div className="results-grid">
              <div className="result-card">
                <div className="card-header">
                  <h3>Detection Summary</h3>
                </div>
                <div className="card-content">
                  <div className="stat">
                    <span className="stat-value">{results.vessels_detected}</span>
                    <span className="stat-label">Vessels Detected</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{results.processing_time}s</span>
                    <span className="stat-label">Processing Time</span>
                  </div>
                </div>
              </div>

              <div className="result-card">
                <div className="card-header">
                  <h3>Risk Assessment</h3>
                </div>
                <div className="card-content">
                  <div className="risk-score">
                    <div className={`risk-indicator ${formatRiskScore(results.risk_score).class}`}>
                      <span className="risk-value">{(results.risk_score * 100).toFixed(1)}%</span>
                      <span className="risk-level">{formatRiskScore(results.risk_score).level} Risk</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-card full-width">
                <div className="card-header">
                  <h3>Detected Anomalies</h3>
                </div>
                <div className="card-content">
                  {results.anomalies.length === 0 ? (
                    <div className="no-anomalies">
                      <span className="check-icon">✅</span>
                      <p>No suspicious activities detected</p>
                    </div>
                  ) : (
                    <div className="anomalies-list">
                      {results.anomalies.map((anomaly, index) => (
                        <div key={anomaly.id} className="anomaly-item">
                          <div className="anomaly-header">
                            <span className="anomaly-type">{anomaly.type.replace('_', ' ')}</span>
                            <span className="confidence">
                              {(anomaly.confidence * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                          <div className="anomaly-location">
                            📍 {anomaly.coordinates.lat.toFixed(4)}, {anomaly.coordinates.lng.toFixed(4)}
                          </div>
                          <div className="risk-factors">
                            {anomaly.risk_factors.map(factor => (
                              <span key={factor} className="risk-factor-tag">
                                {factor.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="result-card full-width">
                <div className="card-header">
                  <h3>Image Metadata</h3>
                </div>
                <div className="card-content">
                  <div className="metadata-grid">
                    <div className="metadata-item">
                      <span className="metadata-label">Filename:</span>
                      <span className="metadata-value">{results.image_metadata.filename}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">File Size:</span>
                      <span className="metadata-value">{results.image_metadata.size_mb} MB</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Analysis Time:</span>
                      <span className="metadata-value">
                        {new Date(results.image_metadata.analysis_timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Eyes in the Sky - Privacy-First Maritime Security Analysis</p>
        <p>⚡ Powered by AI • 🔒 Privacy Protected • 🌍 Global Coverage</p>
      </footer>
    </div>
  )
}

export default App