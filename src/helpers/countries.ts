export type Country = {
  name: string;
  code: string;
  lat: number;
  lng: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

export const COUNTRIES: Country[] = [
  { name: "Azerbaijan", code: "AZ", lat: 40.1431, lng: 47.5769 },
  { name: "Turkey", code: "TR", lat: 38.9637, lng: 35.2433 },
  { name: "United States", code: "US", lat: 37.0902, lng: -95.7129 },
  { name: "United Kingdom", code: "GB", lat: 55.3781, lng: -3.436 },
  { name: "France", code: "FR", lat: 46.2276, lng: 2.2137 },
  { name: "Germany", code: "DE", lat: 51.1657, lng: 10.4515 },
  { name: "Italy", code: "IT", lat: 41.8719, lng: 12.5674 },
  { name: "Spain", code: "ES", lat: 40.4637, lng: -3.7492 },
  { name: "Russia", code: "RU", lat: 61.524, lng: 105.3188 },
  { name: "China", code: "CN", lat: 35.8617, lng: 104.1954 },
  { name: "India", code: "IN", lat: 20.5937, lng: 78.9629 },
  { name: "Japan", code: "JP", lat: 36.2048, lng: 138.2529 },
  { name: "Brazil", code: "BR", lat: -14.235, lng: -51.9253 },
  { name: "Canada", code: "CA", lat: 56.1304, lng: -106.3468 },
  { name: "Australia", code: "AU", lat: -25.2744, lng: 133.7751 },
  { name: "Mexico", code: "MX", lat: 23.6345, lng: -102.5528 },
  { name: "Argentina", code: "AR", lat: -38.4161, lng: -63.6167 },
  { name: "South Africa", code: "ZA", lat: -30.5595, lng: 22.9375 },
  { name: "Egypt", code: "EG", lat: 26.8206, lng: 30.8025 },
  { name: "Saudi Arabia", code: "SA", lat: 23.8859, lng: 45.0792 },
  { name: "Iran", code: "IR", lat: 32.4279, lng: 53.688 },
  { name: "Iraq", code: "IQ", lat: 33.2232, lng: 43.6793 },
  { name: "Kazakhstan", code: "KZ", lat: 48.0196, lng: 66.9237 },
  { name: "Uzbekistan", code: "UZ", lat: 41.3775, lng: 64.5853 },
  { name: "Georgia", code: "GE", lat: 42.3154, lng: 43.3569 },
  { name: "Armenia", code: "AM", lat: 40.0691, lng: 45.0382 },
  { name: "Ukraine", code: "UA", lat: 48.3794, lng: 31.1656 },
  { name: "Poland", code: "PL", lat: 51.9194, lng: 19.1451 },
  { name: "Greece", code: "GR", lat: 39.0742, lng: 21.8243 },
  { name: "Portugal", code: "PT", lat: 39.3999, lng: -8.2245 },
];

// Helper function to get country by name
export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.name === name);
}

// Helper function to get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
