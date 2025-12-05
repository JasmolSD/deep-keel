# ⚓ Deep Keel
### AI-Powered Warship Classification System

*UC Berkeley MIDS Capstone Project - Protecting the seas with machine learning*

---

## 🎯 What's This All About?

**The Problem**: Quickly identifying unknown naval vessels in the field requires extensive expertise and access to classified databases. Analysts need rapid, reliable warship identification for situational awareness.

**Our Solution**: Deep Keel is a real-time classification engine that matches observable ship characteristics against a comprehensive naval database. Input what you can see—dimensions, superstructure, weapons systems—and get the most probable warship identification in seconds.

**The Result**: Streamlined decision support for naval analysts, researchers, and maritime security professionals.

---

## 🚀 Key Features

Our web app lets analysts:
- 🔍 **Smart Classification** - Input ship characteristics and get ranked matches
- 📊 **Similarity Scoring** - See how closely observations match known vessels
- 🎛️ **Flexible Queries** - Search by dimensions, weapons, sensors, or visual features
- 📄 **Generate Reports** - Export detailed classification reports
- 🌍 **2,000+ Vessels** - Comprehensive database of global naval ships
- ⚡ **Real-time Results** - Instant matching and ranking

---

## 🛠️ Quick Start Guide

### What You Need First
- **Python 3.8+** (for the backend)
- **Node.js 16+** (for the web app)
- **Git** (to download the code)

### 1️⃣ Get the Code
```bash
git clone <your-repo-url>
cd deep-keel
```

### 2️⃣ Set Up the Backend (Python)

**Mac/Linux:**
```bash
# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r server/requirements.txt
```

**Windows:**
```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install -r server/requirements.txt
```

### 3️⃣ Set Up the Web App (React)

**Don't have Node.js?** Get it from [nodejs.org](https://nodejs.org/) 

```bash
# Go to the client folder
cd client

# Install dependencies
npm install

# Go back to main folder
cd ..
```

### 4️⃣ Fire It Up! 🔥

**Start the backend:**
```bash
# Make sure Python environment is active
source .venv/bin/activate  # Windows: .venv\Scripts\activate

cd server
python app.py
```
*Backend runs on http://localhost:5001*

**Start the web app (in a new terminal):**
```bash
cd client
npm run dev
```
*Frontend runs on http://localhost:5173*

---

## 🧠 The Classification Engine

Deep Keel uses a multi-dimensional similarity search to identify vessels:

### 📐 **Physical Dimensions**
- Displacement, length, beam, draught
- Speed and crew complement
- Hull shape and bow configuration

### 🏗️ **Superstructure Analysis**
- Layout and height classification
- Funnel arrangement and shape
- Mast and radar configurations

### 🎯 **Weapons Systems**
- Primary and secondary gun mounts
- Missile launchers and torpedo tubes
- Close-in weapon systems (CIWS)

### 📡 **Sensor Suites**
- Air search and surface search radars
- Fire control systems
- Sonar configurations

### 🔧 **Additional Features**
- Propulsion type
- Helicopter facilities
- Country of origin and ship class

---

## 🔍 How Similarity Search Works

1. **Input Features** - Enter observable characteristics (partial data is fine!)
2. **Multi-Index Matching** - System compares across numerical, categorical, and text features
3. **Weighted Scoring** - Configurable weights prioritize the features you trust most
4. **Ranked Results** - Get top matches with similarity percentages
5. **Report Generation** - Export findings for documentation

---

## 🗂️ Project Structure
```
deep-keel/
├── 🌐 client/              # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   └── pages/          # Page views
│   └── package.json
├── 🤖 server/              # Flask backend
│   ├── services/
│   │   └── similarity_search/  # Core classification engine
│   ├── cache/static/       # Naval ships database
│   └── app.py              # API endpoints
├── 📦 .venv/               # Python virtual environment
└── 🐳 docker-compose.yml   # Container deployment
```

---

## 🎨 Tech Stack

**Backend:**
- Python + Flask
- Scikit-learn (similarity computation)
- Pandas + NumPy (data processing)
- TF-IDF vectorization (text features)

**Frontend:**
- React + Vite
- Interactive forms
- Real-time results display

**Data:**
- 2,000+ naval vessel entries
- 40+ classification features per ship
- Global coverage across navies

---

## 🚧 Troubleshooting

**"Port already in use"**
- Try `npm run dev -- --port 3001` or change backend port in `.env`

**"Module not found"**  
- Verify virtual environment is active: `source .venv/bin/activate`

**"CSV file not found"**
- Ensure `naval_ships_data_expanded_alternate.csv` exists in `server/cache/static/`

**"CORS errors"**
- Check that both frontend and backend URLs are in the CORS configuration

---

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/classify` | POST | Submit classification query |
| `/api/stats` | GET | Get database statistics |
| `/api/ship-classes` | GET | List all ship classes |
| `/api/ship/<id>` | GET | Get specific ship details |
| `/api/report/<id>` | GET | Download classification report |

---

## 📊 Example Query

```json
{
  "query_features": {
    "ship_type": "Frigate",
    "displacement_full_load_tons_min": 3000,
    "displacement_full_load_tons_max": 5000,
    "primary_gun_mount_size": "Medium (30mm-76mm)",
    "missile_launcher_visible": "y"
  },
  "top_k": 10
}
```

---

## 🤝 Contributing

1. 🍴 Fork the repo
2. 🌿 Create your feature branch
3. ✅ Test thoroughly
4. 📤 Submit a pull request

---

## 📚 Use Cases

- **Naval Intelligence** - Rapid vessel identification from reconnaissance data
- **Maritime Research** - Comparative analysis of naval capabilities
- **Training & Education** - Teaching ship recognition fundamentals
- **Historical Analysis** - Studying evolution of naval designs

---

## 📞 Contact

**Team**: UC Berkeley MIDS Capstone  
**Course**: MIDS 210  
**Members**: Jasmol Singh Dhesi, Sarah Farooq, Wesley Thomas, Danielle Yoseloff

Questions? Issues? Open an issue or reach out through UC Berkeley MIDS!

---

## 🙏 Acknowledgments

- UC Berkeley MIDS Program
- Open source naval databases
- Jane's Fighting Ships (reference)
- The global open-source intelligence community

*Built with ⚓ for maritime situational awareness*