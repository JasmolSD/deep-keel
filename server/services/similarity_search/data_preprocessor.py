"""
Data preprocessing module for naval ship data.
Handles loading, cleaning, and transforming raw data.
"""

import pandas as pd
from typing import Optional
from pathlib import Path

from .config import (
    SELECTED_FEATURES, NUMERIC_FEATURES, CATEGORICAL_FEATURES,
    BINARY_FEATURES, BINARY_VALUE_MAP
)


class DataPreprocessor:
    """Handles data loading and preprocessing for naval ship data."""
    
    def __init__(self, file_path: str):
        """
        Initialize the preprocessor with a data file.
        
        Args:
            file_path: Path to the CSV or Excel file containing ship data
        """
        self.file_path = Path(file_path)
        self.df: Optional[pd.DataFrame] = None
        
    def load_data(self) -> pd.DataFrame:
        """
        Load data from file, selecting only required features.
        
        Returns:
            Loaded DataFrame
        """
        # Determine file type and load accordingly
        file_extension = self.file_path.suffix.lower()
        
        try:
            if file_extension == '.csv':
                self.df = pd.read_csv(
                    self.file_path,
                    usecols=lambda x: x in SELECTED_FEATURES
                )
            elif file_extension in ['.xlsx', '.xls']:
                self.df = pd.read_excel(
                    self.file_path,
                    usecols=lambda x: x in SELECTED_FEATURES
                )
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
            print(f"Loaded {len(self.df)} ship records from {self.file_path}")
            return self.df
            
        except Exception as e:
            raise RuntimeError(f"Failed to load data from {self.file_path}: {e}")
    
    def preprocess(self) -> pd.DataFrame:
        """
        Complete preprocessing pipeline.
        
        Returns:
            Preprocessed DataFrame
        """
        if self.df is None:
            self.load_data()

        assert self.df is not None
        
        self._handle_missing_values()
        self._convert_numeric_columns()
        self._handle_categorical_columns()
        self._handle_binary_columns()
        self._create_text_features()
        self._create_unique_ids()
        
        print(f"Preprocessing complete for {len(self.df)} ships")
        return self.df
    
    def _handle_missing_values(self) -> None:
        """Fill missing values for critical columns."""
        assert self.df is not None
        self.df['country'] = self.df['country'].astype(str).replace('nan', 'Unknown').fillna('Unknown')
        self.df['ship_type'] = self.df['ship_type'].astype(str).replace('nan', 'Unknown').fillna('Unknown')
        self.df['ship_class'] = self.df.get('ship_class', pd.Series(['Unknown'] * len(self.df))).astype(str).replace('nan', 'Unknown').fillna('Unknown')
    
    def _convert_numeric_columns(self) -> None:
        """Convert and clean numeric columns."""
        assert self.df is not None
        for col in NUMERIC_FEATURES:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)
    
    def _handle_categorical_columns(self) -> None:
        """Fill missing values in categorical columns and convert to strings."""
        assert self.df is not None
        for col in CATEGORICAL_FEATURES:
            if col in self.df.columns:
                # Convert all values to strings to avoid mixed type issues
                self.df[col] = self.df[col].astype(str).replace('nan', 'Unknown')
                self.df[col] = self.df[col].fillna('Unknown')
    
    def _handle_binary_columns(self) -> None:
        """Convert binary columns to 0/1 format."""
        assert self.df is not None
        for col in BINARY_FEATURES:
            if col in self.df.columns:
                self.df[col] = self.df[col].map(BINARY_VALUE_MAP).fillna(0).astype(int)
    
    def _create_text_features(self) -> None:
        """Create combined text feature for TF-IDF vectorization."""
        assert self.df is not None
        text_parts = []
        
        for col in CATEGORICAL_FEATURES:
            if col in self.df.columns:
                text_parts.append(self.df[col].fillna('').astype(str))
        
        if text_parts:
            self.df['text_features'] = text_parts[0]
            for part in text_parts[1:]:
                self.df['text_features'] = self.df['text_features'] + ' ' + part
        else:
            self.df['text_features'] = ''
    
    def _create_unique_ids(self) -> None:
        """Create unique identifiers for each ship instance."""
        assert self.df is not None
        self.df['unique_id'] = self.df.index.astype(str)
    
    def get_available_categories(self) -> dict:
        """
        Get all available unique values for categorical columns.
        
        Returns:
            Dictionary mapping column names to sorted lists of unique values
        """
        if self.df is None:
            raise RuntimeError("Data must be loaded before getting categories")
        
        categories = {}
        categorical_cols = CATEGORICAL_FEATURES + ['ship_type']
        
        for col in categorical_cols:
            if col in self.df.columns:
                categories[col] = sorted(
                    self.df[col].dropna().unique().tolist()
                )
        
        return categories