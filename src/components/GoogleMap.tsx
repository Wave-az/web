import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

export interface PolygonData {
  id: string;
  polygon: google.maps.Polygon;
  name: string;
  type: "polygon" | "rectangle" | "country";
  center?: { lat: number; lng: number };
  coordinates?: Array<{ lat: number; lng: number }>;
}

interface GoogleMapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onPolygonComplete?: (polygonData: PolygonData) => void;
  onPolygonsUpdate?: (polygons: PolygonData[]) => void;
  onPolygonClick?: (polygonData: PolygonData) => void;
  selectedPolygonId?: string | null;
  searchQuery?: string;
  drawingMode?: "polygon" | "rectangle" | null;
  onMapLoaded?: (isLoaded: boolean) => void;
}

export interface GoogleMapComponentRef {
  setDrawingMode: (mode: "polygon" | "rectangle" | null) => void;
  clearPolygons: () => void;
  removePolygon: (id: string) => void;
  getPolygons: () => PolygonData[];
  zoomIn: () => void;
  zoomOut: () => void;
  fitPolygonBounds: (polygonId: string) => void;
  updatePolygonName: (polygonId: string, newName: string) => void;
  createPolygonFromCoordinates: (
    coords: Array<{ lat: number; lng: number }>,
    name?: string
  ) => void;
}

const libraries: ("drawing" | "places" | "geometry")[] = [
  "drawing",
  "places",
  "geometry",
];

export const GoogleMapComponent = forwardRef<
  GoogleMapComponentRef,
  GoogleMapComponentProps
>(
  (
    {
      center = { lat: 39.9261, lng: 47.7469 },
      zoom = 8,
      onPolygonComplete,
      onPolygonsUpdate,
      onPolygonClick,
      selectedPolygonId,
      searchQuery,
      drawingMode,
      onMapLoaded,
    },
    ref
  ) => {
    const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey:
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
      libraries,
    });

    // Notify parent when map is loaded
    useEffect(() => {
      if (onMapLoaded) {
        onMapLoaded(isLoaded);
      }
    }, [isLoaded, onMapLoaded]);

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [initialCenter] = useState<{ lat: number; lng: number }>(center);
    const [polygons, setPolygons] = useState<PolygonData[]>([]);
    const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
      null
    );
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const polygonIdCounter = useRef(0);
    const mapInitializedRef = useRef(false);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      geocoderRef.current = new google.maps.Geocoder();
      mapInitializedRef.current = true;
    }, []);

    const onUnmount = useCallback(() => {
      setMap(null);
    }, []);

    // Calculate center of polygon for lat/lng callback
    const getPolygonCenter = useCallback(
      (
        polygon: google.maps.Polygon
      ): { lat: number; lng: number } | undefined => {
        const paths = polygon.getPath();
        if (!paths) return undefined;

        let latSum = 0;
        let lngSum = 0;
        let count = 0;

        paths.forEach((latLng) => {
          latSum += latLng.lat();
          lngSum += latLng.lng();
          count++;
        });

        if (count === 0) return undefined;
        return { lat: latSum / count, lng: lngSum / count };
      },
      []
    );

    // Get all coordinates from a polygon
    const getPolygonCoordinates = useCallback(
      (polygon: google.maps.Polygon): Array<{ lat: number; lng: number }> => {
        const paths = polygon.getPath();
        if (!paths) return [];

        const coords: Array<{ lat: number; lng: number }> = [];
        paths.forEach((latLng) => {
          coords.push({ lat: latLng.lat(), lng: latLng.lng() });
        });
        return coords;
      },
      []
    );

    // Update polygon styles based on selection
    useEffect(() => {
      polygons.forEach((polyData) => {
        if (polyData.id === selectedPolygonId) {
          polyData.polygon.setOptions({
            strokeColor: "#0000FF",
            strokeWeight: 3,
            fillColor: "#0000FF",
            fillOpacity: 0.4,
          });
        } else {
          polyData.polygon.setOptions({
            strokeColor: "#FF0000",
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
          });
        }
      });
    }, [selectedPolygonId, polygons]);

    // Handle polygon complete from drawing manager
    const onDrawingComplete = useCallback(
      (
        polygon: google.maps.Polygon,
        type: "polygon" | "rectangle" = "polygon",
        name?: string
      ) => {
        const center = getPolygonCenter(polygon);
        const coords = getPolygonCoordinates(polygon);
        const id = `polygon-${++polygonIdCounter.current}`;
        const polygonData: PolygonData = {
          id,
          polygon,
          name:
            name ||
            `${type.charAt(0).toUpperCase() + type.slice(1)} ${
              polygonIdCounter.current
            }`,
          type,
          center,
          coordinates: coords,
        };

        // Make polygon clickable
        polygon.setOptions({ clickable: true });

        // Add click listener
        google.maps.event.addListener(polygon, "click", () => {
          if (onPolygonClick) {
            onPolygonClick(polygonData);
          }
        });

        setPolygons((prev) => {
          // Check if polygon with this ID already exists to prevent duplicates
          if (prev.some((p) => p.id === id)) {
            return prev;
          }
          const updated = [...prev, polygonData];
          if (onPolygonsUpdate) {
            onPolygonsUpdate(updated);
          }
          return updated;
        });

        if (onPolygonComplete) {
          onPolygonComplete(polygonData);
        }
      },
      [
        onPolygonComplete,
        getPolygonCenter,
        getPolygonCoordinates,
        onPolygonsUpdate,
        onPolygonClick,
      ]
    );

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        setDrawingMode: (mode: "polygon" | "rectangle" | null) => {
          if (drawingManagerRef.current) {
            if (mode === "polygon") {
              drawingManagerRef.current.setDrawingMode(
                google.maps.drawing.OverlayType.POLYGON
              );
            } else if (mode === "rectangle") {
              drawingManagerRef.current.setDrawingMode(
                google.maps.drawing.OverlayType.RECTANGLE
              );
            } else {
              drawingManagerRef.current.setDrawingMode(null);
            }
          }
        },
        clearPolygons: () => {
          setPolygons((prev) => {
            prev.forEach((poly) => poly.polygon.setMap(null));
            const empty: PolygonData[] = [];
            if (onPolygonsUpdate) {
              onPolygonsUpdate(empty);
            }
            return empty;
          });
        },
        removePolygon: (id: string) => {
          setPolygons((prev) => {
            const filtered = prev.filter((poly) => {
              if (poly.id === id) {
                poly.polygon.setMap(null);
                return false;
              }
              return true;
            });
            if (onPolygonsUpdate) {
              onPolygonsUpdate(filtered);
            }
            return filtered;
          });
        },
        getPolygons: () => polygons,
        zoomIn: () => {
          if (map) {
            const currentZoom = map.getZoom() || 8;
            map.setZoom(currentZoom + 1);
          }
        },
        zoomOut: () => {
          if (map) {
            const currentZoom = map.getZoom() || 8;
            map.setZoom(currentZoom - 1);
          }
        },
        fitPolygonBounds: (polygonId: string) => {
          if (!map) return;
          const polygonData = polygons.find((p) => p.id === polygonId);
          if (polygonData) {
            const bounds = new google.maps.LatLngBounds();
            const paths = polygonData.polygon.getPath();
            if (paths && paths.getLength() > 0) {
              paths.forEach((latLng) => {
                bounds.extend(latLng);
              });
              // Add padding to ensure polygon is fully visible
              const padding = { top: 50, right: 50, bottom: 50, left: 50 };
              map.fitBounds(bounds, padding);
            }
          }
        },
        createPolygonFromCoordinates: (
          coords: Array<{ lat: number; lng: number }>,
          name?: string
        ) => {
          if (!map || coords.length < 3) return;

          const polygon = new google.maps.Polygon({
            paths: coords.map((c) => ({ lat: c.lat, lng: c.lng })),
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map: map,
            clickable: true,
            editable: true,
          });

          // Use the existing onDrawingComplete callback to handle adding it to state
          const center = getPolygonCenter(polygon);
          const polygonCoords = getPolygonCoordinates(polygon);
          const id = `polygon-${++polygonIdCounter.current}`;
          const polygonData: PolygonData = {
            id,
            polygon,
            name: name || `Polygon ${polygonIdCounter.current}`,
            type: coords.length === 4 ? "rectangle" : "polygon",
            center,
            coordinates: polygonCoords,
          };

          polygon.setOptions({ clickable: true });

          google.maps.event.addListener(polygon, "click", () => {
            if (onPolygonClick) {
              onPolygonClick(polygonData);
            }
          });

          setPolygons((prev) => {
            if (prev.some((p) => p.id === id)) {
              return prev;
            }
            const updated = [...prev, polygonData];
            if (onPolygonsUpdate) {
              onPolygonsUpdate(updated);
            }
            return updated;
          });

          if (onPolygonComplete) {
            onPolygonComplete(polygonData);
          }

          // Fit map to polygon bounds
          const bounds = new google.maps.LatLngBounds();
          coords.forEach((coord) =>
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
          );
          map.fitBounds(bounds);
        },
      }),
      [
        polygons,
        onPolygonsUpdate,
        map,
        getPolygonCenter,
        getPolygonCoordinates,
        onPolygonComplete,
        onPolygonClick,
      ]
    );

    // Initialize drawing manager
    const onDrawingManagerLoad = useCallback(
      (drawingManager: google.maps.drawing.DrawingManager) => {
        // Clear any existing listeners to prevent duplicates
        if (drawingManagerRef.current) {
          google.maps.event.clearInstanceListeners(drawingManagerRef.current);
        }

        drawingManagerRef.current = drawingManager;

        const polygonCompleteListener = google.maps.event.addListener(
          drawingManager,
          "polygoncomplete",
          (polygon: google.maps.Polygon) => {
            onDrawingComplete(polygon, "polygon");
            drawingManager.setDrawingMode(null);
          }
        );

        const rectangleCompleteListener = google.maps.event.addListener(
          drawingManager,
          "rectanglecomplete",
          (rectangle: google.maps.Rectangle) => {
            // Convert rectangle bounds to polygon
            const bounds = rectangle.getBounds();
            if (bounds) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();

              const rectanglePath: google.maps.LatLngLiteral[] = [
                { lat: sw.lat(), lng: sw.lng() },
                { lat: ne.lat(), lng: sw.lng() },
                { lat: ne.lat(), lng: ne.lng() },
                { lat: sw.lat(), lng: ne.lng() },
              ];

              const polygon = new google.maps.Polygon({
                paths: rectanglePath,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map: map || undefined,
              });

              rectangle.setMap(null); // Remove rectangle, keep polygon
              onDrawingComplete(polygon, "rectangle");
              drawingManager.setDrawingMode(null);
            }
          }
        );

        // Cleanup function to remove listeners
        return () => {
          if (polygonCompleteListener) {
            google.maps.event.removeListener(polygonCompleteListener);
          }
          if (rectangleCompleteListener) {
            google.maps.event.removeListener(rectangleCompleteListener);
          }
        };
      },
      [onDrawingComplete, map]
    );

    // Geocode country and create rectangular polygon
    useEffect(() => {
      if (!map || !geocoderRef.current || !searchQuery) return;

      const searchCountry = async () => {
        try {
          const response = await geocoderRef.current!.geocode({
            address: searchQuery,
          });

          if (response.results.length > 0) {
            const result = response.results[0];
            const bounds = result.geometry.viewport || result.geometry.bounds;

            if (bounds) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();

              // Create rectangular polygon
              const rectanglePath: google.maps.LatLngLiteral[] = [
                { lat: sw.lat(), lng: sw.lng() }, // Southwest
                { lat: ne.lat(), lng: sw.lng() }, // Northwest
                { lat: ne.lat(), lng: ne.lng() }, // Northeast
                { lat: sw.lat(), lng: ne.lng() }, // Southeast
              ];

              // Create new polygon (don't clear existing ones for country search)
              const newPolygon = new google.maps.Polygon({
                paths: rectanglePath,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map: map,
              });

              // Fit map to bounds
              map.fitBounds(bounds);

              const center = getPolygonCenter(newPolygon);
              const coordinates = getPolygonCoordinates(newPolygon);
              const id = `polygon-${++polygonIdCounter.current}`;
              const polygonData: PolygonData = {
                id,
                polygon: newPolygon,
                name: searchQuery,
                type: "country",
                center,
                coordinates,
              };

              // Make polygon clickable
              newPolygon.setOptions({ clickable: true });

              // Add click listener
              google.maps.event.addListener(newPolygon, "click", () => {
                if (onPolygonClick) {
                  onPolygonClick(polygonData);
                }
              });

              setPolygons((prev) => {
                // Check if polygon with this ID already exists to prevent duplicates
                if (prev.some((p) => p.id === id)) {
                  return prev;
                }
                const updated = [...prev, polygonData];
                if (onPolygonsUpdate) {
                  onPolygonsUpdate(updated);
                }
                return updated;
              });

              if (onPolygonComplete) {
                onPolygonComplete(polygonData);
              }
            }
          }
        } catch (error) {
          console.error("Geocoding error:", error);
        }
      };

      // Debounce search
      const timeoutId = setTimeout(searchCountry, 500);
      return () => clearTimeout(timeoutId);
    }, [
      searchQuery,
      map,
      onPolygonComplete,
      getPolygonCenter,
      getPolygonCoordinates,
      onPolygonClick,
      onPolygonsUpdate,
    ]);

    // Control drawing mode from parent
    useEffect(() => {
      if (drawingManagerRef.current && drawingMode !== undefined) {
        if (drawingMode === "polygon") {
          drawingManagerRef.current.setDrawingMode(
            google.maps.drawing.OverlayType.POLYGON
          );
        } else if (drawingMode === "rectangle") {
          drawingManagerRef.current.setDrawingMode(
            google.maps.drawing.OverlayType.RECTANGLE
          );
        } else {
          drawingManagerRef.current.setDrawingMode(null);
        }
      }
    }, [drawingMode]);

    if (!isLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="text-white">Loading map...</div>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <DrawingManager
          onLoad={onDrawingManagerLoad}
          options={{
            drawingMode: null,
            drawingControl: false, // Hide default controls
            polygonOptions: {
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1,
            },
            rectangleOptions: {
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              strokeWeight: 2,
              clickable: true,
              editable: true,
            },
          }}
        />
      </GoogleMap>
    );
  }
);

GoogleMapComponent.displayName = "GoogleMapComponent";
