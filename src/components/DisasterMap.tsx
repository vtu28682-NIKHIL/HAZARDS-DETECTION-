import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Crosshair,
  Search,
  Building2,
  ShieldAlert,
  Flame,
  Waves,
  Sun,
  Activity,
  Wind,
  Maximize2,
  Compass,
  Radar,
  Eye,
  Info,
  RotateCcw
} from 'lucide-react';
import { CriticalFacility, DisasterIncident, PriorityCategory } from '../types/disaster';
import { VERIFIED_FACILITIES } from '../data/mockAndHistoricalData';

interface DisasterMapProps {
  incidents: DisasterIncident[];
  selectedIncident: DisasterIncident | null;
  onSelectIncident: (incident: DisasterIncident) => void;
  facilities?: CriticalFacility[];
}

// Coordinate validation helper
const isValidCoord = (lat: any, lng: any): boolean => {
  const numLat = Number(lat);
  const numLng = Number(lng);
  return (
    typeof numLat === 'number' &&
    typeof numLng === 'number' &&
    isFinite(numLat) &&
    isFinite(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  );
};

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  facilities = VERIFIED_FACILITIES
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const perimetersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);
  const bufferRingsLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // States
  const [activeBasemap, setActiveBasemap] = useState<'dark' | 'osm' | 'satellite' | 'nasa_earth'>('dark');
  const [showPerimeters, setShowPerimeters] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBufferRings, setShowBufferRings] = useState(true);
  const [showRadarScan, setShowRadarScan] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocationLoading, setUserLocationLoading] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  // Robust basemap providers
  const basemapUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    nasa_earth: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'
  };

  const basemapSubdomains = {
    dark: 'abcd',
    osm: 'abc',
    satellite: 'abc',
    nasa_earth: ''
  };

  // Safe Fit Bounds
  const fitAllIncidents = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || incidents.length === 0) return;

    try {
      const validPoints: [number, number][] = incidents
        .filter((i) => isValidCoord(i.coordinates?.[0], i.coordinates?.[1]))
        .map((i) => [Number(i.coordinates[0]), Number(i.coordinates[1])]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    } catch (e) {
      console.warn('fitBounds warning:', e);
    }
  }, [incidents]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [20.5937, 78.9629]; // India / South Asia geographic center
    const initialZoom = 5;

    let map: L.Map;
    try {
      map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      });
    } catch (err) {
      console.error('Failed to instantiate Leaflet map:', err);
      return;
    }

    // Add zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer: CartoDB Dark by default
    const tileLayer = L.tileLayer(basemapUrls[activeBasemap], {
      subdomains: basemapSubdomains[activeBasemap],
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);

    tileLayer.bringToBack();
    tileLayerRef.current = tileLayer;

    // Layer groups
    heatmapLayerRef.current = L.layerGroup().addTo(map);
    perimetersLayerRef.current = L.layerGroup().addTo(map);
    bufferRingsLayerRef.current = L.layerGroup().addTo(map);
    facilitiesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Track mouse coordinates & zoom level for tactical HUD
    map.on('mousemove', (e) => {
      setMouseCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lng: Math.round(e.latlng.lng * 10000) / 10000
      });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    // Invalidate size immediately and after layout settles
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => {
      map.invalidateSize();
      fitAllIncidents();
    }, 350);
    const t3 = setTimeout(() => map.invalidateSize(), 800);

    // Global resize listener
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    // ResizeObserver on map container for responsive layout changes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Basemap Cleanly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const subdomains = basemapSubdomains[activeBasemap];
    const newTileLayer = L.tileLayer(basemapUrls[activeBasemap], {
      subdomains,
      maxZoom: 19,
      minZoom: 2
    });

    newTileLayer.addTo(map);
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
    map.invalidateSize();
  }, [activeBasemap]);

  // 3. Render Markers, Perimeters, Heatmap, and Facilities
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (
      !map ||
      !markersLayerRef.current ||
      !perimetersLayerRef.current ||
      !heatmapLayerRef.current ||
      !bufferRingsLayerRef.current ||
      !facilitiesLayerRef.current
    )
      return;

    markersLayerRef.current.clearLayers();
    perimetersLayerRef.current.clearLayers();
    heatmapLayerRef.current.clearLayers();
    bufferRingsLayerRef.current.clearLayers();
    facilitiesLayerRef.current.clearLayers();

    // A. Render Risk Density Heatmap Layer
    if (showHeatmap) {
      incidents.forEach((inc) => {
        const lat = Number(inc.coordinates?.[0]);
        const lng = Number(inc.coordinates?.[1]);
        if (!isValidCoord(lat, lng)) return;

        const priorityWeight = (Number(inc.priorityScore) || 50) / 100;
        const heatColor =
          inc.priorityCategory === 'Critical'
            ? '#ef4444'
            : inc.priorityCategory === 'High'
            ? '#f59e0b'
            : inc.priorityCategory === 'Moderate'
            ? '#3b82f6'
            : '#64748b';

        const radiusMeters = Math.max(15000, Number(inc.radiusKm || 10) * 1200);

        try {
          const outerCircle = L.circle([lat, lng], {
            radius: radiusMeters * 1.5,
            color: 'transparent',
            fillColor: heatColor,
            fillOpacity: 0.12 * priorityWeight,
            interactive: false
          });
          heatmapLayerRef.current?.addLayer(outerCircle);

          const coreCircle = L.circle([lat, lng], {
            radius: radiusMeters * 0.7,
            color: 'transparent',
            fillColor: heatColor,
            fillOpacity: 0.22 * priorityWeight,
            interactive: false
          });
          heatmapLayerRef.current?.addLayer(coreCircle);
        } catch (e) {
          // ignore circle error
        }
      });
    }

    // B. Render Selected Incident Tactical Distance Buffer Rings
    if (showBufferRings && selectedIncident) {
      const lat = Number(selectedIncident.coordinates?.[0]);
      const lng = Number(selectedIncident.coordinates?.[1]);
      if (isValidCoord(lat, lng)) {
        [5, 15, 30].forEach((km) => {
          try {
            const ring = L.circle([lat, lng], {
              radius: km * 1000,
              color: '#38bdf8',
              weight: 1.2,
              dashArray: '4, 6',
              fillColor: '#38bdf8',
              fillOpacity: 0.02,
              interactive: false
            });
            bufferRingsLayerRef.current?.addLayer(ring);
          } catch (e) {}
        });
      }
    }

    // C. Render Incident Markers & Perimeters
    if (showIncidents) {
      incidents.forEach((inc) => {
        const lat = Number(inc.coordinates?.[0]);
        const lng = Number(inc.coordinates?.[1]);
        if (!isValidCoord(lat, lng)) return;

        const isSelected = selectedIncident?.id === inc.id;

        // Color & Pulse styling
        let colorHex = '#94a3b8';
        let bgHex = '#64748b';
        let pulseHtml = '';

        if (inc.priorityCategory === 'Critical') {
          colorHex = '#f43f5e';
          bgHex = '#e11d48';
          pulseHtml = '<div class="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping pointer-events-none"></div>';
        } else if (inc.priorityCategory === 'High') {
          colorHex = '#f59e0b';
          bgHex = '#d97706';
          pulseHtml = '<div class="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-pulse pointer-events-none"></div>';
        } else if (inc.priorityCategory === 'Moderate') {
          colorHex = '#3b82f6';
          bgHex = '#2563eb';
        }

        // Custom High-Contrast HTML Marker
        const iconHtml = `
          <div class="relative cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
            ${pulseHtml}
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono font-bold shadow-2xl border-2 ${
              isSelected ? 'border-white ring-4 ring-rose-500/50' : 'border-slate-900 ring-2 ring-black/40'
            }" style="background-color: ${bgHex};">
              <span class="text-[11px] tabular-nums tracking-tighter">${inc.priorityScore}</span>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'disaster-map-marker-container',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        // Interactive Popup with Action Buttons
        const popupContent = `
          <div class="p-1 space-y-2 text-slate-100 font-sans min-w-[220px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                ${inc.hazardType} ALERT
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style="background-color: ${bgHex}33; color: ${colorHex};">
                ${inc.priorityScore}/100 · ${inc.priorityCategory}
              </span>
            </div>

            <div>
              <h4 class="font-bold text-xs text-white leading-snug">${inc.title}</h4>
              <p class="text-[11px] text-slate-300 mt-0.5">${inc.locationName}</p>
            </div>

            <div class="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <div>
                <span class="text-slate-400 block">Exposed:</span>
                <span class="font-mono text-white font-semibold">${(inc.estimatedPopulation || 0).toLocaleString()}</span>
              </div>
              <div>
                <span class="text-slate-400 block">Confidence:</span>
                <span class="font-mono text-white font-semibold">${inc.confidenceScore || 85}%</span>
              </div>
            </div>

            <div class="pt-1 flex flex-col gap-1.5">
              <button
                id="btn-inspect-${inc.id}"
                class="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                Inspect Incident Details & Brief
              </button>
              <a
                href="https://earth.google.com/web/@${lat},${lng},3500a,35d,35y,0h,45t,0r"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-1 px-3 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 border border-slate-700"
              >
                🌍 Launch Google Earth 3D
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -10],
          className: 'disaster-custom-popup'
        });

        marker.on('click', () => {
          onSelectIncident(inc);
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-inspect-${inc.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectIncident(inc);
            };
          }
        });

        markersLayerRef.current?.addLayer(marker);

        // Danger Perimeter Circle Overlay
        if (showPerimeters) {
          const radiusM = Math.max(2000, Number(inc.radiusKm || 10) * 1000);
          try {
            const circle = L.circle([lat, lng], {
              radius: radiusM,
              color: colorHex,
              weight: isSelected ? 2.5 : 1.2,
              fillColor: colorHex,
              fillOpacity: isSelected ? 0.25 : 0.09,
              dashArray: inc.verificationStatus === 'forecast_model' ? '6, 6' : undefined
            });

            circle.bindTooltip(`Danger Perimeter: ~${inc.radiusKm || 10} km radius around ${inc.locationName}`, {
              direction: 'center',
              className: 'disaster-leaflet-tooltip'
            });

            perimetersLayerRef.current?.addLayer(circle);
          } catch (e) {}
        }
      });
    }

    // D. Render Critical Facilities
    if (showFacilities) {
      facilities.forEach((fac) => {
        if (!isValidCoord(fac.lat, fac.lng)) return;

        let facColor = '#38bdf8';
        let labelIcon = 'H';
        if (fac.type === 'hospital') {
          facColor = '#06b6d4';
          labelIcon = '✚';
        } else if (fac.type === 'shelter') {
          facColor = '#10b981';
          labelIcon = '⛺';
        } else if (fac.type === 'water_treatment') {
          facColor = '#0ea5e9';
          labelIcon = '💧';
        } else if (fac.type === 'bridge') {
          facColor = '#f97316';
          labelIcon = '🌉';
        }

        const facIcon = L.divIcon({
          html: `
            <div class="w-6 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-[11px] shadow text-white hover:scale-115 transition-transform">
              <span style="color: ${facColor}; font-weight: bold;">${labelIcon}</span>
            </div>
          `,
          className: 'facility-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        try {
          const facMarker = L.marker([fac.lat, fac.lng], { icon: facIcon });
          facMarker.bindPopup(`
            <div class="p-1 space-y-1 text-slate-100 font-sans text-xs">
              <span class="font-bold text-white text-sm block">${fac.name}</span>
              <div class="text-[11px] text-slate-400 capitalize">
                Type: ${fac.type.replace('_', ' ')} · Status: <span class="${fac.status === 'operational' ? 'text-emerald-400' : 'text-amber-400'} font-semibold">${fac.status}</span>
              </div>
              ${fac.capacity ? `<div class="text-[11px] text-slate-300 font-mono">Capacity: ${fac.capacity.toLocaleString()}</div>` : ''}
            </div>
          `, { offset: [0, -6] });

          facilitiesLayerRef.current?.addLayer(facMarker);
        } catch (e) {}
      });
    }
  }, [incidents, selectedIncident, showIncidents, showPerimeters, showHeatmap, showBufferRings, showFacilities]);

  // 4. Smooth Pan to Selected Incident
  useEffect(() => {
    if (!selectedIncident || !mapInstanceRef.current) return;
    const lat = Number(selectedIncident.coordinates?.[0]);
    const lng = Number(selectedIncident.coordinates?.[1]);
    if (!isValidCoord(lat, lng)) return;

    mapInstanceRef.current.flyTo([lat, lng], Math.max(9, mapInstanceRef.current.getZoom()), {
      duration: 1.2
    });
  }, [selectedIncident]);

  // Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.toLowerCase();
    const match = incidents.find(
      (inc) =>
        inc.locationName.toLowerCase().includes(term) ||
        inc.title.toLowerCase().includes(term) ||
        inc.hazardType.toLowerCase().includes(term)
    );

    if (match && mapInstanceRef.current) {
      const lat = Number(match.coordinates?.[0]);
      const lng = Number(match.coordinates?.[1]);
      if (isValidCoord(lat, lng)) {
        onSelectIncident(match);
        mapInstanceRef.current.flyTo([lat, lng], 10);
      }
    }
  };

  // Locate Current User Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setUserLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocationLoading(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 11);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#38bdf8',
            fillColor: '#0284c7',
            fillOpacity: 0.9
          })
            .addTo(mapInstanceRef.current)
            .bindPopup('<b>Your Current Location</b><br/>Checking nearby risks...')
            .openPopup();
        }
      },
      (err) => {
        setUserLocationLoading(false);
        console.warn('Geolocation denied or failed:', err.message);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden select-none">
      {/* Search & Location Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-4rem)] pointer-events-auto">
        <form onSubmit={handleSearch} className="relative flex items-center shadow-lg">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident, city, or hazard..."
            className="w-56 sm:w-72 bg-slate-900/95 backdrop-blur border border-slate-750 text-slate-100 text-xs rounded-lg pl-8 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:border-rose-500 shadow-md"
          />
        </form>

        <button
          onClick={handleLocateMe}
          disabled={userLocationLoading}
          title="Zoom to my location"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900/95 hover:bg-slate-800 border border-slate-750 rounded-lg shadow-md transition-colors"
        >
          <Crosshair className={`w-3.5 h-3.5 text-rose-400 ${userLocationLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Near Me</span>
        </button>

        {/* Quick Basemap Switcher (Dark, Satellite, NASA, Topo) */}
        <div className="flex items-center gap-1 bg-slate-900/95 border border-slate-750 rounded-lg p-1 text-xs shadow-md backdrop-blur">
          <button
            onClick={() => setActiveBasemap('dark')}
            title="CartoDB Dark Basemap"
            className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              activeBasemap === 'dark'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🌙 Dark</span>
          </button>
          <button
            onClick={() => setActiveBasemap('satellite')}
            title="High-Resolution Satellite Imagery"
            className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              activeBasemap === 'satellite'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🛰️ Satellite</span>
          </button>
          <button
            onClick={() => setActiveBasemap('nasa_earth')}
            title="NASA Daily Earth Observation"
            className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              activeBasemap === 'nasa_earth'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🌍 NASA</span>
          </button>
          <button
            onClick={() => setActiveBasemap('osm')}
            title="OpenStreetMap Topographic"
            className={`px-2 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              activeBasemap === 'osm'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🗺️ Topo</span>
          </button>
        </div>

        {/* Quick Regions Selector */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-900/95 border border-slate-750 rounded-lg p-1 text-xs shadow-md backdrop-blur">
          <button
            onClick={() => mapInstanceRef.current?.flyTo([13.0827, 80.2707], 11)}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Chennai
          </button>
          <button
            onClick={() => mapInstanceRef.current?.flyTo([26.32, 91.0], 9)}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Assam
          </button>
          <button
            onClick={() => mapInstanceRef.current?.flyTo([21.1458, 79.0882], 9)}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Vidarbha
          </button>
          <button
            onClick={() => mapInstanceRef.current?.flyTo([30.4, 79.33], 10)}
            className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            Chamoli
          </button>
          <button
            onClick={fitAllIncidents}
            className="px-2 py-1 text-rose-400 hover:text-rose-300 font-semibold rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Fit All</span>
          </button>
        </div>
      </div>

      {/* Layer & Basemap Control Overlay (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Layer Toggles Box */}
        <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-3 text-xs text-slate-300 shadow-2xl space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Map Layers</span>
            </div>
            <button
              onClick={fitAllIncidents}
              title="Reset view to fit all hazards"
              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              Fit
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Active Incidents ({incidents.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={showPerimeters}
              onChange={(e) => setShowPerimeters(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Hazard Perimeters</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Risk Density Heatmap</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500"
            />
            <span>Hospitals & Shelters</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
            <input
              type="checkbox"
              checked={showRadarScan}
              onChange={(e) => setShowRadarScan(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="flex items-center gap-1">
              <Radar className="w-3 h-3 text-emerald-400" />
              <span>Radar Sweep HUD</span>
            </span>
          </label>

          {/* Basemap Selection */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 mr-1">Tile:</span>
            <button
              onClick={() => setActiveBasemap('dark')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeBasemap === 'dark' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setActiveBasemap('osm')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeBasemap === 'osm' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Topo
            </button>
            <button
              onClick={() => setActiveBasemap('satellite')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeBasemap === 'satellite' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveBasemap('nasa_earth')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeBasemap === 'nasa_earth' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              NASA
            </button>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80">
            <a
              href={
                selectedIncident
                  ? `https://earth.google.com/web/@${selectedIncident.coordinates[0]},${selectedIncident.coordinates[1]},4000a,35d,35y,0h,45t,0r`
                  : 'https://earth.google.com/web/@20.5937,78.9629,50000a,35d,35y,0h,45t,0r'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1 font-semibold py-1 px-2 rounded bg-slate-800/80 hover:bg-slate-750 transition-colors"
            >
              <span>🌍 Open in Google Earth 3D</span>
            </a>
          </div>
        </div>
      </div>

      {/* Priority Legend & Tactical HUD (Bottom Right) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Tactical Coordinates HUD */}
        <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-400 shadow-xl pointer-events-auto flex items-center gap-2">
          <Compass className="w-3 h-3 text-rose-400" />
          <span>
            {mouseCoords ? `${mouseCoords.lat.toFixed(4)}°N, ${mouseCoords.lng.toFixed(4)}°E` : 'Hover map for coords'}
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Zoom: {currentZoom}</span>
        </div>

        {/* Priority Rating Scale */}
        <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-3 text-xs text-slate-300 shadow-2xl space-y-1.5 pointer-events-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Priority Rating (0-100)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
            <span className="font-mono tabular-nums text-slate-200">80–100</span>
            <span className="text-rose-400 font-semibold">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="font-mono tabular-nums text-slate-200">60–79</span>
            <span className="text-amber-400 font-semibold">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
            <span className="font-mono tabular-nums text-slate-200">35–59</span>
            <span className="text-blue-400 font-semibold">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
            <span className="font-mono tabular-nums text-slate-200">0–34</span>
            <span className="text-slate-400 font-semibold">Monitoring</span>
          </div>
        </div>
      </div>

      {/* Radar Scan Animation Overlay (Optional High-Tech Effect) */}
      {showRadarScan && (
        <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full border border-emerald-500/20 relative animate-radar-sweep">
            <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent rounded-tl-full" />
          </div>
        </div>
      )}

      {/* The Leaflet Canvas Container: Absolute Inset-0 guarantees 100% fill of parent */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: '500px'
        }}
      />
    </div>
  );
};
