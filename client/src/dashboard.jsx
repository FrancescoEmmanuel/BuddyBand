import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    className: 'custom-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

function MapView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]); 
  const mapRef = useRef(null);

  const customIcon = createIcon();

  useEffect(() => {
    const teacherData = JSON.parse(localStorage.getItem("teacherData"));
    console.log("Teacher data from localStorage:", teacherData);
  
    if (teacherData) {
      const studentsRef = ref(db, "students");
      onValue(
        studentsRef,
        (snapshot) => {
          const data = snapshot.val();
          console.log("Fetched students data:", data);
  
          if (data) {
            const filteredStudents = Object.keys(data)
              .filter((key) => data[key].teacherID === teacherData.teacherID)
              .map((key) => ({ id: key, ...data[key] }));
            setStudents(filteredStudents);
          }
        },
        (error) => {
          console.error("Error fetching students:", error.message);
        }
      );
    }
  }, []);

  const handleAlertClick = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student && student.location) {
      setMapCenter([student.location.latitude, student.location.longitude]);
      if (mapRef.current) {
        mapRef.current.setView([student.location.latitude, student.location.longitude], 15);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            BuddyBand Dashboard - {teacher?.name || 'Loading...'}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Students</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              student.SosOn ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {student.SosOn ? 'SOS Active' : 'OK'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.BuzzerON ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Location Map</h2>
            </div>
            <div className="h-[calc(100vh-200px)]">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {students.map((student) => {
                  if (student.location) {
                    return (
                      <Marker
                        key={student.id}
                        position={[student.location.latitude, student.location.longitude]}
                        icon={customIcon}
                      >
                        <Popup>
                          <div>
                            <h3>{student.name}</h3>
                            <p>Grade: {student.grade}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }
                  return null;
                })}
                <MapView center={mapCenter} />
              </MapContainer>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden lg:col-span-2">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Alerts</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAlertClick(alert.studentID)}
                >
                  <div>
                    <p>Type: {alert.type}</p>
                    <p>Time: {alert.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
