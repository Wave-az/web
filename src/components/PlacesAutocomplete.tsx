import { useEffect, useRef, useState } from "react";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
  isMapLoaded?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Location Search",
  className,
  isMapLoaded = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  // Check if Google Maps is loaded
  useEffect(() => {
    if (!isMapLoaded) {
      setIsGoogleMapsReady(false);
      return;
    }

    const checkGoogleMaps = () => {
      if (
        typeof window !== "undefined" &&
        typeof google !== "undefined" &&
        typeof google.maps !== "undefined" &&
        typeof google.maps.places !== "undefined"
      ) {
        setIsGoogleMapsReady(true);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) {
      return;
    }

    // Poll for Google Maps to be loaded
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMapLoaded]);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsReady || !inputRef.current) {
      return;
    }

    try {

    // Clean up previous autocomplete instance
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    // Create Autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["(regions)"], // Restrict to countries, cities, etc.
      fields: ["geometry", "name", "formatted_address", "place_id"],
    });

    autocompleteRef.current = autocomplete;

    // Listen for place selection
    const listener = google.maps.event.addListener(
      autocomplete,
      "place_changed",
      () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          onPlaceSelect(place);
          setShowSuggestions(false);
          setSuggestions([]);
        }
      }
    );

      return () => {
        if (listener) {
          google.maps.event.removeListener(listener);
        }
      };
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
    }
  }, [isGoogleMapsReady, onPlaceSelect]);

  // Get predictions for custom suggestions display
  useEffect(() => {
    if (!isGoogleMapsReady) {
      return;
    }

    if (!value || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const service = new google.maps.places.AutocompleteService();

      // Debounce predictions
      const timeoutId = setTimeout(() => {
        service.getPlacePredictions(
          {
            input: value,
            types: ["(regions)"],
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      }, 300);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("Error getting place predictions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [value, isGoogleMapsReady]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!isGoogleMapsReady) {
      return;
    }

    onChange(prediction.description);
    setShowSuggestions(false);
    
    try {
      // Use PlacesService to get place details
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      
      service.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["geometry", "name", "formatted_address"],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            onPlaceSelect(place);
          }
        }
      );
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => {
          // Delay to allow click events on suggestions
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          {suggestions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              className={`
                px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors
                ${selectedIndex === index ? "bg-blue-50" : ""}
              `}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(prediction);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="text-sm font-medium text-gray-900">
                {prediction.structured_formatting.main_text}
              </div>
              <div className="text-xs text-gray-500">
                {prediction.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

