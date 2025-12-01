"""
Similarity computation engine for naval ships.
Handles indexing and computing similarities across multiple feature types.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, List, Optional, Union
from scipy.sparse import spmatrix

from .config import (
    NUMERIC_FEATURES, CATEGORICAL_FEATURES, BINARY_FEATURES,
    TFIDF_MAX_FEATURES, TFIDF_STOP_WORDS
)


class SimilarityEngine:
    """Computes and manages similarity indices for ship features."""
    
    def __init__(self, df: pd.DataFrame):
        """
        Initialize the similarity engine with preprocessed data.
        
        Args:
            df: Preprocessed DataFrame containing ship data
        """
        self.df = df
        self.scaler = StandardScaler()
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.tfidf = TfidfVectorizer(
            max_features=TFIDF_MAX_FEATURES,
            stop_words=TFIDF_STOP_WORDS
        )
        
        # Similarity matrices/arrays
        self.numerical_scaled: Optional[np.ndarray] = None
        self.categorical_encoded: Optional[pd.DataFrame] = None
        self.text_features_tfidf: Optional[Union[np.ndarray, spmatrix]] = None
        self.binary_df: Optional[pd.DataFrame] = None
        
    def build_indices(self) -> None:
        """Build all similarity indices."""
        self._build_numerical_index()
        self._build_categorical_index()
        self._build_text_index()
        self._build_binary_index()
        
        print(f"Similarity indices built for {len(self.df)} ship entries")
    
    def _build_numerical_index(self) -> None:
        """Build and scale numerical features index."""
        # Select only columns that exist in the dataframe
        available_numeric = [col for col in NUMERIC_FEATURES if col in self.df.columns]
        
        if not available_numeric:
            print("Warning: No numeric features found")
            self.numerical_scaled = np.zeros((len(self.df), 1))
            return
        
        numerical_df = self.df[available_numeric].fillna(0)
        self.numerical_scaled = self.scaler.fit_transform(numerical_df)
    
    def _build_categorical_index(self) -> None:
        """Build categorical features index with label encoding."""
        # Select only columns that exist in the dataframe
        available_categorical = [col for col in CATEGORICAL_FEATURES if col in self.df.columns]
        
        if not available_categorical:
            print("Warning: No categorical features found")
            self.categorical_encoded = pd.DataFrame()
            return
        
        self.categorical_encoded = pd.DataFrame(index=self.df.index)
        
        for col in available_categorical:
            le = LabelEncoder()
            self.categorical_encoded[col] = le.fit_transform(
                self.df[col].fillna('Unknown')
            )
            self.label_encoders[col] = le
    
    def _build_text_index(self) -> None:
        """Build TF-IDF text features index."""
        if 'text_features' not in self.df.columns:
            print("Warning: No text features found")
            self.text_features_tfidf = np.zeros((len(self.df), 1))
            return
        
        self.text_features_tfidf = self.tfidf.fit_transform(
            self.df['text_features']
        )
    
    def _build_binary_index(self) -> None:
        """Build binary features index."""
        # Select only columns that exist in the dataframe
        available_binary = [col for col in BINARY_FEATURES if col in self.df.columns]
        
        if not available_binary:
            print("Warning: No binary features found")
            self.binary_df = pd.DataFrame(index=self.df.index)
            return
        
        self.binary_df = self.df[available_binary]
    
    def compute_similarities(
        self,
        query_idx: Optional[int] = None,
        query_features: Optional[dict] = None,
        weights: Optional[Dict[str, float]] = None
    ) -> np.ndarray:
        """
        Compute similarity scores for a query.
        
        Args:
            query_idx: Index of existing ship to compare against
            query_features: Custom feature dictionary for comparison
            weights: Weights for different feature types
            
        Returns:
            Array of similarity scores for all ships
        """
        if weights is None:
            weights = {
                'numerical': 0.25,
                'categorical': 0.25,
                'text': 0.25,
                'binary': 0.25
            }

        if query_idx is not None:
            return self._compute_similarities_to_existing(query_idx, weights)
        elif query_features is not None:
            return self._compute_similarities_to_custom(query_features, weights)
        else:
            raise ValueError("Must provide either query_idx or query_features")
    
    def _compute_similarities_to_existing(
        self,
        query_idx: int,
        weights: Dict[str, float]
    ) -> np.ndarray:
        """Compute similarities to an existing ship in the dataset."""
        # assertions for type consistency
        assert self.numerical_scaled is not None
        assert self.text_features_tfidf is not None
        
        # Numerical similarity
        num_sim = cosine_similarity(
            self.numerical_scaled[query_idx:query_idx+1],
            self.numerical_scaled
        )[0]
        
        # Categorical similarity (exact matching ratio)
        cat_sim = self._compute_categorical_similarity_vectorized(query_idx)
        
        # Text similarity
        text_sim = cosine_similarity(
            self.text_features_tfidf[query_idx:query_idx+1],    # type: ignore
            self.text_features_tfidf
        )[0]
        
        # Binary similarity
        bin_sim = self._compute_binary_similarity_vectorized(query_idx)
        
        # Combined weighted similarity
        combined = (
            weights['numerical'] * num_sim +
            weights['categorical'] * cat_sim +
            weights['text'] * text_sim +
            weights['binary'] * bin_sim
        )
        
        return combined
    
    def _compute_categorical_similarity_vectorized(self, query_idx: int) -> np.ndarray:
        """Vectorized categorical similarity computation."""
        if self.categorical_encoded is None or  self.categorical_encoded.empty:
            return np.zeros(len(self.df))
        
        query_values = self.categorical_encoded.iloc[query_idx].values
        # Broadcasting comparison
        matches = (self.categorical_encoded.values == query_values).astype(float)
        return matches.mean(axis=1)
    
    def _compute_binary_similarity_vectorized(self, query_idx: int) -> np.ndarray:
        """Vectorized binary similarity computation."""
        if self.binary_df is None or self.binary_df.empty:
            return np.zeros(len(self.df))
        
        query_values = self.binary_df.iloc[query_idx].values
        matches = (self.binary_df.values == query_values).astype(float)
        return matches.mean(axis=1)
    
    def _compute_similarities_to_custom(
        self,
        query_features: dict,
        weights: Dict[str, float]
    ) -> np.ndarray:
        """Compute similarities to custom query features."""
        from .query_builder import QueryBuilder
        
        builder = QueryBuilder(self.df, self.scaler, self.label_encoders, self.tfidf)
        
        # Prepare query components
        query_num = builder.prepare_numerical_query(query_features)
        query_cat = builder.prepare_categorical_query(query_features)
        query_text = builder.prepare_text_query(query_features)
        query_bin = builder.prepare_binary_query(query_features)
        
        # Compute similarities
        num_sim = self._compute_numerical_similarity_custom(query_num)
        cat_sim = self._compute_categorical_similarity_custom(query_cat)
        text_sim = self._compute_text_similarity_custom(query_text)
        bin_sim = self._compute_binary_similarity_custom(query_bin)
        
        # Combined similarity
        combined = (
            weights['numerical'] * num_sim +
            weights['categorical'] * cat_sim +
            weights['text'] * text_sim +
            weights['binary'] * bin_sim
        )
        
        return combined
    
    def _compute_numerical_similarity_custom(self, query_numerical: List[float]) -> np.ndarray:
        """Compute numerical similarity for custom query."""
        if not query_numerical or self.numerical_scaled is None:
            return np.zeros(len(self.df))
        
        try:
            query_scaled = self.scaler.transform([query_numerical])
            return cosine_similarity(query_scaled, self.numerical_scaled)[0]
        except Exception as e:
            print(f"Numerical similarity error: {e}")
            return np.zeros(len(self.df))
    
    def _compute_categorical_similarity_custom(self, query_categorical: dict) -> np.ndarray:
        """Compute categorical similarity for custom query."""
        if not query_categorical or self.categorical_encoded is None or self.categorical_encoded.empty:
            return np.zeros(len(self.df))

        similarities = np.zeros(len(self.df))

        for idx in range(len(self.categorical_encoded)):
            matches = sum(
                1 for col, val in query_categorical.items()
                if col in self.categorical_encoded.columns
                and self.categorical_encoded.iloc[idx][col] == val
            )
            total = len(query_categorical)
            similarities[idx] = matches / total if total > 0 else 0
        
        return similarities
    
    def _compute_text_similarity_custom(self, query_text: str) -> np.ndarray:
        """Compute text similarity for custom query."""
        if not query_text or not query_text.strip():
            return np.zeros(len(self.df))
        
        try:
            query_tfidf = self.tfidf.transform([query_text])
            return cosine_similarity(query_tfidf, self.text_features_tfidf)[0]
        except Exception as e:
            print(f"Text similarity error: {e}")
            return np.zeros(len(self.df))
    
    def _compute_binary_similarity_custom(self, query_binary: dict) -> np.ndarray:
        """Compute binary similarity for custom query."""
        if not query_binary or self.binary_df is None or self.binary_df.empty:
            return np.zeros(len(self.df))
        
        similarities = np.zeros(len(self.df))
        
        for idx in range(len(self.binary_df)):
            matches = sum(
                1 for col, val in query_binary.items()
                if col in self.binary_df.columns
                and self.binary_df.iloc[idx][col] == val
            )
            total = len(query_binary)
            similarities[idx] = matches / total if total > 0 else 0
        
        return similarities