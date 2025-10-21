// upload/uploadConstants.js

export const SHIP_TYPES = [
    { value: 'destroyer', label: 'Destroyer' },
    { value: 'frigate', label: 'Frigate' },
    { value: 'cruiser', label: 'Cruiser' },
    { value: 'carrier', label: 'Aircraft Carrier' },
    { value: 'amphibious', label: 'Amphibious Assault' },
    { value: 'submarine', label: 'Submarine' },
    { value: 'corvette', label: 'Corvette' },
    { value: 'patrol', label: 'Patrol Vessel' },
    { value: 'auxiliary', label: 'Auxiliary' },
    { value: 'other', label: 'Other/Unknown' }
];

export const WEATHER_CONDITIONS = [
    { value: 'clear', label: 'Clear' },
    { value: 'partly_cloudy', label: 'Partly Cloudy' },
    { value: 'overcast', label: 'Overcast' },
    { value: 'fog', label: 'Fog/Haze' },
    { value: 'rain', label: 'Rain' },
    { value: 'storm', label: 'Storm' }
];

export const VISIBILITY_RANGES = [
    { value: 'excellent', label: 'Excellent (>10nm)' },
    { value: 'good', label: 'Good (5-10nm)' },
    { value: 'moderate', label: 'Moderate (2-5nm)' },
    { value: 'poor', label: 'Poor (0.5-2nm)' },
    { value: 'very_poor', label: 'Very Poor (<0.5nm)' }
];

export const SEA_STATES = [
    { value: '0', label: '0 - Calm (glassy)' },
    { value: '1', label: '1 - Calm (rippled)' },
    { value: '2', label: '2 - Smooth' },
    { value: '3', label: '3 - Slight' },
    { value: '4', label: '4 - Moderate' },
    { value: '5', label: '5 - Rough' },
    { value: '6', label: '6 - Very Rough' },
    { value: '7', label: '7 - High' },
    { value: '8', label: '8 - Very High' },
    { value: '9', label: '9 - Phenomenal' }
];

export const FUNNEL_SPACINGS = [
    { value: 'close', label: 'Close Together' },
    { value: 'wide', label: 'Wide Apart' },
    { value: 'single', label: 'Single Funnel' },
    { value: 'side_by_side', label: 'Side by Side' },
    { value: 'none', label: 'No Visible Funnels' }
];

export const AUTOCOMPLETE_DATA = {
    flags: [
        'United States', 'United Kingdom', 'France', 'Germany', 'Japan',
        'China', 'Russia', 'India', 'South Korea', 'Italy', 'Spain',
        'Canada', 'Australia', 'Netherlands', 'Norway', 'Denmark',
        'Sweden', 'Turkey', 'Greece', 'Poland'
    ],
    ports: [
        'Norfolk', 'San Diego', 'Pearl Harbor', 'Portsmouth', 'Yokosuka',
        'Sasebo', 'Toulon', 'Brest', 'Kiel', 'Wilhelmshaven', 'La Spezia',
        'Taranto', 'Halifax', 'Esquimalt', 'Sydney', 'Devonport', 'Faslane'
    ],
    vesselPrefixes: ['USS', 'HMS', 'HMAS', 'HMCS', 'FS', 'FGS', 'HNLMS', 'JS', 'INS', 'RFS']
};

export const TAG_OPTIONS = {
    hullShapes: ['Sleek/Streamlined', 'Boxy/Angular', 'Rounded', 'Trimaran', 'Catamaran', 'Tumblehome'],
    superstructureLayouts: ['Continuous Deck', 'Stepped', 'Pyramid', 'Split/Separated', 'Integrated Mast'],
    radarArrays: [
        'SPY-1D', 'SPY-6', 'SPY-7', 'APAR', 'EMPAR', 'Sampson', 'S1850M',
        'Type 346', 'Type 364', 'Rotating Search', 'Fire Control', 'Navigation Only'
    ],
    armamentTypes: [
        'VLS Forward', 'VLS Aft', 'Main Gun', 'CIWS', 'Missile Launchers',
        'Torpedo Tubes', 'Autocannon', 'Point Defense', 'ASW Rockets', 'Depth Charges'
    ],
    paintSchemes: [
        'Haze Gray', 'Navy Gray', 'Deck Blue', 'Dazzle Camo', 'Black Hull',
        'White Superstructure', 'Red Waterline', 'Baltic Scheme', 'Mediterranean Blue'
    ],
    deckMarkings: [
        'Helipad', 'Flight Deck Numbers', 'Pennant Markings', 'Safety Lines',
        'VERTREP Spots', 'Hangar Markings', 'Weapon Zones', 'No Personnel Areas'
    ],
    formations: [
        'Single Ship', 'Line Ahead', 'Line Abreast', 'Column', 'Diamond',
        'Screen Formation', 'Convoy Escort', 'ASW Pattern', 'Task Force'
    ],
    operationalSpeeds: [
        'Patrol (10-15 kts)', 'Transit (15-20 kts)', 'High Speed (20+ kts)',
        'Station Keeping', 'Variable/Maneuvering', 'Sprint and Drift', 'Slow Ahead'
    ]
};

export const QUICK_FILL_TEMPLATES = {
    'Arleigh Burke DDG': {
        shipType: 'destroyer',
        lengthMin: '153',
        lengthMax: '155',
        beamMin: '20',
        beamMax: '21',
        draftMin: '6',
        draftMax: '6.5',
        hullShape: ['Sleek/Streamlined'],
        superstructureLayout: ['Pyramid'],
        mastCountMin: '1',
        mastCountMax: '2',
        radarArrays: ['SPY-1D'],
        armamentTypes: ['VLS Forward', 'VLS Aft', 'Main Gun', 'CIWS'],
        funnelCountMin: '2',
        funnelCountMax: '2',
        paintScheme: ['Haze Gray']
    },
    'Type 45 Destroyer': {
        shipType: 'destroyer',
        lengthMin: '152',
        lengthMax: '153',
        beamMin: '21',
        beamMax: '21.2',
        draftMin: '5',
        draftMax: '5.5',
        hullShape: ['Sleek/Streamlined', 'Tumblehome'],
        superstructureLayout: ['Pyramid', 'Integrated Mast'],
        mastCountMin: '1',
        mastCountMax: '1',
        radarArrays: ['Sampson', 'S1850M'],
        armamentTypes: ['VLS Forward', 'Main Gun', 'CIWS'],
        funnelCountMin: '2',
        funnelCountMax: '2',
        paintScheme: ['Navy Gray']
    }
};

export const INITIAL_FORM_STATE = {
    // AIS Data
    mmsi: '',
    imoNumber: '',
    callsign: '',
    vesselName: '',
    shipType: '',
    lengthMin: '',
    lengthMax: '',
    beamMin: '',
    beamMax: '',
    draftMin: '',
    draftMax: '',
    position: { lat: '', lon: '' },
    speedMin: '',
    speedMax: '',
    flag: '',
    registryPort: '',

    // Visual Observations
    hullLengthMin: '',
    hullLengthMax: '',
    hullShape: [],
    superstructureLayout: [],
    mastCountMin: '',
    mastCountMax: '',
    radarArrays: [],
    armamentTypes: [],
    armamentLayout: '',
    funnelCountMin: '',
    funnelCountMax: '',
    funnelSpacing: '',
    flightDeckMin: '',
    flightDeckMax: '',
    hangarMin: '',
    hangarMax: '',
    pennantNumber: '',
    paintScheme: [],
    deckMarkings: [],

    // Behavioral
    formation: [],
    rasOperations: 'unknown',
    operationalSpeed: [],

    // Additional Context
    observationTime: '',
    weatherConditions: '',
    visibilityRange: '',
    seaState: '',
    confidenceLevel: 'medium',
    additionalNotes: ''
};

export const SECTIONS = [
    { id: 'ais', label: 'AIS Data', icon: '📡' },
    { id: 'visual', label: 'Visual', icon: '👁️' },
    { id: 'behavioral', label: 'Behavioral', icon: '🎯' },
    { id: 'context', label: 'Context', icon: '📋' }
];