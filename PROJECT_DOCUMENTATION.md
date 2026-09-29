# ResQ-GIS: Master Technical & Operational Documentation
**High-Fidelity Disaster Risk Profiling, Dual-Engine GIS & Algorithmic Relocation Decision Support System**

---

## Table of Contents
1. [Executive Summary & System Vision](#1-executive-summary--system-vision)
2. [High-Level Architecture & Data Flow](#2-high-level-architecture--data-flow)
3. [User Interface & User Experience (UI/UX) Design System](#3-user-interface--user-experience-uiux-design-system)
4. [Dual-Engine Spatial GIS](#4-dual-engine-spatial-gis)
5. [Core Features & Tactical Modules](#5-core-features--tactical-modules)
6. [Algorithmic Engines & Mathematical Formulas](#6-algorithmic-engines--mathematical-formulas)
7. [Data Architecture & Schema Specifications](#7-data-architecture--schema-specifications)
8. [Backend Architecture & API Endpoints](#8-backend-architecture--api-endpoints)
9. [Frontend Architecture & State Machine](#9-frontend-architecture--state-machine)
10. [Third-Party Ingestion Feeds & Integration Protocols](#10-third-party-ingestion-feeds--integration-protocols)
11. [DevOps, Deployment & Operational Handbook](#11-devops-deployment--operational-handbook)

---

## 1. Executive Summary & System Vision

### 1.1 The Operational Problem
Traditional disaster monitoring systems function as **passive dashboards**. They ingest weather alerts and plot hazard contours, but leave incident commanders and district collectors in the dark regarding the logistical core of life preservation:
* *Which exact villages face imminent collapse or isolation?*
* *Where should thousands of civilians be evacuated safely?*
* *Does the destination haven possess adequate drinking water, food rations, and medical beds?*
* *Is the transit highway corridor flood-free and accessible for emergency convoys?*

### 1.2 The ResQ-GIS Solution
**ResQ-GIS** is an AI and GIS-driven spatial decision-support platform designed for **proactive disaster relocation and evacuation intelligence**. It transforms raw sensory and geological data into verified evacuation logistics before catastrophe strikes.

```
┌─────────────────────────┐
│ Multi-Agency Ingestion  │ (IMD / CWC / NDMA / ISRO / Open-Meteo)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ Composite Risk Engine   │ (Hazard 40% + Exposure 35% + Vulnerability 25%)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ Relocation Matcher      │ (Matches Settlements with Engineered Safe Havens)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ Priority Decision Engine│ (State-Scoped Comparative Directive & Fleet Sizing)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ Actionable NDMA Memo    │ (PDF / CSV Executive Evacuation Directive)
└─────────────────────────┘
```

---

## 2. High-Level Architecture & Data Flow

ResQ-GIS follows a decoupled micro-architecture combining a Python FastAPI GIS backend with a React 19 + TypeScript frontend.

```mermaid
graph TD
    subgraph External Ingestion Feeds
        IMD[IMD / NDMA Sachet CAP XML]
        CWC[CWC River Stage Telemetry]
        OM[Open-Meteo Weather Radar]
        BHU[ISRO Bhuvan LULC & Vectors]
        CARTO[CARTO Authenticated Basemaps]
        OSM[OpenStreetMap Corridors]
    end

    subgraph Backend Engine (FastAPI + PostGIS)
        ING[Ingestion Service & Feed Normalizers]
        GEO[GeoAlchemy2 / PostGIS Spatial Calculations]
        HAZ[Composite Hazard Synthesizer]
        HVI[Habitation Vulnerability Indexer]
        TOP[TOPSIS Multi-Criteria Prioritizer]
        FLEET[Evacuation Fleet & Logistics Calculator]
    end

    subgraph Frontend Client (React 19 + Vite + Zustand)
        STORE[Central Reactive Store - useAppStore]
        L2D[2D Tactical Leaflet Canvas]
        C3D[3D Cesium Terrain Globe]
        COMP[State-Scoped Relocation Compare Directive]
        MODAL[Full Executive Comparison Modal Box]
        REP[Evacuation Logistics & Manifests]
        GRID[Foldable Bottom Operations Data Grid]
    end

    IMD & CWC & OM & BHU & CARTO & OSM --> ING
    ING --> GEO --> HAZ & HVI --> TOP --> FLEET
    FLEET --> STORE
    STORE --> L2D & C3D
    STORE --> COMP & MODAL & REP & GRID
```

---

## 3. User Interface & User Experience (UI/UX) Design System

The ResQ-GIS interface is engineered for high-stress Emergency Operation Centers (EOCs), requiring immediate visual clarity, high contrast, zero unnecessary scrolling, and dense operational ergonomics.

### 3.1 Design Philosophy & Visual Tokens
* **Aesthetic**: Tactical command-deck glassmorphism with high-contrast borders and dark/light adaptive theming.
* **Palette**:
  * **Background Surface**: Dark (`#0B1120`, `#111827`) / Light (`#FFFFFF`, `#F8FAFC`).
  * **Sovereign India Accent**: Cyan Glow (`#38BDF8`).
  * **Operational Blue**: (`#2563EB`, `#3B82F6`).
  * **Risk Spectrum**:
    * Low: Emerald (`#10B981`)
    * Moderate: Amber (`#F59E0B`)
    * High: Orange (`#F97316`)
    * Red Zone: Dynamic Interpolated Crimson (`#EF4444` to `#7F1D1D`)
* **Typography**:
  * Display / UI: Inter and Outfit sans-serif for sharp legibility at high density.
  * Telemetry / Geospatial: JetBrains Mono and SF Pro Mono for coordinate tracking, elevations, and sensor numbers.

### 3.2 Workspace Layout Anatomy

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: Logo | State/District Filter | Hazard Chips | Relocation Hub CTA | Live Alert Ticker | Mode Toggle │
├──────────────┬───────────────────────────────┬───────────────────────────────────────────────┬──────────────┤
│ LEFT NAV     │ LEFT COMPARE PANEL (Optional) │ CENTER MAP CANVAS                             │ RIGHT PANEL  │
│              │                               │                                               │              │
│ - Dashboard  │ • State Scope Selector        │ • 2D Leaflet Tactical GIS                     │ • Selected   │
│ - Situation  │ • Loc A & Loc B Pickers       │   - Inverted India Sovereign Focus Mask       │   Inspector  │
│ - Compare    │ • Algorithmic Recommendation  │   - Non-repeating World Bounds                │ • Live Feeds │
│ - Sentry     │ • Metric Differentials        │   - Real-time Marker Clustering               │   (Two-Tier) │
│ - Havens     │ • Priority 1 Assignment       │ • 3D Cesium Digital Elevation Model           │ • District   │
│ - River GIS  │                               │ • Floating Search & Basemap Selector          │   Risk Donut │
│ - Hazards    │                               │                                               │ • Telemetry  │
│ - Reports    │                               │                                               │   Widgets    │
├──────────────┴───────────────────────────────┴───────────────────────────────────────────────┴──────────────┤
│ BOTTOM OPERATIONS DATA GRID: Habitations | Safe Havens | River Gauges | Evacuation Corridors | CSV Export   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Dual-Engine Spatial GIS

ResQ-GIS includes two synchronized geospatial rendering engines designed for different tactical needs.

### 4.1 2D Tactical Leaflet GIS (`Map2D.tsx`)
* **Primary Purpose**: Rapid 2D situational awareness, corridor visualization, and vector layer toggling.
* **Anti-Echoing & World Clamping**:
  * **World Clamping**: Leaflet tiles configured with `noWrap: true` and strict bounding box `bounds: [[-85.06, -180], [85.06, 180]]`.
  * **Viewport Pan Lock**: `maxBounds: [[-85.06, -180], [85.06, 180]]` with `maxBoundsViscosity: 1.0` and `minZoom: 3` prevents repeating copies of the earth when zoomed out.
  * **Sovereign India Focus**: An inverted polygon mask (`WORLD_INVERTED_MASK`) dims the surrounding world with dark transparency (`fillColor: '#030712'`, `fillOpacity: 0.65`, `stroke: false`), while India's land frontier is rendered using a dedicated polyline (`INDIA_BORDER_LATLNGS`) in cyan (`#38bdf8`, weight 1.8), avoiding outer bounding box artifacts.
* **Authenticated Basemap Support**:
  * **CARTO Dark Matter**: Ingests authenticated tiles using user key `?key=cb1_3rb7_2_6ffade6a2c1f6d15a74a8aaf` to prevent watermarking.
  * **Esri World Imagery**: Sub-meter satellite imagery with reference label overlay.
  * **OpenStreetMap**: Standard road vectors.
  * **OpenTopoMap**: Contour lines and topographic hillshades.

### 4.2 3D Cesium Digital Elevation Model (`CesiumGlobe.tsx`)
* **Primary Purpose**: Mountain slope assessment, GLOF trajectory analysis, valley choke point analysis, and vertical flood clearance inspection.
* **Terrain & Elevation**:
  * WorldTerrain elevation mesh with terrain exaggeration controls (1.0x to 2.5x).
  * Smooth cinematic fly-to transitions (`flyToState`, `flyToDistrict`, `flyToHabitation`).
  * Atmospheric Rayleigh and Mie scattering for realistic sun lighting and horizon depth.
  * Synchronized authenticated CARTO Dark and Voyager providers.

---

## 5. Core Features & Tactical Modules

### 5.1 Relocation Comparison & Executive Priority Directive
* **State-Scoped Filtering**: When selecting a state (e.g. *Kerala*), Location A and Location B dropdowns strictly list settlements within that state (e.g. *Vythiri Valley, Mundakkai, Chooralmala, Meppadi, Nilambur, Munnar*).
* **Direct Metric Differential**:
  * Risk Score delta (e.g. `Location B +2%`).
  * Population Exposure gap (e.g. `Loc A +3,180 souls`).
  * Assigned Haven Capacity comparison (`5,500 vs 4,500 beds`).
  * Transit Distance differential (`12.5 km vs 22.5 km`).
* **Algorithmic Priority Rationale**: Distinguishes purely higher composite risk from civilian exposure or community vulnerability, preventing misleading claims.
* **Dual Interface**:
  1. **Left Compare Panel**: Rapid in-line comparison and Priority 1 tagging without obstructing the map.
  2. **Full Evacuation Comparison Box**: Comprehensive modal detailing ASL elevation, hazard weightages, shelter water/rations, and corridor specifics.

### 5.2 Engineered Safe Haven Registry
* 21 verified institutional disaster shelters across 10 states:
  * **Multi-Purpose Cyclone Shelters (MPCS)** (rated for 250+ km/h cyclonic winds).
  * **District Multi-Sport Stadiums & Higher Secondary Hubs**.
  * **Elevation Clearance**: Verified between `+15m` and `+180m` above the 100-year flood line.
  * **Life Support Systems**: Daily drinking water reserve, dry ration buffer (days), diesel generator hours, and triage beds.

### 5.3 Evacuation & Transit Logistics Memo (`ReportsPanel.tsx`)
* Calculates mandatory evacuation convoy assets based on NDMA norms:
  * 50-Seater Evacuation Buses (`ceil(exposedPop / 50)`).
  * Advanced Life Support Ambulances (`max(2, ceil(exposedPop / 350))`).
  * Emergency Rations Tonnage (`(exposedPop * 0.45 * 14) / 1000`).
* Instant printing of operational command memos and CSV exports.

### 5.4 Surveillance Zones & Sentry Monitoring (`SurveillancePanel.tsx`)
* Interactive drawing of circular and polygonal Areas of Interest (AOIs).
* Instant spatial calculation of exposed population, vulnerable habitations, and nearest shelters inside the surveillance zone.

### 5.5 Live Ingestion Feeds Widget (`RightOperationsPanel.tsx`)
* Two-tier micro-card list avoiding text collisions:
  * **Top line**: Feed icon, bold name, and status badge (`LIVE` in green / `ACTIVE` in slate).
  * **Bottom line**: Distinct monospace telemetry values with high contrast.

---

## 6. Algorithmic Engines & Mathematical Formulas

### 6.1 Composite Risk Score Calculation
Every settlement's risk is calculated using a multi-criteria vulnerability formula:

$$\text{Risk Score} = (0.40 \times H) + (0.35 \times E) + (0.25 \times V) - C_{\text{adapt}}$$

Where:
* **$H$ (Hazard Exposure - 40% Weightage)**:
  * Slope angle gradient ($>30^\circ$ significantly increases landslide risk).
  * 24-hour antecedent rainfall from live weather feeds.
  * Proximity to active flood inundation zones or glacial lakes.
* **$E$ (Population Exposure - 35% Weightage)**:
  * Total civilian count and household density within hazard footprint.
* **$V$ (Habitation Vulnerability Index / HVI - 25% Weightage)**:
  * Structural fragility ratio (Kutcha thatched vs. Pucca RCC buildings).
  * Demographic vulnerability (percentage of elderly and children under 5).
  * Distance to tertiary medical trauma care.
* **$C_{\text{adapt}}$ (Adaptive Capacity Offset)**:
  * Presence of early warning sirens, local rescue boats, or retention walls.

### 6.2 Standardized Risk Classification Scale

| Score Range | Category | Color Representation | Operational Directives |
|---|---|---|---|
| **0% – 30%** | **Low** | Emerald Green (`#10b981`) | Normal surveillance; maintain routine civil readiness. |
| **30% – 60%** | **Moderate** | Amber (`#f59e0b`) | Advisory alerts; place shelter logistics on standby. |
| **60% – 80%** | **High** | Orange (`#f97316`) | Prepare evacuation fleet; pre-position first responders. |
| **80% – 100%**| **Red Zone**| Dynamic Crimson (`#ef4444` $\to$ `#7f1d1d`) | Mandatory immediate evacuation directive; Level 1 priority. |

*Dynamic Red Zone Interpolation*: Higher scores produce progressively deeper crimson shades (e.g., 96% is visually distinct and darker than 81%).

---

## 7. Data Architecture & Schema Specifications

### 7.1 Core Entities

#### Habitation Schema
```typescript
interface Habitation {
  id: string;
  name: string;
  district: string;
  state: string;
  block?: string;
  location: { lat: number; lng: number; elevation?: number };
  population: number;
  households: number;
  riskScore: number;       // Normalized 0.00 to 1.00
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  hazardExposure: Array<{ type: string; level: string; probability: number }>;
  vulnerabilityIndex: {
    physical: number;
    social: number;
    economic: number;
    overall: number;
  };
  nearestRelocationSite?: string;
  evacuationPriority?: number;
}
```

#### Relocation Site (Safe Haven) Schema
```typescript
interface RelocationSite {
  id: string;
  name: string;
  district: string;
  state: string;
  location: { lat: number; lng: number; elevation: number };
  capacity: number;           // Total bed capacity
  currentOccupants: number;
  suitabilityScore: number;   // 0.00 to 1.00
  operationalStatus: 'READY' | 'ACTIVE' | 'FULL' | 'MAINTENANCE';
  distanceFromAffected: number;
  foodStockDays: number;
  dailyWaterLiters: number;
  managingAgency: string;
  elevationClearanceMeters?: number;
}
```

---

## 8. Backend Architecture & API Endpoints

The backend is written in Python using FastAPI, Pydantic v2, and GeoAlchemy2.

### 8.1 API Surface

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/habitations` | `GET` | Retrieve vulnerable habitations, filterable by state, district, and risk. |
| `/api/v1/relocation-sites` | `GET` | List institutional safe havens and capacity metrics. |
| `/api/v1/rivers` | `GET` | Real-time CWC river monitoring gauges and warning stages. |
| `/api/v1/weather` | `GET` | Live 24-hour rainfall and weather telemetry. |
| `/api/v1/alerts` | `GET` | Active IMD and NDMA Common Alerting Protocol warnings. |
| `/api/v1/analysis/prioritize` | `POST`| Run multi-criteria TOPSIS relocation prioritization. |
| `/api/v1/surveillance/scan` | `POST`| Compute impacted civilian exposure within a custom polygon AOI. |

---

## 9. Frontend Architecture & State Machine

The client application is built with React 19, TypeScript, and Vite.

### 9.1 State Management (`useAppStore.ts`)
Global state is managed via Zustand without unnecessary re-renders:
* **Spatial State**: `mapMode` (`'2d'` vs `'3d'`), camera targets, active basemap.
* **Selection State**: `selectedHabitationId`, `selectedSiteId`, `selectedState`, `selectedDistrict`.
* **Comparison State**: `compareStateFilter`, `compareLocationAId`, `compareLocationBId`, `isComparisonBoxOpen`.
* **Telemetry Cache**: Auto-refresh loops polling `/api/v1/weather` and `/api/v1/alerts`.

---

## 10. Third-Party Ingestion Feeds & Integration Protocols

1. **CARTO Basemap Platform**:
   * Uses raster tile endpoint `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key={API_KEY}` with key `cb1_3rb7_2_6ffade6a2c1f6d15a74a8aaf`.
2. **IMD & NDMA SACHET**:
   * Parses official CAP XML feeds containing CAP alert polygons, severity ratings, and urgency codes.
3. **Central Water Commission (CWC)**:
   * Ingests flood stage data comparing current water levels against defined warning and danger thresholds.
4. **Open-Meteo**:
   * Collects hourly rainfall, soil moisture, and wind velocity metrics.
5. **ISRO Bhuvan**:
   * Supplies LULC classification, elevation contours, and administrative boundary GeoJSONs.

---

## 11. DevOps, Deployment & Operational Handbook

### 11.1 Local Development Setup

#### Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

#### Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

### 11.2 Multi-Remote Git Repository Setup
The repository is synchronized across two GitHub remotes:
```powershell
git remote add origin https://github.com/devsaivarshith-creator/hazard-relocation-demo.git
git remote add resq-gis https://github.com/devsaivarshith-creator/ResQ-GIS.git

# Push updates to both
git push origin main
git push resq-gis main
```

### 11.3 Production Deployment (Netlify)
The frontend builds into a static bundle with Cesium assets:
```powershell
npm run build --prefix frontend
```
For Netlify deployment, files must be packaged using POSIX-compliant forward slashes:
```powershell
python -c "import os, zipfile; dist = os.path.abspath('frontend/dist'); zip_path = os.path.abspath('dist_posix.zip'); zf = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED); [zf.write(os.path.join(root, f), os.path.relpath(os.path.join(root, f), dist).replace('\\', '/')) for root, _, files in os.walk(dist) for f in files]; zf.close()"
```
Deploy via Netlify API or direct GitHub continuous deployment.

---

*ResQ-GIS PRO &mdash; Confidential Disaster Decision Support Directive*
