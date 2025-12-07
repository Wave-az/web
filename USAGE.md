# COSMIS Web - Usage Instructions

## Quick Start Guide

### Step 1: Setup and Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   
   Get your API key from [Google Cloud Console](https://console.cloud.google.com/). Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:5173`

### Step 2: Create Your First Project

1. **Set Project Title**
   - Click on "My Project Name" at the top-left
   - Type your project name
   - Press Enter or click outside to save

2. **Configure Date Range**
   - Open the **Map Settings** panel (bottom-right)
   - Set your analysis date range:
     - **From**: Year, Month, Day
     - **To**: Year, Month, Day
   - This defines the time window for your analysis

### Step 3: Define Geographic Zones

#### Option A: Draw on Map

1. **Select Drawing Tool**
   - Click the **Square** icon for rectangles
   - Click the **Circle** icon for circles
   - Click the **Pen Tool** icon for freehand polygons

2. **Draw Your Zone**
   - Click and drag on the map
   - For polygons: Click multiple points, double-click to finish
   - The zone will appear with a red outline

3. **Area Validation**
   - Zones larger than 1000 hectares will show an error
   - Draw a smaller zone if needed

#### Option B: Select Country

1. **Open Country Dropdown**
   - In Map Settings, find the "Country" selector
   - Click to open the dropdown

2. **Choose Country**
   - Select from the list of 30+ countries
   - A rectangular boundary will be created automatically

#### Option C: Enter Coordinates

1. **Add Coordinate Pairs**
   - Use the coordinate input fields in Map Settings
   - Click "+" to add more pairs
   - Minimum 3 points for polygon, 4 for rectangle

2. **Enter Coordinates**
   - Format: Decimal degrees (e.g., 40.1431, 47.5769)
   - Negative values for west/south

3. **Create Polygon**
   - Click "Create Polygon from Coordinates"
   - The polygon will be created and displayed

### Step 4: Manage Zones

#### Select a Zone
- Click the zone tab at the top of the map
- Or click directly on the zone on the map
- Selected zone turns blue

#### Rename a Zone
- Double-click the zone tab
- Type new name
- Press Enter to save, Escape to cancel

#### Delete a Zone
- Click the "X" button on the zone tab
- Or select the zone and press Delete/Backspace key

#### View Zone Coordinates
- Selecting a zone displays all coordinates in input fields
- Coordinates are shown in decimal degrees format

### Step 5: Run Analysis

1. **Select Target Zone**
   - Click on the zone you want to analyze
   - Ensure it's highlighted in blue

2. **Verify Settings**
   - Check date range is correct
   - Ensure backend API is running (if using local API)

3. **Request Analysis**
   - Find the **"Request data"** button in the Suitability Score panel
   - Click to send analysis request
   - Wait for response (loading indicator will show)

4. **View Results**
   - **Suitability Score**: Color-coded (0-100)
     - Red: 0-30 (Low)
     - Orange: 31-50 (Moderate-Low)
     - Yellow: 51-70 (Moderate-High)
     - Green: 71-100 (High)
   - **FAO Classification**: Agricultural suitability class
   - **Risk Panel**: Expand to see detailed risk assessments
   - **Summary Panel**: Comprehensive analysis summary

### Step 6: Analyze Multiple Zones

1. **Create Additional Zones**
   - Use any of the zone creation methods
   - Each zone gets its own tab

2. **Switch Between Zones**
   - Click different zone tabs
   - Map automatically zooms to selected zone

3. **Run Analysis Per Zone**
   - Select a zone
   - Click "Request data"
   - Each zone stores independent analysis results

### Step 7: Export and Save

#### Save Project
1. Click **File** menu (top-left)
2. Select **Save**
3. JSON file downloads with:
   - All zones and coordinates
   - Analysis results
   - Project settings
   - Date ranges

#### Load Project
1. Click **File** menu
2. Select **Open**
3. Choose saved project JSON file
4. All data is restored

#### Export PDF Report
1. Ensure zones have analysis results
2. Click **File** menu
3. Select **Export PDF Report**
4. PDF includes:
   - Project overview
   - Table of contents
   - Section per zone
   - Analysis details
   - Risk assessments

#### New Project
1. Click **File** menu
2. Select **New Project**
3. All data is cleared

## Detailed Features

### Map Controls

#### Zoom Controls
- **Zoom In**: Click the "+" button (right side)
- **Zoom Out**: Click the "-" button
- **Fit to Zone**: Automatically when selecting a zone

#### Map Types
- **Roadmap**: Standard map view
- **Satellite**: Aerial imagery
- **Terrain**: Topographic view
- **Hybrid**: Satellite with labels

Change map type in Map Settings panel.

### Analysis Understanding

#### Suitability Components
- **Moisture Quality**: Water availability assessment
- **Excess Water Quality**: Flooding/drainage analysis
- **Terrain Quality**: Slope and elevation factors
- **Temperature Quality**: Climate suitability
- **Accessibility Quality**: Ease of access evaluation

#### Risk Assessment
- **Flood Risk**: Probability and severity of flooding
- **Dryness Risk**: Drought and water scarcity
- **Shoreline Risk**: Coastal erosion and changes
- **Seasonality**: Seasonal variation patterns

### Tips & Best Practices

1. **Zone Size**: Keep zones under 1000 hectares for best results
2. **Date Ranges**: Use meaningful time periods for comparison
3. **Multiple Zones**: Compare different areas in the same project
4. **Save Regularly**: Save projects to avoid data loss
5. **Coordinate Precision**: Use 6 decimal places for accuracy

### Keyboard Shortcuts

- **Delete/Backspace**: Remove selected zone
- **Enter**: Save zone name when editing
- **Escape**: Cancel zone name editing

## Troubleshooting

### Map Not Loading
- Check `.env` file exists and API key is correct
- Verify API key has required APIs enabled
- Check browser console for errors

### Analysis Failing
- Ensure backend API is running on `localhost:3000`
- Check network tab for API errors
- Verify date range is set correctly
- Ensure at least one zone is selected

### Zone Not Creating
- Check area is under 1000 hectares
- Verify coordinates are valid decimal degrees
- Ensure minimum 3 points for polygons

### PDF Export Issues
- Wait for all analysis to complete first
- Check browser console for errors
- Ensure zones have analysis results

## Advanced Usage

### Coordinate Formats
- Input: Decimal degrees (e.g., 40.1431)
- Latitude: -90 to 90
- Longitude: -180 to 180
- Negative = South/West

### Area Calculations
- Uses Google Maps Geometry Library
- Calculated in square meters
- Converted to hectares (1 ha = 10,000 m²)
- Maximum allowed: 1000 hectares

### Project File Format
Projects are saved as JSON with this structure:
```json
{
  "version": "1.0.0",
  "metadata": {
    "name": "Project Name",
    "createdAt": "ISO date",
    "lastModified": "ISO date"
  },
  "project": {
    "title": "...",
    "polygons": [...],
    "analysis": {...},
    "dateRange": {...}
  }
}
```

## API Integration

### Starting Backend API

Ensure your analysis API is running:
```bash
# Example (adjust for your setup)
cd backend
npm start
# API should run on http://localhost:3000
```

### API Endpoint
```
POST http://localhost:3000/suitability/analyze
```

### Request Example
```json
{
  "aoi": {
    "type": "bbox",
    "value": [47.4, 39.9, 47.8, 40.2]
  },
  "periods": {
    "baseline": {
      "start_date": "2020-01-01",
      "end_date": "2020-12-31"
    },
    "current": {
      "start_date": "2023-01-01",
      "end_date": "2023-12-31"
    }
  },
  "options": {
    "max_cloud_percentage": 30,
    "ndwi_water_threshold": 0.2,
    "scale": 10
  }
}
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set
4. Check API connectivity

---

**Last Updated**: 2024

