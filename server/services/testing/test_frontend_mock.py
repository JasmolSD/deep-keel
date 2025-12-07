"""
Test file for Naval Ship Similarity Search API
Mocks frontend sending JSON ship data
"""

import requests
import json
import time
from typing import Dict, Any

# API Configuration
API_BASE_URL = "http://localhost:5001"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(title: str):
    """Print a formatted header."""
    print(f"\n{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{title.center(80)}{Colors.RESET}")
    print(f"{Colors.CYAN}{'='*80}{Colors.RESET}\n")


def print_success(message: str):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")


def print_error(message: str):
    """Print error message."""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")


def print_info(message: str):
    """Print info message."""
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")


def print_results(results: Dict[str, Any]):
    """Pretty print search results."""
    if not results.get('success'):
        print_error(f"Search failed: {results.get('error', 'Unknown error')}")
        return
    
    print_success(f"Search completed successfully!")
    print(f"\n{Colors.BOLD}Query Summary:{Colors.RESET}")
    print(f"  Features used: {results['query_summary']['feature_count']}")
    print(f"  Features: {', '.join(results['query_summary']['features_used'][:10])}")
    if len(results['query_summary']['features_used']) > 10:
        print(f"            ... and {len(results['query_summary']['features_used']) - 10} more")
    
    print(f"\n{Colors.BOLD}Results: {results['count']} similar ships found{Colors.RESET}")
    print("-" * 80)
    
    for ship in results['results'][:10]:  # Show top 10
        print(f"\n{Colors.YELLOW}Rank {ship['rank']}: {ship['ship_info']['name']}{Colors.RESET}")
        print(f"  Similarity: {Colors.GREEN}{ship['similarity_score']}%{Colors.RESET}")
        print(f"  Country: {ship['ship_info']['country']}")
        print(f"  Type: {ship['ship_info']['ship_type']}")
        print(f"  Class: {ship['ship_info']['ship_class']}")
        print(f"  Pages: {ship['ship_info']['pages']}")
    
    if results['count'] > 10:
        print(f"\n{Colors.CYAN}... and {results['count'] - 10} more results{Colors.RESET}")


def test_with_json_data(test_name: str, json_data: Dict[str, Any]):
    """
    Test the API with provided JSON data.
    
    Args:
        test_name: Name of the test
        json_data: JSON data to send
    """
    print_header(test_name)
    
    # Show what we're sending
    print(f"{Colors.BOLD}Request Data:{Colors.RESET}")
    non_empty_fields = {k: v for k, v in json_data.items() if v and v != ""}
    print(json.dumps(non_empty_fields, indent=2))
    
    try:
        print(f"\n{Colors.BOLD}Sending request to {API_BASE_URL}/api/search...{Colors.RESET}")
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE_URL}/api/search",
            json=json_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        elapsed = time.time() - start_time
        
        print(f"Response time: {elapsed:.2f}s")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            results = response.json()
            print_results(results)
            return True
        else:
            print_error(f"Request failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to API server")
        print_info(f"Make sure the server is running: python app.py")
        return False
    except requests.exceptions.Timeout:
        print_error("Request timed out")
        return False
    except Exception as e:
        print_error(f"Test failed: {str(e)}")
        return False


# Test Case 1: Your exact JSON example
TEST_CASE_1 = {
    "ship_name": "",
    "hull_number": "",
    "country": "",
    "base_port": "",
    "ship_class": "",
    "ship_type": "",
    "ship_role": "",
    "displacement_full_load_tons": "",
    "length_metres_min": "1",
    "length_metres_max": "63",
    "beam_metres_min": "1",
    "beam_metres_max": "99",
    "draught_metres_min": "",
    "draught_metres_max": "",
    "speed_knots_min": "5",
    "complement_total_personnel": "",
    "hull_form": "Monohull",
    "hull_shape": "Bulky",
    "bow_shape": "Axe bow",
    "length_to_beam_ratio": "",
    "approximate_size_category": "Small (500-2,000 tons)",
    "freeboard_height": "",
    "superstructure_layout": "",
    "distinct_superstructure_blocks_number": "",
    "funnel_arrangement": "",
    "funnels_total": "",
    "funnel_shape": "",
    "spacing_between_funnels": "",
    "smokestacks_total": "",
    "mast_configuration": "",
    "radar_configuration": "",
    "radar_airsearch": "",
    "radar_surfacesearch": "",
    "radar_firecontrol": "",
    "main_machinery": "",
    "main_gun": "",
    "main_gun_caliber_inches": "",
    "main_gun_turrets_total": "",
    "torpedo_tubes_visible_number": "",
    "gunmounts_position": "",
    "gunmounts_number": "",
    "gunmounts_size": "",
    "missile_launchers": "",
    "CIWS": "",
    "CIWS_positions": "",
    "sonar": "",
    "flight_deck": "False",
    "hangar": "False",
    "hangar_capacity": "",
    "helicopter_platform": "False",
    "helicopter_capacity": "",
    "builder": "",
    "launch_year": "",
    "commission_year": ""
}

# Test Case 2: USA Destroyer
TEST_CASE_2 = {
    "country": "USA",
    "ship_type": "Destroyer",
    "length_metres_min": "150",
    "length_metres_max": "165",
    "beam_metres_min": "18",
    "beam_metres_max": "22",
    "speed_knots_min": "28",
    "hull_form": "conventional",
    "bow_shape": "bulbous",
    "superstructure_layout": "integrated",
    "flight_deck": "True",
    "helicopter_platform": "True",
    "hangar": "False"
}

# Test Case 3: Large Aircraft Carrier
TEST_CASE_3 = {
    "ship_type": "Aircraft Carrier",
    "length_metres_min": "300",
    "length_metres_max": "350",
    "flight_deck": "True",
    "hangar": "True",
    "helicopter_platform": "True",
    "approximate_size_category": "Very Large (50,000+ tons)"
}

# Test Case 4: Russian Cruiser
TEST_CASE_4 = {
    "country": "Russia",
    "ship_type": "Cruiser",
    "length_metres_min": "180",
    "length_metres_max": "220",
    "hull_form": "conventional",
    "superstructure_layout": "stepped",
}

# Test Case 5: Small Fast Attack Craft
TEST_CASE_5 = {
    "ship_type": "Fast Attack Craft",
    "length_metres_min": "40",
    "length_metres_max": "80",
    "speed_knots_min": "35",
    "hull_form": "planing",
    "approximate_size_category": "Small (500-2,000 tons)"
}

# Test Case 6: Frigate with Advanced Radar
TEST_CASE_6 = {
    "ship_type": "Frigate",
    "length_metres_min": "120",
    "length_metres_max": "150",
    "radar_configuration": "phased array",
    "mast_configuration": "lattice",
    "helicopter_platform": "True",
    "hangar": "True",
}


def test_health_endpoint():
    """Test the health check endpoint."""
    print_header("Testing Health Check Endpoint")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Health check passed!")
            print(json.dumps(data, indent=2))
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Could not connect to API server")
        print_info("Make sure the server is running: python app.py")
        return False
    except Exception as e:
        print_error(f"Health check failed: {str(e)}")
        return False


def test_statistics_endpoint():
    """Test the statistics endpoint."""
    print_header("Testing Statistics Endpoint")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/statistics", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Statistics retrieved!")
            if data.get('success'):
                stats = data['statistics']
                print(f"\n{Colors.BOLD}Dataset Statistics:{Colors.RESET}")
                print(f"  Total ships: {stats['total_ships']}")
                print(f"  Unique countries: {stats['unique_countries']}")
                print(f"  Unique classes: {stats['unique_classes']}")
                print(f"  Unique types: {stats['unique_types']}")
                print(f"\n  Countries: {', '.join(stats['countries'][:10])}")
                if len(stats['countries']) > 10:
                    print(f"             ... and {len(stats['countries']) - 10} more")
                print(f"\n  Ship Types: {', '.join(stats['ship_types'][:10])}")
                if len(stats['ship_types']) > 10:
                    print(f"              ... and {len(stats['ship_types']) - 10} more")
            return True
        else:
            print_error(f"Statistics request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Statistics check failed: {str(e)}")
        return False


def run_all_tests():
    """Run all test cases."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print("╔" + "═" * 78 + "╗")
    print("║" + "NAVAL SHIP SIMILARITY SEARCH API - TEST SUITE".center(78) + "║")
    print("║" + "Mocking Frontend JSON Requests".center(78) + "║")
    print("╚" + "═" * 78 + "╝")
    print(Colors.RESET)
    
    results = []
    
    # Test endpoints
    results.append(("Health Check", test_health_endpoint()))
    time.sleep(0.5)
    
    results.append(("Statistics", test_statistics_endpoint()))
    time.sleep(0.5)
    
    # Test search with different JSON payloads
    test_cases = [
        ("Test Case 1: Your Exact JSON (Small Ship, Bulky Hull)", TEST_CASE_1),
        ("Test Case 2: USA Destroyer (Arleigh Burke-like)", TEST_CASE_2),
        ("Test Case 3: Large Aircraft Carrier", TEST_CASE_3),
        ("Test Case 4: Russian Cruiser", TEST_CASE_4),
        ("Test Case 5: Small Fast Attack Craft", TEST_CASE_5),
        ("Test Case 6: Frigate with Advanced Radar", TEST_CASE_6),
    ]
    
    for test_name, test_data in test_cases:
        results.append((test_name, test_with_json_data(test_name, test_data)))
        time.sleep(0.5)
    
    # Print summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}PASSED{Colors.RESET}" if result else f"{Colors.RED}FAILED{Colors.RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Results: {passed - 2}/{total-2} tests passed{Colors.RESET}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! 🎉{Colors.RESET}\n")
    else:
        print(f"\n{Colors.YELLOW}Some tests failed. Check the output above for details.{Colors.RESET}\n")


def test_single_case(case_number: int = 1):
    """
    Test a single case by number.
    
    Args:
        case_number: Test case number (1-6)
    """
    test_cases = {
        1: ("Your Exact JSON (Small Ship, Bulky Hull)", TEST_CASE_1),
        2: ("USA Destroyer (Arleigh Burke-like)", TEST_CASE_2),
        3: ("Large Aircraft Carrier", TEST_CASE_3),
        4: ("Russian Cruiser", TEST_CASE_4),
        5: ("Small Fast Attack Craft", TEST_CASE_5),
        6: ("Frigate with Advanced Radar", TEST_CASE_6),
    }
    
    if case_number not in test_cases:
        print_error(f"Invalid test case number: {case_number}")
        print_info(f"Available test cases: 1-{len(test_cases)}")
        return
    
    test_name, test_data = test_cases[case_number]
    test_with_json_data(f"Test Case {case_number}: {test_name}", test_data)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Run specific test case
        try:
            case_num = int(sys.argv[1])
            test_single_case(case_num)
        except ValueError:
            print_error("Invalid test case number")
            print_info("Usage: python test_frontend_mock.py [1-8]")
    else:
        # Run all tests
        run_all_tests()