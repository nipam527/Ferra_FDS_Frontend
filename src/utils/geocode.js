// src/utils/geocode.js
// (reference: see Restaurants.jsx integration notes in the accompanying reply)

function buildAddressParts(addr = {}) {
  const street = [addr.house_number, addr.road].filter(Boolean).join(" ") || addr.neighbourhood || "";
  const city = addr.city || addr.town || addr.village || addr.suburb || "";
  const pincode = addr.postcode || "";
  return { street, city, pincode };
}

// Forward geocode: address text -> { label, lat, lng, street, city, pincode }
export async function geocodeAddress(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`
  );
  const data = await res.json();
  if (!data?.length) throw new Error("Address not found");
  const { lat, lon, display_name, address } = data[0];
  const { street, city, pincode } = buildAddressParts(address);
  return {
    label: display_name.split(",").slice(0, 2).join(",").trim(),
    lat: parseFloat(lat),
    lng: parseFloat(lon),
    street,
    city,
    pincode,
  };
}

// Reverse geocode: lat/lng -> { label, lat, lng, street, city, pincode }
export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  );
  const data = await res.json();
  const { street, city, pincode } = buildAddressParts(data?.address);
  const label = city || data?.address?.neighbourhood || "Current location";
  return { label, lat, lng, street, city, pincode };
}

// Haversine distance in km between two coordinate pairs
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}