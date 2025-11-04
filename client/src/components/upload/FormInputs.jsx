// components/upload/FormInputs.jsx
import { useState } from 'react'

export const FormInput = ({ label, required, hint, ...props }) => (
    <div className="form-group">
        <label>{label} {required && <span className="required-star">*</span>}</label>
        <input className="form-input" {...props} />
        {hint && <span className="form-hint">{hint}</span>}
    </div>
);

export const FormSelect = ({ label, required, options, placeholder = "Select...", ...props }) => (
    <div className="form-group">
        <label>{label} {required && <span className="required-star">*</span>}</label>
        <select className="form-input" {...props}>
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

export const FormRange = ({ label, required, hint, minProps, maxProps }) => (
    <div className="form-group range-group">
        <label>{label} {required && <span className="required-star">*</span>}</label>
        <div className="range-inputs">
            <input type="number" className="form-input range-input" placeholder="Min" {...minProps} />
            <span className="range-separator">to</span>
            <input type="number" className="form-input range-input" placeholder="Max" {...maxProps} />
        </div>
        {hint && <span className="form-hint">{hint}</span>}
    </div>
);

export const FormTextarea = ({ label, ...props }) => (
    <div className="form-group form-group-full">
        <label>{label}</label>
        <textarea className="form-input" {...props} />
    </div>
);

export const FormAutocomplete = ({ label, value, onChange, suggestions, showSuggestions, onSelect, onBlur, placeholder }) => (
    <div className="form-group autocomplete-group">
        <label>{label}</label>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className="form-input"
        />
        {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
                {suggestions.map(suggestion => (
                    <div
                        key={suggestion}
                        className="suggestion-item"
                        onClick={() => onSelect(suggestion)}
                    >
                        {suggestion}
                    </div>
                ))}
            </div>
        )}
    </div>
);

export const FormTagSelect = ({ label, options, selected, onToggle, fullWidth = false }) => (
    <div className={`form-group ${fullWidth ? 'form-group-full' : ''}`}>
        <label>{label}</label>
        <div className="tag-select">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    className={`tag-option ${selected.includes(option) ? 'selected' : ''}`}
                    onClick={() => onToggle(option)}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export const FormRadioGroup = ({ label, name, options, value, onChange }) => (
    <div className="form-group">
        <label>{label}</label>
        <div className="radio-group">
            {options.map(option => (
                <label key={option.value} className="radio-label">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    </div>
);

export const ConfidenceSlider = ({ value, onChange }) => {
    const levels = ['low', 'medium', 'high', 'confirmed'];
    const currentIndex = levels.indexOf(value);

    return (
        <div className="form-group">
            <label>Confidence Level</label>
            <div className="confidence-slider">
                <input
                    type="range"
                    min="0"
                    max="3"
                    value={currentIndex}
                    onChange={(e) => onChange(levels[e.target.value])}
                    className="slider"
                />
                <div className="slider-labels">
                    {levels.map(level => (
                        <span key={level} className={value === level ? 'active' : ''}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};