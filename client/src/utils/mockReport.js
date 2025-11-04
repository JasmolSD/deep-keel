// utils/mockReport.js

/**
 * Generate a mock classification report for development/testing
 * This simulates what the backend will return
 * @param {Object} formData - The submitted form data
 * @returns {Object} Mock classification results with report
 */
export function generateMockReport(formData) {
    const timestamp = new Date().toISOString();
    const reportDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Mock matches based on form data
    const mockMatches = [
        {
            ship_name: "USS Arleigh Burke",
            ship_class: "Arleigh Burke",
            hull_number: "DDG-51",
            country: "United States",
            ship_type: "Guided Missile Destroyer",
            ship_role: "Multi-role",
            length_metres: 155.3,
            beam_metres: 20.4,
            draught_metres: 6.3,
            displacement_full_load_tons: 9200,
            speed_knots: 30,
            hull_form: "Monohull",
            hull_shape: "Sleek",
            bow_shape: "Raked",
            confidence: 0.95,
            match_score: 0.92
        },
        {
            ship_name: "USS John Paul Jones",
            ship_class: "Arleigh Burke",
            hull_number: "DDG-53",
            country: "United States",
            ship_type: "Guided Missile Destroyer",
            ship_role: "AAW",
            length_metres: 154.8,
            beam_metres: 20.4,
            draught_metres: 6.3,
            displacement_full_load_tons: 9200,
            speed_knots: 30,
            hull_form: "Monohull",
            hull_shape: "Sleek",
            bow_shape: "Raked",
            confidence: 0.94,
            match_score: 0.91
        },
        {
            ship_name: "USS Curtis Wilbur",
            ship_class: "Arleigh Burke",
            hull_number: "DDG-54",
            country: "United States",
            ship_type: "Guided Missile Destroyer",
            ship_role: "Multi-role",
            length_metres: 154.7,
            beam_metres: 20.4,
            draught_metres: 6.3,
            displacement_full_load_tons: 9200,
            speed_knots: 30,
            hull_form: "Monohull",
            hull_shape: "Sleek",
            bow_shape: "Raked",
            confidence: 0.93,
            match_score: 0.90
        },
        {
            ship_name: "HMS Daring",
            ship_class: "Type 45",
            hull_number: "D32",
            country: "United Kingdom",
            ship_type: "Destroyer",
            ship_role: "Air Defence Destroyer",
            length_metres: 152.4,
            beam_metres: 21.2,
            draught_metres: 5.3,
            displacement_full_load_tons: 8000,
            speed_knots: 29,
            hull_form: "Monohull",
            hull_shape: "Sleek",
            bow_shape: "Raked",
            confidence: 0.87,
            match_score: 0.85
        },
        {
            ship_name: "HMS Dauntless",
            ship_class: "Type 45",
            hull_number: "D33",
            country: "United Kingdom",
            ship_type: "Destroyer",
            ship_role: "Air Defence Destroyer",
            length_metres: 152.4,
            beam_metres: 21.2,
            draught_metres: 5.3,
            displacement_full_load_tons: 8000,
            speed_knots: 29,
            hull_form: "Monohull",
            hull_shape: "Sleek",
            bow_shape: "Raked",
            confidence: 0.86,
            match_score: 0.84
        }
    ];

    // Generate report text
    const reportText = generateReportText(formData, mockMatches, reportDate);

    return {
        success: true,
        report_id: `MOCK-${Date.now()}`,
        timestamp: timestamp,
        total_matches: mockMatches.length,
        matches: mockMatches,
        query_params: formData,
        report_text: reportText
    };
}

function generateReportText(formData, matches, reportDate) {
    const divider = "=".repeat(80);
    const minorDivider = "-".repeat(80);

    let report = `${divider}\n`;
    report += `                    WARSHIP CLASSIFICATION REPORT\n`;
    report += `${divider}\n\n`;

    report += `Report Date: ${reportDate}\n`;
    report += `Report ID: MOCK-${Date.now()}\n`;
    report += `Classification System: Warship Identification Database v1.0\n\n`;

    report += `${divider}\n`;
    report += `SECTION 1: QUERY PARAMETERS\n`;
    report += `${divider}\n\n`;

    report += `Physical Dimensions:\n`;
    report += `  Length:     ${formData.length_metres_min || 'N/A'}m - ${formData.length_metres_max || 'N/A'}m\n`;
    report += `  Beam:       ${formData.beam_metres_min || 'N/A'}m - ${formData.beam_metres_max || 'N/A'}m\n`;
    report += `  Draught:    ${formData.draught_metres_min || 'N/A'}m - ${formData.draught_metres_max || 'N/A'}m\n\n`;

    report += `Hull Characteristics:\n`;
    report += `  Hull Form:  ${formData.hull_form || 'N/A'}\n`;
    report += `  Hull Shape: ${formData.hull_shape || 'N/A'}\n`;
    report += `  Bow Shape:  ${formData.bow_shape || 'N/A'}\n\n`;

    if (formData.ship_type || formData.ship_role || formData.country) {
        report += `Additional Criteria:\n`;
        if (formData.ship_type) report += `  Ship Type:  ${formData.ship_type}\n`;
        if (formData.ship_role) report += `  Ship Role:  ${formData.ship_role}\n`;
        if (formData.country) report += `  Country:    ${formData.country}\n`;
        report += `\n`;
    }

    report += `${divider}\n`;
    report += `SECTION 2: CLASSIFICATION RESULTS\n`;
    report += `${divider}\n\n`;

    report += `Total Matches Found: ${matches.length}\n`;
    report += `Confidence Threshold: 80%\n`;
    report += `Search Method: Multi-parameter matching with weighted scoring\n\n`;

    report += `${minorDivider}\n`;
    report += `TOP MATCHING VESSELS\n`;
    report += `${minorDivider}\n\n`;

    matches.forEach((match, index) => {
        report += `Match #${index + 1}: ${match.ship_name}\n`;
        report += `${'-'.repeat(40)}\n`;
        report += `  Class:          ${match.ship_class}\n`;
        report += `  Hull Number:    ${match.hull_number}\n`;
        report += `  Country:        ${match.country}\n`;
        report += `  Type/Role:      ${match.ship_type} / ${match.ship_role}\n`;
        report += `  \n`;
        report += `  Dimensions:\n`;
        report += `    Length:       ${match.length_metres}m\n`;
        report += `    Beam:         ${match.beam_metres}m\n`;
        report += `    Draught:      ${match.draught_metres}m\n`;
        report += `    Displacement: ${match.displacement_full_load_tons} tons\n`;
        report += `  \n`;
        report += `  Hull Characteristics:\n`;
        report += `    Hull Form:    ${match.hull_form}\n`;
        report += `    Hull Shape:   ${match.hull_shape}\n`;
        report += `    Bow Shape:    ${match.bow_shape}\n`;
        report += `  \n`;
        report += `  Performance:\n`;
        report += `    Speed:        ${match.speed_knots} knots\n`;
        report += `  \n`;
        report += `  Match Metrics:\n`;
        report += `    Confidence:   ${(match.confidence * 100).toFixed(1)}%\n`;
        report += `    Match Score:  ${(match.match_score * 100).toFixed(1)}%\n`;
        report += `\n`;
    });

    report += `${divider}\n`;
    report += `SECTION 3: ANALYSIS SUMMARY\n`;
    report += `${divider}\n\n`;

    report += `Classification Analysis:\n`;
    report += `  The query parameters provided match ${matches.length} vessels in the database.\n`;
    report += `  The top match, ${matches[0].ship_name}, shows a ${(matches[0].confidence * 100).toFixed(1)}% confidence level.\n\n`;

    report += `Key Findings:\n`;
    const shipClasses = [...new Set(matches.map(m => m.ship_class))];
    report += `  - ${shipClasses.length} distinct ship class(es) identified: ${shipClasses.join(', ')}\n`;

    const countries = [...new Set(matches.map(m => m.country))];
    report += `  - ${countries.length} nation(s) represented: ${countries.join(', ')}\n`;

    const avgLength = (matches.reduce((sum, m) => sum + m.length_metres, 0) / matches.length).toFixed(1);
    report += `  - Average length of matches: ${avgLength}m\n`;

    const avgDisplacement = (matches.reduce((sum, m) => sum + m.displacement_full_load_tons, 0) / matches.length).toFixed(0);
    report += `  - Average displacement: ${avgDisplacement} tons\n\n`;

    report += `Recommendations:\n`;
    if (matches[0].confidence > 0.9) {
        report += `  - High confidence match identified. The vessel is very likely a\n`;
        report += `    ${matches[0].ship_class}-class ${matches[0].ship_type}.\n`;
    } else if (matches[0].confidence > 0.8) {
        report += `  - Good confidence match identified. Further analysis recommended\n`;
        report += `    to confirm vessel classification.\n`;
    } else {
        report += `  - Multiple potential matches with similar confidence levels.\n`;
        report += `    Additional data points recommended for precise identification.\n`;
    }
    report += `\n`;

    report += `${divider}\n`;
    report += `SECTION 4: METHODOLOGY\n`;
    report += `${divider}\n\n`;

    report += `Classification Methodology:\n`;
    report += `  This report was generated using a multi-parameter matching algorithm\n`;
    report += `  that compares input characteristics against a comprehensive database\n`;
    report += `  of warship specifications.\n\n`;

    report += `Scoring System:\n`;
    report += `  - Dimensional Accuracy:  40% weight\n`;
    report += `  - Hull Characteristics:  30% weight\n`;
    report += `  - Type/Role Matching:    20% weight\n`;
    report += `  - Additional Features:   10% weight\n\n`;

    report += `Database Coverage:\n`;
    report += `  - Total vessels in database: ~20,000\n`;
    report += `  - Countries represented: 150+\n`;
    report += `  - Ship types: 293\n`;
    report += `  - Date range: 1940-2024\n\n`;

    report += `${divider}\n`;
    report += `SECTION 5: LIMITATIONS AND DISCLAIMERS\n`;
    report += `${divider}\n\n`;

    report += `Limitations:\n`;
    report += `  - Classification accuracy depends on the completeness and accuracy\n`;
    report += `    of input parameters\n`;
    report += `  - Database may not include all variants or recent modifications\n`;
    report += `  - Visual observations may be subject to measurement error\n`;
    report += `  - Similar vessel designs may result in multiple high-confidence matches\n\n`;

    report += `Disclaimer:\n`;
    report += `  This report is generated for informational purposes only. The\n`;
    report += `  classification results should be used in conjunction with other\n`;
    report += `  intelligence sources and verified through appropriate channels.\n\n`;

    report += `${divider}\n`;
    report += `END OF REPORT\n`;
    report += `${divider}\n\n`;

    report += `Generated by: Warship Classification System\n`;
    report += `Report Version: 1.0\n`;
    report += `Timestamp: ${new Date().toISOString()}\n`;

    return report;
}