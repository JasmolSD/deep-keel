"""
CORRECTED test script for your NavalSimilaritySearch class.

Run this script to verify your search engine can find the KALMYKIYA ship.
"""

from .naval_search import NavalSimilaritySearch

# Path to your data
DATA_PATH = "server/cache/static/naval_ships_data_expanded_alternate.csv"


def test_search_engine():
    """Test if search engine handles range queries."""
    
    print("=" * 60)
    print("NAVAL SEARCH ENGINE TEST")
    print("=" * 60)
    
    # Initialize search engine
    print("\n1. Initializing search engine...")
    try:
        search_engine = NavalSimilaritySearch(DATA_PATH)
        print("   ✓ Search engine initialized")
    except Exception as e:
        print(f"   ✗ Failed to initialize: {e}")
        return
    
    # Check if KALMYKIYA exists in database
    print("\n2. Looking for KALMYKIYA in database...")
    df = search_engine.df
    assert df is not None
    # kalmykiya = df[df['ship_name'].str.contains('KALMYKIYA', na=False, case=False)]
    kalmykiya = df.iloc[2279]
    print(kalmykiya)
    
    if len(kalmykiya) > 0:
        print("   ✓ Found KALMYKIYA!")
        # ship = kalmykiya.iloc[0]
        ship = kalmykiya
        print(f"   - Ship Type: {ship.get('ship_type', 'N/A')}")
        print(f"   - Ship Role: {ship.get('ship_role', 'N/A')}")
        print(f"   - Length: {ship.get('length_metres', 'N/A')} m")
        print(f"   - Beam: {ship.get('beam_metres', 'N/A')} m")
        print(f"   - Draught: {ship.get('draught_metres', 'N/A')} m")
        print(f"   - Speed: {ship.get('speed_knots', 'N/A')} knots")
        print(f"   - Hull Form: {ship.get('hull_form', 'N/A')}")
        print(f"   - Size Category: {ship.get('approximate_size_category', 'N/A')}")
        print(f"   - Flight Deck: {ship.get('flight_deck', 'N/A')}")
        print(f"   - Hangar: {ship.get('hangar', 'N/A')}")
    else:
        print("   ✗ KALMYKIYA not found in database")
        print("   → Listing first 5 ship names in database:")
        for i, name in enumerate(df['ship_name'].head().values, 1):
            print(f"      {i}. {name}")
        return
    
    # Test 1: Exact match filters
    print("\n3. Test 1: Exact match filter")
    print("   Query: ship_type = 'Light Guided Missile Frigate'")
    try:
        results = search_engine.search_by_filters(
            filters={'ship_type': 'Light Guided Missile Frigate'},
            top_k=5
        )
        print(f"   ✓ Found {len(results)} ships")
        
        if len(results) > 0:
            found_kalmykiya = any('KALMYKIYA' in str(r.get('ship_name', '')) for r in results)
            if found_kalmykiya:
                print("   ✓ KALMYKIYA is in results!")
            else:
                print("   ✗ KALMYKIYA not in results")
                print("   → Ships found:")
                for r in results:
                    print(f"      - {r.get('ship_name', 'Unknown')}")
        else:
            print("   ✗ No results found")
            print(f"   → Database has ship_type values like: {df['ship_type'].unique()[:5]}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 2: Range filters
    print("\n4. Test 2: Range filters")
    print("   Query: 70 <= length_metres <= 80")
    try:
        results = search_engine.search_by_filters(
            filters={
                'length_metres__gte': 70,
                'length_metres__lte': 80
            },
            top_k=10
        )
        print(f"   ✓ Found {len(results)} ships in length range")
        
        if len(results) > 0:
            found_kalmykiya = any('KALMYKIYA' in str(r.get('ship_name', '')) for r in results)
            if found_kalmykiya:
                print("   ✓ KALMYKIYA is in results!")
            else:
                print("   ✗ KALMYKIYA not in results")
                print(f"   → KALMYKIYA length is {ship.get('length_metres')} m")
                print("   → Ships found in range:")
                for r in results[:3]:
                    print(f"      - {r.get('ship_name', 'Unknown')}: {r.get('length_metres')} m")
        else:
            print("   ✗ No ships found in range")
            print(f"   → Length range in database: {df['length_metres'].min()} - {df['length_metres'].max()}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 3: Combined filters (the actual query)
    print("\n5. Test 3: Combined filters (your actual query)")
    
    # First, let's check what values KALMYKIYA actually has
    print("\n   KALMYKIYA actual values:")
    print(f"   - ship_type: '{ship.get('ship_type')}'")
    print(f"   - ship_role: '{ship.get('ship_role')}'")
    print(f"   - hull_form: '{ship.get('hull_form')}'")
    print(f"   - size_category: '{ship.get('approximate_size_category')}'")
    print(f"   - flight_deck: {ship.get('flight_deck')}")
    print(f"   - hangar: {ship.get('hangar')}")
    print(f"   - helicopter_platform: {ship.get('helicopter_platform')}")
    
    query_filters = {
        'ship_type': 'Light Guided Missile Frigate',
        'ship_role': 'Corvette, ASW',
        'length_metres__gte': 70,
        'length_metres__lte': 80,
        'beam_metres__gte': 8,
        'beam_metres__lte': 10,
        'draught_metres__gte': 3,
        'draught_metres__lte': 5,
        'speed_knots__gte': 20,
        'speed_knots__lte': 35,
        'hull_form': 'Monohull',
        'approximate_size_category': 'Small (500-2,000 tons)',
        'flight_deck': False,
        'hangar': False,
        'helicopter_platform': False
    }
    
    print("\n   Query filters:")
    for k, v in query_filters.items():
        print(f"     - {k}: {v}")
    
    try:
        print("\n   Running filter search...")
        results = search_engine.search_by_filters(
            filters=query_filters,
            top_k=5
        )
        
        print(f"\n   ✓ Search completed!")
        print(f"   → Found {len(results)} matching ships")
        
        if len(results) > 0:
            print("\n   Results:")
            for i, result in enumerate(results, 1):
                ship_name = result.get('combined_name') or result.get('ship_name') or 'Unknown'
                print(f"     {i}. {ship_name}")
                print(f"        Type: {result.get('ship_type', 'N/A')}")
                print(f"        Role: {result.get('ship_role', 'N/A')}")
                print(f"        Length: {result.get('length_metres', 'N/A')} m")
            
            found_kalmykiya = any('KALMYKIYA' in str(r.get('ship_name', '')) for r in results)
            if found_kalmykiya:
                print("\n   ✓✓✓ SUCCESS! KALMYKIYA found in results!")
            else:
                print("\n   ✗ KALMYKIYA not found in results")
                print("   → Checking which filter failed...")
                
                # Test each filter individually
                for key, value in query_filters.items():
                    single_filter_results = search_engine.search_by_filters(
                        filters={key: value},
                        top_k=100
                    )
                    found = any('KALMYKIYA' in str(r.get('ship_name', '')) for r in single_filter_results)
                    status = "✓" if found else "✗"
                    print(f"      {status} {key}: {value}")
                    
        else:
            print("\n   ✗ No results found!")
            print("   → This is the problem - KALMYKIYA should be found")
            print("   → Testing filters one by one...")
            
            # Test each filter individually
            for key, value in query_filters.items():
                try:
                    single_filter_results = search_engine.search_by_filters(
                        filters={key: value},
                        top_k=100
                    )
                    found = any('KALMYKIYA' in str(r.get('ship_name', '')) for r in single_filter_results)
                    status = "✓" if found else "✗"
                    print(f"      {status} {key}: {value} → {len(single_filter_results)} results")
                except Exception as e:
                    print(f"      ✗ {key}: {value} → Error: {e}")
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    test_search_engine()