// src/components/TrackingMap.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// fix Leaflet's default marker icons not loading correctly with bundlers like Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const riderIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 46],
  className: "hue-rotate-[280deg]", // visually distinguish the rider marker from pickup/drop
});

// keeps the map's view following the rider marker as it updates
function RecenterOnMove({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true });
    }
  }, [position, map]);
  return null;
}

function TrackingMap({ restaurantCoords, deliveryCoords, riderCoords }) {
  const points = [restaurantCoords, deliveryCoords, riderCoords].filter(
    (p) => p && p.lat && p.lng
  );

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-stone-50 text-sm text-stone-400">
        Location data not available for this order
      </div>
    );
  }

  const center = riderCoords?.lat ? riderCoords : points[0];

  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-stone-200">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurantCoords?.lat && (
          <Marker position={[restaurantCoords.lat, restaurantCoords.lng]}>
            <Popup>Restaurant (pickup)</Popup>
          </Marker>
        )}

        {deliveryCoords?.lat && (
          <Marker position={[deliveryCoords.lat, deliveryCoords.lng]}>
            <Popup>Delivery address</Popup>
          </Marker>
        )}

        {riderCoords?.lat && (
          <>
            <Marker position={[riderCoords.lat, riderCoords.lng]} icon={riderIcon}>
              <Popup>Your delivery partner</Popup>
            </Marker>
            <RecenterOnMove position={[riderCoords.lat, riderCoords.lng]} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default TrackingMap;