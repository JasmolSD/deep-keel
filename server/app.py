# app.py - UPDATED VERSION WITH FRONTEND COMPATIBILITY
from __future__ import annotations
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from typing import Dict, Optional, List, Any
from pathlib import Path
from dotenv import load_dotenv
import time
import io

# Import Naval Search system
from services.similarity_search.naval_search import NavalSimilaritySearch
from services.similarity_search.config import DEFAULT_TOP_K, SIMILARITY_THRESHOLD
from services.similarity_search.generate_report import generate_classification_report
from services.endpoint_support import process_classification_request


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
CORS(app, origins=["http://localhost:5173", "http://localhost:3000", "https://deep-keel.onrender.com"])

# Configuration
app.config['UPLOAD_FOLDER'] = 'cache/tmp'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

# Path to the naval ships CSV data
BASE_DIR = Path(__file__).parent
DATA_PATH = str(BASE_DIR / "cache" / "static" / "naval_ships_data_expanded_alternate.csv")

# Verify file exists before starting
if not Path(DATA_PATH).exists():
    raise FileNotFoundError(f"CSV data file not found at: {DATA_PATH}")

# Identify temp directories
STATIC_DIR = Path(str(app.static_folder)).resolve()
UPLOADS_DIR = Path(app.config['UPLOAD_FOLDER']).resolve()

# Global search engine instance (initialized on startup)
search_engine: Optional[NavalSimilaritySearch] = None

# Simple in-memory storage for reports (use Redis/DB for production)
classification_store = {}


def initialize_search_engine():
    """Initialize the naval search engine with the dataset."""
    global search_engine
    try:
        print("🔧 Initializing Naval Similarity Search Engine...")
        search_engine = NavalSimilaritySearch(DATA_PATH)
        print("✅ Search engine initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize search engine: {e}")
        return False


@app.route("/")
def index():
    """Root endpoint with API information."""
    return jsonify({
        "message": "Naval Ship Similarity Search API",
        "version": "1.0.0",
        "status": "operational" if search_engine else "initializing",
        "endpoints": {
            "health": "/api/health",
            "classify": "/api/classify (POST)",
            "search": "/api/search (POST)",
            "statistics": "/api/statistics",
            "stats": "/api/stats (alias)",
            "categories": "/api/categories",
            "ship_classes": "/api/ship-classes"
        }
    })


@app.route("/api/health")
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy" if search_engine else "initializing",
        "timestamp": time.time(),
        "search_engine_ready": search_engine is not None,
        "data_path": DATA_PATH
    })


@app.route("/api/statistics")
def get_statistics():
    """Get dataset statistics."""
    if not search_engine:
        return jsonify({
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        stats = search_engine.get_statistics()
        return jsonify({
            'success': True,
            'statistics': stats
        })
    except Exception as e:
        app.logger.error(f"Statistics error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route("/api/stats")
def get_stats_alias():
    """Alias for /api/statistics to match frontend expectations."""
    return get_statistics()


@app.route("/api/categories")
def get_categories():
    """Get available categories for dropdowns."""
    if not search_engine:
        return jsonify({
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        categories = search_engine.get_available_categories()
        return jsonify({
            'success': True,
            'categories': categories
        })
    except Exception as e:
        app.logger.error(f"Categories error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route("/api/ship-classes")
def get_ship_classes():
    """Get list of all ship classes for autocomplete - frontend compatible endpoint."""
    if not search_engine:
        return jsonify({
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        # Get unique ship classes from dataset
        df = search_engine.df
        assert df is not None
        ship_classes = sorted(df['ship_class'].dropna().unique().tolist())
        
        return jsonify({
            'success': True,
            'ship_classes': ship_classes,
            'count': len(ship_classes)
        })
    except Exception as e:
        app.logger.error(f"Ship classes error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route("/api/classify", methods=["POST"])
def classify_ship():
    """
    Main classification endpoint.
    Delegates to process_classification_request from endpoint_support.
    """
    if not search_engine:
        return jsonify({
            'success': False,
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        
        # Process the classification request
        result = process_classification_request(
            data=data,
            search_engine=search_engine,
            default_top_k=DEFAULT_TOP_K,
            similarity_threshold=SIMILARITY_THRESHOLD,
            generate_report_fn=generate_classification_report,
            logger=app.logger
        )
        
        # Check for errors
        if not result.get('success'):
            return jsonify(result), 400
        
        # Store classification data if present
        classification_data = result.pop('_classification_data', None)
        if classification_data:
            classification_store[classification_data['id']] = classification_data
        
        return jsonify(result), 200
        
    except Exception as e:
        app.logger.error(f"Classification error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Classification failed: {str(e)}',
            'details': str(e)
        }), 500


@app.route("/api/search", methods=["POST"])
def search_similar_ships():
    """
    Alternative search endpoint - same functionality as /api/classify.
    Kept for backwards compatibility.
    """
    return classify_ship()


@app.route("/api/search/filter", methods=["POST"])
def filter_ships():
    """
    Filter-based search endpoint for exact matches and ranges.
    
    Expected JSON format:
    {
        "filters": {
            "country": "USA",
            "ship_type": "Destroyer",
            "length_metres": [100, 200]
        },
        "top_k": 20
    }
    """
    if not search_engine:
        return jsonify({
            'success': False,
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        if not request.is_json:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        filters = data.get('filters', {})
        top_k = data.get('top_k', 20)
        
        if not filters:
            return jsonify({
                'success': False,
                'error': 'No filters provided'
            }), 400
        
        # Perform filter search
        results = search_engine.search_by_filters(
            filters=filters,
            top_k=top_k
        )
        
        response = {
            'success': True,
            'filters_applied': filters,
            'results': results,
            'count': len(results),
            'timestamp': time.time()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        app.logger.error(f"Filter search error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Filter search failed: {str(e)}'
        }), 500


@app.route("/api/classification/<classification_id>")
def get_classification(classification_id: str):
    """
    Get classification results by ID - frontend compatible endpoint.
    
    Returns stored classification data including results and report.
    """
    try:
        if classification_id not in classification_store:
            return jsonify({
                'success': False,
                'error': 'Classification not found'
            }), 404
        
        classification_data = classification_store[classification_id]
        
        return jsonify({
            'success': True,
            'classification': classification_data
        }), 200
        
    except Exception as e:
        app.logger.error(f"Get classification error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route("/api/report/<report_id>")
def download_report(report_id: str):
    """
    Download classification report as text file - frontend compatible endpoint.
    
    The report_id should be the same as classification_id.
    """
    try:
        if report_id not in classification_store:
            return jsonify({
                'error': 'Report not found'
            }), 404
        
        classification_data = classification_store[report_id]
        report_text = classification_data.get('report_text', '')
        
        if not report_text:
            return jsonify({
                'error': 'Report text not available'
            }), 404
        
        # Create file-like object
        report_bytes = io.BytesIO(report_text.encode('utf-8'))
        
        # Send file
        return send_file(
            report_bytes,
            mimetype='text/plain',
            as_attachment=True,
            download_name=f'classification_report_{report_id[:8]}.txt'
        )
        
    except Exception as e:
        app.logger.error(f"Download report error: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route("/api/ship/<ship_id>")
def get_ship_details(ship_id: str):
    """Get details for a specific ship by ID."""
    if not search_engine:
        return jsonify({
            'success': False,
            'error': 'Search engine not initialized'
        }), 503
    
    try:
        ship_data = search_engine.get_ship_by_id(ship_id)
        
        if ship_data is None:
            return jsonify({
                'success': False,
                'error': f'Ship with ID {ship_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'ship': ship_data
        })
        
    except Exception as e:
        app.logger.error(f"Ship details error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(413)
def too_large(e):
    """Handle request entity too large errors."""
    return jsonify({
        'success': False,
        'error': 'Request too large. Maximum size is 5MB.'
    }), 413


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


# Initialize search engine on startup
with app.app_context():
    initialize_search_engine()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv('RENDER') != 'true'
    
    print(f"🚀 Starting Naval Similarity Search API on port {port}")
    print(f"📊 Dataset: {DATA_PATH}")
    print(f"🔧 Debug mode: {debug}")
    print(f"\n✅ Added endpoints for frontend compatibility:")
    print(f"   - POST /api/classify")
    print(f"   - GET  /api/stats (alias)")
    print(f"   - GET  /api/ship-classes")
    print(f"   - GET  /api/report/<id>")
    print(f"   - GET  /api/classification/<id>")
    
    app.run(host="0.0.0.0", port=port, debug=debug)