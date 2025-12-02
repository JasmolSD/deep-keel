"""
Similarity computation engine for naval ships.
Handles indexing and computing similarities across multiple feature types.

FIXES APPLIED:
1. Dynamic weight normalization based on features actually provided
2. Range-based matching for numerical features instead of pure cosine similarity
3. Proper handling of empty query components
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import Dict, Optional, Union
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
        self.numerical_raw: Optional[pd.DataFrame] = None  # Keep raw values for range matching
        self.categorical_encoded: Optional[pd.DataFrame] = None
        self.text_features_tfidf: Optional[Union[np.ndarray, spmatrix]] = None
        self.binary_df: Optional[pd.DataFrame] = None
        
        # Store feature statistics for range matching
        self.feature_stats: Dict[str, Dict[str, float]] = {}
        
    def build_indices(self) -> None:
        """Build all similarity indices."""
        self._build_numerical_index()
        self._build_categorical_index()
        self._build_text_index()
        self._build_binary_index()
        
        print(f"Similarity indices built for {len(self.df)} ship entries")
    
    def _build_numerical_index(self) -> None:
        """Build and scale numerical features index."""
        available_numeric = [col for col in NUMERIC_FEATURES if col in self.df.columns]
        
        if not available_numeric:
            print("Warning: No numeric features found")
            self.numerical_scaled = np.zeros((len(self.df), 1))
            self.numerical_raw = pd.DataFrame()
            return
        
        numerical_df = self.df[available_numeric].fillna(0)
        self.numerical_raw = numerical_df.copy()
        self.numerical_scaled = self.scaler.fit_transform(numerical_df)
        
        # Store feature statistics for range-based matching
        for col in available_numeric:
            self.feature_stats[col] = {
                'min': numerical_df[col].min(),
                'max': numerical_df[col].max(),
                'mean': numerical_df[col].mean(),
                'std': numerical_df[col].std()
            }
    
    def _build_categorical_index(self) -> None:
        """Build categorical features index with label encoding."""
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
                'numerical': 0.35,
                'categorical': 0.30,
                'text': 0.20,
                'binary': 0.15
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
        if self.categorical_encoded is None or self.categorical_encoded.empty:
            return np.zeros(len(self.df))
        
        query_values = self.categorical_encoded.iloc[query_idx].values
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
        """
        Compute similarities to custom query features.
        
        KEY FIX: Dynamically adjust weights based on which feature types
        are actually provided in the query.
        """
        from .query_builder import QueryBuilder
        
        builder = QueryBuilder(self.df, self.scaler, self.label_encoders, self.tfidf)
        
        # Prepare query components and track which have data
        query_num_ranges = builder.prepare_numerical_ranges(query_features)
        query_cat = builder.prepare_categorical_query(query_features)
        query_text = builder.prepare_text_query(query_features)
        query_bin = builder.prepare_binary_query(query_features)
        
        # Compute similarities for each component
        num_sim, has_num = self._compute_numerical_range_similarity(query_num_ranges)
        cat_sim, has_cat = self._compute_categorical_similarity_custom(query_cat)
        text_sim, has_text = self._compute_text_similarity_custom(query_text)
        bin_sim, has_bin = self._compute_binary_similarity_custom(query_bin)
        
        # DYNAMIC WEIGHT ADJUSTMENT
        # Only include weights for feature types that were actually specified
        active_weights = {}
        if has_num:
            active_weights['numerical'] = weights['numerical']
        if has_cat:
            active_weights['categorical'] = weights['categorical']
        if has_text:
            active_weights['text'] = weights['text']
        if has_bin:
            active_weights['binary'] = weights['binary']
        
        # Normalize active weights to sum to 1.0
        if not active_weights:
            print("Warning: No query features provided, returning zeros")
            return np.zeros(len(self.df))
        
        weight_sum = sum(active_weights.values())
        normalized_weights = {k: v / weight_sum for k, v in active_weights.items()}
        
        # Combined similarity using only active weights
        combined = np.zeros(len(self.df))
        if has_num:
            combined += normalized_weights['numerical'] * num_sim
        if has_cat:
            combined += normalized_weights['categorical'] * cat_sim
        if has_text:
            combined += normalized_weights['text'] * text_sim
        if has_bin:
            combined += normalized_weights['binary'] * bin_sim
        
        return combined
    
    def _compute_numerical_range_similarity(
        self, 
        query_ranges: Dict[str, Dict[str, Optional[float]]]
    ) -> tuple[np.ndarray, bool]:
        """
        Compute numerical similarity using RANGE MATCHING.
        
        For each specified feature with min/max:
        - Ships within range get score 1.0
        - Ships outside range get penalized based on distance
        
        Returns:
            Tuple of (similarity_array, has_data_bool)
        """
        if not query_ranges or self.numerical_raw is None or self.numerical_raw.empty:
            return np.zeros(len(self.df)), False
        
        similarities = np.ones(len(self.df))
        feature_count = 0
        
        for col, range_vals in query_ranges.items():
            if col not in self.numerical_raw.columns:
                continue
            
            min_val = range_vals.get('min')
            max_val = range_vals.get('max')
            
            if min_val is None and max_val is None:
                continue
            
            feature_count += 1
            ship_values = self.numerical_raw[col].values
            
            # Get feature range for normalization
            feat_min = self.feature_stats.get(col, {}).get('min', 0)
            feat_max = self.feature_stats.get(col, {}).get('max', 1)
            feat_range = max(feat_max - feat_min, 1)  # Avoid division by zero
            
            # Compute per-feature similarity
            feature_sim = np.ones(len(self.df))
            
            for i, val in enumerate(ship_values):
                if min_val is not None and max_val is not None:
                    # Both bounds specified
                    if min_val <= val <= max_val:
                        feature_sim[i] = 1.0
                    elif val < min_val:
                        # Penalize based on how far below minimum
                        distance = (min_val - val) / feat_range
                        feature_sim[i] = max(0, 1 - distance * 2)
                    else:
                        # Penalize based on how far above maximum
                        distance = (val - max_val) / feat_range
                        feature_sim[i] = max(0, 1 - distance * 2)
                elif min_val is not None:
                    # Only minimum specified
                    if val >= min_val:
                        feature_sim[i] = 1.0
                    else:
                        distance = (min_val - val) / feat_range
                        feature_sim[i] = max(0, 1 - distance * 2)
                elif max_val is not None:
                    # Only maximum specified
                    if val <= max_val:
                        feature_sim[i] = 1.0
                    else:
                        distance = (val - max_val) / feat_range
                        feature_sim[i] = max(0, 1 - distance * 2)
            
            similarities *= feature_sim
        
        if feature_count == 0:
            return np.zeros(len(self.df)), False
        
        # Take the geometric mean to balance all features
        return np.power(similarities, 1 / feature_count), True
    
    def _compute_categorical_similarity_custom(
        self, 
        query_categorical: dict
    ) -> tuple[np.ndarray, bool]:
        """
        Compute categorical similarity for custom query.
        
        Returns:
            Tuple of (similarity_array, has_data_bool)
        """
        if not query_categorical or self.categorical_encoded is None or self.categorical_encoded.empty:
            return np.zeros(len(self.df)), False

        similarities = np.zeros(len(self.df))
        valid_features = 0

        for idx in range(len(self.categorical_encoded)):
            matches = 0
            total = 0
            for col, val in query_categorical.items():
                if col in self.categorical_encoded.columns:
                    total += 1
                    if self.categorical_encoded.iloc[idx][col] == val:
                        matches += 1
            
            if total > 0:
                similarities[idx] = matches / total
                valid_features = total
        
        return similarities, valid_features > 0
    
    def _compute_text_similarity_custom(
        self, 
        query_text: str
    ) -> tuple[np.ndarray, bool]:
        """
        Compute text similarity for custom query.
        
        Returns:
            Tuple of (similarity_array, has_data_bool)
        """
        if not query_text or not query_text.strip():
            return np.zeros(len(self.df)), False
        
        try:
            query_tfidf = self.tfidf.transform([query_text])
            return cosine_similarity(query_tfidf, self.text_features_tfidf)[0], True
        except Exception as e:
            print(f"Text similarity error: {e}")
            return np.zeros(len(self.df)), False
    
    def _compute_binary_similarity_custom(
        self, 
        query_binary: dict
    ) -> tuple[np.ndarray, bool]:
        """
        Compute binary similarity for custom query.
        
        Returns:
            Tuple of (similarity_array, has_data_bool)
        """
        if not query_binary or self.binary_df is None or self.binary_df.empty:
            return np.zeros(len(self.df)), False
        
        similarities = np.zeros(len(self.df))
        valid_features = 0
        
        for idx in range(len(self.binary_df)):
            matches = 0
            total = 0
            for col, val in query_binary.items():
                if col in self.binary_df.columns:
                    total += 1
                    if self.binary_df.iloc[idx][col] == val:
                        matches += 1
            
            if total > 0:
                similarities[idx] = matches / total
                valid_features = total
        
        return similarities, valid_features > 0
    