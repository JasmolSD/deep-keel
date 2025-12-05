# Supports the classify endpoint in app.py

from typing import List, Dict, Any
import time
import uuid


def clean_query_features(data: Dict[str, Any], logger=None) -> Dict[str, Any]:
    """
    Clean and validate query features from JSON input.
    Removes empty strings, None values, and converts types appropriately.
    """
    cleaned = {}
    
    # Fields that should always be numeric (for range queries)
    numeric_range_fields = [
        'length_metres', 'beam_metres', 'draught_metres', 'speed_knots',
        'displacement_full_load_tons', 'complement_total_personnel',
        'funnels_total', 'gunmounts_number', 'torpedo_tubes_visible_number'
    ]
    
    for key, value in data.items():
        # Skip empty strings, None, and empty lists
        if value is None or value == "" or value == []:
            continue
        
        # Check if this is a range field that should be numeric
        base_key = key.replace('_min', '').replace('_max', '')
        is_range_field = any(base_key.endswith(f) or base_key == f for f in numeric_range_fields)
        
        # Skip boolean values in numeric range fields (frontend bug)
        if is_range_field and (key.endswith('_min') or key.endswith('_max')):
            if isinstance(value, bool):
                if logger:
                    logger.warning(f"Skipping invalid boolean value for range field: {key}={value}")
                continue
            # Try to convert to number
            try:
                cleaned[key] = float(value)
                continue
            except (ValueError, TypeError):
                if logger:
                    logger.warning(f"Skipping non-numeric value for range field: {key}={value}")
                continue
        
        # Convert string "True"/"False" to boolean (for checkbox fields)
        if isinstance(value, str):
            if value.lower() in ["true", "yes", "1"]:
                cleaned[key] = True
                continue
            elif value.lower() in ["false", "no", "0"]:
                cleaned[key] = False
                continue
        
        # Convert numeric strings to numbers
        if isinstance(value, str) and value.replace('.', '').replace('-', '').isdigit():
            try:
                if '.' in value:
                    cleaned[key] = float(value)
                else:
                    cleaned[key] = int(value)
                continue
            except ValueError:
                pass
        
        # Keep valid values
        cleaned[key] = value
    
    return cleaned


def process_classification_request(
    data: Dict[str, Any],
    search_engine,
    default_top_k: int,
    similarity_threshold: float,
    generate_report_fn,
    logger=None
) -> Dict[str, Any]:
    """
    Process a ship classification request.
    
    Args:
        data: Raw request data (JSON)
        search_engine: NavalSimilaritySearch instance
        default_top_k: Default number of results
        similarity_threshold: Threshold for similarity matching
        generate_report_fn: Function to generate classification report
        logger: Optional logger instance
        
    Returns:
        Dictionary with classification results
    """
    start_time = time.time()
    
    # Clean the query features
    cleaned_features = clean_query_features(data, logger)
    
    # Get top_k, weights, and aggregation preference
    top_k = cleaned_features.pop('top_k', default_top_k)
    weights = cleaned_features.pop('weights', None)
    aggregate_by_index = cleaned_features.pop('aggregate_by_index', True)
    
    # Separate range queries from exact matches
    filters = {}
    similarity_features = {}
    text_search_fields = {}
    has_range_queries = False
    
    # Define which fields use text/partial matching
    text_match_fields = ['ship_name', 'hull_number']
    
    # Define filter fields (exact match)
    filter_fields = [
        'ship_type', 'ship_role', 'country', 'ship_class',
        'hull_form', 'approximate_size_category', 'base_port',
        'superstructure_layout', 'funnel_arrangement',
        'mast_configuration', 'radar_configuration',
        'flight_deck', 'hangar', 'helicopter_platform'
    ]
    
    # Process each cleaned feature
    for key, value in cleaned_features.items():
        if key.endswith('_min') or key.endswith('_max'):
            has_range_queries = True
            base_field = key.rsplit('_', 1)[0]
            suffix = key.rsplit('_', 1)[1]
            
            if suffix == 'min':
                filters[f"{base_field}__gte"] = value
            elif suffix == 'max':
                filters[f"{base_field}__lte"] = value
        
        elif key in text_match_fields:
            text_search_fields[key] = value
            similarity_features[key] = value
            has_range_queries = True
        
        elif key in filter_fields:
            filters[key] = value
        
        else:
            similarity_features[key] = value
    
    # Log search parameters
    if logger:
        logger.info(f"Has range queries: {has_range_queries}")
        logger.info(f"Filters: {filters}")
        logger.info(f"Text search fields: {text_search_fields}")
        logger.info(f"Similarity features: {similarity_features}")
        logger.info(f"Aggregate by index: {aggregate_by_index}")
    
    # Perform the search
    if has_range_queries or text_search_fields or (filters and not similarity_features):
        if logger:
            logger.info("Using filter-based search")
        results = search_engine.search_by_filters(
            filters=filters,
            top_k=top_k,
            aggregate=aggregate_by_index,
            fill_with_similarity=True,
            similarity_features=similarity_features if similarity_features else None,
            weights=weights,
            text_search_fields=text_search_fields if text_search_fields else None
        )
    
    elif similarity_features:
        if logger:
            logger.info("Using similarity-based search")
        
        # Include country from filters for pre-filtering during similarity search
        query_with_country = similarity_features.copy()
        if 'country' in filters:
            query_with_country['country'] = filters['country']
            if logger:
                logger.info(f"Including country filter in similarity search: {filters['country']}")

        results = search_engine.get_similar_ships(
            query_features=similarity_features,
            top_k=top_k,
            weights=weights,
            aggregate=aggregate_by_index
        )
    
    else:
        return {
            'success': False,
            'error': 'No valid search criteria provided'
        }
    
    if logger:
        logger.info(f"Search returned {len(results)} results (aggregate={aggregate_by_index})")
    
    # Format results
    formatted_results = format_search_results(results)
    
    # Generate report text
    all_query_features = {**filters, **similarity_features}
    report_text = generate_report_fn(
        all_query_features,
        formatted_results,
        similarity_threshold
    )
    
    # Generate unique classification ID
    classification_id = str(uuid.uuid4())
    
    # Calculate processing time
    processing_time = round(time.time() - start_time, 2)
    
    # Count filter vs similarity matches
    filter_match_count = sum(1 for r in formatted_results if r.get('match_type') == 'filter')
    similarity_match_count = sum(1 for r in formatted_results if r.get('match_type') == 'similarity')
    
    # Build response
    return {
        'success': True,
        'total_matches': len(formatted_results),
        'matches': formatted_results,
        'processing_time': processing_time,
        'report_text': report_text,
        'classification_id': classification_id,
        'timestamp': time.time(),
        'debug_info': {
            'search_method': 'filter' if (has_range_queries or text_search_fields) else 'similarity',
            'aggregated': aggregate_by_index,
            'filters_applied': filters if filters else None,
            'text_search_fields': text_search_fields if text_search_fields else None,
            'similarity_features': list(similarity_features.keys()) if similarity_features else None,
            'filter_matches': filter_match_count,
            'similarity_fill_matches': similarity_match_count
        },
        # For storage
        '_classification_data': {
            'id': classification_id,
            'query_features': all_query_features,
            'filters_used': filters,
            'similarity_features_used': similarity_features,
            'search_method': 'filter' if has_range_queries else 'similarity',
            'aggregated': aggregate_by_index,
            'results': formatted_results,
            'report_text': report_text,
            'timestamp': time.time()
        }
    }


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