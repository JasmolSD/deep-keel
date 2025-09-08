# app.py
from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os, uuid, pandas as pd
from typing import cast, TypedDict, Dict, Optional
from pathlib import Path
from dotenv import load_dotenv


# Conditional import for local development
if os.getenv('RENDER') != 'true':
    try:
        from dotenv import load_dotenv
        env_path = Path(__file__).parent / 'services' / '.env'
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
CORS(app)

# Identify temp directories
app.config['UPLOAD_FOLDER'] = 'cache/tmp'
STATIC_DIR = Path(str(app.static_folder)).resolve()
UPLOADS_DIR = Path(app.config['UPLOAD_FOLDER']).resolve()

# Ensure dirs exist
for d in (STATIC_DIR, UPLOADS_DIR):
    d.mkdir(parents=True, exist_ok=True)

@app.route("/")
def index():
    return jsonify({
        "message": "Python backend is running.",
        "health": "/api/health",
        "upload": "/api/upload"
    })

@app.route("/api/health")
def health():
    return {"status": "ok"}

@app.route("/api/upload", methods=["POST"])
def upload():
    pass


if __name__ == "__main__":
    # Change port if you like; 5001 is fine
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5001)))
    
print("Exiting Flask App...")