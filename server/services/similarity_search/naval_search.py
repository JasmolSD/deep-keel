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
        
        When using query_features with a 'country' field, results will be
        pre-filtered to only include ships from that country before
        similarity ranking is applied.
        
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
            # Extract country for pre-filtering (if provided and non-empty)
            country_filter = query_features.get('country')
            if country_filter == '' or country_filter is None:
                country_filter = None
            
            return self._find_similar_to_custom(
                query_features, 
                top_k, 
                weights, 
                aggregate,
                country_filter=country_filter
            )
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
        aggregate: bool = True,
        country_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Find ships similar to custom query features.
        
        Args:
            query_features: Dictionary of features to search for
            top_k: Number of results to return
            weights: Feature weights
            aggregate: Whether to aggregate by index
            country_filter: If provided, only return ships from this country
            
        Returns:
            List of similar ship results
        """
        # Compute similarities
        similarity_scores = self.similarity_engine.compute_similarities(    # type: ignore
            query_features=query_features,
            weights=weights
        )
        
        # Apply country pre-filter if specified
        assert self.df is not None
        if country_filter and 'country' in self.df.columns:
            # Create mask for non-matching countries
            country_mask = self.df['country'] != country_filter
            # Set similarity score to -1 for non-matching countries (will be filtered out)
            similarity_scores[country_mask] = -1
            print(f"Applied country filter: {country_filter}, {(~country_mask).sum()} ships remain")
        
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
        
        # IMPORTANT: Apply country filter FIRST before any similarity computation
        assert self.df is not None
        country_filter = filters.get('country')
        if country_filter:
            country_filtered_df = self.df[self.df['country'] == country_filter].copy()
            print(f"Pre-filtered to country '{country_filter}': {len(country_filtered_df)} ships")
        else:
            country_filtered_df = self.df.copy()
        
        # Exclude already-found indices from the country-filtered dataframe
        if exclude_indices:
            country_filtered_df = country_filtered_df[~country_filtered_df['index'].isin(exclude_indices)]
            print(f"After excluding found indices: {len(country_filtered_df)} ships remain")
        
        if len(country_filtered_df) == 0:
            print("No ships remaining after filtering, returning filter results only")
            for result in filter_results:
                result['match_type'] = 'filter'
            return filter_results
        
        # Compute similarity scores for ALL ships in country-filtered data
        # Use a combined scoring approach: text similarity + other features
        country_filtered_df = country_filtered_df.copy()
        country_filtered_df['_fill_score'] = 0.0
        
        # Score based on text search fields (name matching)
        if text_search_fields:
            print(f"Computing text similarity scores: {text_search_fields}")
            for field, search_term in text_search_fields.items():
                if field in country_filtered_df.columns and search_term:
                    search_term_lower = str(search_term).lower().strip()
                    
                    def compute_text_score(db_value):
                        """Compute similarity score (0-1) instead of boolean match."""
                        if pd.isna(db_value):
                            return 0.0
                        db_value_lower = str(db_value).lower().strip()
                        if not db_value_lower or db_value_lower == 'nan':
                            return 0.0
                        
                        # Exact match
                        if search_term_lower == db_value_lower:
                            return 1.0
                        
                        # Substring match (search term in db value)
                        if search_term_lower in db_value_lower:
                            return 0.9
                        
                        # Substring match (db value in search term)
                        if db_value_lower in search_term_lower:
                            return 0.8
                        
                        # Fuzzy match
                        similarity = self._fuzzy_match_strings(search_term_lower, db_value_lower)
                        return similarity * 0.7  # Scale fuzzy matches
                    
                    field_scores = country_filtered_df[field].apply(compute_text_score)
                    country_filtered_df['_fill_score'] = country_filtered_df['_fill_score'] + field_scores
                    
                    # Log some stats
                    high_scores = (field_scores >= 0.5).sum()
                    print(f"Text similarity '{field}' = '{search_term}': {high_scores} ships with score >= 0.5")
        
        # Add scores based on other similarity features
        if similarity_features:
            print(f"Adding similarity feature scores: {list(similarity_features.keys())}")
            for field, value in similarity_features.items():
                if field in country_filtered_df.columns and field not in (text_search_fields or {}):
                    if isinstance(value, (int, float)):
                        # Numeric similarity - inverse distance
                        col_values = pd.to_numeric(country_filtered_df[field], errors='coerce').fillna(0)
                        if col_values.std() > 0:
                            normalized_diff = abs(col_values - value) / col_values.std()
                            field_scores = 1 / (1 + normalized_diff)  # Score between 0 and 1
                            country_filtered_df['_fill_score'] = country_filtered_df['_fill_score'] + field_scores * 0.3
                    elif isinstance(value, str):
                        # Categorical similarity - exact match bonus
                        exact_matches = (country_filtered_df[field].astype(str).str.lower() == str(value).lower())
                        country_filtered_df.loc[exact_matches, '_fill_score'] += 0.5
        
        # Sort by score descending and take top results
        country_filtered_df = country_filtered_df.sort_values('_fill_score', ascending=False)
        
        # If all scores are 0 (no matching features), sort by ship_class as fallback
        if country_filtered_df['_fill_score'].max() == 0:
            print("No scoring features matched, sorting by ship_class as fallback")
            if 'ship_class' in country_filtered_df.columns:
                country_filtered_df = country_filtered_df.sort_values('ship_class')
        
        # Log top scores
        top_scores = country_filtered_df['_fill_score'].head(5).tolist()
        print(f"Top 5 fill scores: {[round(s, 3) for s in top_scores]}")
        
        # Take top remaining_slots ships
        top_ships_df = country_filtered_df.head(remaining_slots + 5)  # Get a few extra in case of aggregation
        
        # Format results
        additional_results = self.result_formatter.format_filter_results(   # type: ignore
            top_ships_df,
            top_k=remaining_slots,
            aggregate=aggregate
        )
        
        # Add similarity scores and mark as similarity results
        for i, result in enumerate(additional_results):
            result['match_type'] = 'similarity'
            # Use the fill score as similarity score (normalize to 0-1 range)
            idx = result.get('index')
            if idx is not None and idx in country_filtered_df['index'].values:
                fill_score = country_filtered_df[country_filtered_df['index'] == idx]['_fill_score'].iloc[0]
                # Normalize: assume max reasonable score is ~2.0
                result['similarity_score'] = min(fill_score / 2.0, 0.99)
            else:
                result['similarity_score'] = 0.3  # Default for aggregated results
        
        # Limit to remaining_slots
        additional_results = additional_results[:remaining_slots]
        
        print(f"Added {len(additional_results)} total additional results")
        
        # Mark filter results
        for result in filter_results:
            result['match_type'] = 'filter'
        
        # Combine results
        combined_results = filter_results + additional_results
        
        # Re-assign ranks
        for i, result in enumerate(combined_results, 1):
            result['rank'] = i
        
        return combined_results
    
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