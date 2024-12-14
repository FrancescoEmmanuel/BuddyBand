import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createIcon = (type) => {
  const color = type === "SOS" ? "red" : "blue";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`,
    className: "custom-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

export default function LeafletMap({ students }) {
  const [mapCenter, setMapCenter] = useState([0, 0]); // Default to [0, 0]

  useEffect(() => {
    if (students.length > 0) {
      const firstStudentWithLocation = students.find((s) => s.location);
      if (firstStudentWithLocation) {
        setMapCenter([
          firstStudentWithLocation.location.latitude,
          firstStudentWithLocation.location.longitude,
        ]);
      }
    }
  }, [students]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-gray-900">Student Locations</h2>
      </div>
      <div id="map" style={{ height: "400px", width: "100%" }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {students.map((student) =>
            student.location ? (
              <Marker
                key={student.id}
                position={[student.location.latitude, student.location.longitude]}
                icon={createIcon(student.SosOn ? "SOS" : "OK")}
              >
                <Popup>
                  <div>
                    <h3>{student.name}</h3>
                    <p>Grade: {student.grade}</p>
                    <p>SOS: {student.SosOn ? "Active" : "OK"}</p>
                    <p>Battery: {student.Battery || "N/A"}%</p>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
}
