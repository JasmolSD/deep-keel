// upload/useAutocomplete.js
import { useState } from 'react'
import { AUTOCOMPLETE_DATA } from './uploadConstants'

export const useAutocomplete = () => {
    const [suggestions, setSuggestions] = useState({
        country: [],
        base_port: []
    });

    const [showSuggestions, setShowSuggestions] = useState({
        country: false,
        base_port: false
    });

    const handleAutocomplete = (field, value) => {
        let filtered = [];

        if (field === 'country') {
            filtered = AUTOCOMPLETE_DATA.countries.filter(c =>
                c.toLowerCase().includes(value.toLowerCase())
            );
        } else if (field === 'base_port') {
            filtered = AUTOCOMPLETE_DATA.ports.filter(p =>
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