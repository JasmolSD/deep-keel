// Base URL for API requests
// Uses environment variable VITE_API_URL if defined, otherwise falls back to localhost:5001
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Log the base URL being used (helpful for debugging deployment issues)
console.log('[API] ========== API Configuration ==========');
console.log('[API] Base URL configured as:', BASE);
console.log('[API] VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('[API] Using production mode:', import.meta.env.PROD);
console.log('[API] =========================================');

/**
 * Submit warship classification form data to the server
 * @param {Object} formData - The form data object containing ship characteristics
 * @returns {Promise<Object>} Classification results including report
 */
export async function submitClassification(formData) {
    console.log('[submitClassification] Starting classification request');
    console.log('[submitClassification] Form data:', formData);

    // Validate form data before sending
    if (!formData) {
        console.error('[submitClassification] No form data provided');
        throw new Error('No form data provided');
    }

    const url = `${BASE}/api/classify`;
    console.log('[submitClassification] Making POST request to:', url);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('[submitClassification] Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[submitClassification] HTTP error response:', errorData);

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
        console.log('[submitClassification] Success! Response data:', data);

        // Validate response structure
        if (!data.success) {
            console.error('[submitClassification] Classification failed:', data.error);
            throw new Error(data.error || 'Classification failed');
        }

        return data;

    } catch (error) {
        console.error('[submitClassification] Error caught:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Network or parsing errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[submitClassification] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/api/report/${reportId}`;
    console.log('[downloadReport] Downloading report from:', url);

    try {
        const response = await fetch(url);

        console.log('[downloadReport] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.error('[downloadReport] Report not found');
                throw new Error('Report not found');
            }
            console.error('[downloadReport] Failed with status:', response.status);
            throw new Error(`Failed to download report with status ${response.status}`);
        }

        // Get the blob from response
        const blob = await response.blob();
        console.log('[downloadReport] Report downloaded successfully, size:', blob.size);
        return blob;

    } catch (error) {
        console.error('[downloadReport] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[downloadReport] Network error - unable to reach server at:', url);
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
    console.log('[downloadReportFromResults] Generating download');

    if (!classificationResults || !classificationResults.report_text) {
        console.error('[downloadReportFromResults] No report data available');
        throw new Error('No report data available');
    }

    // Create blob from report text
    const blob = new Blob([classificationResults.report_text], { type: 'text/plain' });

    // Generate filename if not provided
    const reportFilename = filename || `warship_classification_report_${new Date().toISOString().slice(0, 10)}.txt`;
    console.log('[downloadReportFromResults] Downloading as:', reportFilename);

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
    console.log('[downloadReportFromResults] Download triggered successfully');
}

/**
 * Search for ships matching the provided criteria
 * @param {Object} searchCriteria - Search parameters
 * @returns {Promise<Object>} Search results
 */
export async function searchShips(searchCriteria) {
    const url = `${BASE}/api/search`;
    console.log('[searchShips] Searching with criteria:', searchCriteria);
    console.log('[searchShips] POST request to:', url);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchCriteria)
        });

        console.log('[searchShips] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[searchShips] Error response:', errorData);

            if (response.status === 400) {
                throw new Error(errorData.error || 'Invalid search criteria');
            } else if (response.status === 500) {
                throw new Error('Server error occurred during search');
            } else {
                throw new Error(`Search failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('[searchShips] Search successful, results:', data);
        return data;

    } catch (error) {
        console.error('[searchShips] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[searchShips] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/api/health`;
    console.log('[checkHealth] Checking server health at:', url);

    try {
        const response = await fetch(url);

        console.log('[checkHealth] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            console.error('[checkHealth] Health check failed with status:', response.status);
            throw new Error(`Health check failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[checkHealth] Server is healthy:', data);
        return data;
    } catch (error) {
        console.error('[checkHealth] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[checkHealth] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/api/classification/${classificationId}`;
    console.log('[getClassification] Fetching classification:', classificationId);
    console.log('[getClassification] GET request to:', url);

    try {
        const response = await fetch(url);

        console.log('[getClassification] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.error('[getClassification] Classification not found');
                throw new Error('Classification not found');
            }
            console.error('[getClassification] Failed with status:', response.status);
            throw new Error(`Failed to get classification with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[getClassification] Classification retrieved:', data);
        return data;
    } catch (error) {
        console.error('[getClassification] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[getClassification] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/`;
    console.log('[getServerInfo] Fetching server info from:', url);

    try {
        const response = await fetch(url);

        console.log('[getServerInfo] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            console.error('[getServerInfo] Failed with status:', response.status);
            throw new Error(`Failed to get server info with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[getServerInfo] Server info:', data);
        return data;
    } catch (error) {
        console.error('[getServerInfo] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[getServerInfo] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/api/ship-classes`;
    console.log('[getShipClasses] Fetching ship classes from:', url);

    try {
        const response = await fetch(url);

        console.log('[getShipClasses] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            console.error('[getShipClasses] Failed with status:', response.status);
            throw new Error(`Failed to get ship classes with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[getShipClasses] Ship classes retrieved:', data);
        return data;
    } catch (error) {
        console.error('[getShipClasses] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[getShipClasses] Network error - unable to reach server at:', url);
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
    const url = `${BASE}/api/stats`;
    console.log('[getDatabaseStats] Fetching database stats from:', url);

    try {
        const response = await fetch(url);

        console.log('[getDatabaseStats] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            console.error('[getDatabaseStats] Failed with status:', response.status);
            throw new Error(`Failed to get database stats with status ${response.status}`);
        }

        const data = await response.json();
        console.log('[getDatabaseStats] Database stats:', data);
        return data;
    } catch (error) {
        console.error('[getDatabaseStats] Error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[getDatabaseStats] Network error - unable to reach server at:', url);
            throw new Error('Unable to connect to the server');
        }
        throw error;
    }
}