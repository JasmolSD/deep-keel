// upload/uploadConstants.js

export const SHIP_TYPES = [
    { value: 'Aircraft Carrier', label: 'Aircraft Carrier' },
    { value: 'Amphibious Assault Ship', label: 'Amphibious Assault Ship' },
    { value: 'Amphibious Transport Dock', label: 'Amphibious Transport Dock' },
    { value: 'Ballistic Missile Submarine', label: 'Ballistic Missile Submarine' },
    { value: 'Battlecruiser', label: 'Battlecruiser' },
    { value: 'Battleship', label: 'Battleship' },
    { value: 'Coastal Patrol Craft', label: 'Coastal Patrol Craft' },
    { value: 'Corvette', label: 'Corvette' },
    { value: 'Cruiser', label: 'Cruiser' },
    { value: 'Destroyer', label: 'Destroyer' },
    { value: 'Fast Attack Craft', label: 'Fast Attack Craft' },
    { value: 'Fast Patrol Craft', label: 'Fast Patrol Craft' },
    { value: 'Frigate', label: 'Frigate' },
    { value: 'Guided Missile Destroyer', label: 'Guided Missile Destroyer' },
    { value: 'Landing Platform Dock', label: 'Landing Platform Dock' },
    { value: 'Landing Ship Tank', label: 'Landing Ship Tank' },
    { value: 'Mine Countermeasures Vessel', label: 'Mine Countermeasures Vessel' },
    { value: 'Minesweeper - Ocean', label: 'Minesweeper - Ocean' },
    { value: 'Offshore Patrol Vessel', label: 'Offshore Patrol Vessel' },
    { value: 'Patrol Boat', label: 'Patrol Boat' },
    { value: 'Patrol Vessel', label: 'Patrol Vessel' },
    { value: 'Submarine', label: 'Submarine' },
    { value: 'Support Ship', label: 'Support Ship' },
    { value: 'Other', label: 'Other' }
];

export const SHIP_ROLES = [
    { value: 'AAW', label: 'AAW (Anti-Air Warfare)' },
    { value: 'ASW', label: 'ASW (Anti-Submarine Warfare)' },
    { value: 'Air Defence Destroyer', label: 'Air Defence Destroyer' },
    { value: 'Air Defence Frigate', label: 'Air Defence Frigate' },
    { value: 'Amphibious', label: 'Amphibious' },
    { value: 'Amphibious Assault', label: 'Amphibious Assault' },
    { value: 'Amphibious Transport', label: 'Amphibious Transport' },
    { value: 'Auxiliary', label: 'Auxiliary' },
    { value: 'Command', label: 'Command' },
    { value: 'Escort', label: 'Escort' },
    { value: 'Intelligence', label: 'Intelligence' },
    { value: 'Mine Warfare', label: 'Mine Warfare' },
    { value: 'Missile Strike', label: 'Missile Strike' },
    { value: 'Multi-role', label: 'Multi-role' },
    { value: 'Patrol', label: 'Patrol' },
    { value: 'Repair', label: 'Repair' },
    { value: 'Special Operations', label: 'Special Operations' },
    { value: 'Strike', label: 'Strike' },
    { value: 'Support', label: 'Support' },
    { value: 'Training', label: 'Training' },
    { value: 'Transport', label: 'Transport' },
    { value: 'Utility', label: 'Utility' }
];

export const HULL_FORMS = [
    { value: 'Monohull', label: 'Monohull' },
    { value: 'Catamaran', label: 'Catamaran' },
    { value: 'Trimaran', label: 'Trimaran' },
    { value: 'SWATH', label: 'SWATH (Small Waterplane Area Twin Hull)' },
    { value: 'Hydrofoil', label: 'Hydrofoil' },
    { value: 'Hovercraft', label: 'Hovercraft' }
];

export const HULL_SHAPES = [
    { value: 'Sleek', label: 'Sleek' },
    { value: 'Fine', label: 'Fine' },
    { value: 'Bulky', label: 'Bulky' },
    { value: 'Beamish', label: 'Beamish' },
    { value: 'Flat-decked', label: 'Flat-decked' }
];

export const BOW_SHAPES = [
    { value: 'Raked', label: 'Raked' },
    { value: 'Fine', label: 'Fine' },
    { value: 'Bluff', label: 'Bluff' },
    { value: 'Bulbous', label: 'Bulbous' },
    { value: 'Axe bow', label: 'Axe bow' },
    { value: 'Clipper', label: 'Clipper' },
    { value: 'Icebreaker', label: 'Icebreaker' },
    { value: 'Wave-piercing', label: 'Wave-piercing' },
    { value: 'Bluff/Bulbous', label: 'Bluff/Bulbous' },
    { value: 'Fine/Bulbous', label: 'Fine/Bulbous' },
    { value: 'Fine/Raked', label: 'Fine/Raked' }
];

export const SUPERSTRUCTURE_LAYOUTS = [
    { value: 'Single continuous', label: 'Single continuous' },
    { value: 'Central block', label: 'Central block' },
    { value: 'Split fore/aft', label: 'Split fore/aft' },
    { value: 'Minimal', label: 'Minimal' },
    { value: 'Stealthy/angular', label: 'Stealthy/angular' },
    { value: 'Cluttered/asymmetric', label: 'Cluttered/asymmetric' },
    { value: 'Towering island', label: 'Towering island' },
    { value: 'Island starboard', label: 'Island starboard' },
    { value: 'Bulky/Merchant-derived', label: 'Bulky/Merchant-derived' }
];

export const FUNNEL_ARRANGEMENTS = [
    { value: 'Single compact', label: 'Single compact' },
    { value: 'Twin side-by-side', label: 'Twin side-by-side' },
    { value: 'Twin fore-aft', label: 'Twin fore-aft' },
    { value: 'Paired', label: 'Paired' },
    { value: 'Integrated', label: 'Integrated' },
    { value: 'Underwater exhaust', label: 'Underwater exhaust' },
    { value: 'Island-mounted', label: 'Island-mounted' },
    { value: 'Three funnels', label: 'Three funnels' },
    { value: 'Four funnels', label: 'Four funnels' }
];

export const FUNNEL_SHAPES = [
    { value: 'Tall/stack', label: 'Tall/stack' },
    { value: 'Squat/boxy', label: 'Squat/boxy' },
    { value: 'Raked', label: 'Raked' },
    { value: 'Vertical', label: 'Vertical' },
    { value: 'Angled', label: 'Angled' },
    { value: 'Integrated', label: 'Integrated' },
    { value: 'Stealthy/angular', label: 'Stealthy/angular' },
    { value: 'Raked/Stealth', label: 'Raked/Stealth' },
    { value: 'Enclosed mast-funnel', label: 'Enclosed mast-funnel' }
];

export const FUNNEL_SPACINGS = [
    { value: 'Close', label: 'Close' },
    { value: 'Wide', label: 'Wide' },
    { value: 'Fore-aft separated', label: 'Fore-aft separated' },
    { value: 'Integrated', label: 'Integrated' }
];

export const SIZE_CATEGORIES = [
    { value: 'Very Small (<500 tons)', label: 'Very Small (<500 tons)' },
    { value: 'Small (500-2,000 tons)', label: 'Small (500-2,000 tons)' },
    { value: 'Medium (2,000-6,000 tons)', label: 'Medium (2,000-6,000 tons)' },
    { value: 'Large (6,000-12,000 tons)', label: 'Large (6,000-12,000 tons)' },
    { value: 'Very Large (12,000-30,000 tons)', label: 'Very Large (12,000-30,000 tons)' },
    { value: 'Extra Large (>30,000 tons)', label: 'Extra Large (>30,000 tons)' }
];

export const MAST_CONFIGURATIONS = [
    { value: 'Pole masts', label: 'Pole masts' },
    { value: 'Lattice mast', label: 'Lattice mast' },
    { value: 'Tripod mast', label: 'Tripod mast' },
    { value: 'Tower mast', label: 'Tower mast' },
    { value: 'Integrated mast', label: 'Integrated mast' },
    { value: 'Enclosed mast', label: 'Enclosed mast' },
    { value: 'Stealth mast', label: 'Stealth mast' },
    { value: 'Single foremast', label: 'Single foremast' },
    { value: 'Two masts', label: 'Two masts' },
    { value: 'Three masts', label: 'Three masts' },
    { value: 'Minimal', label: 'Minimal' },
    { value: 'Minimal mast', label: 'Minimal mast' }
];

export const FREEBOARD_HEIGHTS = [
    { value: 'Very Low', label: 'Very Low' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Very High', label: 'Very High' }
];

export const RADAR_CONFIGURATIONS = [
    { value: 'None/Minimal', label: 'None/Minimal' },
    { value: 'Simple arrays (1-2 basic radars)', label: 'Simple arrays (1-2 basic radars)' },
    { value: 'Moderate arrays (multiple specialized radars)', label: 'Moderate arrays (multiple specialized radars)' },
    { value: 'Complex arrays (AEGIS-type systems)', label: 'Complex arrays (AEGIS-type systems)' }
];

export const GUNMOUNT_POSITIONS = [
    { value: 'Forward only', label: 'Forward only' },
    { value: 'Aft only', label: 'Aft only' },
    { value: 'Forward and Aft', label: 'Forward and Aft' },
    { value: 'Forward and Amidships', label: 'Forward and Amidships' },
    { value: 'Amidships', label: 'Amidships' },
    { value: 'Multiple positions', label: 'Multiple positions' },
    { value: 'Broadside', label: 'Broadside' }
];

export const GUNMOUNT_SIZES = [
    { value: 'Small (<30mm - CIWS)', label: 'Small (<30mm - CIWS)' },
    { value: 'Medium (30mm-76mm)', label: 'Medium (30mm-76mm)' },
    { value: 'Large (76mm-127mm)', label: 'Large (76mm-127mm)' },
    { value: 'Very Large (>127mm)', label: 'Very Large (>127mm)' },
    { value: 'Multiple calibers', label: 'Multiple calibers' }
];

export const LENGTH_TO_BEAM_RATIOS = [
    { value: 'Very Short and wide', label: 'Very Short and wide' },
    { value: 'Short and wide', label: 'Short and wide' },
    { value: 'Balanced', label: 'Balanced' },
    { value: 'Long and narrow', label: 'Long and narrow' },
    { value: 'Very Long and narrow', label: 'Very Long and narrow' }
];

export const INITIAL_FORM_STATE = {
    // Basic Identification
    ship_name: '',
    hull_number: '',
    country: '',
    base_port: '',
    ship_class: '',
    ship_type: '',
    ship_role: '',

    // Physical Dimensions
    displacement_full_load_tons: '',
    length_metres_min: '',
    length_metres_max: '',
    beam_metres_min: '',
    beam_metres_max: '',
    draught_metres_min: '',
    draught_metres_max: '',
    speed_knots_min: '',
    speed_knots_max: '',
    complement_total_personnel: '',

    // Hull Characteristics
    hull_form: '',
    hull_shape: '',
    bow_shape: '',
    length_to_beam_ratio: '',
    approximate_size_category: '',
    freeboard_height: '',

    // Superstructure
    superstructure_layout: '',
    distinct_superstructure_blocks_number: '',

    // Funnels/Smokestacks
    funnel_arrangement: '',
    funnels_total: '',
    funnel_shape: '',
    spacing_between_funnels: '',
    smokestacks_total: '',

    // Masts and Radars
    mast_configuration: '',
    radar_configuration: '',
    radar_airsearch: '',
    radar_surfacesearch: '',
    radar_firecontrol: '',

    // Weapons and Systems
    main_machinery: '',
    main_gun: '',
    main_gun_caliber_inches: '',
    main_gun_turrets_total: '',
    torpedo_tubes_visible_number: '',
    gunmounts_position: '',
    gunmounts_number: '',
    gunmounts_size: '',
    missile_launchers: '',
    CIWS: '',
    CIWS_positions: '',
    sonar: '',

    // Aviation Facilities
    flight_deck: 'False',
    hangar: 'False',
    hangar_capacity: '',
    helicopter_platform: 'False',
    helicopter_capacity: '',

    // Build Information
    builder: '',
    launch_year: '',
    commission_year: '',

    // Number of matches to return
    top_k: '5',
};

export const AUTOCOMPLETE_DATA = {
    countries: [
        'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
        'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
        'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
        'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
        'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
        'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
        'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
        'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
        'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
        'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
        'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
        'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti',
        'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
        'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
        'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
        'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
        'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
        'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
        'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
        'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
        'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
        'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
        'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis',
        'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
        'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
        'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
        'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan',
        'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
        'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
        'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
        'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu',
        'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
    ],
    ports: [
        'Norfolk', 'San Diego', 'Pearl Harbor', 'Portsmouth', 'Yokosuka',
        'Sasebo', 'Toulon', 'Brest', 'Kiel', 'Wilhelmshaven', 'La Spezia',
        'Taranto', 'Halifax', 'Esquimalt', 'Sydney', 'Devonport', 'Faslane',
        'Severomorsk', 'Vladivostok', 'Qingdao', 'Shanghai', 'Mumbai', 'Karachi'
    ]
};