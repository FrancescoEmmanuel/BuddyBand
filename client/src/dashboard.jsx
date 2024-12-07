import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function MapView({ center }) {
  const map = useMap()
  map.setView(center, 15)
  return null
}

const createIcon = () => {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    className: 'custom-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  })
}

export default function Dashboard() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Alice Johnson', class: '5A', parentContact: '+1 (555) 123-4567', location: [51.505, -0.09], battery: 80, status: 'OK', avatar: '/placeholder.svg' },
    { id: 2, name: 'Bob Smith', class: '5B', parentContact: '+1 (555) 234-5678', location: [51.51, -0.1], battery: 60, status: 'Alert', avatar: '/placeholder.svg' },
    { id: 3, name: 'Charlie Brown', class: '5A', parentContact: '+1 (555) 345-6789', location: [51.515, -0.095], battery: 90, status: 'OK', avatar: '/placeholder.svg' },
    { id: 4, name: 'Diana Prince', class: '5C', parentContact: '+1 (555) 456-7890', location: [51.52, -0.105], battery: 45, status: 'OK', avatar: '/placeholder.svg' },
  ])

  const [alerts, setAlerts] = useState([
    { id: 1, studentId: 2, studentName: 'Bob Smith', message: 'Student has strayed from the group', time: '2 mins ago' },
    { id: 2, studentId: 4, studentName: 'Diana Prince', message: 'Low battery warning', time: '5 mins ago' },
  ])

  const [mapCenter, setMapCenter] = useState([51.505, -0.09])
  const mapRef = useRef(null)

  const handleAlertClick = (studentId) => {
    const student = students.find(s => s.id === studentId)
    if (student) {
      setMapCenter(student.location)
      if (mapRef.current) {
        mapRef.current.setView(student.location, 15)
      }
    }
  }

  const customIcon = createIcon()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">BuddyBand Dashboard</h1>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={student.avatar} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.class}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.parentContact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.battery}%
                        </td>
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
                {students.map((student) => (
                  <Marker key={student.id} position={student.location} icon={customIcon}>
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold text-base mb-2">{student.name}</h3>
                        <p><span className="font-semibold">Class:</span> {student.class}</p>
                        <p><span className="font-semibold">Parent Contact:</span> {student.parentContact}</p>
                        <p><span className="font-semibold">Status:</span> 
                          <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.status}
                          </span>
                        </p>
                        <p><span className="font-semibold">Battery:</span> {student.battery}%</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
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
                <li key={alert.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer" onClick={() => handleAlertClick(alert.studentId)}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600">{alert.studentName}</p>
                    <p className="text-sm text-gray-500">{alert.time}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{alert.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
