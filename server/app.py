# app.py
from __future__ import annotations
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, uuid, pandas as pd
from typing import cast, TypedDict, Dict, Optional, List
from pathlib import Path
from dotenv import load_dotenv
import time

# Conditional import for local development
if os.getenv('RENDER') != 'true':
    try:
        from dotenv import load_dotenv
        env_path = Path(__file__).parent / '.env'
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
            print("✓ Loaded .env file for local development")
        else:
            print("ℹ️ No .env file found, using system environment variables")
    except ImportError:
        print("ℹ️ python-dotenv not installed, using system environment variables")
else:
    print("✓ Running on Render - using platform environment variables")

# Serve /static from cache/static
app = Flask(__name__, static_folder="cache/static", static_url_path="/static")

# Configure CORS properly
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "https://deepkeel-api.onrender.com"])

# Configuration
app.config['UPLOAD_FOLDER'] = 'cache/tmp'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size

# Allowed file extensions for satellite imagery
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tiff', 'tif', 'geotiff', 'jp2'}

# Identify temp directories
STATIC_DIR = Path(str(app.static_folder)).resolve()
UPLOADS_DIR = Path(app.config['UPLOAD_FOLDER']).resolve()

# Ensure dirs exist
for d in (STATIC_DIR, UPLOADS_DIR):
    d.mkdir(parents=True, exist_ok=True)
    # Create .gitkeep files
    gitkeep = d / '.gitkeep'
    if not gitkeep.exists():
        gitkeep.touch()

def allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class AnalysisResult(TypedDict):
    vessels_detected: int
    risk_score: float
    anomalies: List[Dict]
    processing_time: float
    image_metadata: Dict

def mock_satellite_analysis(file_path: str) -> AnalysisResult:
    """
    Mock analysis function - replace with actual ML models later
    This simulates the satellite imagery analysis for trafficking detection
    """
    import random
    time.sleep(2)  # Simulate processing time
    
    # Mock detection results
    vessels_detected = random.randint(0, 15)
    risk_score = round(random.uniform(0.1, 0.9), 3)
    
    anomalies = []
    for i in range(vessels_detected):
        anomalies.append({
            'id': f'vessel_{i+1}',
            'type': random.choice(['small_boat', 'fishing_vessel', 'cargo_ship']),
            'confidence': round(random.uniform(0.6, 0.98), 3),
            'coordinates': {
                'lat': round(random.uniform(20.0, 40.0), 6),
                'lng': round(random.uniform(-120.0, -80.0), 6)
            },
            'risk_factors': random.sample([
                'ais_signal_off',
                'unusual_route',
                'night_activity',
                'proximity_to_known_site'
            ], k=random.randint(1, 3))
        })
    
    return {
        'vessels_detected': vessels_detected,
        'risk_score': risk_score,
        'anomalies': anomalies,
        'processing_time': 2.1,
        'image_metadata': {
            'filename': os.path.basename(file_path),
            'size_mb': round(os.path.getsize(file_path) / (1024*1024), 2),
            'analysis_timestamp': time.time()
        }
    }

@app.route("/")
def index():
    return jsonify({
        "message": "Eyes in the Sky - Satellite Trafficking Detection API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "upload": "/api/upload",
            "analysis": "/api/analysis/<analysis_id>"
        },
        "status": "operational"
    })

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "upload_folder": str(UPLOADS_DIR),
        "disk_space_mb": round(sum(f.stat().st_size for f in UPLOADS_DIR.rglob('*') if f.is_file()) / (1024*1024), 2)
    })

@app.route("/api/upload", methods=["POST"])
def upload():
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOADS_DIR / unique_filename
        
        # Save file
        file.save(str(file_path))
        
        # Run analysis (mock for now)
        analysis_results = mock_satellite_analysis(str(file_path))
        
        # Create analysis ID for tracking
        analysis_id = str(uuid.uuid4())
        
        # In a real system, you'd store this in a database
        # For now, we'll return it directly
        
        response = {
            'success': True,
            'analysis_id': analysis_id,
            'original_filename': original_filename,
            'message': 'File uploaded and analyzed successfully',
            'results': analysis_results
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        app.logger.error(f"Upload error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during file processing'
        }), 500

@app.route("/api/analysis/<analysis_id>")
def get_analysis(analysis_id: str):
    """
    Endpoint to retrieve analysis results by ID
    In a real system, this would query a database
    """
    # Mock response - in real system, look up by analysis_id
    return jsonify({
        'analysis_id': analysis_id,
        'status': 'completed',
        'message': 'Analysis results retrieved successfully'
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'error': 'File too large. Maximum size is 50MB.'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'error': 'Internal server error'
    }), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv('RENDER') != 'true'
    
    print(f"🚀 Starting Eyes in the Sky API on port {port}")
    print(f"📁 Upload folder: {UPLOADS_DIR}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)