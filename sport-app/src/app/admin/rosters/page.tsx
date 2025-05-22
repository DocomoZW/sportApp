"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout'; // Adjust path if necessary
import { getActivities, getStudents, getSelections } from '@/services/appDataService';
import { Sport, Student, Selections } from '@/lib/types';

export default function SportRostersPage() {
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allSelections, setAllSelections] = useState<Selections>({});
  const [selectedSportId, setSelectedSportId] = useState<string>('');
  const [roster, setRoster] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [sportsData, studentsData, selectionsData] = await Promise.all([
          getActivities(),
          getStudents(),
          getSelections(),
        ]);
        setAllSports(sportsData);
        setAllStudents(studentsData);
        setAllSelections(selectionsData);
      } catch (error) {
        console.error("Failed to load data for rosters:", error);
        // Optionally, set an error state here to display to the user
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedSportId || allStudents.length === 0 || Object.keys(allSelections).length === 0) {
      setRoster([]); // Clear roster if no sport selected or data is missing
      return;
    }

    // Find student IDs who have selected the current sportId
    const studentIdsWithSelectedSport = Object.entries(allSelections)
      .filter(([_studentId, selectionsForStudent]) => selectionsForStudent[selectedSportId]) // Check if selectedSportId is true
      .map(([studentId, _selectionsForStudent]) => studentId);

    // Filter allStudents to get the actual student objects for the roster
    const currentRoster = allStudents.filter(student => studentIdsWithSelectedSport.includes(student.id));
    setRoster(currentRoster);

  }, [selectedSportId, allStudents, allSelections]);

  const handleSportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSportId(event.target.value);
  };

  if (isLoading) {
    return <AdminLayout><div className="text-center p-10">Loading roster data...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Sport Rosters</h2>
      <div className="mb-6 bg-white p-4 shadow rounded-lg">
        <label htmlFor="sport-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select a Sport:
        </label>
        <select
          id="sport-select"
          value={selectedSportId}
          onChange={handleSportChange}
          className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
        >
          <option value="" disabled className="text-gray-500">-- Select Sport --</option>
          {allSports.map(sport => (
            <option key={sport.id} value={sport.id}>
              {sport.name} ({sport.category})
            </option>
          ))}
        </select>
      </div>

      {selectedSportId ? (
        roster.length > 0 ? (
          <div className="bg-white p-4 shadow rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Roster for: <span className="text-blue-600">{allSports.find(s => s.id === selectedSportId)?.name || 'Selected Sport'}</span>
            </h3>
            <ul className="divide-y divide-gray-200">
              {roster.map(student => (
                <li key={student.id} className="py-4 px-2 hover:bg-gray-50 transition-colors duration-150 rounded-md">
                  <p className="text-md font-semibold text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">Age Group: {student.ageGroup}</p>
                  {student.email && <p className="text-sm text-gray-500">Email: {student.email}</p>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white p-6 shadow rounded-lg text-center">
            <p className="text-gray-600 text-lg">No students have selected this sport.</p>
          </div>
        )
      ) : (
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <p className="text-gray-600 text-lg">Select a sport to view its roster.</p>
        </div>
      )}
    </AdminLayout>
  );
}
