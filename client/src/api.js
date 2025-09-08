// Base URL for API requests
// Uses environment variable VITE_API_URL if defined, otherwise falls back to localhost:5001
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Upload a file to the server for satellite imagery analysis
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Analysis results
 */
export async function uploadFile(file) {
    // Validate file before sending
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/tif'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.geotiff', '.jp2'];

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
        throw new Error('Invalid file type. Please upload a satellite image (PNG, JPG, TIFF, GeoTIFF, or JP2)');
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 50MB.');
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${BASE}/api/upload`, {
            method: "POST",
            body: formData
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 413) {
                throw new Error('File is too large. Maximum size is 50MB.');
            } else if (response.status === 400) {
                throw new Error(errorData.error || 'Invalid file or request');
            } else if (response.status === 500) {
                throw new Error('Server error occurred while processing the file');
            } else {
                throw new Error(`Upload failed with status ${response.status}`);
            }
        }

        const data = await response.json();

        // Validate response structure
        if (!data.success) {
            throw new Error(data.error || 'Upload failed');
        }

        return data;

    } catch (error) {
        // Network or parsing errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server. Please check your connection and try again.');
        }

        // Re-throw known errors
        throw error;
    }
}

/**
 * Check server health status
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${BASE}/api/health`);

        if (!response.ok) {
            throw new Error(`Health check failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}

/**
 * Get analysis results by ID
 * @param {string} analysisId - The analysis ID
 * @returns {Promise<Object>} Analysis results
 */
export async function getAnalysis(analysisId) {
    try {
        const response = await fetch(`${BASE}/api/analysis/${analysisId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Analysis not found');
            }
            throw new Error(`Failed to get analysis with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}

/**
 * Get server information
 * @returns {Promise<Object>} Server info
 */
export async function getServerInfo() {
    try {
        const response = await fetch(`${BASE}/`);

        if (!response.ok) {
            throw new Error(`Failed to get server info with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}