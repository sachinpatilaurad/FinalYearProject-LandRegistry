import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom marker icon for land boundary points
const boundaryIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzM5OGVmNCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Search component for location
const LocationSearch = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Using Nominatim API for geocoding (free alternative to Google)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        onLocationSelect({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name,
        });
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for location (e.g., City, State, Country)"
        className="flex-1 form-input"
        disabled={isSearching}
      />
      <button
        type="submit"
        disabled={isSearching || !searchQuery.trim()}
        className="btn-primary px-4"
      >
        {isSearching ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Searching...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </>
        )}
      </button>
    </form>
  );
};

// Map click handler component
const MapClickHandler = ({ onMapClick, boundaryPoints }) => {
  useMapEvents({
    click: (e) => {
      if (boundaryPoints.length < 4) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Reverse geocoding function
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data.address) {
      return {
        area:
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.hamlet ||
          "",
        city:
          data.address.city || data.address.town || data.address.village || "",
        district: data.address.county || data.address.state_district || "",
        state: data.address.state || "",
        country: data.address.country || "",
        postcode: data.address.postcode || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Calculate area of polygon using Shoelace formula (approximate)
const calculateArea = (points) => {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].lat * points[j].lng;
    area -= points[j].lat * points[i].lng;
  }

  area = Math.abs(area) / 2;

  // Convert to approximate square meters (very rough approximation)
  // 1 degree ≈ 111,320 meters at equator
  const areaInSqMeters = area * 111320 * 111320;

  // Convert to square yards (1 square meter = 1.196 square yards)
  const areaInSqYards = Math.round(areaInSqMeters * 1.196);

  return areaInSqYards;
};

const LandSelectionMap = ({ onLocationDataChange }) => {
  const [mapView, setMapView] = useState("topographic"); // Default to topographic for better village visibility
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default to India
  const [zoom, setZoom] = useState(5);
  const [boundaryPoints, setBoundaryPoints] = useState([]);
  const [isCalculatingArea, setIsCalculatingArea] = useState(false);

  // Update parent component when boundary points change
  useEffect(() => {
    const updateLocationData = async () => {
      if (boundaryPoints.length === 4) {
        setIsCalculatingArea(true);

        // Calculate center of the selected area
        const centerLat =
          boundaryPoints.reduce((sum, point) => sum + point.lat, 0) / 4;
        const centerLng =
          boundaryPoints.reduce((sum, point) => sum + point.lng, 0) / 4;

        // Get location details from reverse geocoding
        const locationData = await reverseGeocode(centerLat, centerLng);

        // Calculate approximate area
        const areaInSqYards = calculateArea(boundaryPoints);

        // Update parent component with location data
        if (onLocationDataChange && locationData) {
          onLocationDataChange({
            area: locationData.area,
            city: locationData.city,
            district: locationData.district,
            state: locationData.state,
            areaSqYd: areaInSqYards,
            coordinates: boundaryPoints,
            centerCoordinates: { lat: centerLat, lng: centerLng },
          });
        }

        setIsCalculatingArea(false);
      }
    };

    updateLocationData();
  }, [boundaryPoints, onLocationDataChange]);

  const handleLocationSelect = useCallback((location) => {
    setCenter([location.lat, location.lng]);
    setZoom(15);
  }, []);

  const handleMapClick = useCallback(
    (latlng) => {
      if (boundaryPoints.length < 4) {
        setBoundaryPoints((prev) => [...prev, latlng]);
      }
    },
    [boundaryPoints.length]
  );

  const clearBoundaryPoints = () => {
    setBoundaryPoints([]);
    if (onLocationDataChange) {
      onLocationDataChange(null);
    }
  };

  const undoLastPoint = () => {
    setBoundaryPoints((prev) => prev.slice(0, -1));
  };

  // Function to get tile layer configuration based on selected view
  const getTileLayerConfig = () => {
    switch (mapView) {
      case "topographic":
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        };
      case "terrain":
        return {
          url: "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
      case "administrative":
        return {
          url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
        };
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        };
      case "street":
      default:
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <LocationSearch onLocationSelect={handleLocationSelect} />

      {/* Map Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={() => setMapView("topographic")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === "topographic"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            📍 Topographic
          </button>
          <button
            onClick={() => setMapView("street")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === "street"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setMapView("satellite")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === "satellite"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setMapView("terrain")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === "terrain"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            🏔️ Terrain
          </button>
          <button
            onClick={() => setMapView("administrative")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mapView === "administrative"
                ? "bg-primary-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            🏛️ Boundaries
          </button>
        </div>

        <div className="flex space-x-2">
          {boundaryPoints.length > 0 && (
            <button
              onClick={undoLastPoint}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Undo Last Point
            </button>
          )}
          {boundaryPoints.length > 0 && (
            <button
              onClick={clearBoundaryPoints}
              className="btn-secondary px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Map View Description */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <strong>
            {mapView === "topographic" && "📍 Topographic View:"}
            {mapView === "street" && "🗺️ Street View:"}
            {mapView === "satellite" && "🛰️ Satellite View:"}
            {mapView === "terrain" && "🏔️ Terrain View:"}
            {mapView === "administrative" && "🏛️ Administrative Boundaries:"}
          </strong>
          <span className="ml-2">
            {mapView === "topographic" &&
              "Shows elevation contours, village names, and geographical features. Best for rural areas and small villages."}
            {mapView === "street" &&
              "Standard street map with roads, landmarks, and basic place names."}
            {mapView === "satellite" &&
              "High-resolution satellite imagery showing actual ground features."}
            {mapView === "terrain" &&
              "Emphasizes physical features like hills, valleys, and natural boundaries."}
            {mapView === "administrative" &&
              "Highlights administrative boundaries, districts, and populated places with clear labels."}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Land Selection Instructions:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>
                • <strong>Choose the best map view:</strong> Use Topographic or
                Administrative for small villages
              </li>
              <li>• Click on the map to select 4 corner points of your land</li>
              <li>• Points selected: {boundaryPoints.length}/4</li>
              <li>
                • Location details will be filled automatically after selecting
                all 4 points
              </li>
              {isCalculatingArea && (
                <li>• Calculating area and location details...</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
        style={{ height: "500px" }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          key={`${center[0]}-${center[1]}-${zoom}`} // Force re-render when center changes
        >
          {(() => {
            const config = getTileLayerConfig();
            return (
              <TileLayer
                attribution={config.attribution}
                url={config.url}
                key={mapView} // Force re-render when map view changes
              />
            );
          })()}

          <MapClickHandler
            onMapClick={handleMapClick}
            boundaryPoints={boundaryPoints}
          />

          {/* Render boundary points */}
          {boundaryPoints.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lng]}
              icon={boundaryIcon}
            />
          ))}

          {/* Render polygon when we have enough points */}
          {boundaryPoints.length >= 3 && (
            <Polygon
              positions={boundaryPoints.map((point) => [point.lat, point.lng])}
              color="#3b82f6"
              fillColor="#3b82f6"
              fillOpacity={0.2}
              weight={2}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected Points Summary */}
      {boundaryPoints.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Selected Boundary Points:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {boundaryPoints.map((point, index) => (
              <div
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                Point {index + 1}: {point.lat.toFixed(6)},{" "}
                {point.lng.toFixed(6)}
              </div>
            ))}
          </div>
          {boundaryPoints.length === 4 && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              ✓ Land boundary selection complete!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandSelectionMap;
