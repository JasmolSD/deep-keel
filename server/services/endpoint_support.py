# Supports the classify endpoint in app.py
# Replace your format_search_results and classify_ship functions with these:

from typing import List, Dict

def format_search_results(results: List[Dict]) -> List[Dict]:
    """
    Format search results with cleaner structure.
    UPDATED to:
    - Handle both get_similar_ships and search_by_filters results
    - Extract page numbers from start_page/end_page fields
    - Handle aggregated ship names
    
    Args:
        results: Raw results from search engine
        
    Returns:
        Formatted results with cleaner structure
    """
    formatted = []
    
    for i, result in enumerate(results, 1):
        # Handle both formats:
        # - get_similar_ships returns: combined_name, ship_names_list
        # - search_by_filters returns: ship_name, hull_number
        # - aggregated results have: aggregated_ship_names, aggregated_hull_numbers
        
        # Check if this result has aggregated names (from aggregate_results_by_index)
        if 'aggregated_ship_names' in result:
            ship_names_list = result['aggregated_ship_names']
            hull_numbers_list = result['aggregated_hull_numbers']
            ship_name = ', '.join(ship_names_list) if ship_names_list else result.get('ship_class', 'Unknown')
            ship_count = result.get('ship_count', len(ship_names_list) if ship_names_list else 1)
        elif 'combined_name' in result:
            # Result from get_similar_ships (similarity search)
            ship_name = result.get('combined_name', 'Unknown')
            ship_names_list = result.get('ship_names_list', [])
            hull_numbers_list = result.get('hull_numbers_list', [])
            ship_count = len(ship_names_list) if ship_names_list else 1
        else:
            # Result from search_by_filters (filter search) - single ship
            ship_name = result.get('ship_name', 'Unknown')
            hull_number = result.get('hull_number', '')
            ship_names_list = [ship_name] if ship_name and ship_name != 'Unknown' else []
            hull_numbers_list = [hull_number] if hull_number else []
            ship_count = 1
        
        # Handle page numbers - check for both formats
        pages = result.get('pages', 'N/A')
        if pages == 'N/A' or not pages:
            # Try to construct from start_page and end_page
            start_page = result.get('start_page', '')
            end_page = result.get('end_page', '')
            if start_page and end_page:
                if start_page == end_page:
                    pages = str(start_page)
                else:
                    pages = f"{start_page}-{end_page}"
            else:
                pages = 'N/A'
        
        formatted_result = {
            'rank': result.get('rank', i),
            'similarity_score': round(result.get('similarity_score', 1.0) * 100, 2) if 'similarity_score' in result else 100.0,
            'ship_count': ship_count,  # How many ships were aggregated
            'match_type': result.get('match_type', 'filter'),  # 'filter' or 'similarity'
            'ship_info': {
                'name': ship_name,
                'ship_names': ship_names_list,
                'hull_numbers': hull_numbers_list,
                'country': result.get('country', 'Unknown'),
                'ship_class': result.get('ship_class', 'Unknown'),
                'ship_type': result.get('ship_type', 'Unknown'),
                'ship_role': result.get('ship_role', 'Unknown'),
                'length_metres': result.get('length_metres', 'N/A'),
                'beam_metres': result.get('beam_metres', 'N/A'),
                'draught_metres': result.get('draught_metres', 'N/A'),
                'pages': pages
            }
        }
        formatted.append(formatted_result)
    
    return formatted