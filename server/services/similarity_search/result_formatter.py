"""
Result formatting and grouping utilities.
Handles aggregation of search results by ship class and formatting for display.
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional

from .config import SIMILARITY_THRESHOLD


class ResultFormatter:
    """Formats and groups search results for presentation."""
    
    def __init__(self, df: pd.DataFrame):
        """
        Initialize formatter with ship data.
        
        Args:
            df: DataFrame containing ship data
        """
        self.df = df
    
    def group_and_format_results(
        self,
        similarity_scores: np.ndarray,
        top_k: int = 10,
        exclude_idx: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Group results by ship class and format for display.
        
        Args:
            similarity_scores: Array of similarity scores
            top_k: Number of top results to return
            exclude_idx: Index to exclude (e.g., the query ship itself)
            
        Returns:
            List of formatted result dictionaries
        """
        # Get top similar indices
        similar_indices = np.argsort(similarity_scores)[::-1]
        
        # Exclude query index if provided
        if exclude_idx is not None:
            similar_indices = similar_indices[similar_indices != exclude_idx]
        
        # Get more results than needed for grouping
        similar_indices = similar_indices[:top_k * 10]
        
        # Group by ship class, country, and type
        grouped_results = self._group_by_ship_class(similar_indices, similarity_scores)
        
        # Sort by similarity and take top_k
        results = sorted(
            grouped_results.values(),
            key=lambda x: x['similarity_score'],
            reverse=True
        )[:top_k]
        
        # Apply similarity threshold
        results = [r for r in results if r['similarity_score'] >= SIMILARITY_THRESHOLD]
        
        # Add ranks
        for i, result in enumerate(results[:top_k]):
            result['rank'] = i + 1
        
        return results[:top_k]
    
    def _group_by_ship_class(
        self,
        indices: np.ndarray,
        similarity_scores: np.ndarray
    ) -> Dict[str, Dict[str, Any]]:
        """
        Group ship results by class, country, and type.
        
        Args:
            indices: Array of ship indices
            similarity_scores: Array of similarity scores
            
        Returns:
            Dictionary of grouped results
        """
        grouped = {}
        
        for idx in indices:
            ship = self.df.iloc[idx]
            
            # Extract key attributes
            ship_class = ship.get('ship_class', 'Unknown')
            country = ship.get('country', 'Unknown')
            ship_type = ship.get('ship_type', 'Unknown')
            
            # Create unique key
            result_key = f"{ship_class}|{country}|{ship_type}"
            
            # Initialize group if first occurrence
            if result_key not in grouped:
                grouped[result_key] = {
                    'ship_names': set(),
                    'hull_numbers': set(),
                    'country': country,
                    'ship_type': ship_type,
                    'ship_class': ship_class,
                    'similarity_score': similarity_scores[idx],
                    'pages': self._format_page_range(ship)
                }
            
            # Add ship name and hull number
            if pd.notna(ship.get('ship_name')):
                grouped[result_key]['ship_names'].add(str(ship['ship_name']).strip())
            
            if pd.notna(ship.get('hull_number')):
                grouped[result_key]['hull_numbers'].add(str(ship['hull_number']).strip())
        
        # Convert sets to formatted strings
        for data in grouped.values():
            data['combined_name'] = self._format_combined_name(
                data['ship_names'],
                data['hull_numbers']
            )
            data['ship_names_list'] = sorted(data['ship_names'])
            data['hull_numbers_list'] = sorted(data['hull_numbers'])
            
            # Remove sets
            del data['ship_names']
            del data['hull_numbers']
        
        return grouped
    
    @staticmethod
    def _format_page_range(ship: pd.Series) -> str:
        """
        Format page range for a ship record.
        
        Args:
            ship: Ship data row
            
        Returns:
            Formatted page range string
        """
        start_page = ship.get('start_page')
        end_page = ship.get('end_page')
        
        if pd.notna(start_page) and pd.notna(end_page):
            return f"{int(start_page)}-{int(end_page)}"
        return "N/A"
    
    @staticmethod
    def _format_combined_name(ship_names: set, hull_numbers: set) -> str:
        """
        Format combined name from ship names and hull numbers.
        
        Args:
            ship_names: Set of ship names
            hull_numbers: Set of hull numbers
            
        Returns:
            Formatted combined name string
        """
        sorted_names = sorted(ship_names)
        sorted_hull_numbers = sorted(hull_numbers)
        
        if len(sorted_names) == 1:
            combined = sorted_names[0]
            if sorted_hull_numbers:
                combined += f" ({', '.join(sorted_hull_numbers)})"
        else:
            names_str = ', '.join(sorted_names)
            if sorted_hull_numbers:
                hulls_str = ', '.join(sorted_hull_numbers)
                combined = f"{names_str} ({hulls_str})"
            else:
                combined = names_str
        
        return combined
    
    @staticmethod
    def format_for_display(results: List[Dict[str, Any]]) -> List[str]:
        """
        Format results as human-readable strings.
        
        Args:
            results: List of result dictionaries
            
        Returns:
            List of formatted result strings
        """
        formatted = []
        
        for result in results:
            similarity_pct = f"{result['similarity_score'] * 100:.1f}%"
            
            formatted_result = (
                f"Name: {result['combined_name']}\n"
                f"Country: {result['country']}\n"
                f"Class: {result['ship_class']}\n"
                f"Type: {result['ship_type']}\n"
                f"Similarity: {similarity_pct}\n"
                f"Pages: {result['pages']}"
            )
            formatted.append(formatted_result)
        
        return formatted
    
    def format_filter_results(
        self,
        filtered_df: pd.DataFrame,
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Format results from filter-based search.
        
        Args:
            filtered_df: Filtered DataFrame
            top_k: Maximum number of results
            
        Returns:
            List of formatted result dictionaries
        """
        results = []
        
        for _, row in filtered_df.head(top_k).iterrows():
            results.append({
                'ship_name': row.get('ship_name', 'Unknown'),
                'hull_number': row.get('hull_number', 'N/A'),
                'country': row.get('country', 'Unknown'),
                'ship_type': row.get('ship_type', 'Unknown'),
                'ship_class': row.get('ship_class', 'Unknown'),
                'pages': self._format_page_range(row),
                'unique_id': row.get('unique_id', str(row.name))
            })
        
        return results