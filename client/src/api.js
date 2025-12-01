// Base URL for API requests
// Uses environment variable VITE_API_URL if defined, otherwise falls back to localhost:5001
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Submit warship classification form data to the server
 * @param {Object} formData - The form data object containing ship characteristics
 * @returns {Promise<Object>} Classification results including report
 */
export async function submitClassification(formData) {
    // Validate form data before sending
    if (!formData) {
        throw new Error('No form data provided');
    }

    // Validate required fields
    const requiredFields = {
        'Speed Min': formData.speed_knots_min,
        'Speed Max': formData.speed_knots_max
    };

    const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([field, _]) => field);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
        const response = await fetch(`${BASE}/api/classify`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 400) {
                throw new Error(errorData.error || 'Invalid form data or request');
            } else if (response.status === 422) {
                throw new Error(errorData.error || 'Validation error: Please check your input values');
            } else if (response.status === 500) {
                throw new Error('Server error occurred while processing the classification');
            } else {
                throw new Error(`Classification failed with status ${response.status}`);
            }
        }

        const data = await response.json();

        // Validate response structure
        if (!data.success) {
            throw new Error(data.error || 'Classification failed');
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
 * Download classification report as a text file
 * @param {string} reportId - The report ID or classification ID
 * @returns {Promise<Blob>} Report file blob
 */
export async function downloadReport(reportId) {
    try {
        const response = await fetch(`${BASE}/api/report/${reportId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Report not found');
            }
            throw new Error(`Failed to download report with status ${response.status}`);
        }

        // Get the blob from response
        const blob = await response.blob();
        return blob;

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}

/**
 * Generate and download report directly from classification results
 * @param {Object} classificationResults - The classification results object
 * @param {string} filename - Optional filename (defaults to classification report with timestamp)
 */
export function downloadReportFromResults(classificationResults, filename = null) {
    if (!classificationResults || !classificationResults.report_text) {
        throw new Error('No report data available');
    }

    // Create blob from report text
    const blob = new Blob([classificationResults.report_text], { type: 'text/plain' });

    // Generate filename if not provided
    const reportFilename = filename || `warship_classification_report_${new Date().toISOString().slice(0, 10)}.txt`;

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = reportFilename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Search for ships matching the provided criteria
 * @param {Object} searchCriteria - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchShips(searchCriteria) {
    try {
        const response = await fetch(`${BASE}/api/search`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchCriteria)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 400) {
                throw new Error(errorData.error || 'Invalid search criteria');
            } else if (response.status === 500) {
                throw new Error('Server error occurred during search');
            } else {
                throw new Error(`Search failed with status ${response.status}`);
            }
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
 * Get classification results by ID
 * @param {string} classificationId - The classification ID
 * @returns {Promise<Object>} Classification results
 */
export async function getClassification(classificationId) {
    try {
        const response = await fetch(`${BASE}/api/classification/${classificationId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Classification not found');
            }
            throw new Error(`Failed to get classification with status ${response.status}`);
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

/**
 * Get list of all ship classes in the database
 * @returns {Promise<Object>} List of ship classes
 */
export async function getShipClasses() {
    try {
        const response = await fetch(`${BASE}/api/ship-classes`);

        if (!response.ok) {
            throw new Error(`Failed to get ship classes with status ${response.status}`);
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
 * Get statistics about the ship database
 * @returns {Promise<Object>} Database statistics
 */
export async function getDatabaseStats() {
    try {
        const response = await fetch(`${BASE}/api/stats`);

        if (!response.ok) {
            throw new Error(`Failed to get database stats with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}