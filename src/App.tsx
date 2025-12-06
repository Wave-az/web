// src/App.tsx
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Map,
  Square,
  PenTool,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "./lib/utils";
import {
  GoogleMapComponent,
  type GoogleMapComponentRef,
  type PolygonData,
} from "./components/GoogleMap";
import { PlacesAutocomplete } from "./components/PlacesAutocomplete";

function App() {
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(true);
  const [isRisksOpen, setIsRisksOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [coordinates, setCoordinates] = useState<
    Array<{ lat: string; lng: string }>
  >([{ lat: "", lng: "" }]);
  const [drawingMode, setDrawingMode] = useState<
    "polygon" | "rectangle" | null
  >(null);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
    null
  );
  const [editingPolygonId, setEditingPolygonId] = useState<string | null>(null);
  const [editingPolygonName, setEditingPolygonName] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<
    "roadmap" | "satellite" | "terrain" | "hybrid"
  >("roadmap");
  const mapRef = useRef<GoogleMapComponentRef>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);

  // Handle delete key to remove selected polygon
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedPolygonId &&
        mapRef.current
      ) {
        e.preventDefault();
        mapRef.current.removePolygon(selectedPolygonId);
        setSelectedPolygonId(null);
        setLatitude("");
        setLongitude("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPolygonId]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* Map background */}
      <div className="absolute inset-0">
        <GoogleMapComponent
          ref={mapRef}
          searchQuery={locationSearch}
          drawingMode={drawingMode}
          selectedPolygonId={selectedPolygonId}
          onMapLoaded={setIsMapLoaded}
          mapTypeId={mapType}
          onPolygonComplete={(polygonData) => {
            if (polygonData.center) {
              setLatitude(polygonData.center.lat.toFixed(6));
              setLongitude(polygonData.center.lng.toFixed(6));
            }
            // Populate coordinates list with all polygon coordinates
            if (polygonData.coordinates && polygonData.coordinates.length > 0) {
              setCoordinates(
                polygonData.coordinates.map((c) => ({
                  lat: c.lat.toFixed(6),
                  lng: c.lng.toFixed(6),
                }))
              );
            }
            setSelectedPolygonId(polygonData.id);
            // Stop drawing after completion
            setDrawingMode(null);
          }}
          onPolygonsUpdate={(updatedPolygons) => {
            setPolygons(updatedPolygons);
          }}
          onPolygonClick={(polygonData) => {
            setSelectedPolygonId(polygonData.id);
            // Fit map to polygon bounds
            if (mapRef.current) {
              mapRef.current.fitPolygonBounds(polygonData.id);
            }
            // Get fresh coordinates from the polygon in case it was edited
            const paths = polygonData.polygon.getPath();
            if (paths) {
              const freshCoords: Array<{ lat: string; lng: string }> = [];
              paths.forEach((latLng) => {
                freshCoords.push({
                  lat: latLng.lat().toFixed(6),
                  lng: latLng.lng().toFixed(6),
                });
              });
              if (freshCoords.length > 0) {
                setCoordinates(freshCoords);
              }

              // Calculate center from fresh coordinates
              let latSum = 0;
              let lngSum = 0;
              paths.forEach((latLng) => {
                latSum += latLng.lat();
                lngSum += latLng.lng();
              });
              const count = paths.getLength();
              if (count > 0) {
                setLatitude((latSum / count).toFixed(6));
                setLongitude((lngSum / count).toFixed(6));
              }
            } else if (
              polygonData.coordinates &&
              polygonData.coordinates.length > 0
            ) {
              // Fallback to stored coordinates if path is not available
              setCoordinates(
                polygonData.coordinates.map((c) => ({
                  lat: c.lat.toFixed(6),
                  lng: c.lng.toFixed(6),
                }))
              );
              if (polygonData.center) {
                setLatitude(polygonData.center.lat.toFixed(6));
                setLongitude(polygonData.center.lng.toFixed(6));
              }
            }
          }}
        />
        {/* slight dark overlay on top of map */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Custom Zoom Controls - Bottom Left */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10">
          <div className="pointer-events-auto flex flex-col gap-2 rounded-full bg-white/95 backdrop-blur-[60px] border border-white/20 shadow-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-gray-100"
              onClick={() => mapRef.current?.zoomIn()}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <div className="h-px bg-gray-200 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none hover:bg-gray-100"
              onClick={() => mapRef.current?.zoomOut()}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Polygon Tabs - Top of map */}
      {polygons.length > 0 && (
        <div className="pointer-events-none absolute top-4 left-4 right-4 z-10">
          <div className="pointer-events-auto flex gap-2 overflow-x-auto max-w-full">
            {polygons.map((poly) => (
              <div
                key={poly.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-colors whitespace-nowrap shrink-0",
                  selectedPolygonId === poly.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white/95 backdrop-blur-[60px] text-gray-700 hover:bg-white border border-white/20 shadow-lg"
                )}
                onClick={() => {
                  setSelectedPolygonId(poly.id);
                  // Fit map to polygon bounds
                  if (mapRef.current) {
                    mapRef.current.fitPolygonBounds(poly.id);
                  }
                  // Get fresh coordinates from the polygon in case it was edited
                  const paths = poly.polygon.getPath();
                  if (paths) {
                    const freshCoords: Array<{ lat: string; lng: string }> = [];
                    paths.forEach((latLng) => {
                      freshCoords.push({
                        lat: latLng.lat().toFixed(6),
                        lng: latLng.lng().toFixed(6),
                      });
                    });
                    if (freshCoords.length > 0) {
                      setCoordinates(freshCoords);
                    }

                    // Calculate center from fresh coordinates
                    let latSum = 0;
                    let lngSum = 0;
                    paths.forEach((latLng) => {
                      latSum += latLng.lat();
                      lngSum += latLng.lng();
                    });
                    const count = paths.getLength();
                    if (count > 0) {
                      setLatitude((latSum / count).toFixed(6));
                      setLongitude((lngSum / count).toFixed(6));
                    }
                  } else if (poly.coordinates && poly.coordinates.length > 0) {
                    // Fallback to stored coordinates if path is not available
                    setCoordinates(
                      poly.coordinates.map((c) => ({
                        lat: c.lat.toFixed(6),
                        lng: c.lng.toFixed(6),
                      }))
                    );
                    if (poly.center) {
                      setLatitude(poly.center.lat.toFixed(6));
                      setLongitude(poly.center.lng.toFixed(6));
                    }
                  }
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingPolygonId(poly.id);
                  setEditingPolygonName(poly.name);
                  // Focus input after a brief delay to ensure it's rendered
                  setTimeout(() => {
                    editingInputRef.current?.focus();
                    editingInputRef.current?.select();
                  }, 0);
                }}
              >
                {editingPolygonId === poly.id ? (
                  <input
                    ref={editingPolygonId === poly.id ? editingInputRef : null}
                    type="text"
                    value={editingPolygonName}
                    onChange={(e) => setEditingPolygonName(e.target.value)}
                    onBlur={() => {
                      if (editingPolygonName.trim() && mapRef.current) {
                        mapRef.current.updatePolygonName(
                          poly.id,
                          editingPolygonName.trim()
                        );
                      }
                      setEditingPolygonId(null);
                      setEditingPolygonName("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (editingPolygonName.trim() && mapRef.current) {
                          mapRef.current.updatePolygonName(
                            poly.id,
                            editingPolygonName.trim()
                          );
                        }
                        setEditingPolygonId(null);
                        setEditingPolygonName("");
                      } else if (e.key === "Escape") {
                        setEditingPolygonId(null);
                        setEditingPolygonName("");
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "bg-transparent border-none outline-none text-sm font-medium w-[120px] text-inherit px-1 rounded",
                      selectedPolygonId === poly.id
                        ? "text-white"
                        : "text-gray-700"
                    )}
                  />
                ) : (
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {poly.name}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "h-5 w-5 rounded-full hover:bg-black/10 shrink-0",
                    selectedPolygonId === poly.id
                      ? "text-white hover:bg-white/20"
                      : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mapRef.current) {
                      mapRef.current.removePolygon(poly.id);
                      if (selectedPolygonId === poly.id) {
                        setSelectedPolygonId(null);
                        setLatitude("");
                        setLongitude("");
                      }
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control panel */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-end justify-start gap-3 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/20 p-2 backdrop-blur-xs">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
            <div>
              <p>Suitability Score</p>
              <p className="text-sm text-gray-600">
                Based on water percentage change*
              </p>
            </div>
            <Label className="text-2xl text-green-600">72/100</Label>
          </div>
        </div>

        {/* Settings panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsMapSettingsOpen(!isMapSettingsOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Map Settings</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isMapSettingsOpen && "rotate-90"
                )}
              />
            </Button>
          </div>

          {isMapSettingsOpen && (
            <CardContent className="space-y-6">
              {/* Location search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600 z-10" />
                <PlacesAutocomplete
                  value={locationSearch}
                  onChange={setLocationSearch}
                  onPlaceSelect={(place) => {
                    if (place.name) {
                      setLocationSearch(place.name);
                    } else if (place.formatted_address) {
                      setLocationSearch(place.formatted_address);
                    }
                  }}
                  placeholder="Location Search (e.g., Azerbaijan, Turkey, USA)"
                  className="ring-8 ring-white/20 h-10 rounded-full bg-white pl-9 pr-4 text-sm w-full"
                  isMapLoaded={isMapLoaded}
                />
              </div>

              {/* Map Type Selector */}
              <div>
                <Label className="text-sm text-white mb-2 block">
                  Map Type
                </Label>
                <Select
                  value={mapType}
                  onValueChange={(
                    value: "roadmap" | "satellite" | "terrain" | "hybrid"
                  ) => setMapType(value)}
                >
                  <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm ring-8 ring-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roadmap">Roadmap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lat / Lon - Display for selected polygon */}
              {selectedPolygonId && (
                <div className="flex w-full gap-2 bg-white/20 ring-8 ring-white/20 rounded-full">
                  <Input
                    placeholder="Latitude"
                    className="h-9 rounded-full bg-white text-sm shadow-sm"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    readOnly
                  />
                  <Input
                    placeholder="Longitude"
                    className="h-9 rounded-full bg-white text-sm shadow-sm"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    readOnly
                  />
                </div>
              )}

              {/* Coordinate Inputs for Creating Polygon */}
              <div className="space-y-3 ring-8 ring-white/20 rounded-2xl bg-white/20 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white font-medium">
                    Coordinates (min 3 points)
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white hover:bg-gray-100"
                    onClick={() => {
                      setCoordinates([...coordinates, { lat: "", lng: "" }]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {coordinates.map((coord, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white rounded-full px-2"
                    >
                      <span className="text-xs text-gray-500 w-6 shrink-0">
                        {index + 1}
                      </span>
                      <Input
                        placeholder="Lat"
                        className="h-8 rounded-full bg-transparent border-0 text-sm shadow-none focus-visible:ring-0"
                        value={coord.lat}
                        onChange={(e) => {
                          const newCoords = [...coordinates];
                          newCoords[index].lat = e.target.value;
                          setCoordinates(newCoords);
                        }}
                      />
                      <Input
                        placeholder="Lng"
                        className="h-8 rounded-full bg-transparent border-0 text-sm shadow-none focus-visible:ring-0"
                        value={coord.lng}
                        onChange={(e) => {
                          const newCoords = [...coordinates];
                          newCoords[index].lng = e.target.value;
                          setCoordinates(newCoords);
                        }}
                      />
                      {coordinates.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                          onClick={() => {
                            setCoordinates(
                              coordinates.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full h-9 rounded-full bg-white hover:bg-gray-100 text-gray-700 text-sm font-medium"
                  onClick={() => {
                    const validCoords = coordinates
                      .filter((c) => c.lat && c.lng)
                      .map((c) => ({
                        lat: parseFloat(c.lat),
                        lng: parseFloat(c.lng),
                      }))
                      .filter(
                        (c) =>
                          !isNaN(c.lat) &&
                          !isNaN(c.lng) &&
                          c.lat >= -90 &&
                          c.lat <= 90 &&
                          c.lng >= -180 &&
                          c.lng <= 180
                      );

                    if (validCoords.length >= 3 && mapRef.current) {
                      mapRef.current.createPolygonFromCoordinates(
                        validCoords,
                        validCoords.length === 4
                          ? "Rectangle"
                          : `Polygon (${validCoords.length} points)`
                      );
                      // Reset coordinates after creating
                      setCoordinates([{ lat: "", lng: "" }]);
                    }
                  }}
                  disabled={
                    coordinates.filter((c) => c.lat && c.lng).length < 3
                  }
                >
                  Create Polygon from Coordinates
                </Button>
              </div>

              {/* Date selectors */}
              <div className="flex flex-col gap-4 ring-8 ring-white/20 rounded-2xl bg-white/20">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-white ml-4">From</p>
                  <div className="flex gap-2 justify-between">
                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Jan</SelectItem>
                        <SelectItem value="2">Feb</SelectItem>
                        <SelectItem value="3">Mar</SelectItem>
                        <SelectItem value="4">Apr</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">Jun</SelectItem>
                        <SelectItem value="7">Jul</SelectItem>
                        <SelectItem value="8">Aug</SelectItem>
                        <SelectItem value="9">Sep</SelectItem>
                        <SelectItem value="10">Oct</SelectItem>
                        <SelectItem value="11">Nov</SelectItem>
                        <SelectItem value="12">Dec</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm text-white ml-4">To</p>
                  <div className="flex gap-2 justify-between">
                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Jan</SelectItem>
                        <SelectItem value="2">Feb</SelectItem>
                        <SelectItem value="3">Mar</SelectItem>
                        <SelectItem value="4">Apr</SelectItem>
                        <SelectItem value="5">May</SelectItem>
                        <SelectItem value="6">Jun</SelectItem>
                        <SelectItem value="7">Jul</SelectItem>
                        <SelectItem value="8">Aug</SelectItem>
                        <SelectItem value="9">Sep</SelectItem>
                        <SelectItem value="10">Oct</SelectItem>
                        <SelectItem value="11">Nov</SelectItem>
                        <SelectItem value="12">Dec</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="w-full h-9 rounded-full bg-white text-sm shadow-sm">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Grid options */}
              <div className="space-y-2 rounded-2xl ring-8 ring-white/20 bg-white/20">
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4" />
                  <span>Sentinel-2 Grid (Tile ID)</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>Landsat Grid (WRS2 Path/Row)</span>
                </label>
              </div>

              <div className="space-y-2 rounded-2xl ring-8 ring-white/20 bg-white/20">
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4" />
                  <span>AOI Boundary</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>Water maks</span>
                </label>
                <label className="flex items-center gap-2 text-sm p-3 rounded-full bg-white text-gray-600">
                  <Checkbox className="h-4 w-4 " />
                  <span>NDWI Heatmap</span>
                </label>
              </div>

              {/* Product Type – single choice select with 4 options */}
              <div className="rounded-full ring-8 ring-white/20 bg-white/20">
                <RadioGroup className="flex gap-2 justify-between">
                  <div className="flex w-full items-center space-x-2 rounded-full bg-white text-gray-600 p-3">
                    <RadioGroupItem value="baseline" />
                    <Label className="text-sm font-normal">
                      Baseline Period
                    </Label>
                  </div>

                  <div className="flex w-full items-center space-x-2 rounded-full bg-white text-gray-600 p-3">
                    <RadioGroupItem value="current" />
                    <Label className="text-sm font-normal">
                      Current Period
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <ToggleGroup
                  type="single"
                  className="rounded-full bg-white p-1"
                  value={drawingMode || "map"}
                  onValueChange={(value) => {
                    if (value === "polygon") {
                      setDrawingMode("polygon");
                    } else if (value === "rectangle") {
                      setDrawingMode("rectangle");
                    } else {
                      setDrawingMode(null);
                    }
                  }}
                >
                  <ToggleGroupItem value="map" className="h-8 w-8 rounded-xl">
                    <Map className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="rectangle"
                    className="h-8 w-8 rounded-xl"
                  >
                    <Square className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="polygon"
                    className="h-8 w-8 rounded-xl"
                  >
                    <PenTool className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>

                <Button
                  size="sm"
                  className=" h-9 rounded-full px-4 text-sm font-medium shadow"
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.clearPolygons();
                      setLatitude("");
                      setLongitude("");
                      setSelectedPolygonId(null);
                    }
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Risks panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsRisksOpen(!isRisksOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Risks</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isRisksOpen && "rotate-90"
                )}
              />
            </Button>
          </div>

          {isRisksOpen && (
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Flood Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-amber-300">
                      Medium
                    </Label>
                    <p className="text-xs text-gray-600">
                      Based on water percentage change*
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Dryness Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-green-500">
                      Low
                    </Label>
                    <p className="text-xs text-gray-600">
                      Based on water percentage change*
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Shoreline Risk</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-amber-300">
                      Medium
                    </Label>
                    <p className="text-xs text-gray-600">
                      Based on water percentage change*
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-3xl ">
                  <p className="text-black/60">Seasonality</p>
                  <div className="flex flex-col text-end">
                    <Label className="text-xl self-end text-red-600">
                      Strong
                    </Label>
                    <p className="text-xs text-gray-600">
                      Based on water percentage change*
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Summary panel */}
        <Card className="pointer-events-auto w-full max-w-xs sm:max-w-sm rounded-4xl bg-white/10 backdrop-blur-[60px] border-0">
          <div className="px-6">
            <Button
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full ring-8 ring-white/20 flex items-center justify-between text-black text-base font-medium rounded-3xl p-4 bg-white hover:bg-white"
            >
              <span>Summary</span>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-500 transition-transform",
                  isSummaryOpen && "rotate-90"
                )}
              />
            </Button>
          </div>

          {isSummaryOpen && (
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl">
                  <div>
                    <p className="text-black/60">Suitability Score</p>
                    <p className="text-xs text-gray-600">
                      Based on water percentage change*
                    </p>
                  </div>
                  <Label className="text-2xl text-green-600">72/100</Label>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Flood Risk</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Water Snapshot</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex gap-2">
                  <div className="w-full flex flex-col bg-white p-4 rounded-3xl gap-2">
                    <p className="text-black/60">Flood Risk</p>
                    <ul className="list-disc pl-6 text-black/60 text-xs">
                      <li>High Water Levels</li>
                      <li>Rapid Flow </li>
                      <li>Soil </li>
                      <li>Rainfall Surge</li>
                      <li>Critical Threshold</li>
                    </ul>
                  </div>

                  <div className="w-full flex flex-col bg-white p-4 rounded-3xl gap-2">
                    <p className="text-black/60">Water Snapshot</p>
                    <ul className="list-disc pl-6 text-black/60 text-xs">
                      <li>High Water Levels</li>
                      <li>Rapid Flow Increase</li>
                      <li>Soil Saturation</li>
                      <li>Rainfall Surge</li>
                      <li>Critical Threshold</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-white p-4 rounded-3xl">
                  <p className="text-black/60">Difference</p>
                  <ul className="list-disc pl-6 text-black/60 text-xs">
                    <li>High Water Levels</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 ring-8 ring-white/20 rounded-3xl bg-white/20">
                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Risk Breakdown</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>

                <div className="flex flex-col bg-white p-4 rounded-3xl gap-2">
                  <p className="text-black/60">Outlook Panel</p>
                  <ul className="list-disc pl-6 text-black/60 text-sm">
                    <li>High Water Levels</li>
                    <li>Rapid Flow Increase</li>
                    <li>Soil Saturation</li>
                    <li>Rainfall Surge</li>
                    <li>Critical Threshold</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </main>
  );
}

export default App;
