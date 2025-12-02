"""
Main naval similarity search service.
Orchestrates preprocessing, indexing, and searching.

UPDATED: Aggregation now happens during search phase, before limiting to top_k
"""

import pandas as pd
from typing import List, Dict, Any, Optional, Union
from .config import DEFAULT_WEIGHTS, DEFAULT_TOP_K
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
        weights: Optional[Dict[str, float]] = None
    ) -> List[Dict]:
        """
        Search ships by filters (exact matches and ranges).
        
        If filter results are fewer than top_k and fill_with_similarity=True,
        additional results will be fetched using similarity search.
        
        Aggregation by index happens BEFORE limiting to top_k.
        
        Args:
            filters: Dictionary of filters where:
                - Regular key: exact match (e.g., {'ship_type': 'Destroyer'})
                - Key with __gte: greater than or equal (e.g., {'length_metres__gte': 100})
                - Key with __lte: less than or equal (e.g., {'length_metres__lte': 200})
            top_k: Maximum number of results to return
            aggregate: Whether to aggregate results by index (default True)
            fill_with_similarity: Whether to fill remaining slots with similarity results (default True)
            similarity_features: Features to use for similarity search when filling
            weights: Weights for similarity search
        
        Returns:
            List of matching ships (aggregated by index if aggregate=True)
        """
        df = self.df.copy()     # type: ignore
        
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
        
        # Build similarity features from filters if not provided
        if similarity_features is None:
            similarity_features = self._build_similarity_features_from_filters(filters)
        
        # Only run similarity search if we have features to search with
        if similarity_features:
            # Get more similarity results than needed to account for exclusions
            similarity_results = self._find_similar_to_custom(
                query_features=similarity_features,
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