// upload/useAutocomplete.js
import { useState } from 'react'
import { AUTOCOMPLETE_DATA } from '../constants/uploadConstants'

export const useAutocomplete = () => {
    const [suggestions, setSuggestions] = useState({
        flag: [],
        registryPort: [],
        vesselName: []
    });

    const [showSuggestions, setShowSuggestions] = useState({
        flag: false,
        registryPort: false,
        vesselName: false
    });

    const handleAutocomplete = (field, value) => {
        let filtered = [];

        if (field === 'flag') {
            filtered = AUTOCOMPLETE_DATA.flags.filter(f =>
                f.toLowerCase().includes(value.toLowerCase())
            );
        } else if (field === 'registryPort') {
            filtered = AUTOCOMPLETE_DATA.ports.filter(p =>
                p.toLowerCase().includes(value.toLowerCase())
            );
        } else if (field === 'vesselName') {
            filtered = AUTOCOMPLETE_DATA.vesselPrefixes.filter(p =>
                p.toLowerCase().includes(value.toLowerCase())
            );
        }

        setSuggestions(prev => ({ ...prev, [field]: filtered }));
        setShowSuggestions(prev => ({ ...prev, [field]: value.length > 0 }));

        return filtered;
    };

    const selectSuggestion = (field, value) => {
        setShowSuggestions(prev => ({ ...prev, [field]: false }));
        return value;
    };

    const hideAutocompleteSuggestions = (field) => {
        setTimeout(() => {
            setShowSuggestions(prev => ({ ...prev, [field]: false }));
        }, 200);
    };

    return {
        suggestions,
        showSuggestions,
        handleAutocomplete,
        selectSuggestion,
        hideAutocompleteSuggestions
    };
};