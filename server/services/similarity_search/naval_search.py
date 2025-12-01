"""
Main naval similarity search service.
Orchestrates preprocessing, indexing, and searching.
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
        weights: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Find similar ships based on query.
        
        Args:
            query_ship_id: Unique ID of existing ship to compare against
            query_features: Custom feature dictionary for comparison
            top_k: Number of top results to return
            weights: Weights for different feature types
            
        Returns:
            List of similar ship dictionaries with metadata
            
        Raises:
            ValueError: If neither query_ship_id nor query_features provided
        """
        if weights is None:
            weights = DEFAULT_WEIGHTS.copy()
        
        if query_ship_id is not None:
            return self._find_similar_to_existing(query_ship_id, top_k, weights)
        elif query_features is not None:
            return self._find_similar_to_custom(query_features, top_k, weights)
        else:
            raise ValueError("Must provide either query_ship_id or query_features")
    
    def _find_similar_to_existing(
        self,
        query_ship_id: str,
        top_k: int,
        weights: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Find ships similar to an existing ship.
        
        Args:
            query_ship_id: Unique ID of the query ship
            top_k: Number of results to return
            weights: Feature weights
            
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
        
        # Format and return results
        return self.result_formatter.group_and_format_results(      # type: ignore
            similarity_scores,
            top_k=top_k,
            exclude_idx=query_idx
        )
    
    def _find_similar_to_custom(
        self,
        query_features: dict,
        top_k: int,
        weights: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """
        Find ships similar to custom query features.
        
        Args:
            query_features: Dictionary of features to search for
            top_k: Number of results to return
            weights: Feature weights
            
        Returns:
            List of similar ship results
        """
        # Compute similarities
        similarity_scores = self.similarity_engine.compute_similarities(    # type: ignore
            query_features=query_features,
            weights=weights
        )
        
        # Format and return results
        return self.result_formatter.group_and_format_results(      # type: ignore
            similarity_scores,
            top_k=top_k
        )
    
    def search_by_filters(
        self,
        filters: Dict[str, Union[Any, tuple]],
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Search ships using direct filters.
        
        Supports exact matches and range queries.
        
        Args:
            filters: Dictionary of column:value filters
                    - Single values for exact match
                    - Tuples (min, max) for range queries
            top_k: Maximum number of results
            
        Returns:
            List of matching ships
            
        Example:
            >>> search.search_by_filters({
            ...     'country': 'USA',
            ...     'length_metres': (100, 200),
            ...     'ship_type': 'Destroyer'
            ... })
        """
        assert self.df is not None
        filtered_df = self.df.copy()
        
        for column, value in filters.items():
            if column not in filtered_df.columns:
                print(f"Warning: Column '{column}' not found, skipping")
                continue
            
            filtered_df = self._apply_filter(filtered_df, column, value)
        
        return self.result_formatter.format_filter_results(filtered_df, top_k)  # type: ignore
    
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