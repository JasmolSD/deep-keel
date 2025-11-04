// components/upload/FormSections.jsx
import FormSection from './FormSection'
import {
    FormInput,
    FormSelect,
    FormRange,
    FormTextarea,
    FormAutocomplete,
    FormRadioGroup
} from './FormInputs'
import {
    SHIP_TYPES,
    SHIP_ROLES,
    HULL_FORMS,
    HULL_SHAPES,
    BOW_SHAPES,
    SUPERSTRUCTURE_LAYOUTS,
    FUNNEL_ARRANGEMENTS,
    FUNNEL_SHAPES,
    FUNNEL_SPACINGS,
    SIZE_CATEGORIES,
    MAST_CONFIGURATIONS,
    FREEBOARD_HEIGHTS,
    RADAR_CONFIGURATIONS,
    GUNMOUNT_POSITIONS,
    GUNMOUNT_SIZES,
    LENGTH_TO_BEAM_RATIOS
} from './uploadConstants'

export const IdentificationSection = ({
    formData,
    handleInputChange,
    handleAutocomplete,
    suggestions,
    showSuggestions,
    selectSuggestion,
    hideAutocompleteSuggestions
}) => (
    <FormSection
        title="Basic Identification"
        description="Ship identification and classification information"
    >
        <FormInput
            label="Ship Name"
            placeholder="e.g., USS Arleigh Burke"
            value={formData.ship_name}
            onChange={(e) => handleInputChange('ship_name', e.target.value)}
        />

        <FormInput
            label="Hull Number"
            placeholder="e.g., DDG-51"
            value={formData.hull_number}
            onChange={(e) => handleInputChange('hull_number', e.target.value.toUpperCase())}
        />

        <FormAutocomplete
            label="Country"
            placeholder="e.g., United States"
            value={formData.country}
            onChange={(e) => {
                handleInputChange('country', e.target.value);
                handleAutocomplete('country', e.target.value);
            }}
            suggestions={suggestions.country}
            showSuggestions={showSuggestions.country}
            onSelect={(value) => {
                handleInputChange('country', value);
                selectSuggestion('country', value);
            }}
            onBlur={() => hideAutocompleteSuggestions('country')}
        />

        <FormAutocomplete
            label="Base Port"
            placeholder="e.g., Norfolk"
            value={formData.base_port}
            onChange={(e) => {
                handleInputChange('base_port', e.target.value);
                handleAutocomplete('base_port', e.target.value);
            }}
            suggestions={suggestions.base_port}
            showSuggestions={showSuggestions.base_port}
            onSelect={(value) => {
                handleInputChange('base_port', value);
                selectSuggestion('base_port', value);
            }}
            onBlur={() => hideAutocompleteSuggestions('base_port')}
        />

        <FormInput
            label="Ship Class"
            placeholder="e.g., Arleigh Burke"
            value={formData.ship_class}
            onChange={(e) => handleInputChange('ship_class', e.target.value)}
        />

        <FormSelect
            label="Ship Type"
            options={SHIP_TYPES}
            value={formData.ship_type}
            onChange={(e) => handleInputChange('ship_type', e.target.value)}
        />

        <FormSelect
            label="Ship Role"
            options={SHIP_ROLES}
            value={formData.ship_role}
            onChange={(e) => handleInputChange('ship_role', e.target.value)}
        />
    </FormSection>
);

export const DimensionsSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Physical Dimensions"
        description="Ship measurements and specifications"
    >
        <FormInput
            label="Displacement (tons)"
            type="number"
            placeholder="Full load displacement"
            value={formData.displacement_full_load_tons}
            onChange={(e) => handleInputChange('displacement_full_load_tons', e.target.value)}
            step="0.1"
        />

        <FormRange
            label="Length (metres)"
            required
            minProps={{
                value: formData.length_metres_min,
                onChange: (e) => handleInputChange('length_metres_min', e.target.value),
                placeholder: "Min",
                step: "0.1"
            }}
            maxProps={{
                value: formData.length_metres_max,
                onChange: (e) => handleInputChange('length_metres_max', e.target.value),
                placeholder: "Max",
                step: "0.1"
            }}
        />

        <FormRange
            label="Beam (metres)"
            required
            minProps={{
                value: formData.beam_metres_min,
                onChange: (e) => handleInputChange('beam_metres_min', e.target.value),
                placeholder: "Min",
                step: "0.1"
            }}
            maxProps={{
                value: formData.beam_metres_max,
                onChange: (e) => handleInputChange('beam_metres_max', e.target.value),
                placeholder: "Max",
                step: "0.1"
            }}
        />

        <FormRange
            label="Draught (metres)"
            required
            minProps={{
                value: formData.draught_metres_min,
                onChange: (e) => handleInputChange('draught_metres_min', e.target.value),
                placeholder: "Min",
                step: "0.1"
            }}
            maxProps={{
                value: formData.draught_metres_max,
                onChange: (e) => handleInputChange('draught_metres_max', e.target.value),
                placeholder: "Max",
                step: "0.1"
            }}
        />

        <FormRange
            label="Speed (knots)"
            required
            minProps={{
                value: formData.speed_knots_min,
                onChange: (e) => handleInputChange('speed_knots_min', e.target.value),
                placeholder: "Min",
                step: "0.1"
            }}
            maxProps={{
                value: formData.speed_knots_max,
                onChange: (e) => handleInputChange('speed_knots_max', e.target.value),
                placeholder: "Max",
                step: "0.1"
            }}
        />

        <FormInput
            label="Complement (personnel)"
            type="number"
            placeholder="Total crew"
            value={formData.complement_total_personnel}
            onChange={(e) => handleInputChange('complement_total_personnel', e.target.value)}
        />

        <FormSelect
            label="Size Category"
            options={SIZE_CATEGORIES}
            value={formData.approximate_size_category}
            onChange={(e) => handleInputChange('approximate_size_category', e.target.value)}
        />

        <FormSelect
            label="Length to Beam Ratio"
            options={LENGTH_TO_BEAM_RATIOS}
            value={formData.length_to_beam_ratio}
            onChange={(e) => handleInputChange('length_to_beam_ratio', e.target.value)}
        />
    </FormSection>
);

export const HullSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Hull Characteristics"
        description="Hull form and shape details"
    >
        <FormSelect
            label="Hull Form"
            required
            options={HULL_FORMS}
            value={formData.hull_form}
            onChange={(e) => handleInputChange('hull_form', e.target.value)}
        />

        <FormSelect
            label="Hull Shape"
            required
            options={HULL_SHAPES}
            value={formData.hull_shape}
            onChange={(e) => handleInputChange('hull_shape', e.target.value)}
        />

        <FormSelect
            label="Bow Shape"
            required
            options={BOW_SHAPES}
            value={formData.bow_shape}
            onChange={(e) => handleInputChange('bow_shape', e.target.value)}
        />

        <FormSelect
            label="Freeboard Height"
            options={FREEBOARD_HEIGHTS}
            value={formData.freeboard_height}
            onChange={(e) => handleInputChange('freeboard_height', e.target.value)}
        />
    </FormSection>
);

export const SuperstructureSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Superstructure & Funnels"
        description="Superstructure layout, masts, and funnel configuration"
    >
        <FormSelect
            label="Superstructure Layout"
            options={SUPERSTRUCTURE_LAYOUTS}
            value={formData.superstructure_layout}
            onChange={(e) => handleInputChange('superstructure_layout', e.target.value)}
        />

        <FormInput
            label="Superstructure Blocks"
            type="number"
            placeholder="Number of distinct blocks"
            value={formData.distinct_superstructure_blocks_number}
            onChange={(e) => handleInputChange('distinct_superstructure_blocks_number', e.target.value)}
            min="0"
            max="10"
        />

        <FormSelect
            label="Mast Configuration"
            options={MAST_CONFIGURATIONS}
            value={formData.mast_configuration}
            onChange={(e) => handleInputChange('mast_configuration', e.target.value)}
        />

        <FormSelect
            label="Funnel Arrangement"
            options={FUNNEL_ARRANGEMENTS}
            value={formData.funnel_arrangement}
            onChange={(e) => handleInputChange('funnel_arrangement', e.target.value)}
        />

        <FormInput
            label="Total Funnels"
            type="number"
            placeholder="Number of funnels"
            value={formData.funnels_total}
            onChange={(e) => handleInputChange('funnels_total', e.target.value)}
            min="0"
            max="10"
        />

        <FormSelect
            label="Funnel Shape"
            options={FUNNEL_SHAPES}
            value={formData.funnel_shape}
            onChange={(e) => handleInputChange('funnel_shape', e.target.value)}
        />

        <FormSelect
            label="Funnel Spacing"
            options={FUNNEL_SPACINGS}
            value={formData.spacing_between_funnels}
            onChange={(e) => handleInputChange('spacing_between_funnels', e.target.value)}
        />

        <FormInput
            label="Smokestacks"
            type="number"
            placeholder="Total smokestacks"
            value={formData.smokestacks_total}
            onChange={(e) => handleInputChange('smokestacks_total', e.target.value)}
            min="0"
            max="10"
        />

        <FormSelect
            label="Radar Configuration"
            options={RADAR_CONFIGURATIONS}
            value={formData.radar_configuration}
            onChange={(e) => handleInputChange('radar_configuration', e.target.value)}
        />

        <FormInput
            label="Air Search Radar"
            placeholder="e.g., SPY-1D, AN/SPS-48"
            value={formData.radar_airsearch}
            onChange={(e) => handleInputChange('radar_airsearch', e.target.value)}
        />

        <FormInput
            label="Surface Search Radar"
            placeholder="e.g., AN/SPS-67"
            value={formData.radar_surfacesearch}
            onChange={(e) => handleInputChange('radar_surfacesearch', e.target.value)}
        />

        <FormInput
            label="Fire Control Radar"
            placeholder="e.g., AN/SPG-62"
            value={formData.radar_firecontrol}
            onChange={(e) => handleInputChange('radar_firecontrol', e.target.value)}
        />
    </FormSection>
);

export const WeaponsSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Weapons & Systems"
        description="Armament, sensors, and combat systems"
    >
        <FormInput
            label="Main Machinery"
            placeholder="e.g., 4 x Gas Turbines"
            value={formData.main_machinery}
            onChange={(e) => handleInputChange('main_machinery', e.target.value)}
        />

        <FormInput
            label="Main Gun"
            placeholder="e.g., 5 inch/62 caliber Mk 45"
            value={formData.main_gun}
            onChange={(e) => handleInputChange('main_gun', e.target.value)}
        />

        <FormInput
            label="Main Gun Caliber (inches)"
            type="number"
            placeholder="Gun caliber"
            value={formData.main_gun_caliber_inches}
            onChange={(e) => handleInputChange('main_gun_caliber_inches', e.target.value)}
            step="0.01"
        />

        <FormInput
            label="Main Gun Turrets"
            type="number"
            placeholder="Number of turrets"
            value={formData.main_gun_turrets_total}
            onChange={(e) => handleInputChange('main_gun_turrets_total', e.target.value)}
            min="0"
            max="10"
        />

        <FormSelect
            label="Gun Mount Position"
            options={GUNMOUNT_POSITIONS}
            value={formData.gunmounts_position}
            onChange={(e) => handleInputChange('gunmounts_position', e.target.value)}
        />

        <FormInput
            label="Gun Mounts Number"
            type="number"
            placeholder="Total gun mounts"
            value={formData.gunmounts_number}
            onChange={(e) => handleInputChange('gunmounts_number', e.target.value)}
            min="0"
            max="20"
        />

        <FormSelect
            label="Gun Mount Size"
            options={GUNMOUNT_SIZES}
            value={formData.gunmounts_size}
            onChange={(e) => handleInputChange('gunmounts_size', e.target.value)}
        />

        <FormInput
            label="Torpedo Tubes"
            type="number"
            placeholder="Visible torpedo tubes"
            value={formData.torpedo_tubes_visible_number}
            onChange={(e) => handleInputChange('torpedo_tubes_visible_number', e.target.value)}
            min="0"
            max="20"
        />

        <FormInput
            label="Missile Launchers"
            placeholder="e.g., Mk 41 VLS (96 cells)"
            value={formData.missile_launchers}
            onChange={(e) => handleInputChange('missile_launchers', e.target.value)}
        />

        <FormInput
            label="CIWS"
            placeholder="e.g., 2 x Phalanx"
            value={formData.CIWS}
            onChange={(e) => handleInputChange('CIWS', e.target.value)}
        />

        <FormInput
            label="CIWS Positions"
            placeholder="e.g., Port and Starboard"
            value={formData.CIWS_positions}
            onChange={(e) => handleInputChange('CIWS_positions', e.target.value)}
        />

        <FormInput
            label="Sonar"
            placeholder="e.g., AN/SQS-53C"
            value={formData.sonar}
            onChange={(e) => handleInputChange('sonar', e.target.value)}
        />
    </FormSection>
);

export const AviationSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Aviation Facilities"
        description="Helicopter and aircraft support capabilities"
    >
        <FormRadioGroup
            label="Flight Deck"
            name="flight_deck"
            value={formData.flight_deck}
            onChange={(value) => handleInputChange('flight_deck', value)}
            options={[
                { value: 'True', label: 'Yes' },
                { value: 'False', label: 'No' }
            ]}
        />

        <FormRadioGroup
            label="Hangar"
            name="hangar"
            value={formData.hangar}
            onChange={(value) => handleInputChange('hangar', value)}
            options={[
                { value: 'True', label: 'Yes' },
                { value: 'False', label: 'No' }
            ]}
        />

        <FormInput
            label="Hangar Capacity"
            type="number"
            placeholder="Number of aircraft"
            value={formData.hangar_capacity}
            onChange={(e) => handleInputChange('hangar_capacity', e.target.value)}
            min="0"
            max="100"
        />

        <FormRadioGroup
            label="Helicopter Platform"
            name="helicopter_platform"
            value={formData.helicopter_platform}
            onChange={(value) => handleInputChange('helicopter_platform', value)}
            options={[
                { value: 'True', label: 'Yes' },
                { value: 'False', label: 'No' }
            ]}
        />

        <FormInput
            label="Helicopter Capacity"
            type="number"
            placeholder="Number of helicopters"
            value={formData.helicopter_capacity}
            onChange={(e) => handleInputChange('helicopter_capacity', e.target.value)}
            min="0"
            max="50"
        />
    </FormSection>
);

export const BuildInfoSection = ({ formData, handleInputChange }) => (
    <FormSection
        title="Build Information"
        description="Shipyard and construction details"
    >
        <FormInput
            label="Builder"
            placeholder="e.g., Bath Iron Works"
            value={formData.builder}
            onChange={(e) => handleInputChange('builder', e.target.value)}
        />

        <FormInput
            label="Launch Year"
            type="number"
            placeholder="e.g., 1991"
            value={formData.launch_year}
            onChange={(e) => handleInputChange('launch_year', e.target.value)}
            min="1800"
            max="2050"
        />

        <FormInput
            label="Commission Year"
            type="number"
            placeholder="e.g., 1992"
            value={formData.commission_year}
            onChange={(e) => handleInputChange('commission_year', e.target.value)}
            min="1800"
            max="2050"
        />
    </FormSection>
);