import time
from typing import List, Dict, Any

def generate_classification_report(query_features: Dict[str, Any], results: List[Dict], SIMILARITY_THRESHOLD: float) -> str:
    """
    Generate a comprehensive text report for classification results.
    
    Args:
        query_features: The search parameters used
        results: The formatted search results
        
    Returns:
        Text report as string
    """
    divider = "=" * 80
    minor_divider = "-" * 80
    
    report = f"{divider}\n"
    report += "WARSHIP CLASSIFICATION REPORT\n"
    report += f"{divider}\n\n"
    
    report += f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}\n"
    report += "Classification System: Naval Similarity Search v1.0\n\n"
    
    report += f"{divider}\n"
    report += "SECTION 1: QUERY PARAMETERS\n"
    report += f"{divider}\n\n"
    
    # Basic Identification
    if any(k in query_features for k in ['ship_name', 'hull_number', 'country', 'base_port', 'ship_type', 'ship_role']):
        report += "Basic Identification:\n"
        if 'ship_name' in query_features:
            report += f"  Ship Name:    {query_features['ship_name']}\n"
        if 'hull_number' in query_features:
            report += f"  Hull Number:  {query_features['hull_number']}\n"
        if 'country' in query_features:
            report += f"  Country:      {query_features['country']}\n"
        if 'base_port' in query_features:
            report += f"  Base Port:    {query_features['base_port']}\n"
        if 'ship_type' in query_features:
            report += f"  Ship Type:    {query_features['ship_type']}\n"
        if 'ship_role' in query_features:
            report += f"  Ship Role:    {query_features['ship_role']}\n"
        report += "\n"
    
    # Physical Dimensions
    dimension_fields = [
        'displacement_full_load_tons_min', 'displacement_full_load_tons_max',
        'length_metres_min', 'length_metres_max',
        'beam_metres_min', 'beam_metres_max',
        'draught_metres_min', 'draught_metres_max',
        'speed_knots_min',
        'complement_personnel_min', 'complement_personnel_max'
    ]
    if any(k in query_features for k in dimension_fields):
        report += "Physical Dimensions:\n"
        if 'displacement_full_load_tons_min' in query_features or 'displacement_full_load_tons_max' in query_features:
            report += f"  Displacement: {query_features.get('displacement_full_load_tons_min', 'N/A')} - {query_features.get('displacement_full_load_tons_max', 'N/A')} tons\n"
        if 'length_metres_min' in query_features or 'length_metres_max' in query_features:
            report += f"  Length:       {query_features.get('length_metres_min', 'N/A')} - {query_features.get('length_metres_max', 'N/A')} m\n"
        if 'beam_metres_min' in query_features or 'beam_metres_max' in query_features:
            report += f"  Beam:         {query_features.get('beam_metres_min', 'N/A')} - {query_features.get('beam_metres_max', 'N/A')} m\n"
        if 'draught_metres_min' in query_features or 'draught_metres_max' in query_features:
            report += f"  Draught:      {query_features.get('draught_metres_min', 'N/A')} - {query_features.get('draught_metres_max', 'N/A')} m\n"
        if 'speed_knots_min' in query_features:
            report += f"  Speed:        {query_features.get('speed_knots_min', 'N/A')}\n"
        if 'complement_personnel_min' in query_features or 'complement_personnel_max' in query_features:
            report += f"  Complement:   {query_features.get('complement_personnel_min', 'N/A')} - {query_features.get('complement_personnel_max', 'N/A')} personnel\n"
        if 'approximate_size_category' in query_features:
            report += f"  Size Category: {query_features['approximate_size_category']}\n"
        if 'length_to_beam_ratio' in query_features:
            report += f"  L/B Ratio:    {query_features['length_to_beam_ratio']}\n"
        report += "\n"
    
    # Hull Characteristics
    hull_fields = ['hull_form', 'hull_shape', 'bow_shape', 'freeboard_height']
    if any(k in query_features for k in hull_fields):
        report += "Hull Characteristics:\n"
        if 'hull_form' in query_features:
            report += f"  Hull Form:       {query_features['hull_form']}\n"
        if 'hull_shape' in query_features:
            report += f"  Hull Shape:      {query_features['hull_shape']}\n"
        if 'bow_shape' in query_features:
            report += f"  Bow Shape:       {query_features['bow_shape']}\n"
        if 'freeboard_height' in query_features:
            report += f"  Freeboard:       {query_features['freeboard_height']}\n"
        report += "\n"
    
    # Superstructure
    superstructure_fields = [
        'superstructure_layout', 'superstructure_height',
        'funnel_arrangement', 'funnel_shape', 'funnel_spacing',
        'mast_configuration', 'radar_configuration'
    ]
    if any(k in query_features for k in superstructure_fields):
        report += "Superstructure:\n"
        if 'superstructure_layout' in query_features:
            report += f"  Layout:          {query_features['superstructure_layout']}\n"
        if 'superstructure_height' in query_features:
            report += f"  Height:          {query_features['superstructure_height']}\n"
        if 'funnel_arrangement' in query_features:
            report += f"  Funnel Arrange:  {query_features['funnel_arrangement']}\n"
        if 'funnel_shape' in query_features:
            report += f"  Funnel Shape:    {query_features['funnel_shape']}\n"
        if 'funnel_spacing' in query_features:
            report += f"  Funnel Spacing:  {query_features['funnel_spacing']}\n"
        if 'mast_configuration' in query_features:
            report += f"  Mast Config:     {query_features['mast_configuration']}\n"
        if 'radar_configuration' in query_features:
            report += f"  Radar Config:    {query_features['radar_configuration']}\n"
        report += "\n"
    
    # Weapons Systems
    weapons_fields = [
        'primary_gun_mount_position', 'primary_gun_mount_size',
        'secondary_gun_mount_position', 'secondary_gun_mount_size',
        'missile_launcher_visible', 'torpedo_tubes_visible',
        'close_in_weapon_systems'
    ]
    if any(k in query_features for k in weapons_fields):
        report += "Weapons Systems:\n"
        if 'primary_gun_mount_position' in query_features:
            report += f"  Primary Gun Pos:   {query_features['primary_gun_mount_position']}\n"
        if 'primary_gun_mount_size' in query_features:
            report += f"  Primary Gun Size:  {query_features['primary_gun_mount_size']}\n"
        if 'secondary_gun_mount_position' in query_features:
            report += f"  Secondary Gun Pos: {query_features['secondary_gun_mount_position']}\n"
        if 'secondary_gun_mount_size' in query_features:
            report += f"  Secondary Gun Size:{query_features['secondary_gun_mount_size']}\n"
        if 'missile_launcher_visible' in query_features:
            report += f"  Missile Launcher:  {query_features['missile_launcher_visible']}\n"
        if 'torpedo_tubes_visible' in query_features:
            report += f"  Torpedo Tubes:     {query_features['torpedo_tubes_visible']}\n"
        if 'close_in_weapon_systems' in query_features:
            report += f"  CIWS:              {query_features['close_in_weapon_systems']}\n"
        report += "\n"
    
    # Aviation Facilities
    aviation_fields = [
        'flight_deck', 'helicopter_platform', 'hangar',
        'aviation_fuel_capacity_litres_min', 'aviation_fuel_capacity_litres_max'
    ]
    if any(k in query_features for k in aviation_fields):
        report += "Aviation Facilities:\n"
        if 'flight_deck' in query_features:
            report += f"  Flight Deck:       {query_features['flight_deck']}\n"
        if 'helicopter_platform' in query_features:
            report += f"  Helo Platform:     {query_features['helicopter_platform']}\n"
        if 'hangar' in query_features:
            report += f"  Hangar:            {query_features['hangar']}\n"
        if 'aviation_fuel_capacity_litres_min' in query_features or 'aviation_fuel_capacity_litres_max' in query_features:
            report += f"  Fuel Capacity:     {query_features.get('aviation_fuel_capacity_litres_min', 'N/A')} - {query_features.get('aviation_fuel_capacity_litres_max', 'N/A')} L\n"
        report += "\n"
    
    # Build Information
    build_fields = [
        'builder', 'build_year_min', 'build_year_max',
        'commission_year_min', 'commission_year_max'
    ]
    if any(k in query_features for k in build_fields):
        report += "Build Information:\n"
        if 'builder' in query_features:
            report += f"  Builder:         {query_features['builder']}\n"
        if 'build_year_min' in query_features or 'build_year_max' in query_features:
            report += f"  Build Year:      {query_features.get('build_year_min', 'N/A')} - {query_features.get('build_year_max', 'N/A')}\n"
        if 'commission_year_min' in query_features or 'commission_year_max' in query_features:
            report += f"  Commission Year: {query_features.get('commission_year_min', 'N/A')} - {query_features.get('commission_year_max', 'N/A')}\n"
        report += "\n"
    
    # Search Parameters
    report += "Search Parameters:\n"
    report += f"  Requested Matches: {query_features.get('top_k', 10)}\n"
    report += "\n"

    report += f"{divider}\n"
    report += "SECTION 2: CLASSIFICATION RESULTS\n"
    report += f"{divider}\n\n"
    
    report += f"Total Matches Found: {len(results)}\n"
    report += f"Confidence Threshold: {SIMILARITY_THRESHOLD * 100}%\n"
    report += "Search Method: Multi-parameter similarity matching\n\n"
    
    report += f"{minor_divider}\n"
    report += "TOP MATCHING VESSELS\n"
    report += f"{minor_divider}\n\n"
    
    for i, match in enumerate(results[:10], 1):
        ship_info = match['ship_info']
        report += f"Match #{i}: {ship_info['name']}\n"
        report += f"{'-' * 40}\n"
        report += f"  Class:          {ship_info['ship_class']}\n"
        report += f"  Country:        {ship_info['country']}\n"
        report += f"  Type:           {ship_info['ship_type']}\n"
        report += f"  Pages:          {ship_info['pages']}\n"
        report += f"  Similarity:     {match['similarity_score']:.1f}%\n"
        report += "\n"
    
    if len(results) > 10:
        report += f"... and {len(results) - 10} more matches\n\n"
    
    report += f"{divider}\n"
    report += "END OF REPORT\n"
    report += f"{divider}\n"
    
    return report