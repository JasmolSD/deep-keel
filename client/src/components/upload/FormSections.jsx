// components/upload/FormSections.jsx
import FormSection from './FormSection'
import {
    FormInput,
    FormSelect,
    FormRange,
    FormTextarea,
    FormAutocomplete,
    FormTagSelect,
    FormRadioGroup,
    ConfidenceSlider
} from './FormInputs'
import {
    SHIP_TYPES,
    WEATHER_CONDITIONS,
    VISIBILITY_RANGES,
    SEA_STATES,
    FUNNEL_SPACINGS,
    TAG_OPTIONS
} from './uploadConstants'

export const AISSection = ({ formData, handleInputChange, handleAutocomplete, suggestions, showSuggestions, selectSuggestion, hideAutocompleteSuggestions }) => (
    <FormSection
        title="AIS Data"
        description="Information from Automatic Identification System"
    >
        <FormInput
            label="MMSI"
            required
            placeholder="e.g., 338123456"
            value={formData.mmsi}
            onChange={(e) => handleInputChange('mmsi', e.target.value)}
            pattern="[0-9]{9}"
            maxLength="9"
            hint="9-digit identifier (first 3 = country)"
        />

        <FormInput
            label="IMO Number"
            placeholder="e.g., 9123456"
            value={formData.imoNumber}
            onChange={(e) => handleInputChange('imoNumber', e.target.value)}
            pattern="[0-9]{7}"
            maxLength="7"
        />

        <FormInput
            label="Callsign"
            placeholder="e.g., NBDP"
            value={formData.callsign}
            onChange={(e) => handleInputChange('callsign', e.target.value.toUpperCase())}
            maxLength="7"
        />

        <FormAutocomplete
            label="Vessel Name *"
            placeholder="e.g., USS Arleigh Burke"
            value={formData.vesselName}
            onChange={(e) => {
                handleInputChange('vesselName', e.target.value);
                handleAutocomplete('vesselName', e.target.value);
            }}
            suggestions={suggestions.vesselName}
            showSuggestions={showSuggestions.vesselName}
            onSelect={(value) => {
                handleInputChange('vesselName', value + ' ');
                selectSuggestion('vesselName', value);
            }}
            onBlur={() => hideAutocompleteSuggestions('vesselName')}
        />

        <FormSelect
            label="Ship Type"
            options={SHIP_TYPES}
            placeholder="Select type..."
            value={formData.shipType}
            onChange={(e) => handleInputChange('shipType', e.target.value)}
        />

        <FormRange
            label="Length (meters)"
            minProps={{
                value: formData.lengthMin,
                onChange: (e) => handleInputChange('lengthMin', e.target.value)
            }}
            maxProps={{
                value: formData.lengthMax,
                onChange: (e) => handleInputChange('lengthMax', e.target.value)
            }}
        />

        <FormRange
            label="Beam (meters)"
            minProps={{
                value: formData.beamMin,
                onChange: (e) => handleInputChange('beamMin', e.target.value)
            }}
            maxProps={{
                value: formData.beamMax,
                onChange: (e) => handleInputChange('beamMax', e.target.value)
            }}
        />

        <FormRange
            label="Draft (meters)"
            minProps={{
                value: formData.draftMin,
                onChange: (e) => handleInputChange('draftMin', e.target.value),
                step: "0.1"
            }}
            maxProps={{
                value: formData.draftMax,
                onChange: (e) => handleInputChange('draftMax', e.target.value),
                step: "0.1"
            }}
        />

        <FormRange
            label="Speed (knots)"
            minProps={{
                value: formData.speedMin,
                onChange: (e) => handleInputChange('speedMin', e.target.value),
                step: "0.1"
            }}
            maxProps={{
                value: formData.speedMax,
                onChange: (e) => handleInputChange('speedMax', e.target.value),
                step: "0.1"
            }}
        />

        <FormAutocomplete
            label="Flag/Nationality"
            placeholder="e.g., United States"
            value={formData.flag}
            onChange={(e) => {
                handleInputChange('flag', e.target.value);
                handleAutocomplete('flag', e.target.value);
            }}
            suggestions={suggestions.flag}
            showSuggestions={showSuggestions.flag}
            onSelect={(value) => {
                handleInputChange('flag', value);
                selectSuggestion('flag', value);
            }}
            onBlur={() => hideAutocompleteSuggestions('flag')}
        />

        <FormAutocomplete
            label="Registry Port"
            placeholder="e.g., Norfolk"
            value={formData.registryPort}
            onChange={(e) => {
                handleInputChange('registryPort', e.target.value);
                handleAutocomplete('registryPort', e.target.value);
            }}
            suggestions={suggestions.registryPort}
            showSuggestions={showSuggestions.registryPort}
            onSelect={(value) => {
                handleInputChange('registryPort', value);
                selectSuggestion('registryPort', value);
            }}
            onBlur={() => hideAutocompleteSuggestions('registryPort')}
        />
    </FormSection>
);

export const VisualSection = ({ formData, handleInputChange, toggleArrayValue }) => (
    <FormSection
        title="Visual Observation"
        description="Physical characteristics and visual identification"
    >
        <FormRange
            label="Estimated Hull Length (m)"
            minProps={{
                value: formData.hullLengthMin,
                onChange: (e) => handleInputChange('hullLengthMin', e.target.value)
            }}
            maxProps={{
                value: formData.hullLengthMax,
                onChange: (e) => handleInputChange('hullLengthMax', e.target.value)
            }}
        />

        <FormTagSelect
            label="Hull Shape (select all that apply)"
            options={TAG_OPTIONS.hullShapes}
            selected={formData.hullShape}
            onToggle={(value) => toggleArrayValue('hullShape', value)}
        />

        <FormTagSelect
            label="Superstructure Layout"
            options={TAG_OPTIONS.superstructureLayouts}
            selected={formData.superstructureLayout}
            onToggle={(value) => toggleArrayValue('superstructureLayout', value)}
        />

        <FormRange
            label="Number of Masts"
            minProps={{
                value: formData.mastCountMin,
                onChange: (e) => handleInputChange('mastCountMin', e.target.value),
                min: "0",
                max: "10"
            }}
            maxProps={{
                value: formData.mastCountMax,
                onChange: (e) => handleInputChange('mastCountMax', e.target.value),
                min: "0",
                max: "10"
            }}
        />

        <FormTagSelect
            label="Radar Arrays (select all observed)"
            options={TAG_OPTIONS.radarArrays}
            selected={formData.radarArrays}
            onToggle={(value) => toggleArrayValue('radarArrays', value)}
            fullWidth
        />

        <FormTagSelect
            label="Armament Types (select all observed)"
            options={TAG_OPTIONS.armamentTypes}
            selected={formData.armamentTypes}
            onToggle={(value) => toggleArrayValue('armamentTypes', value)}
            fullWidth
        />

        <FormTextarea
            label="Additional Armament Details"
            placeholder="Describe specific weapons systems, launcher counts, positions..."
            value={formData.armamentLayout}
            onChange={(e) => handleInputChange('armamentLayout', e.target.value)}
            rows="2"
        />

        <FormRange
            label="Number of Funnels"
            minProps={{
                value: formData.funnelCountMin,
                onChange: (e) => handleInputChange('funnelCountMin', e.target.value),
                min: "0",
                max: "5"
            }}
            maxProps={{
                value: formData.funnelCountMax,
                onChange: (e) => handleInputChange('funnelCountMax', e.target.value),
                min: "0",
                max: "5"
            }}
        />

        <FormSelect
            label="Funnel Spacing"
            options={FUNNEL_SPACINGS}
            value={formData.funnelSpacing}
            onChange={(e) => handleInputChange('funnelSpacing', e.target.value)}
        />

        <FormRange
            label="Flight Decks"
            hint="Enter 0 for none, leave blank if uncertain"
            minProps={{
                value: formData.flightDeckMin,
                onChange: (e) => handleInputChange('flightDeckMin', e.target.value),
                placeholder: "At least",
                min: "0",
                max: "5"
            }}
            maxProps={{
                value: formData.flightDeckMax,
                onChange: (e) => handleInputChange('flightDeckMax', e.target.value),
                placeholder: "At most",
                min: "0",
                max: "5"
            }}
        />

        <FormRange
            label="Hangars"
            hint="Enter 0 for none, leave blank if uncertain"
            minProps={{
                value: formData.hangarMin,
                onChange: (e) => handleInputChange('hangarMin', e.target.value),
                placeholder: "At least",
                min: "0",
                max: "5"
            }}
            maxProps={{
                value: formData.hangarMax,
                onChange: (e) => handleInputChange('hangarMax', e.target.value),
                placeholder: "At most",
                min: "0",
                max: "5"
            }}
        />

        <FormInput
            label="Pennant Number"
            placeholder="e.g., DDG-51, F-83"
            value={formData.pennantNumber}
            onChange={(e) => handleInputChange('pennantNumber', e.target.value.toUpperCase())}
        />

        <FormTagSelect
            label="Paint Scheme"
            options={TAG_OPTIONS.paintSchemes}
            selected={formData.paintScheme}
            onToggle={(value) => toggleArrayValue('paintScheme', value)}
        />

        <FormTagSelect
            label="Deck Markings"
            options={TAG_OPTIONS.deckMarkings}
            selected={formData.deckMarkings}
            onToggle={(value) => toggleArrayValue('deckMarkings', value)}
        />
    </FormSection>
);

export const BehavioralSection = ({ formData, handleInputChange, toggleArrayValue }) => (
    <FormSection
        title="Behavioral Observations"
        description="Movement patterns and operational behavior"
    >
        <FormTagSelect
            label="Formation (select all observed)"
            options={TAG_OPTIONS.formations}
            selected={formData.formation}
            onToggle={(value) => toggleArrayValue('formation', value)}
            fullWidth
        />

        <FormRadioGroup
            label="RAS Operations"
            name="rasOperations"
            value={formData.rasOperations}
            onChange={(value) => handleInputChange('rasOperations', value)}
            options={[
                { value: 'yes', label: 'Observed' },
                { value: 'no', label: 'Not Observed' },
                { value: 'unknown', label: 'Unknown' }
            ]}
        />

        <FormTagSelect
            label="Operational Speed Pattern (select all observed)"
            options={TAG_OPTIONS.operationalSpeeds}
            selected={formData.operationalSpeed}
            onToggle={(value) => toggleArrayValue('operationalSpeed', value)}
            fullWidth
        />
    </FormSection>
);

export const ContextSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Additional Context"
        description="Environmental and observation conditions"
    >
        <FormInput
            label="Observation Time"
            type="datetime-local"
            value={formData.observationTime}
            onChange={(e) => handleInputChange('observationTime', e.target.value)}
        />

        <FormSelect
            label="Weather Conditions"
            options={WEATHER_CONDITIONS}
            value={formData.weatherConditions}
            onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
        />

        <FormSelect
            label="Visibility Range"
            options={VISIBILITY_RANGES}
            value={formData.visibilityRange}
            onChange={(e) => handleInputChange('visibilityRange', e.target.value)}
        />

        <FormSelect
            label="Sea State"
            options={SEA_STATES}
            value={formData.seaState}
            onChange={(e) => handleInputChange('seaState', e.target.value)}
        />

        <ConfidenceSlider
            value={formData.confidenceLevel}
            onChange={(value) => handleInputChange('confidenceLevel', value)}
        />

        <FormTextarea
            label="Additional Notes"
            placeholder="Any other relevant observations, unusual features, or context..."
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            rows="4"
        />
    </FormSection>
);