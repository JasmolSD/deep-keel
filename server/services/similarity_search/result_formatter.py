"""
Result formatting and grouping utilities.
Handles aggregation of search results by index and formatting for display.

UPDATED: Now groups by 'index' column instead of ship_class|country|ship_type
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
        exclude_idx: Optional[int] = None,
        aggregate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Group results by index and format for display.
        
        Aggregation happens BEFORE limiting to top_k to ensure we get
        the correct number of unique results.
        
        Args:
            similarity_scores: Array of similarity scores
            top_k: Number of top results to return
            exclude_idx: Index to exclude (e.g., the query ship itself)
            aggregate: Whether to aggregate by index (default True)
            
        Returns:
            List of formatted result dictionaries
        """
        # Get ALL indices sorted by similarity (we'll limit after aggregation)
        similar_indices = np.argsort(similarity_scores)[::-1]
        
        # Exclude query index if provided
        if exclude_idx is not None:
            similar_indices = similar_indices[similar_indices != exclude_idx]
        
        if aggregate:
            # Group by index column - process ALL results first
            grouped_results = self._group_by_index(similar_indices, similarity_scores)
            
            # Sort by similarity and take top_k AFTER aggregation
            results = sorted(
                grouped_results.values(),
                key=lambda x: x['similarity_score'],
                reverse=True
            )
        else:
            # No aggregation - just format individual results
            results = []
            for idx in similar_indices:
                ship = self.df.iloc[idx]
                results.append({
                    'ship_name': ship.get('ship_name', 'Unknown'),
                    'hull_number': ship.get('hull_number', ''),
                    'country': ship.get('country', 'Unknown'),
                    'ship_type': ship.get('ship_type', 'Unknown'),
                    'ship_class': ship.get('ship_class', 'Unknown'),
                    'ship_role': ship.get('ship_role', 'Unknown'),
                    'similarity_score': similarity_scores[idx],
                    'pages': self._format_page_range(ship),
                    'index': ship.get('index', None),
                    'length_metres': ship.get('length_metres', 0),
                    'beam_metres': ship.get('beam_metres', 0),
                    'draught_metres': ship.get('draught_metres', 0),
                })
        
        # Apply similarity threshold
        results = [r for r in results if r.get('similarity_score', 0) >= SIMILARITY_THRESHOLD]
        
        # Limit to top_k AFTER aggregation
        results = results[:top_k]
        
        # Add ranks
        for i, result in enumerate(results):
            result['rank'] = i + 1
        
        return results
    
    def _group_by_index(
        self,
        indices: np.ndarray,
        similarity_scores: np.ndarray
    ) -> Dict[Any, Dict[str, Any]]:
        """
        Group ship results by the 'index' column.
        
        Args:
            indices: Array of ship indices (row positions in dataframe)
            similarity_scores: Array of similarity scores
            
        Returns:
            Dictionary of grouped results keyed by index value
        """
        grouped = {}
        
        for idx in indices:
            ship = self.df.iloc[idx]
            
            # Use 'index' column as the grouping key
            index_value = ship.get('index', None)
            
            # Fallback to ship characteristics if 'index' column not present
            if index_value is None or pd.isna(index_value):
                result_key = (
                    ship.get('ship_class', 'Unknown'),
                    ship.get('country', 'Unknown'),
                    ship.get('ship_type', 'Unknown')
                )
            else:
                result_key = index_value
            
            # Initialize group if first occurrence (highest similarity for this index)
            if result_key not in grouped:
                grouped[result_key] = {
                    'ship_names': set(),
                    'hull_numbers': set(),
                    'country': ship.get('country', 'Unknown'),
                    'ship_type': ship.get('ship_type', 'Unknown'),
                    'ship_class': ship.get('ship_class', 'Unknown'),
                    'ship_role': ship.get('ship_role', 'Unknown'),
                    'similarity_score': similarity_scores[idx],
                    'pages': self._format_page_range(ship),
                    'index': index_value,
                    'length_metres': ship.get('length_metres', 0),
                    'beam_metres': ship.get('beam_metres', 0),
                    'draught_metres': ship.get('draught_metres', 0),
                }
            
            # Add ship name and hull number to the group
            if pd.notna(ship.get('ship_name')):
                grouped[result_key]['ship_names'].add(str(ship['ship_name']).strip())
            
            if pd.notna(ship.get('hull_number')):
                grouped[result_key]['hull_numbers'].add(str(ship['hull_number']).strip())
        
        # Convert sets to formatted strings and lists
        for data in grouped.values():
            data['combined_name'] = self._format_combined_name(
                data['ship_names'],
                data['hull_numbers']
            )
            data['ship_names_list'] = sorted(data['ship_names'])
            data['hull_numbers_list'] = sorted(data['hull_numbers'])
            data['ship_count'] = len(data['ship_names']) if data['ship_names'] else 1
            
            # Remove sets (not JSON serializable)
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
        
        if not sorted_names:
            return "Unknown"
        
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
            
            name = result.get('combined_name', result.get('ship_name', 'Unknown'))
            
            formatted_result = (
                f"Name: {name}\n"
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
        top_k: int = 20,
        aggregate: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Format results from filter-based search.
        
        Aggregation happens BEFORE limiting to top_k.
        Applies similarity threshold to filter out low-confidence similarity matches.
        Exact filter matches are always included regardless of similarity score.
        
        Args:
            filtered_df: Filtered DataFrame
            top_k: Maximum number of results
            aggregate: Whether to aggregate by index (default True)
            
        Returns:
            List of formatted result dictionaries
        """
        if aggregate:
            # Group by index column BEFORE limiting
            grouped = {}
            
            for _, row in filtered_df.iterrows():
                index_value = row.get('index', None)
                
                # Fallback key if no index
                if index_value is None or pd.isna(index_value):
                    result_key = (
                        row.get('ship_class', 'Unknown'),
                        row.get('country', 'Unknown'),
                        row.get('ship_type', 'Unknown')
                    )
                else:
                    result_key = index_value
                
                if result_key not in grouped:
                    grouped[result_key] = {
                        'ship_names': set(),
                        'hull_numbers': set(),
                        'country': row.get('country', 'Unknown'),
                        'ship_type': row.get('ship_type', 'Unknown'),
                        'ship_class': row.get('ship_class', 'Unknown'),
                        'ship_role': row.get('ship_role', 'Unknown'),
                        'pages': self._format_page_range(row),
                        'index': index_value,
                        'length_metres': row.get('length_metres', 0),
                        'beam_metres': row.get('beam_metres', 0),
                        'draught_metres': row.get('draught_metres', 0),
                        'unique_id': row.get('unique_id', str(row.name)),
                        'similarity_score': row.get('similarity_score', 1.0),
                        'match_type': row.get('match_type', 'filter')
                    }
                
                if pd.notna(row.get('ship_name')):
                    grouped[result_key]['ship_names'].add(str(row['ship_name']).strip())
                if pd.notna(row.get('hull_number')):
                    grouped[result_key]['hull_numbers'].add(str(row['hull_number']).strip())
            
            # Convert to list and format
            results = []
            for data in grouped.values():
                data['combined_name'] = self._format_combined_name(
                    data['ship_names'],
                    data['hull_numbers']
                )
                data['ship_names_list'] = sorted(data['ship_names'])
                data['hull_numbers_list'] = sorted(data['hull_numbers'])
                data['ship_count'] = len(data['ship_names']) if data['ship_names'] else 1
                del data['ship_names']
                del data['hull_numbers']
                results.append(data)
            
            # Apply similarity threshold - keep filter matches, filter similarity matches
            filtered_results = []
            for result in results:
                match_type = result.get('match_type', 'filter')
                similarity_score = result.get('similarity_score', 1.0)
                
                # Always include exact filter matches
                if match_type == 'filter':
                    filtered_results.append(result)
                # Only include similarity matches above threshold
                elif similarity_score >= SIMILARITY_THRESHOLD:
                    filtered_results.append(result)
            
            # Limit to top_k AFTER filtering
            return filtered_results[:top_k]
        else:
            # No aggregation
            results = []
            for _, row in filtered_df.iterrows():
                match_type = row.get('match_type', 'filter')
                similarity_score = row.get('similarity_score', 1.0)
                
                # Apply threshold filtering for similarity matches
                if match_type == 'similarity' and similarity_score < SIMILARITY_THRESHOLD:
                    continue
                
                results.append({
                    'ship_name': row.get('ship_name', 'Unknown'),
                    'hull_number': row.get('hull_number', 'N/A'),
                    'country': row.get('country', 'Unknown'),
                    'ship_type': row.get('ship_type', 'Unknown'),
                    'ship_class': row.get('ship_class', 'Unknown'),
                    'ship_role': row.get('ship_role', 'Unknown'),
                    'pages': self._format_page_range(row),
                    'index': row.get('index', None),
                    'unique_id': row.get('unique_id', str(row.name)),
                    'length_metres': row.get('length_metres', 0),
                    'beam_metres': row.get('beam_metres', 0),
                    'draught_metres': row.get('draught_metres', 0),
                    'similarity_score': similarity_score,
                    'match_type': match_type
                })
                
                # Stop when we have enough results
                if len(results) >= top_k:
                    break
            
            return results