import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { get, ref, onValue, update } from "firebase/database";
import LeafletMap from "./LeafletMap";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const teacherData = JSON.parse(localStorage.getItem("teacher"));
    setTeacher(teacherData);

    if (teacherData) {
      const studentsRef = ref(db, 'students');
      onValue(studentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filteredStudents = Object.keys(data)
            .filter((key) => data[key].teacherID === teacherData.teacherID)
            .map((key) => ({ id: key, ...data[key] }));
          setStudents(filteredStudents);
        }
      });

      const alertsRef = ref(db, "alerts");
      onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filteredAlerts = Object.keys(data)
            .filter((key) => data[key].teacherID === teacherData.teacherID)
            .map((key) => ({ id: key, ...data[key] }));
          setAlerts(filteredAlerts);
        }
      });
    }
  }, []);

  // Toggle buzzer for a student
  const handleBuzzerToggle = (studentId, currentStatus) => {
    const studentRef = ref(db, `students/${studentId}`);
    update(studentRef, { BuzzerON: !currentStatus });
  };

  // Filter students who are out of range or have SOS activated
  const studentsOutOfRangeOrSOS = students.filter(
    (student) => student.SosOn || student.outOfRange
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            BuddyBand Dashboard - {teacher?.name || "Loading..."}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts Container */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Alerts</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p>Type: {alert.type}</p>
                    <p>Student ID: {alert.studentID}</p>
                    <p>Time: {alert.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Student Database</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SOS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Buzzer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.SosOn ? "Active" : "OK"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.BuzzerON ? "On" : "Off"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleBuzzerToggle(student.id, student.BuzzerON)}
                            className="text-blue-600 hover:underline"
                          >
                            Toggle Buzzer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Leaflet Map */}
          <LeafletMap students={students} />

          {/* Out-of-Range/SOS Students Table */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden lg:col-span-2">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Students Out of Range / SOS</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SOS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {studentsOutOfRangeOrSOS.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{student.grade}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.SosOn ? "Active" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
