"""
Query builder for preparing custom search queries.
Handles conversion of user input to feature vectors.
"""

import pandas as pd
from typing import Dict, List, Any, Optional
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer

from .config import (
    NUMERIC_FEATURES, CATEGORICAL_FEATURES, BINARY_FEATURES, TEXT_SEARCH_FEATURES
)


class QueryBuilder:
    """Builds query vectors from user input for similarity search."""
    
    def __init__(
        self,
        df: pd.DataFrame,
        scaler: StandardScaler,
        label_encoders: Dict[str, LabelEncoder],
        tfidf: TfidfVectorizer
    ):
        """
        Initialize query builder with fitted transformers.
        
        Args:
            df: Original dataframe
            scaler: Fitted StandardScaler for numerical features
            label_encoders: Dictionary of fitted LabelEncoders
            tfidf: Fitted TfidfVectorizer
        """
        self.df = df
        self.scaler = scaler
        self.label_encoders = label_encoders
        self.tfidf = tfidf
    
    def prepare_numerical_ranges(
        self, 
        query_features: dict
    ) -> Dict[str, Dict[str, Optional[float]]]:
        """
        Extract numerical feature ranges from query.
        
        IMPORTANT: Only returns features that were actually specified.
        Does NOT default to zero for missing features.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            Dictionary mapping column names to {min, max} dicts
        """
        available_numeric = [col for col in NUMERIC_FEATURES if col in self.df.columns]
        ranges = {}
        
        for col in available_numeric:
            range_vals = self._extract_range(query_features, col)
            if range_vals is not None:
                ranges[col] = range_vals
        
        return ranges
    
    def _extract_range(
        self, 
        query_features: dict, 
        col: str
    ) -> Optional[Dict[str, Optional[float]]]:
        """
        Extract min/max range for a numerical column.
        
        Supports formats:
        - {col_min: 70, col_max: 80}
        - {col: [70, 80]}
        - {col: 75}  (single value)
        
        Returns:
            Dict with 'min' and 'max' keys, or None if not specified
        """
        min_key = f"{col}_min"
        max_key = f"{col}_max"
        
        # Check for min/max format
        if min_key in query_features or max_key in query_features:
            min_val = query_features.get(min_key)
            max_val = query_features.get(max_key)
            
            # Convert empty strings to None
            if min_val == '' or min_val is None:
                min_val = None
            else:
                min_val = float(min_val)
                
            if max_val == '' or max_val is None:
                max_val = None
            else:
                max_val = float(max_val)
            
            # Only return if at least one bound is specified
            if min_val is not None or max_val is not None:
                return {'min': min_val, 'max': max_val}
            return None
        
        # Check for direct value
        if col in query_features:
            value = query_features[col]
            
            if value == '' or value is None:
                return None
            
            # Handle list/tuple ranges
            if isinstance(value, (list, tuple)) and len(value) == 2:
                return {
                    'min': float(value[0]) if value[0] not in ('', None) else None,
                    'max': float(value[1]) if value[1] not in ('', None) else None
                }
            
            # Single value - use as both min and max for exact match
            try:
                val = float(value)  # type: ignore
                # Allow 5% tolerance for single value matches
                tolerance = abs(val) * 0.05 if val != 0 else 1
                return {'min': val - tolerance, 'max': val + tolerance}
            except (ValueError, TypeError):
                return None
        
        return None
    
    def prepare_numerical_query(self, query_features: dict) -> List[float]:
        """
        Prepare numerical features from query, handling ranges.
        
        DEPRECATED: Use prepare_numerical_ranges instead for custom queries.
        Kept for backward compatibility with existing ship index queries.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            List of numerical feature values
        """
        available_numeric = [col for col in NUMERIC_FEATURES if col in self.df.columns]
        query_numerical = []
        
        for col in available_numeric:
            value = self._get_numeric_value(query_features, col)
            query_numerical.append(value)
        
        return query_numerical
    
    def _get_numeric_value(self, query_features: dict, col: str) -> float:
        """
        Extract numeric value from query, handling different formats.
        
        Args:
            query_features: Query feature dictionary
            col: Column name
            
        Returns:
            Numeric value (midpoint for ranges)
        """
        min_key = f"{col}_min"
        max_key = f"{col}_max"
        
        if min_key in query_features or max_key in query_features:
            min_val = query_features.get(min_key, 0)
            max_val = query_features.get(max_key, 1000)
            
            # Handle empty strings
            if min_val == '':
                min_val = 0
            if max_val == '':
                max_val = 1000
                
            min_val = float(min_val)
            max_val = float(max_val)
            
            return (min_val + max_val) / 2
        
        value = query_features.get(col, 0)
        
        if value == '' or value is None:
            return 0.0
        
        if isinstance(value, (list, tuple)) and len(value) == 2:
            return (float(value[0]) + float(value[1])) / 2
        
        return float(value)     # type: ignore
    
    def prepare_categorical_query(self, query_features: dict) -> dict:
        """
        Prepare categorical features from query.
        
        Only includes features that are actually specified.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            Dictionary of encoded categorical values
        """
        available_categorical = [col for col in CATEGORICAL_FEATURES if col in self.df.columns]
        query_categorical = {}
        
        for col in available_categorical:
            if col not in query_features:
                continue
            
            value = query_features[col]
            
            # Skip empty values
            if value == '' or value is None:
                continue
            
            # Skip range queries for categorical
            if isinstance(value, (list, tuple)):
                continue
            
            # Encode if the value exists in the original data
            if col in self.label_encoders and value in self.df[col].values:
                try:
                    query_categorical[col] = self.label_encoders[col].transform([value])[0]     # type: ignore
                except Exception:
                    pass
        
        return query_categorical
    
    def prepare_text_query(self, query_features: dict) -> str:
        """
        Prepare text features from query.
        
        Only includes features that are actually specified.
        Now includes TEXT_SEARCH_FEATURES (ship_name, hull_number, ship_class) 
        for better text-based matching.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            Combined text string
        """
        text_parts = []
        
        # Include both categorical features and text search features
        all_text_fields = list(CATEGORICAL_FEATURES) + list(TEXT_SEARCH_FEATURES)
        
        for col in all_text_fields:
            if col not in query_features:
                continue
            
            value = query_features[col]
            
            # Skip empty values
            if value == '' or value is None:
                continue
            
            # Skip range queries for text
            if isinstance(value, (list, tuple)):
                continue
            
            text_parts.append(str(value))
        
        return ' '.join(text_parts)
    
    def prepare_binary_query(self, query_features: dict) -> dict:
        """
        Prepare binary features from query.
        
        Only includes features that are actually specified.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            Dictionary of binary values (0 or 1)
        """
        available_binary = [col for col in BINARY_FEATURES if col in self.df.columns]
        query_binary = {}
        
        for col in available_binary:
            if col not in query_features:
                continue
            
            value = query_features[col]
            
            # Skip empty values
            if value == '' or value is None:
                continue
            
            query_binary[col] = self._convert_to_binary(value)
        
        return query_binary
    
    @staticmethod
    def _convert_to_binary(value: Any) -> int:
        """
        Convert various formats to binary 0/1.
        
        Args:
            value: Value to convert
            
        Returns:
            0 or 1
        """
        if isinstance(value, bool):
            return 1 if value else 0
        
        if isinstance(value, int):
            return 1 if value else 0
        
        if isinstance(value, str):
            return 1 if value.lower() in ['y', 'yes', '1', 'true'] else 0
        
        return 0