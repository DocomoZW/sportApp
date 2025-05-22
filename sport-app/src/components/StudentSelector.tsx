"use client";

import React, { useState, useEffect } from 'react';
import { getStudents } from '@/services/appDataService';
import { Student } from '@/lib/types';

interface StudentSelectorProps {
  onStudentSelected: (student: Student | null) => void; // Changed to pass Student object or null
}

export default function StudentSelector({ onStudentSelected }: StudentSelectorProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(""); // Store the ID of the selected student

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const fetchedStudents = await getStudents();
        if (fetchedStudents && fetchedStudents.length > 0) {
          setStudents(fetchedStudents);
        } else {
          setStudents([]);
          console.warn("No students fetched or empty array returned.");
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setError("Failed to load students. Please check the console for more details.");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = event.target.value;
    setSelectedId(studentId);
    if (studentId) {
      const selectedStudent = students.find(s => s.id === studentId) || null;
      onStudentSelected(selectedStudent);
    } else {
      onStudentSelected(null); // Pass null if "Select Student..." is chosen
    }
  };

  if (loading) {
    return <p className="text-gray-700">Loading students...</p>;
  }

  if (error) {
    return <p className="text-red-600 bg-red-100 p-3 rounded-md border border-red-300">{error}</p>;
  }

  return (
    <select 
      value={selectedId} 
      onChange={handleChange} 
      className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto min-w-[200px] max-w-md bg-white text-gray-800"
      aria-label="Select a student"
    >
      <option value="" disabled className="text-gray-500">Select Student...</option>
      {students.length > 0 ? (
        students.map(student => (
          <option key={student.id} value={student.id} className="text-gray-800">
            {student.name} ({student.ageGroup})
          </option>
        ))
      ) : (
        <option value="" disabled className="text-gray-500">No students available</option>
      )}
    </select>
  );
}
