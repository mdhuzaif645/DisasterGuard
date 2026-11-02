/**
 * DisasterGuard Interactive Disaster Map
 * Full Leaflet & OpenStreetMap implementation with multi-layer controls,
 * custom severity markers, and an accessible list-based alternative view.
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Alert, Shelter, DisasterReport } from '../types';
import { formatDistance, calculateHaversineDistance } from '../utils/geo';
import {
  Layers,
  MapPin,
  ShieldAlert,
  Home,
  AlertTriangle,
  List,
  Map as MapIcon,
  Search,
  Filter,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

interface DisasterMapProps {
  alerts: Alert[];
  shelters: Shelter[];
  reports: DisasterReport[];
  userLat?: number;
  userLng?: number;
  onSelectAlert?: (alert: Alert) => void;
  onSelectShelter?: (shelter: Shelter) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  alerts,
  shelters,
  reports,
  userLat = 12.9716,
  userLng = 77.5946,
  onSelectAlert,
  onSelectShelter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    alerts: true,
    shelters: true,
    reports: true,
    userLocation: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<{ type: 'alert' | 'shelter' | 'report'; item: any } | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (activeTab !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Base Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Layer Groups
      layersRef.current = {
        alerts: L.layerGroup().addTo(map),
        shelters: L.layerGroup().addTo(map),
        reports: L.layerGroup().addTo(map),
        userLocation: L.layerGroup().addTo(map),
      };

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if container tears down
    };
  }, [activeTab]);

  // Update Layers & Markers whenever data or layer toggles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || activeTab !== 'map') return;

    const { alerts: alertGroup, shelters: shelterGroup, reports: reportGroup, userLocation: userGroup } =
      layersRef.current;

    // Clear previous markers
    alertGroup?.clearLayers();
    shelterGroup?.clearLayers();
    reportGroup?.clearLayers();
    userGroup?.clearLayers();

    // 1. User Location Pin
    if (layerVisibility.userLocation && userGroup) {
      const userMarker = L.circleMarker([userLat, userLng], {
        radius: 9,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      });
      userMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; color: #1e293b;">
          <strong>Your Current Location</strong><br/>
          Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)}
        </div>
      `);
      userGroup.addLayer(userMarker);
    }

    // 2. Official Alerts (Circles + Center Marker)
    if (layerVisibility.alerts && alertGroup) {
      alerts.forEach((alert) => {
        if (selectedCategory !== 'all' && alert.category !== selectedCategory) return;
        if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return;

        const color =
          alert.severity === 'critical'
            ? '#ef4444'
            : alert.severity === 'high'
            ? '#f97316'
            : alert.severity === 'moderate'
            ? '#eab308'
            : '#3b82f6';

        // Affected Area Circle
        const alertArea = L.circle([alert.centerLat, alert.centerLng], {
          radius: (alert.radiusKm || 20) * 1000,
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
        });

        // Center Marker
        const alertMarker = L.circleMarker([alert.centerLat, alert.centerLng], {
          radius: 12,
          fillColor: color,
          color: '#ffffff',
          weight: 3,
          fillOpacity: 0.9,
        });

        alertMarker.on('click', () => {
          setActiveItem({ type: 'alert', item: alert });
          if (onSelectAlert) onSelectAlert(alert);
        });

        alertArea.addTo(alertGroup);
        alertMarker.addTo(alertGroup);
      });
    }

    // 3. Shelters
    if (layerVisibility.shelters && shelterGroup) {
      shelters.forEach((shelter) => {
        const isFull = shelter.operatingStatus === 'full';
        const color = isFull ? '#64748b' : '#10b981';

        const shelterMarker = L.circleMarker([shelter.lat, shelter.lng], {
          radius: 11,
          fillColor: color,
          color: '#ffffff',
          weight: 3,
          fillOpacity: 0.95,
        });

        shelterMarker.on('click', () => {
          setActiveItem({ type: 'shelter', item: shelter });
          if (onSelectShelter) onSelectShelter(shelter);
        });

        shelterMarker.addTo(shelterGroup);
      });
    }

    // 4. Community Reports
    if (layerVisibility.reports && reportGroup) {
      reports.forEach((rep) => {
        if (rep.status === 'rejected') return;
        const color = rep.status === 'verified' ? '#f59e0b' : '#a855f7';

        const repMarker = L.circleMarker([rep.lat, rep.lng], {
          radius: 8,
          fillColor: color,
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9,
        });

        repMarker.on('click', () => {
          setActiveItem({ type: 'report', item: rep });
        });

        repMarker.addTo(reportGroup);
      });
    }
  }, [alerts, shelters, reports, layerVisibility, selectedCategory, selectedSeverity, activeTab, userLat, userLng]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Map Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-850 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'map'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Interactive Map
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTab === 'list'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              Accessible List View
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              showFilters
                ? 'bg-slate-700 border-rose-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            Layers & Filters
          </button>
        </div>

        {/* Legend Pills */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            Critical Alert
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            High/Moderate Alert
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            Open Shelter
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
            Citizen Hazard
          </span>
        </div>
      </div>

      {/* Expandable Filter / Layer Panel */}
      {showFilters && (
        <div className="p-3 bg-slate-900 border-b border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Toggle Map Layers:</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={layerVisibility.alerts}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, alerts: e.target.checked })}
                  className="rounded text-rose-500"
                />
                Alerts
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={layerVisibility.shelters}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, shelters: e.target.checked })}
                  className="rounded text-emerald-500"
                />
                Shelters
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={layerVisibility.reports}
                  onChange={(e) => setLayerVisibility({ ...layerVisibility, reports: e.target.checked })}
                  className="rounded text-purple-500"
                />
                Reports
              </label>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Filter Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            >
              <option value="all">All Hazards</option>
              <option value="flood">Floods</option>
              <option value="cyclone">Cyclones</option>
              <option value="earthquake">Earthquakes</option>
              <option value="landslide">Landslides</option>
              <option value="severe_storm">Severe Storms</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Filter Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Red)</option>
              <option value="high">High (Orange)</option>
              <option value="moderate">Moderate (Yellow)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium">Search Location / Keyword:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Koramangala, Udupi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded pl-7 pr-2.5 py-1 text-slate-200"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Map or List Container */}
      <div className="relative flex-1 min-h-[460px] w-full">
        {activeTab === 'map' ? (
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] z-0" />
        ) : (
          /* Accessible List-Based Alternative */
          <div className="p-4 h-full overflow-y-auto space-y-4">
            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
              <h3 className="text-sm font-semibold text-rose-400 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Active Disaster Warnings ({alerts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => onSelectAlert && onSelectAlert(alert)}
                    className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-rose-500 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                        {alert.severity} • {alert.category}
                      </span>
                      <span className="text-xs text-slate-400">{alert.affectedArea}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Verified Relief Shelters ({shelters.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shelters.map((shelter) => (
                  <div
                    key={shelter.id}
                    onClick={() => onSelectShelter && onSelectShelter(shelter)}
                    className="p-3 bg-slate-900 rounded-lg border border-slate-800 hover:border-emerald-500 cursor-pointer transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-emerald-400">{shelter.name}</span>
                      <span className="text-xs text-slate-400">
                        {formatDistance(
                          calculateHaversineDistance({ lat: userLat, lng: userLng }, { lat: shelter.lat, lng: shelter.lng })
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{shelter.address}</p>
                    <div className="mt-2 text-xs flex justify-between text-slate-300">
                      <span>Occupancy: {shelter.currentOccupancy} / {shelter.totalCapacity}</span>
                      <span className="text-emerald-400">Status: {shelter.operatingStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Marker Floating Overlay (When Map Active) */}
        {activeTab === 'map' && activeItem && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl z-[1000]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {activeItem.type.toUpperCase()}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {activeItem.type === 'alert' && activeItem.item.title}
                  {activeItem.type === 'shelter' && activeItem.item.name}
                  {activeItem.type === 'report' && activeItem.item.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-2 line-clamp-3">
              {activeItem.type === 'alert' && activeItem.item.description}
              {activeItem.type === 'shelter' && `${activeItem.item.address} • Phone: ${activeItem.item.contactPhone}`}
              {activeItem.type === 'report' && activeItem.item.description}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
              {activeItem.type === 'shelter' && (
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Occupancy: <strong>{activeItem.item.currentOccupancy} / {activeItem.item.totalCapacity}</strong></span>
                </div>
              )}
              {activeItem.type === 'alert' && (
                <button
                  onClick={() => onSelectAlert && onSelectAlert(activeItem.item)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium ml-auto"
                >
                  View Full Advisory & AI Steps
                </button>
              )}
              {activeItem.type === 'shelter' && (
                <button
                  onClick={() => onSelectShelter && onSelectShelter(activeItem.item)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium ml-auto"
                >
                  Shelter Details & Facilities
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
