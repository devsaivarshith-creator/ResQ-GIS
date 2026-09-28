import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import {
  Search,
  Maximize2,
  Plus,
  Minus,
  Crosshair,
  Layers,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { WORLD_INVERTED_MASK } from '../../data/indiaBoundary';

type BasemapType = 'osm' | 'satellite' | 'dark' | 'topo';

const BASEMAP_URLS: Record<BasemapType, { url: string; attribution: string; maxZoom?: number; labelUrl?: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    labelUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19,
  },
  topo: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

const DEFAULT_CENTER: [number, number] = [30.45, 79.35];
const DEFAULT_ZOOM = 9;

export default function Map2D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);
  const pathwayGroupRef = useRef<L.FeatureGroup | null>(null);
  const indiaMaskRef = useRef<L.Polygon | null>(null);

  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('satellite');
  const [showLabels] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [basemapMenuOpen, setBasemapMenuOpen] = useState(false);
  const [isLayersMinimized, setIsLayersMinimized] = useState(false);

  // Local layer visibility toggles matching the tactical LAYERS card
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({
    landslide: true,
    flood: true,
    rainfall: true,
    rivers: true,
    habitations: true,
    relocation_sites: true,
    roads: true,
    district_boundaries: false,
    block_boundaries: false,
    india_focus: true,
  });

  const {
    habitations,
    relocationSites,
    riverStations,
    hazardLayers,
    alerts,
    roads,
    emergencyResources,
    layers,
    selectedHabitationId,
    selectedSiteId,
    selectedRiverId,
    selectHabitation,
    selectSite,
    selectRiver,
    selectHazard,
    getSelectedHabitation,
    getLayerVisibilityMap,
    mapMode,
    setMapMode,
    selectedDistrict,
    selectedState,
    toggleLayer,
  } = useAppStore();

  const toggleLocalLayer = (key: string) => {
    setLayerVisibility((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toggleLayer(key);
      return updated;
    });
  };

  // Search results for floating search bar
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return habitations
      .filter((h) => h.name.toLowerCase().includes(q) || (h.block && h.block.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [habitations, searchQuery]);

  const handleSelectHabitation = (h: typeof habitations[0]) => {
    if (mapRef.current && h.location) {
      mapRef.current.flyTo([h.location.lat, h.location.lng], 13, { duration: 1.2 });
    }
    selectHabitation(h.id);
    setSearchQuery(h.name);
    setSearchFocused(false);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    const coordParts = searchQuery.split(',').map((p) => parseFloat(p.trim()));
    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
      if (mapRef.current) {
        mapRef.current.flyTo([coordParts[0], coordParts[1]], 13, { duration: 1.2 });
      }
      setSearchFocused(false);
      return;
    }
    if (searchResults.length > 0) {
      handleSelectHabitation(searchResults[0]);
    }
  };

  // Switch basemap tile layer
  const switchBasemap = useCallback((type: BasemapType) => {
    if (!mapRef.current) return;
    setActiveBasemap(type);
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (labelLayerRef.current) {
      mapRef.current.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }
    const def = BASEMAP_URLS[type];
    tileLayerRef.current = L.tileLayer(def.url, {
      attribution: def.attribution,
      maxZoom: def.maxZoom || 18,
    }).addTo(mapRef.current);

    if (def.labelUrl && showLabels) {
      labelLayerRef.current = L.tileLayer(def.labelUrl, {
        maxZoom: def.maxZoom || 18,
        pane: 'overlayPane',
      }).addTo(mapRef.current);
    }
  }, [showLabels]);

  // Synchronize reference label layer when showLabels or activeBasemap changes
  useEffect(() => {
    if (!mapRef.current) return;
    const def = BASEMAP_URLS[activeBasemap];
    if (showLabels && def.labelUrl && !labelLayerRef.current) {
      labelLayerRef.current = L.tileLayer(def.labelUrl, {
        maxZoom: def.maxZoom || 18,
        pane: 'overlayPane',
      }).addTo(mapRef.current);
    } else if (!showLabels && labelLayerRef.current) {
      mapRef.current.removeLayer(labelLayerRef.current);
      labelLayerRef.current = null;
    }
  }, [showLabels, activeBasemap]);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });

    const initialDef = BASEMAP_URLS[activeBasemap];
    tileLayerRef.current = L.tileLayer(initialDef.url, {
      attribution: initialDef.attribution,
      maxZoom: initialDef.maxZoom || 18,
    }).addTo(map);

    if (initialDef.labelUrl && showLabels) {
      labelLayerRef.current = L.tileLayer(initialDef.labelUrl, {
        maxZoom: initialDef.maxZoom || 18,
        pane: 'overlayPane',
      }).addTo(map);
    }

    layersGroupRef.current = L.featureGroup().addTo(map);
    pathwayGroupRef.current = L.featureGroup().addTo(map);

    // Inverted Mask: Darkens world outside India, illuminates and highlights sovereign India
    const mask = L.polygon(WORLD_INVERTED_MASK as any, {
      fillColor: '#030712',
      fillOpacity: 0.65,
      color: '#38bdf8',
      weight: 1.8,
      opacity: 0.95,
      interactive: false,
    }).addTo(map);
    indiaMaskRef.current = mask;

    mapRef.current = map;

    return () => {
      if (indiaMaskRef.current) {
        indiaMaskRef.current.remove();
        indiaMaskRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      labelLayerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle India Focus Mask layer visibility
  useEffect(() => {
    if (!indiaMaskRef.current || !mapRef.current) return;
    if (layerVisibility.india_focus) {
      if (!mapRef.current.hasLayer(indiaMaskRef.current)) {
        indiaMaskRef.current.addTo(mapRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(indiaMaskRef.current)) {
        mapRef.current.removeLayer(indiaMaskRef.current);
      }
    }
  }, [layerVisibility.india_focus]);

  // When mapMode is '2d', invalidate size to ensure tiles render immediately
  useEffect(() => {
    if (mapMode === '2d' && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 50);
    }
  }, [mapMode]);

  // Center on selected items
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedHabitationId) {
      const hab = habitations.find((h) => h.id === selectedHabitationId);
      if (hab && hab.location) {
        mapRef.current.flyTo([hab.location.lat, hab.location.lng], 13, { duration: 1.2 });
      }
    } else if (selectedSiteId) {
      const site = relocationSites.find((s) => s.id === selectedSiteId);
      if (site && site.location) {
        mapRef.current.flyTo([site.location.lat, site.location.lng], 13, { duration: 1.2 });
      }
    } else if (selectedRiverId) {
      const river = riverStations.find((r) => r.id === selectedRiverId);
      if (river && river.location) {
        mapRef.current.flyTo([river.location.lat, river.location.lng], 13, { duration: 1.2 });
      }
    }
  }, [selectedHabitationId, selectedSiteId, selectedRiverId, habitations, relocationSites, riverStations]);

  // Center when administrative scope changes (district or state)
  useEffect(() => {
    if (!mapRef.current || selectedHabitationId || selectedSiteId || selectedRiverId) return;
    const distMap: Record<string, [number, number]> = {
      chamoli: [30.55, 79.55],
      rudraprayag: [30.45, 79.05],
      pithoragarh: [29.58, 80.22],
      uttarkashi: [30.73, 78.43],
      kinnaur: [31.65, 78.35],
      kullu: [31.95, 77.10],
      mandi: [31.71, 76.93],
      wayanad: [11.68, 76.13],
      idukki: [10.08, 77.05],
      alappuzha: [9.42, 76.48],
      konaseema: [16.48, 81.88],
      'dr. b.r. ambedkar konaseema': [16.48, 81.88],
      visakhapatnam: [17.68, 83.22],
      majuli: [26.96, 94.21],
      silchar: [24.83, 92.79],
      cachar: [24.83, 92.79],
      'dima hasao': [25.40, 93.02],
      mangan: [27.50, 88.52],
      chungthang: [27.60, 88.65],
      gangtok: [27.33, 88.61],
      singtam: [27.23, 88.50],
      jagatsinghpur: [19.98, 86.42],
      puri: [19.81, 85.83],
      ganjam: [19.40, 84.85],
      anantnag: [33.73, 75.15],
      srinagar: [34.08, 74.80],
      'east khasi hills': [25.28, 91.72],
      sohra: [25.28, 91.72],
      cherrapunji: [25.28, 91.72],
      noney: [24.78, 93.63],
      kohima: [25.67, 94.11],
    };
    const stateMap: Record<string, [number, number]> = {
      uttarakhand: [30.4, 79.3],
      'himachal pradesh': [31.8, 77.2],
      kerala: [10.5, 76.3],
      'andhra pradesh': [16.8, 81.5],
      assam: [26.2, 92.8],
      sikkim: [27.5, 88.5],
      odisha: [20.3, 85.0],
      'jammu & kashmir': [33.9, 74.9],
      'jammu and kashmir': [33.9, 74.9],
      meghalaya: [25.5, 91.5],
      'manipur & nagaland': [25.2, 93.8],
      manipur: [24.8, 93.8],
      nagaland: [25.7, 94.1],
    };
    // 1. Specific entity selection (Highest priority)
    if (selectedHabitationId) {
      const hab = habitations.find((h) => h.id === selectedHabitationId);
      if (hab && hab.location) {
        mapRef.current.flyTo([hab.location.lat, hab.location.lng], 13, { duration: 1.2 });
        return;
      }
    }
    if (selectedSiteId) {
      const site = relocationSites.find((s) => s.id === selectedSiteId);
      if (site && site.location) {
        mapRef.current.flyTo([site.location.lat, site.location.lng], 13, { duration: 1.2 });
        return;
      }
    }
    if (selectedRiverId) {
      const river = riverStations.find((r) => r.id === selectedRiverId);
      if (river && river.location) {
        mapRef.current.flyTo([river.location.lat, river.location.lng], 12, { duration: 1.2 });
        return;
      }
    }

    // 2. District selection
    if (selectedDistrict && selectedDistrict !== 'ALL') {
      const coords = distMap[selectedDistrict.toLowerCase().trim()];
      if (coords) {
        mapRef.current.flyTo(coords, 10, { duration: 1.2 });
        return;
      }
    }

    // 3. State selection
    if (selectedState && selectedState !== 'ALL') {
      const sCoords = stateMap[selectedState.toLowerCase().trim()];
      if (sCoords) {
        mapRef.current.flyTo(sCoords, 8, { duration: 1.2 });
      }
    }
  }, [selectedDistrict, selectedState, selectedHabitationId, selectedSiteId, selectedRiverId, habitations, relocationSites, riverStations]);



  // Render all GIS layers directly tied to layerVisibility
  useEffect(() => {
    const group = layersGroupRef.current;
    if (!group) return;
    group.clearLayers();

    // 1. Hazard Polygons (Landslide & Flood)
    if (hazardLayers.length > 0) {
      hazardLayers.forEach((hz) => {
        const typeLower = hz.type.toLowerCase();
        if (typeLower === 'landslide' && !layerVisibility['landslide']) return;
        if (typeLower === 'flood' && !layerVisibility['flood']) return;
        if (!hz.geometry) return;

        const colorMap: Record<string, string> = {
          landslide: '#dc2626',
          flood: '#0284c7',
          glof: '#8b5cf6',
          earthquake: '#ea580c',
        };
        const color = colorMap[typeLower] || '#ea580c';

        try {
          const geoJsonLayer = L.geoJSON(hz.geometry, {
            style: {
              color,
              weight: 2,
              opacity: 0.85,
              fillColor: color,
              fillOpacity: 0.28,
            },
          });
          geoJsonLayer.bindTooltip(`<b>${hz.name.toUpperCase()}</b><br>${hz.description || ''}`, {
            sticky: true,
            className: 'retro-leaflet-tooltip',
          });
          geoJsonLayer.on('click', () => selectHazard(hz.id));
          group.addLayer(geoJsonLayer);
        } catch {
          // ignore
        }
      });
    }

    // 2. IMD Rainfall Radar & Precipitation Rings
    if (layerVisibility['rainfall']) {
      const rainfallZones = [
        { name: 'Chamoli Cloudburst & Heavy Rain Zone', lat: 30.55, lng: 79.56, mm: 180, radius: 18000, color: '#f97316' },
        { name: 'Wayanad Torrential Downpour Grid', lat: 11.68, lng: 76.13, mm: 245, radius: 22000, color: '#ef4444' },
        { name: 'East Khasi Hills Extreme Precipitation', lat: 25.28, lng: 91.72, mm: 310, radius: 25000, color: '#b91c1c' },
        { name: 'Kullu Pandoh Basin Rain Alert', lat: 31.85, lng: 77.05, mm: 140, radius: 16000, color: '#f59e0b' },
        { name: 'Konaseema Godavari Delta Deluge', lat: 16.48, lng: 81.88, mm: 165, radius: 20000, color: '#f97316' },
      ];

      rainfallZones.forEach((rz) => {
        try {
          const rainCircle = L.circle([rz.lat, rz.lng], {
            radius: rz.radius,
            color: rz.color,
            weight: 1.5,
            dashArray: '4, 6',
            fillColor: rz.color,
            fillOpacity: 0.18,
          });
          rainCircle.bindTooltip(
            `<b>🌧️ IMD RADAR: ${rz.name}</b><br>Precipitation: <b>${rz.mm} mm / 24h</b> (Heavy Rainfall Status Active)`,
            { sticky: true, className: 'retro-leaflet-tooltip' }
          );
          group.addLayer(rainCircle);
        } catch {
          // ignore
        }
      });
    }

    // 3. OSM Road Network & Evacuation Corridors
    if (layerVisibility['roads']) {
      roads.forEach((road) => {
        if (!road.geometry) return;
        try {
          const roadLayer = L.geoJSON(road.geometry, {
            style: {
              color: road.isEvacuationRoute ? '#06b6d4' : '#f59e0b',
              weight: 3.5,
              opacity: 0.85,
              dashArray: road.isEvacuationRoute ? '6, 6' : undefined,
            },
          });
          roadLayer.bindTooltip(`<b>EVAC ROUTE: ${road.name}</b><br>Type: ${road.highwayType} | Status: ${road.passabilityStatus}`, {
            sticky: true,
            className: 'retro-leaflet-tooltip',
          });
          group.addLayer(roadLayer);
        } catch {
          // ignore
        }
      });
    }

    // 4. CWC River Monitoring Stations
    if (layerVisibility['rivers']) {
      riverStations.forEach((river) => {
        const isSelected = selectedRiverId === river.id;
        const statusColor =
          river.status === 'danger' ? '#ff2a85' : river.status === 'warning' ? '#fb923c' : '#38bdf8';
        const circleSize = isSelected ? 26 : 20;

        const icon = L.divIcon({
          className: 'retro-marker-station',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 140px; pointer-events: auto; user-select: none;">
              <div style="
                width: ${circleSize}px;
                height: ${circleSize}px;
                background: ${statusColor};
                border: 2px solid #000000;
                box-shadow: ${isSelected ? '0 0 0 2px #fde047, 3px 3px 0px #000000' : '2px 2px 0px #000000'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000000;
                font-size: ${isSelected ? '11px' : '9px'};
                font-weight: 900;
                cursor: pointer;
              ">
                💧
              </div>
              ${
                showLabels
                  ? `<div style="
                      margin-top: 2px;
                      background: #ffffff;
                      color: #000000;
                      font-size: 10px;
                      font-weight: 800;
                      font-family: var(--font-sans);
                      padding: 1px 7px;
                      border-radius: 6px;
                      border: 1.5px solid #000000;
                      box-shadow: 2px 2px 0px #000000;
                      white-space: nowrap;
                      letter-spacing: -0.01em;
                      line-height: 1.35;
                      pointer-events: none;
                    ">
                      ${river.name}
                    </div>`
                  : ''
              }
            </div>
          `,
          iconSize: [140, showLabels ? 42 : circleSize],
          iconAnchor: [70, circleSize / 2],
        });

        const marker = L.marker([river.location.lat, river.location.lng], { icon });
        marker.bindTooltip(`<b>${river.name}</b><br>Stage: ${river.waterLevel ?? '—'}m (Warn: ${river.warningLevel}m)`, {
          className: 'retro-leaflet-tooltip',
        });
        marker.on('click', () => selectRiver(river.id));
        group.addLayer(marker);
      });
    }

    // 5. Safe Haven Relocation Sites
    if (layerVisibility['relocation_sites']) {
      relocationSites.forEach((site) => {
        const isSelected = selectedSiteId === site.id;
        const boxSize = isSelected ? 30 : 24;
        const icon = L.divIcon({
          className: 'retro-marker-site',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 140px; pointer-events: auto; user-select: none;">
              <div style="
                width: ${boxSize}px;
                height: ${boxSize}px;
                background: #6ee7b7;
                border: 2px solid #000000;
                box-shadow: ${isSelected ? '0 0 0 2px #fde047, 3px 3px 0px #000000' : '2px 2px 0px #000000'};
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000000;
                font-size: ${isSelected ? '13px' : '11px'};
                cursor: pointer;
                transition: transform 0.1s ease;
              ">
                🏰
              </div>
              ${
                showLabels
                  ? `<div style="
                      margin-top: 3px;
                      background: #6ee7b7;
                      color: #000000;
                      font-size: 10px;
                      font-weight: 800;
                      font-family: var(--font-sans);
                      padding: 1px 7px;
                      border-radius: 6px;
                      border: 1.5px solid #000000;
                      box-shadow: 2px 2px 0px #000000;
                      white-space: nowrap;
                      letter-spacing: -0.01em;
                      line-height: 1.35;
                      pointer-events: none;
                    ">
                      ${site.name}
                    </div>`
                  : ''
              }
            </div>
          `,
          iconSize: [140, showLabels ? 48 : boxSize],
          iconAnchor: [70, boxSize / 2],
        });

        const marker = L.marker([site.location.lat, site.location.lng], { icon, zIndexOffset: 200 });
        marker.bindTooltip(
          `<b>SAFE HAVEN: ${site.name.toUpperCase()}</b><br>Capacity: ${site.capacity.toLocaleString()} | Suitability: ${site.suitabilityScore.toFixed(2)}`,
          { className: 'retro-leaflet-tooltip' }
        );
        marker.on('click', () => selectSite(site.id));
        group.addLayer(marker);
      });
    }

    // 6. At-Risk Habitations
    if (layerVisibility['habitations']) {
      habitations.forEach((h) => {
        const isSelected = selectedHabitationId === h.id;
        const color = h.riskScore >= 0.7 ? '#ef4444' : h.riskScore >= 0.5 ? '#fde047' : '#86efac';
        const circleSize = isSelected ? 28 : 22;

        const icon = L.divIcon({
          className: 'retro-marker-habitation',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 140px; pointer-events: auto; user-select: none;">
              <div style="
                width: ${circleSize}px;
                height: ${circleSize}px;
                background: ${color};
                border: 2px solid #000000;
                box-shadow: ${isSelected ? '0 0 0 2px #ffffff, 3px 3px 0px #000000' : '2px 2px 0px #000000'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000000;
                font-size: ${isSelected ? '12px' : '10px'};
                cursor: pointer;
                transition: transform 0.1s ease;
              ">
                🏠
              </div>
              ${
                showLabels
                  ? `<div style="
                      margin-top: 2px;
                      background: #ffffff;
                      color: #000000;
                      font-size: 10px;
                      font-weight: 800;
                      font-family: var(--font-sans);
                      padding: 1px 7px;
                      border-radius: 6px;
                      border: 1.5px solid #000000;
                      box-shadow: 2px 2px 0px #000000;
                      white-space: nowrap;
                      letter-spacing: -0.01em;
                      line-height: 1.35;
                      pointer-events: none;
                    ">
                      ${h.name}
                    </div>`
                  : ''
              }
            </div>
          `,
          iconSize: [140, showLabels ? 42 : circleSize],
          iconAnchor: [70, circleSize / 2],
        });

        const marker = L.marker([h.location.lat, h.location.lng], { icon, zIndexOffset: 100 });
        marker.bindTooltip(
          `<b>${h.name.toUpperCase()}</b><br>Risk: ${(h.riskScore * 100).toFixed(0)}% (${h.riskLevel})<br>Pop: ${h.population.toLocaleString()}`,
          { className: 'retro-leaflet-tooltip' }
        );
        marker.on('click', () => selectHabitation(h.id));
        group.addLayer(marker);
      });
    }

    // 7. District Boundaries
    if (layerVisibility['district_boundaries']) {
      const districtOutlines = [
        // Chamoli
        [[30.85, 79.25], [30.82, 80.05], [30.30, 80.02], [30.25, 79.40], [30.45, 79.20]],
        // Rudraprayag
        [[30.75, 78.85], [30.70, 79.25], [30.25, 79.20], [30.30, 78.90]],
        // Pithoragarh
        [[30.40, 79.95], [30.50, 80.65], [29.40, 80.55], [29.50, 79.90]],
        // Wayanad
        [[11.95, 75.95], [11.90, 76.40], [11.45, 76.35], [11.50, 75.90]],
      ];

      districtOutlines.forEach((coords) => {
        try {
          const poly = L.polygon(coords as [number, number][], {
            color: '#000000',
            weight: 2,
            dashArray: '8, 8',
            fillColor: '#38bdf8',
            fillOpacity: 0.08,
          });
          poly.bindTooltip('<b>District Administrative Boundary</b>', { sticky: true });
          group.addLayer(poly);
        } catch {
          // ignore
        }
      });
    }

    // 8. Block Boundaries
    if (layerVisibility['block_boundaries']) {
      const blockOutlines = [
        [[30.65, 79.45], [30.60, 79.80], [30.40, 79.75], [30.45, 79.40]],
        [[30.45, 79.40], [30.40, 79.75], [30.25, 79.60], [30.30, 79.30]],
      ];

      blockOutlines.forEach((coords) => {
        try {
          const poly = L.polygon(coords as [number, number][], {
            color: '#475569',
            weight: 1.5,
            dashArray: '5, 5',
            fillColor: '#94a3b8',
            fillOpacity: 0.05,
          });
          poly.bindTooltip('<b>Block Sub-District Boundary</b>', { sticky: true });
          group.addLayer(poly);
        } catch {
          // ignore
        }
      });
    }
  }, [
    habitations,
    relocationSites,
    riverStations,
    hazardLayers,
    alerts,
    roads,
    emergencyResources,
    selectedHabitationId,
    selectedSiteId,
    selectedRiverId,
    layers,
    layerVisibility,
    showLabels,
    getLayerVisibilityMap,
    selectHabitation,
    selectSite,
    selectRiver,
    selectHazard,
  ]);

  // Render relocation pathway corridor when a habitation is selected
  useEffect(() => {
    const pGroup = pathwayGroupRef.current;
    if (!pGroup) return;
    pGroup.clearLayers();

    if (!selectedHabitationId) return;
    const hab = getSelectedHabitation();
    if (!hab || !hab.nearestRelocationSite) return;

    const site = relocationSites.find((s) => s.id === hab.nearestRelocationSite);
    if (!site || !hab.location || !site.location) return;

    const start: [number, number] = [hab.location.lat, hab.location.lng];
    const end: [number, number] = [site.location.lat, site.location.lng];

    // Background glow line
    const glowLine = L.polyline([start, end], {
      color: '#f59e0b',
      weight: 6,
      opacity: 0.45,
    });
    // Dashed primary corridor line
    const mainLine = L.polyline([start, end], {
      color: '#06b6d4',
      weight: 3.5,
      dashArray: '8, 8',
      opacity: 0.95,
    });

    mainLine.bindTooltip(
      `<b>RELOCATION CORRIDOR</b><br>From: ${hab.name}<br>To Safe Haven: ${site.name}`,
      { sticky: true, className: 'retro-leaflet-tooltip' }
    );

    pGroup.addLayer(glowLine);
    pGroup.addLayer(mainLine);
  }, [selectedHabitationId, habitations, relocationSites, getSelectedHabitation]);

  const recenterMap = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
    }
  };
  const toolBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    background: '#ffffff',
    border: '2px solid #000000',
    borderRadius: 8,
    boxShadow: '2px 2px 0px #000000',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 900,
    color: '#000000',
    transition: 'all 0.1s ease',
  };

  const layerRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 700,
    color: '#000000',
    userSelect: 'none',
  };

  const checkboxStyle: React.CSSProperties = {
    accentColor: '#0284c7',
    cursor: 'pointer',
    width: 13,
    height: 13,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#0f172a',
        overflow: 'hidden',
      }}
    >
      {/* 1. Underlying Leaflet Map Canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />

      {/* 2. Top-Left Floating Badge: GIS MAP VIEW + 2D/3D Mode Switcher */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: '#38bdf8',
            border: '2.5px solid #000000',
            boxShadow: '2.5px 2.5px 0px #000000',
            borderRadius: 8,
            padding: '5px 10px',
            color: '#000000',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.2px',
            }}
          >
            GIS MAP VIEW
          </span>
          <button
            onClick={() => {
              if (containerRef.current) {
                if (!document.fullscreenElement) {
                  containerRef.current.parentElement?.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              width: 20,
              height: 20,
              cursor: 'pointer',
            }}
            title="Toggle Fullscreen"
          >
            <Maximize2 size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2D / 3D Switcher Pill */}
        <div
          style={{
            display: 'flex',
            background: '#ffffff',
            border: '2px solid #000000',
            boxShadow: '2px 2px 0px #000000',
            borderRadius: 8,
            padding: 2,
          }}
        >
          <button
            onClick={() => setMapMode('2d')}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 900,
              background: mapMode === '2d' ? '#2dd4bf' : 'transparent',
              border: mapMode === '2d' ? '1.5px solid #000000' : '1.5px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            2D
          </button>
          <button
            onClick={() => setMapMode('3d')}
            style={{
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 900,
              background: mapMode === '3d' ? '#2dd4bf' : 'transparent',
              border: mapMode === '3d' ? '1.5px solid #000000' : '1.5px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            3D
          </button>
        </div>
      </div>

      {/* 3. Top-Center Floating Search Bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 500,
          width: 360,
          maxWidth: '85%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: '2.5px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            borderRadius: 8,
            padding: '5px 12px',
          }}
        >
          <Search size={15} strokeWidth={2.5} color="#000000" />
          <input
            type="text"
            placeholder="Search village, location, or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              color: '#000000',
              background: 'transparent',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchFocused(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
            >
              <X size={13} strokeWidth={3} color="#000000" />
            </button>
          )}
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {searchFocused && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000',
              borderRadius: 8,
              maxHeight: 220,
              overflowY: 'auto',
              zIndex: 600,
            }}
          >
            {searchResults.map((h) => (
              <div
                key={h.id}
                onClick={() => handleSelectHabitation(h)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fef08a')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 11, color: '#000000' }}>{h.name}</div>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>
                    {h.block || 'Chamoli'} • Pop: {h.population.toLocaleString()}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: 4,
                    border: '1px solid #000000',
                    background: h.riskScore >= 0.7 ? '#ef4444' : h.riskScore >= 0.5 ? '#fde047' : '#86efac',
                    color: h.riskScore >= 0.7 ? '#ffffff' : '#000000',
                  }}
                >
                  {h.riskLevel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Left Vertical Tool Stack */}
      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 10,
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        {/* Zoom In */}
        <button
          onClick={() => mapRef.current?.zoomIn()}
          style={toolBtnStyle}
          title="Zoom In (+)"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fde047')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <Plus size={16} strokeWidth={3} />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapRef.current?.zoomOut()}
          style={toolBtnStyle}
          title="Zoom Out (−)"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fde047')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <Minus size={16} strokeWidth={3} />
        </button>

        {/* Recenter */}
        <button
          onClick={recenterMap}
          style={toolBtnStyle}
          title="Recenter to Chamoli"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fde047')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <Crosshair size={16} strokeWidth={2.5} />
        </button>

        {/* Basemap Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setBasemapMenuOpen((prev) => !prev)}
            style={{
              ...toolBtnStyle,
              background: basemapMenuOpen ? '#fde047' : '#ffffff',
            }}
            title="Switch Basemap (Satellite / OSM / Topo / Dark)"
          >
            <Layers size={16} strokeWidth={2.5} />
          </button>

          {/* Basemap Flyout */}
          {basemapMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 'calc(100% + 6px)',
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
                border: '2px solid #000000',
                boxShadow: '3px 3px 0px #000000',
                borderRadius: 8,
                padding: 4,
                gap: 4,
                zIndex: 700,
                width: 100,
              }}
            >
              {(['satellite', 'osm', 'topo', 'dark'] as BasemapType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    switchBasemap(t);
                    setBasemapMenuOpen(false);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: 800,
                    textAlign: 'left',
                    background: activeBasemap === t ? '#38bdf8' : 'transparent',
                    border: activeBasemap === t ? '1.5px solid #000000' : '1.5px solid transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {t === 'satellite' ? 'Satellite' : t === 'osm' ? 'Vector OSM' : t === 'topo' ? 'Topo' : 'Dark'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Top-Right Floating LAYERS Card */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 500,
          width: isLayersMinimized ? 'auto' : 205,
          background: '#ffffff',
          border: '2.5px solid #000000',
          boxShadow: '3px 3px 0px #000000',
          borderRadius: 10,
          overflow: 'hidden',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Header with Minimize Toggle */}
        <div
          onClick={() => setIsLayersMinimized((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#7dd3fc',
            padding: '5px 8px',
            borderBottom: isLayersMinimized ? 'none' : '2px solid #000000',
            cursor: 'pointer',
            userSelect: 'none',
            gap: 6,
          }}
          title={isLayersMinimized ? 'Click to expand GIS layers' : 'Click to minimize GIS layers'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 900,
                color: '#000000',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              LAYERS
            </span>
            <span
              style={{
                fontSize: 8,
                fontWeight: 800,
                background: '#000000',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: 3,
              }}
            >
              GIS
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLayersMinimized((prev) => !prev);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: 3,
              width: 18,
              height: 18,
              cursor: 'pointer',
              padding: 0,
            }}
            title={isLayersMinimized ? 'Expand' : 'Minimize'}
          >
            {isLayersMinimized ? <ChevronDown size={13} strokeWidth={3} /> : <ChevronUp size={13} strokeWidth={3} />}
          </button>
        </div>

        {/* Checkbox Rows */}
        {!isLayersMinimized && (
          <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 8px', gap: 4 }}>
            {/* 1. Landslide Susceptibility */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['landslide'])}
                onChange={() => toggleLocalLayer('landslide')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, background: '#ef4444', border: '1px solid #000000', borderRadius: 2 }} />
              <span>Landslide Susceptibility</span>
            </label>

            {/* 2. Flood Inundation */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['flood'])}
                onChange={() => toggleLocalLayer('flood')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, background: '#3b82f6', border: '1px solid #000000', borderRadius: 2 }} />
              <span>Flood Inundation (Forecast)</span>
            </label>

            {/* 3. Rainfall (IMD) */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['rainfall'])}
                onChange={() => toggleLocalLayer('rainfall')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, background: '#f97316', border: '1px solid #000000', borderRadius: 2 }} />
              <span>Rainfall (IMD)</span>
            </label>

            {/* 4. River Gauge (CWC) */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['rivers'])}
                onChange={() => toggleLocalLayer('rivers')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#0284c7', border: '1px solid #000000' }} />
              <span>River Gauge (CWC)</span>
            </label>

            {/* 5. Habitations */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['habitations'])}
                onChange={() => toggleLocalLayer('habitations')}
                style={checkboxStyle}
              />
              <span style={{ fontSize: 10 }}>🏠</span>
              <span>Habitations</span>
            </label>

            {/* 6. Relocation Sites */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['relocation_sites'])}
                onChange={() => toggleLocalLayer('relocation_sites')}
                style={checkboxStyle}
              />
              <span style={{ fontSize: 10 }}>🛖</span>
              <span>Relocation Sites</span>
            </label>

            {/* 7. Road Network (OSM) */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['roads'])}
                onChange={() => toggleLocalLayer('roads')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 11, height: 3, background: '#0ea5e9', border: '1px solid #000000' }} />
              <span>Road Network (OSM)</span>
            </label>

            {/* 8. District Boundary */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['district_boundaries'])}
                onChange={() => toggleLocalLayer('district_boundaries')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, border: '1px dashed #000000', borderRadius: 2 }} />
              <span>District Boundary</span>
            </label>

            {/* 9. Block Boundary */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['block_boundaries'])}
                onChange={() => toggleLocalLayer('block_boundaries')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, border: '1px dashed #6b7280', borderRadius: 2 }} />
              <span>Block Boundary</span>
            </label>

            {/* 10. India Focus Mask */}
            <label style={layerRowStyle}>
              <input
                type="checkbox"
                checked={Boolean(layerVisibility['india_focus'])}
                onChange={() => toggleLocalLayer('india_focus')}
                style={checkboxStyle}
              />
              <span style={{ display: 'inline-block', width: 9, height: 9, background: '#0284c7', border: '1px solid #38bdf8', borderRadius: 2 }} />
              <span>India Focus (Dim Foreign Land)</span>
            </label>
          </div>
        )}
      </div>

      {/* 6. Bottom-Left Scale Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(0, 0, 0, 0.78)',
          border: '1.5px solid #000000',
          borderRadius: 4,
          padding: '3px 8px',
          color: '#ffffff',
          fontSize: 9,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: 120 }}>
          <span>0</span>
          <span>5</span>
          <span>10</span>
          <span>20 km</span>
        </div>
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 4,
            border: '1px solid #ffffff',
            marginTop: 2,
          }}
        >
          <div style={{ flex: 1, background: '#ffffff' }} />
          <div style={{ flex: 1, background: '#000000' }} />
          <div style={{ flex: 1, background: '#ffffff' }} />
          <div style={{ flex: 1, background: '#000000' }} />
        </div>
      </div>

      {/* Bottom-Right Inset Mini-Map Removed as per user request */}
    </div>
  );
}
