"""
Query builder for preparing custom search queries.
Handles conversion of user input to feature vectors.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Union
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer

from .config import (
    NUMERIC_FEATURES, CATEGORICAL_FEATURES, BINARY_FEATURES
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
    
    def prepare_numerical_query(self, query_features: dict) -> List[float]:
        """
        Prepare numerical features from query, handling ranges.
        
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
        
        Supports:
        - Single values: {col: 100}
        - Ranges: {col: [50, 100]} or {col_min: 50, col_max: 100}
        
        Args:
            query_features: Query feature dictionary
            col: Column name
            
        Returns:
            Numeric value (midpoint for ranges)
        """
        # Check for min/max range format
        min_key = f"{col}_min"
        max_key = f"{col}_max"
        
        if min_key in query_features or max_key in query_features:
            min_val = query_features.get(min_key, 0)
            max_val = query_features.get(max_key, 1000)
            
            if min_val == 0 and max_key in query_features:
                return max_val / 2
            return (min_val + max_val) / 2
        
        # Check for direct value
        value = query_features.get(col, 0)
        
        # Handle list/tuple ranges
        if isinstance(value, (list, tuple)) and len(value) == 2:
            return (value[0] + value[1]) / 2
        
        return float(value)
    
    def prepare_categorical_query(self, query_features: dict) -> dict:
        """
        Prepare categorical features from query.
        
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
            
            # Skip range queries for categorical
            if isinstance(value, (list, tuple)):
                continue
            
            # Encode if the value exists in the original data
            if col in self.label_encoders and value in self.df[col].values:
                try:
                    query_categorical[col] = self.label_encoders[col].transform([value])[0]
                except Exception:
                    pass  # Skip if encoding fails
        
        return query_categorical
    
    def prepare_text_query(self, query_features: dict) -> str:
        """
        Prepare text features from query.
        
        Args:
            query_features: Dictionary of query features
            
        Returns:
            Combined text string
        """
        text_parts = []
        
        for col in CATEGORICAL_FEATURES:
            if col not in query_features:
                continue
            
            value = query_features[col]
            
            # Skip range queries for text
            if isinstance(value, (list, tuple)):
                continue
            
            text_parts.append(str(value))
        
        return ' '.join(text_parts)
    
    def prepare_binary_query(self, query_features: dict) -> dict:
        """
        Prepare binary features from query.
        
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
        if isinstance(value, (bool, int)):
            return 1 if value else 0
        
        if isinstance(value, str):
            return 1 if value.lower() in ['y', 'yes', '1', 'true'] else 0
        
        return 0