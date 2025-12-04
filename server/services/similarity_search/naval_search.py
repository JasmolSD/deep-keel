"""
Main naval similarity search service.
Orchestrates preprocessing, indexing, and searching.

UPDATED: Aggregation now happens during search phase, before limiting to top_k
"""

import pandas as pd
from typing import List, Dict, Any, Optional, Union
from .config import DEFAULT_WEIGHTS, DEFAULT_TOP_K, TEXT_SEARCH_FEATURES
from .data_preprocessor import DataPreprocessor
from .similarity_engine import SimilarityEngine
from .result_formatter import ResultFormatter


class NavalSimilaritySearch:
    """
    Main search service for finding similar naval ships.
    
    This class orchestrates the entire similarity search pipeline,
    from data loading to result formatting.
    """
    
    def __init__(self, file_path: str):
        """
        Initialize the search service with a data file.
        
        Args:
            file_path: Path to CSV or Excel file containing ship data
        """
        self.file_path = file_path
        
        # Initialize components
        self.preprocessor = DataPreprocessor(file_path)
        self.df: Optional[pd.DataFrame] = None
        self.similarity_engine: Optional[SimilarityEngine] = None
        self.result_formatter: Optional[ResultFormatter] = None
        
        # Load and prepare data
        self._initialize()
    
    def _initialize(self) -> None:
        """Load data and build similarity indices."""
        print("Initializing Naval Similarity Search...")
        
        # Preprocess data
        self.df = self.preprocessor.preprocess()
        
        # Build similarity indices
        self.similarity_engine = SimilarityEngine(self.df)
        self.similarity_engine.build_indices()
        
        # Initialize result formatter
        self.result_formatter = ResultFormatter(self.df)
        
        print("Initialization complete!")
    
    def get_similar_ships(
        self,
        query_ship_id: Optional[str] = None,
        query_features: Optional[dict] = None,
        top_k: int = DEFAULT_TOP_K,
        weights: Optional[Dict[str, float]] = None,
        aggregate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Find similar ships based on query.
        
        Aggregation by index happens BEFORE limiting to top_k.
        
        Args:
            query_ship_id: Unique ID of existing ship to compare against
            query_features: Custom feature dictionary for comparison
            top_k: Number of top results to return
            weights: Weights for different feature types
            aggregate: Whether to aggregate results by index (default True)
            
        Returns:
            List of similar ship dictionaries with metadata
            
        Raises:
            ValueError: If neither query_ship_id nor query_features provided
        """
        if weights is None:
            weights = DEFAULT_WEIGHTS.copy()
        
        if query_ship_id is not None:
            return self._find_similar_to_existing(query_ship_id, top_k, weights, aggregate)
        elif query_features is not None:
            return self._find_similar_to_custom(query_features, top_k, weights, aggregate)
        else:
            raise ValueError("Must provide either query_ship_id or query_features")
    
    def _find_similar_to_existing(
        self,
        query_ship_id: str,
        top_k: int,
        weights: Dict[str, float],
        aggregate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Find ships similar to an existing ship.
        
        Args:
            query_ship_id: Unique ID of the query ship
            top_k: Number of results to return
            weights: Feature weights
            aggregate: Whether to aggregate by index
            
        Returns:
            List of similar ship results
        """
        assert self.df is not None

        # Find query ship index
        query_idx = self.df[self.df['unique_id'] == query_ship_id].index
        
        if len(query_idx) == 0:
            raise ValueError(f"Ship with ID '{query_ship_id}' not found")
        
        query_idx = query_idx[0]
        
        # Compute similarities
        similarity_scores = self.similarity_engine.compute_similarities(    # type: ignore
            query_idx=query_idx,
            weights=weights
        )   
        
        # Format and return results (aggregation happens here before top_k limit)
        return self.result_formatter.group_and_format_results(      # type: ignore
            similarity_scores,
            top_k=top_k,
            exclude_idx=query_idx,
            aggregate=aggregate
        )
    
    def _find_similar_to_custom(
        self,
        query_features: dict,
        top_k: int,
        weights: Dict[str, float],
        aggregate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Find ships similar to custom query features.
        
        Args:
            query_features: Dictionary of features to search for
            top_k: Number of results to return
            weights: Feature weights
            aggregate: Whether to aggregate by index
            
        Returns:
            List of similar ship results
        """
        # Compute similarities
        similarity_scores = self.similarity_engine.compute_similarities(    # type: ignore
            query_features=query_features,
            weights=weights
        )
        
        # Format and return results (aggregation happens here before top_k limit)
        return self.result_formatter.group_and_format_results(      # type: ignore
            similarity_scores,
            top_k=top_k,
            aggregate=aggregate
        )
    
    def search_by_filters(
        self, 
        filters: Dict[str, Any], 
        top_k: int = 10,
        aggregate: bool = True,
        fill_with_similarity: bool = True,
        similarity_features: Optional[Dict[str, Any]] = None,
        weights: Optional[Dict[str, float]] = None,
        text_search_fields: Optional[Dict[str, str]] = None
    ) -> List[Dict]:
        """
        Search ships by filters (exact matches, ranges, and text search).
        
        If filter results are fewer than top_k and fill_with_similarity=True,
        additional results will be fetched using similarity search.
        
        Aggregation by index happens BEFORE limiting to top_k.
        
        Args:
            filters: Dictionary of filters where:
                - Regular key: exact match (e.g., {'ship_type': 'Destroyer'})
                - Key with __gte: greater than or equal (e.g., {'length_metres__gte': 100})
                - Key with __lte: less than or equal (e.g., {'length_metres__lte': 200})
                - Key with __contains: partial text match (e.g., {'ship_name__contains': 'Enterprise'})
            top_k: Maximum number of results to return
            aggregate: Whether to aggregate results by index (default True)
            fill_with_similarity: Whether to fill remaining slots with similarity results (default True)
            similarity_features: Features to use for similarity search when filling
            weights: Weights for similarity search
            text_search_fields: Dictionary of text fields to search with partial matching
        
        Returns:
            List of matching ships (aggregated by index if aggregate=True)
        """
        df = self.df.copy()     # type: ignore
        
        # Process text search fields first (fuzzy matching)
        if text_search_fields:
            for field, search_term in text_search_fields.items():
                if field in df.columns and search_term:
                    search_term_lower = str(search_term).lower().strip()
                    
                    # Create a mask for fuzzy matching
                    def fuzzy_match(db_value):
                        """Check if search term fuzzy-matches the database value."""
                        if pd.isna(db_value):
                            return False
                        
                        db_value_lower = str(db_value).lower().strip()
                        
                        if not db_value_lower or db_value_lower == 'nan':
                            return False
                        
                        # Strategy 1: Exact substring match
                        if search_term_lower in db_value_lower:
                            return True
                        
                        # Strategy 2: Check each word in the database value
                        db_words = db_value_lower.replace('(', ' ').replace(')', ' ').split()
                        for db_word in db_words:
                            if len(db_word) < 2:
                                continue
                            
                            # Substring within word
                            if search_term_lower in db_word or db_word in search_term_lower:
                                return True
                            
                            # Fuzzy match (for typos like "sydny" vs "sydney")
                            if self._fuzzy_match_strings(search_term_lower, db_word) > 0.7:
                                return True
                        
                        return False
                    
                    # Apply fuzzy matching filter
                    mask = df[field].apply(fuzzy_match)
                    df = df[mask]
                    print(f"Fuzzy text search {field} ~ '{search_term}', remaining: {len(df)}")
        
        for key, value in filters.items():
            if '__gte' in key:
                # Greater than or equal (for _min queries)
                field = key.replace('__gte', '')
                if field in df.columns:
                    df = df[df[field] >= value]
                    print(f"Filtered {field} >= {value}, remaining: {len(df)}")
            
            elif '__lte' in key:
                # Less than or equal (for _max queries)
                field = key.replace('__lte', '')
                if field in df.columns:
                    df = df[df[field] <= value]
                    print(f"Filtered {field} <= {value}, remaining: {len(df)}")
            
            elif '__gt' in key:
                # Greater than
                field = key.replace('__gt', '')
                if field in df.columns:
                    df = df[df[field] > value]
            
            elif '__lt' in key:
                # Less than
                field = key.replace('__lt', '')
                if field in df.columns:
                    df = df[df[field] < value]
            
            elif '__contains' in key:
                # Partial text match
                field = key.replace('__contains', '')
                if field in df.columns:
                    df = df[df[field].astype(str).str.lower().str.contains(
                        str(value).lower(),
                        na=False,
                        regex=False
                    )]
                    print(f"Text search {field} contains '{value}', remaining: {len(df)}")
            
            else:
                # Exact match
                if key in df.columns:
                    # Handle None/NaN values
                    if pd.isna(value):
                        df = df[df[key].isna()]
                    else:
                        df = df[df[key] == value]
                    print(f"Filtered {key} == {value}, remaining: {len(df)}")
        
        # Use result_formatter to handle aggregation properly
        # Aggregation happens BEFORE limiting to top_k
        filter_results = self.result_formatter.format_filter_results(  # type: ignore
            df,
            top_k=top_k,
            aggregate=aggregate
        )
        
        print(f"Filter results (aggregate={aggregate}): {len(filter_results)}")
        
        # If we have enough results or filling is disabled, return filter results
        if len(filter_results) >= top_k or not fill_with_similarity:
            # Mark filter results
            for result in filter_results:
                result['match_type'] = 'filter'
            return filter_results
        
        # Need to fill remaining slots with similarity search
        remaining_slots = top_k - len(filter_results)
        print(f"Filling {remaining_slots} remaining slots with similarity search...")
        
        # Get index values from filter results to exclude
        exclude_indices = set()
        for result in filter_results:
            index_val = result.get('index')
            if index_val is not None:
                exclude_indices.add(index_val)
        
        print(f"Excluding {len(exclude_indices)} indices from similarity search: {exclude_indices}")
        
        # Build similarity features - IMPORTANT: Include text_search_fields!
        combined_similarity_features = {}
        
        # Start with provided similarity features
        if similarity_features:
            combined_similarity_features.update(similarity_features)
        
        # Add text search fields (ship_name, hull_number) for name-based similarity
        if text_search_fields:
            combined_similarity_features.update(text_search_fields)
            print(f"Added text search fields to similarity: {text_search_fields}")
        
        # Also extract features from filters if needed
        if not combined_similarity_features:
            combined_similarity_features = self._build_similarity_features_from_filters(filters)
        
        # Run similarity search if we have ANY features to search with
        if combined_similarity_features:
            print(f"Running similarity search with features: {list(combined_similarity_features.keys())}")
            
            # Get more similarity results than needed to account for exclusions
            similarity_results = self._find_similar_to_custom(
                query_features=combined_similarity_features,
                top_k=remaining_slots + len(exclude_indices) + 10,  # Get extra to account for exclusions
                weights=weights if weights else DEFAULT_WEIGHTS.copy(),
                aggregate=aggregate
            )
            
            # Filter out results that share index with filter results
            additional_results = []
            for result in similarity_results:
                result_index = result.get('index')
                if result_index not in exclude_indices:
                    # Mark this as a similarity-based result
                    result['match_type'] = 'similarity'
                    additional_results.append(result)
                    exclude_indices.add(result_index)  # Avoid duplicates in similarity results too
                    
                    if len(additional_results) >= remaining_slots:
                        break
            
            print(f"Added {len(additional_results)} similarity results")
            
            # Mark filter results
            for result in filter_results:
                result['match_type'] = 'filter'
            
            # Combine results
            combined_results = filter_results + additional_results
            
            # Re-assign ranks
            for i, result in enumerate(combined_results, 1):
                result['rank'] = i
            
            return combined_results
        
        # No similarity features available - just return filter results (already marked)
        return filter_results
    
    def _build_similarity_features_from_filters(
        self,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Convert filter parameters to similarity search features.
        
        Args:
            filters: Filter dictionary with __gte/__lte suffixes
            
        Returns:
            Features dictionary suitable for similarity search
        """
        features = {}
        
        # Track min/max pairs
        range_fields: Dict[str, Dict[str, Any]] = {}
        
        for key, value in filters.items():
            if '__gte' in key:
                field = key.replace('__gte', '')
                if field not in range_fields:
                    range_fields[field] = {}
                range_fields[field]['min'] = value
            elif '__lte' in key:
                field = key.replace('__lte', '')
                if field not in range_fields:
                    range_fields[field] = {}
                range_fields[field]['max'] = value
            elif '__gt' in key or '__lt' in key:
                # Skip strict inequalities for similarity
                continue
            else:
                # Exact match - use directly
                features[key] = value
        
        # Convert range fields to midpoint values for similarity search
        for field, bounds in range_fields.items():
            min_val = bounds.get('min')
            max_val = bounds.get('max')
            
            if min_val is not None and max_val is not None:
                # Use midpoint
                features[field] = (min_val + max_val) / 2
            elif min_val is not None:
                features[field] = min_val
            elif max_val is not None:
                features[field] = max_val
        
        return features
    
    def _fuzzy_match_strings(self, s1: str, s2: str) -> float:
        """
        Compute fuzzy similarity between two strings for filtering.
        
        Handles typos like "sydny" vs "sydney" by checking:
        - Character overlap with position awareness
        - Prefix matching bonus
        
        Args:
            s1: First string (search term)
            s2: Second string (database value)
            
        Returns:
            Similarity score between 0 and 1
        """
        if not s1 or not s2:
            return 0.0
        
        if s1 == s2:
            return 1.0
        
        # Make s1 the shorter string
        if len(s1) > len(s2):
            s1, s2 = s2, s1
        
        # Count matching characters
        matches = 0
        s2_remaining = s2
        
        for char in s1:
            if char in s2_remaining:
                matches += 1
                s2_remaining = s2_remaining.replace(char, '', 1)
        
        # Base similarity
        similarity = (2.0 * matches) / (len(s1) + len(s2))
        
        # Bonus for matching prefix (important for typos)
        prefix_match = 0
        for i in range(min(len(s1), len(s2))):
            if s1[i] == s2[i]:
                prefix_match += 1
            else:
                break
        
        if prefix_match > 0:
            prefix_bonus = (prefix_match / min(len(s1), len(s2))) * 0.2
            similarity = min(1.0, similarity + prefix_bonus)
        
        return similarity
    
    @staticmethod
    def _apply_filter(
        df: pd.DataFrame,
        column: str,
        value: Union[Any, tuple]
    ) -> pd.DataFrame:
        """
        Apply a single filter to the dataframe.
        
        Args:
            df: DataFrame to filter
            column: Column name
            value: Filter value (single value or (min, max) tuple)
            
        Returns:
            Filtered DataFrame
        """
        if isinstance(value, (int, float)):
            # Exact numerical match
            return df[df[column] == value]
        
        elif isinstance(value, (list, tuple)) and len(value) == 2:
            # Range query
            return df[(df[column] >= value[0]) & (df[column] <= value[1])]
        
        else:
            # Text filter (contains, case-insensitive)
            return df[
                df[column].astype(str).str.contains(
                    str(value),
                    case=False,
                    na=False
                )
            ]
    
    def format_results_for_display(
        self,
        results: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Format results as human-readable strings.
        
        Args:
            results: List of result dictionaries
            
        Returns:
            List of formatted strings
        """
        return self.result_formatter.format_for_display(results)    # type: ignore
    
    def get_available_categories(self) -> Dict[str, List[str]]:
        """
        Get all available categories for form dropdowns.
        
        Returns:
            Dictionary mapping column names to lists of unique values
        """
        return self.preprocessor.get_available_categories()
    
    def get_ship_by_id(self, ship_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific ship by its unique ID.
        
        Args:
            ship_id: Unique ship identifier
            
        Returns:
            Ship data dictionary or None if not found
        """
        assert self.df is not None

        ship_data = self.df[self.df['unique_id'] == ship_id]
        
        if len(ship_data) == 0:
            return None
        
        return ship_data.iloc[0].to_dict()
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get dataset statistics.
        
        Returns:
            Dictionary containing dataset statistics
        """
        assert self.df is not None

        return {
            'total_ships': len(self.df),
            'unique_countries': self.df['country'].nunique(),
            'unique_classes': self.df['ship_class'].nunique(),
            'unique_types': self.df['ship_type'].nunique(),
            'countries': sorted(self.df['country'].unique().tolist()),
            'ship_types': sorted(self.df['ship_type'].unique().tolist())
        }