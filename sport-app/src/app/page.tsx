"use client"; // Required for hooks

import React, { useState, useEffect } from 'react';
import StudentSelector from '@/components/StudentSelector';
import SportCategoryDisplay from '@/components/SportCategoryDisplay';
import FeedbackToolbar from '@/components/FeedbackToolbar';
import { getActivities, getSelections, getSessions, saveStudentSelections } from '@/services/appDataService'; // Added saveStudentSelections
import { getComplianceRulesByAgeGroup } from '@/lib/complianceRules';
import { Student, Sport, Session, StudentSelection, SportCategoryName, AgeGroupComplianceRules } from '@/lib/types';
import toast, { Toaster } from 'react-hot-toast'; // Import toast

// Category definitions
const sportCategoryDefinitions: Array<{ name: SportCategoryName; displayName: string }> = [
  { name: "Red", displayName: "Category 1 Sport (Major Sports)" },
  { name: "Green", displayName: "Club/Skill (Cultural Clubs)" },
  { name: "Blue", displayName: "Category 2 Sport (Minor Sports)" },
  { name: "Yellow", displayName: "Service (Optional)" },
];

export default function StudentPortalPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [currentSelections, setCurrentSelections] = useState<StudentSelection>({});
  const [currentRules, setCurrentRules] = useState<AgeGroupComplianceRules | undefined>(undefined);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingSelections, setLoadingSelections] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission status

  const handleStudentSelected = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setCurrentRules(getComplianceRulesByAgeGroup(student.ageGroup));
    } else {
      setCurrentRules(undefined);
      setCurrentSelections({});
    }
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoadingSports(true);
        const sports = await getActivities();
        setAllSports(sports);
      } catch (error) {
        console.error("Failed to fetch sports:", error);
      } finally {
        setLoadingSports(false);
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const sessions = await getSessions();
        setAllSessions(sessions);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedStudent?.id) {
      setCurrentSelections({});
      return;
    }
    const fetchUserSelections = async () => {
      try {
        setLoadingSelections(true);
        const allUserSelections = await getSelections();
        setCurrentSelections(allUserSelections[selectedStudent.id] || {});
      } catch (error) {
        console.error(`Failed to fetch selections for student ${selectedStudent.id}:`, error);
        setCurrentSelections({});
      } finally {
        setLoadingSelections(false);
      }
    };
    fetchUserSelections();
  }, [selectedStudent?.id]);

  const handleToggleSportSelect = (sportId: string, isSelected: boolean) => {
    if (!selectedStudent?.id) {
      console.warn("No student selected. Cannot toggle sport selection.");
      return;
    }
    setCurrentSelections(prev => {
      const updatedSelections = { ...prev };
      if (isSelected) {
        updatedSelections[sportId] = true;
      } else {
        delete updatedSelections[sportId];
      }
      return updatedSelections;
    });
  };

  const handleSubmitSelections = async () => {
    if (!selectedStudent) { // currentSelections can be an empty object {}
      toast.error("Please select a student.");
      return;
    }
    // Check if currentSelections is actually defined, though it's initialized to {}
    if (typeof currentSelections === 'undefined') {
        toast.error("Selections data is missing. Please try again.");
        return;
    }


    setIsSubmitting(true);
    const submissionToastId = toast.loading("Submitting selections...");

    try {
      await saveStudentSelections(selectedStudent.id, currentSelections);
      toast.success("Selections submitted successfully!", { id: submissionToastId });
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit selections. Please try again.", { id: submissionToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoadingInitialData = loadingSports || loadingSessions;

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <Toaster position="top-center" reverseOrder={false} /> {/* Add Toaster */}
      <header className="mb-6 py-4 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600">Sport and Cultural Activity Selector</h1>
      </header>

      <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-white shadow">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Student Selection</h2>
        <StudentSelector onStudentSelected={handleStudentSelected} />
        {selectedStudent && (
          <p className="mt-2 text-sm text-gray-600">
            Currently selected: <span className="font-semibold text-blue-500">{selectedStudent.name} ({selectedStudent.ageGroup})</span>
          </p>
        )}
      </div>

      <FeedbackToolbar 
        student={selectedStudent}
        studentSelections={currentSelections}
        allSports={allSports}
        allSessions={allSessions}
        rules={currentRules}
      />
      {loadingSelections && selectedStudent && <p className="text-blue-500 text-center my-2">Loading selections...</p>}

      <div>
        {isLoadingInitialData && <p className="text-center text-gray-600 py-4">Loading initial sports and session data...</p>}
        {!isLoadingInitialData && sportCategoryDefinitions.map(category => {
          const sportsForCategory = allSports.filter(sport => sport.category === category.name);
          return (
            <SportCategoryDisplay
              key={category.name}
              categoryName={category.displayName}
              sports={sportsForCategory}
              selectedSportIds={currentSelections}
              onToggleSportSelect={handleToggleSportSelect}
            />
          );
        })}
        {!isLoadingInitialData && allSports.length === 0 && <p className="text-center text-gray-500 py-4">No sports available.</p>}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={handleSubmitSelections}
          disabled={!selectedStudent || isLoadingInitialData || loadingSelections || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Selections"}
        </button>
      </div>
    </div>
  );
}
