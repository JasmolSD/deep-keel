"""
Configuration settings for the Naval Similarity Search system.
"""

from typing import Dict

# Feature columns to load from the dataset
SELECTED_FEATURES = [
    'country', 'ship_name', 'hull_number', 'ship_class', 'ship_type', 'ship_role',
    'guid', 'start_page', 'end_page',
    
    # Dimensions and performance
    'length_metres', 'beam_metres', 'speed_knots',
    
    # Hull and superstructure
    'hull_form', 'hull_shape', 'bow_shape',
    'superstructure_layout', 'distinct_superstructure_blocks_number',
    
    # Funnel/mast configuration
    'funnel_arrangement', 'funnels_total', 'funnel_shape',
    'spacing_between_funnels', 'smokestacks_total', 'mast_configuration',
    
    # Weapons and equipment
    'main_gun_turrets_total', 'gunmounts_position', 'gunmounts_number', 'gunmounts_size',
    'CIWS_positions', 'torpedo_tubes_visible_number',
    
    # Aviation
    'flight_deck', 'helicopter_platform', 'hangar',
    
    # Radar configuration
    'radar_configuration',
    
    # Categorical size
    'approximate_size_category', 'length_to_beam_ratio', 'freeboard_height'
]

# Numeric feature columns
NUMERIC_FEATURES = [
    'length_metres', 'beam_metres', 'speed_knots',
    'distinct_superstructure_blocks_number', 'funnels_total', 'smokestacks_total',
    'main_gun_turrets_total', 'gunmounts_number',
    'torpedo_tubes_visible_number', 
    'CIWS_count'
]

# Categorical feature columns (text cols for TF-IDF)
CATEGORICAL_FEATURES = [
    'hull_form', 'hull_shape', 'bow_shape', 'superstructure_layout',
    'funnel_arrangement', 'funnel_shape', 'spacing_between_funnels', 
    'mast_configuration','gunmounts_position', 'gunmounts_size', 
    'radar_configuration', 'approximate_size_category',
    'length_to_beam_ratio', 'freeboard_height','CIWS_positions'
]

# Binary feature columns
BINARY_FEATURES = ['flight_deck', 'helicopter_platform', 'hangar']

# Default similarity weights
DEFAULT_WEIGHTS: Dict[str, float] = {
    'numerical': 0.4,
    'categorical': 0.3,
    'text': 0.2,
    'binary': 0.1
}

# Similarity threshold (70%)
SIMILARITY_THRESHOLD = 0.3

# TF-IDF parameters
TFIDF_MAX_FEATURES = 100
TFIDF_STOP_WORDS = 'english'

# Default top-k results
DEFAULT_TOP_K = 10

# Binary column mapping
BINARY_VALUE_MAP = {'y': 1, 'n': 0}