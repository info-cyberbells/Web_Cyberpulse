// Server-side Google Maps reverse geocoding.
// Returns a human-readable address for the given coordinates,
// or null if the key is missing / the API call fails.
export const reverseGeocode = async (latitude, longitude) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || latitude == null || longitude == null) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    console.warn("Google Geocoding returned non-OK status:", data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Reverse geocoding failed:", error.message);
    return null;
  }
};

// Forward geocoding: address → { latitude, longitude, formattedAddress }
export const forwardGeocode = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !address) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && Array.isArray(data.results) && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    console.warn("Google Geocoding returned non-OK status:", data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Forward geocoding failed:", error.message);
    return null;
  }
};
