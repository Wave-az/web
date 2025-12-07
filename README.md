# COSMIS Web - Geographic Area Suitability Analysis Platform

## Project Title & Description

**COSMIS Web** is an interactive web-based geographic analysis platform that enables users to define areas of interest (AOI) on maps and perform comprehensive suitability assessments and risk analysis. The platform provides tools for drawing polygons, circles, and rectangles on Google Maps, with built-in area validation, and integrates with a backend API to analyze geographic locations for agricultural suitability, water availability, terrain quality, and various environmental risks.

The solution combines modern web technologies with geographic information systems (GIS) capabilities to deliver an intuitive interface for professionals working in agriculture, environmental planning, and land management.

## Overview

COSMIS Web allows users to:

- Draw and manage multiple geographic zones (polygons, rectangles, circles) on interactive maps
- Select predefined country locations with automatic area bounding
- Validate polygon areas against size constraints (max 1000 hectares)
- Perform suitability analysis for selected geographic areas
- Assess risks including flood, dryness, shoreline erosion, and seasonality
- Export comprehensive PDF reports with detailed zone-by-zone analysis
- Save and load project configurations for future reference

## Key Features

### Interactive Map Tools

- **Multiple Drawing Tools**: Polygon (freehand), Rectangle, and Circle selection
- **Country Selection**: Predefined list of 30+ countries with automatic boundary creation
- **Coordinate Input**: Manual latitude/longitude entry for precise zone definition
- **Area Validation**: Automatic validation ensuring zones don't exceed 1000 hectares
- **Zone Management**: Multiple zones per project with tab-based navigation
- **Visual Feedback**: Color-coded suitability scores and risk indicators

### Analysis Capabilities

- **Suitability Assessment**: Multi-factor analysis including:
  - Moisture quality
  - Excess water quality
  - Terrain quality
  - Temperature quality
  - Accessibility quality
- **Risk Analysis**: Comprehensive risk evaluation for:
  - Flood risk
  - Dryness risk
  - Shoreline risk
  - Seasonality patterns
- **FAO Classification**: Agricultural suitability classification
- **Score-Based Evaluation**: Color-coded scoring system (red/orange/yellow/green)

### Project Management

- **Save/Load Projects**: JSON-based project persistence
- **Export to PDF**: Professional reports with zone-specific sections
- **Multi-Zone Analysis**: Independent analysis results per geographic zone
- **Date Range Selection**: Configurable time windows for analysis periods

## Technology Stack

### Frontend

- **React 19.2.0** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4.1.17** - Utility-first styling
- **Google Maps JavaScript API** - Interactive mapping
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Key Libraries

- `@react-google-maps/api` - React wrapper for Google Maps
- `jspdf` - PDF generation
- `html2canvas` - Screenshot capabilities
- Shadcn/ui components - High-quality UI component library

### Data & Methodology

#### Geographic Data Sources

- **Google Maps API**: Base maps, satellite imagery, terrain data
- **Google Places API**: Location geocoding and country boundaries
- **Google Geometry Library**: Area calculations, coordinate transformations

#### Analysis Methodology

The platform integrates with a backend API (`http://localhost:3000/suitability/analyze`) that performs:

1. **Spatial Analysis**: Processes bounding boxes and coordinate polygons
2. **Remote Sensing**: Utilizes satellite imagery (Landsat grid WRS2 Path/Row)
3. **NDWI Analysis**: Normalized Difference Water Index for water detection
4. **Multi-Factor Evaluation**: Combines multiple environmental factors
5. **Risk Modeling**: Statistical analysis of environmental risks

#### Data Processing Pipeline

```
User Input (Polygon/Circle/Rectangle)
  ↓
Area Validation (< 1000 hectares)
  ↓
Coordinate Extraction & Bounding Box Calculation
  ↓
API Request with Date Range & Options
  ↓
Backend Processing (Satellite Data Analysis)
  ↓
Suitability Score Calculation
  ↓
Risk Assessment
  ↓
Results Display & Report Generation
```

## Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Google Maps API Key** (with the following APIs enabled):
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Geometry Library

### Environment Configuration

1. Create a `.env` file in the project root:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

2. Replace `your_google_maps_api_key_here` with your actual Google Maps API key.

### Installation Steps

1. **Clone the repository** (if applicable):

```bash
git clone <repository-url>
cd cosmis-web
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start the development server**:

```bash
npm run dev
```

4. **Open your browser** and navigate to:

```
http://localhost:5173
```

### Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Usage Instructions

### Getting Started

1. **Launch the Application**: Start the dev server and open in your browser
2. **Set Project Title**: Click on the project title at the top-left to rename your project
3. **Configure Date Range**: Set baseline and current periods in the Map Settings panel

### Creating Geographic Zones

#### Method 1: Drawing Tools

1. Open the **Map Settings** panel (bottom-right)
2. Select a drawing tool:
   - **Square Icon**: Draw rectangular zones
   - **Circle Icon**: Draw circular zones
   - **Pen Tool**: Draw custom polygon zones
3. Click and drag on the map to create your zone
4. The zone will be validated (must be < 1000 hectares)

#### Method 2: Country Selection

1. Use the **Country** dropdown in Map Settings
2. Select a country from the list
3. A rectangular boundary for that country will be automatically created

#### Method 3: Coordinate Input

1. In Map Settings, use the coordinate input fields
2. Add multiple latitude/longitude pairs (minimum 3 for polygons, 4 for rectangles)
3. Click **"Create Polygon from Coordinates"**
4. The polygon will be created and validated

### Managing Zones

- **Select Zone**: Click on a zone tab at the top of the map or click the zone on the map
- **Rename Zone**: Double-click the zone tab to edit its name
- **Delete Zone**: Click the X button on a zone tab or select a zone and press Delete/Backspace
- **View Coordinates**: Selecting a zone displays all its coordinates in the input fields

### Running Analysis

1. **Select a Zone**: Click on the zone you want to analyze
2. **Configure Settings**:
   - Set date ranges (from/to year, month, day)
   - Adjust analysis options if available
3. **Run Suitability Analysis**:
   - Click **"Request data"** button in the Suitability Score panel
   - Wait for the API response
4. **View Results**:
   - **Suitability Score**: Color-coded score (0-100) with FAO classification
   - **Risks Panel**: Detailed risk assessments for flood, dryness, shoreline, seasonality
   - **Summary Panel**: Comprehensive summary with multiple analysis sections

### Understanding Results

#### Suitability Score Colors

- **Red** (≤30): Low suitability
- **Orange** (31-50): Moderate-low suitability
- **Yellow** (51-70): Moderate-high suitability
- **Green** (71-100): High suitability

#### Risk Labels

- **Low Risk**: Green indicator
- **Medium Risk**: Amber/yellow indicator
- **High Risk**: Red indicator

### Exporting Projects

#### Save Project

1. Click **File** menu (top-left)
2. Select **Save**
3. A JSON file will be downloaded containing:
   - All zones and coordinates
   - Project settings
   - Analysis results per zone
   - Date ranges and metadata

#### Load Project

1. Click **File** menu
2. Select **Open**
3. Choose a previously saved project JSON file
4. All zones and analysis results will be restored

#### Export PDF Report

1. Ensure you have zones with analysis results
2. Click **File** menu
3. Select **Export PDF Report**
4. A comprehensive PDF will be generated with:
   - Project overview
   - Table of contents
   - Detailed section for each zone
   - Analysis results and risk assessments

### Map Controls

- **Zoom In/Out**: Use the zoom controls on the right side of the map
- **Map Type**: Switch between Roadmap, Satellite, Terrain, and Hybrid views
- **Fit to Zone**: Selecting a zone automatically zooms and centers the map
- **Clear All**: Button to remove all zones from the map

## Project Structure

```
cosmis-web/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/
│   │   ├── GoogleMap.tsx       # Google Maps integration
│   │   ├── PlacesAutocomplete.tsx
│   │   ├── SimpleCombobox.tsx
│   │   └── ui/                 # Reusable UI components
│   ├── helpers/
│   │   ├── countries.ts        # Country data and utilities
│   │   ├── date-helper.tsx     # Date range utilities
│   │   └── pdf-generator.ts    # PDF report generation
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   └── index.css               # Global styles
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
└── README.md                   # This file
```

## API Integration

The application expects a backend API endpoint at:

```
POST http://localhost:3000/suitability/analyze
```

### Request Format

```json
{
  "aoi": {
    "type": "bbox",
    "value": [minLng, minLat, maxLng, maxLat]
  },
  "periods": {
    "baseline": {
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    },
    "current": {
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    }
  },
  "options": {
    "max_cloud_percentage": 30,
    "ndwi_water_threshold": 0.2,
    "scale": 10
  }
}
```

### Response Format

```json
{
  "location_id": "string",
  "time_window": {
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  },
  "suitability": {
    "score": 0-100,
    "fao_class": "string",
    "components": {
      "moisture_quality": 0-100,
      "excess_water_quality": 0-100,
      "terrain_quality": 0-100,
      "temperature_quality": 0-100,
      "accessibility_quality": 0-100
    }
  },
  "risks": {
    "flood": { "score": number, "label": "string", "footnote": "string" },
    "dryness": { "score": number, "label": "string", "footnote": "string" },
    "shoreline": { "score": number, "label": "string", "footnote": "string" },
    "seasonality": { "score": number, "label": "string", "footnote": "string" }
  },
  "summary_panels": {
    "flood_risk": { "title": "string", "bullets": ["string"] },
    "water_snapshot": { "title": "string", "bullets": ["string"] },
    "difference": { "title": "string", "bullets": ["string"] },
    "risk_breakdown": { "title": "string", "bullets": ["string"] },
    "outlook": { "title": "string", "bullets": ["string"] }
  }
}
```

## Key Results & Capabilities

### Area Validation

- Automatic calculation of polygon areas using Google Maps Geometry Library
- Validation against 1000 hectare maximum
- Real-time error feedback for oversized zones

### Multi-Zone Analysis

- Independent analysis results for each geographic zone
- Per-zone suitability scoring and risk assessment
- Zone-specific data persistence and reporting

### Visual Analytics

- Color-coded suitability scores for quick assessment
- Risk indicators with detailed labels and footnotes
- Interactive map visualization with multiple overlay options

### Professional Reporting

- Structured PDF reports with zone-by-zone sections
- Comprehensive data tables including coordinates and areas
- Analysis summaries with key findings and recommendations

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses:

- ESLint for code linting
- TypeScript for type safety
- Prettier-compatible formatting (via Tailwind)

## Troubleshooting

### Common Issues

**Issue**: Map not loading

- **Solution**: Check that `VITE_GOOGLE_MAPS_API_KEY` is set correctly in `.env`

**Issue**: API requests failing

- **Solution**: Ensure the backend API is running on `http://localhost:3000`

**Issue**: Zone area validation errors

- **Solution**: Ensure zones are under 1000 hectares (100 hectares = 1 km²)

**Issue**: PDF export not working

- **Solution**: Check browser console for errors; ensure all analysis data is loaded

## License

[Specify your license here]

## Contact & Support

[Add contact information or support channels]

## Acknowledgments

- Google Maps Platform for mapping services
- React and Vite teams for excellent development tools
- Shadcn/ui for high-quality component library

---

**Version**: 0.0.0  
**Last Updated**: 2024
