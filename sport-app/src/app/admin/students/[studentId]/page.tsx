"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // For accessing studentId
import AdminLayout from '@/components/admin/AdminLayout';
import { getStudents, getActivities, getSelections, getSessions } from '@/services/appDataService';
import { Student, Sport, Session, Selections, AgeGroupComplianceRules, SportCategoryName, StudentSelection } from '@/lib/types';
import { getComplianceRulesByAgeGroup } from '@/lib/complianceRules';
import { calculateTotalWeeklySessions } from '@/lib/sessionCalculator';

interface ComplianceDetails {
  isOverallCompliant: boolean;
  sessionsMet: boolean;
  actualSessions: number;
  categoriesMet: Array<{ 
    name: SportCategoryName; 
    displayName: string; 
    isMet: boolean; 
    selected: number; 
    required: number; 
    isOptional: boolean;
  }>;
  customRuleResult?: { compliant: boolean; message?: string };
}

export default function StudentDetailsPage() {
  const params = useParams();
  const studentId = typeof params.studentId === 'string' ? params.studentId : null;

  const [student, setStudent] = useState<Student | null>(null);
  const [studentSelections, setStudentSelections] = useState<StudentSelection>({});
  const [allSports, setAllSports] = useState<Sport[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [rules, setRules] = useState<AgeGroupComplianceRules | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [complianceDetails, setComplianceDetails] = useState<ComplianceDetails | null>(null);

  const categoryOrder: SportCategoryName[] = ["Red", "Green", "Blue", "Yellow"];
  const categoryDisplayNames: Record<SportCategoryName, string> = {
      Red: "Category 1 Sport (Major Sports)",
      Green: "Club/Skill (Cultural Clubs)",
      Blue: "Category 2 Sport (Minor Sports)",
      Yellow: "Service (Optional)",
  };

  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsData, sportsData, selectionsData, sessionsData] = await Promise.all([
          getStudents(),
          getActivities(),
          getSelections(),
          getSessions(),
        ]);

        const currentStudent = studentsData.find(s => s.id === studentId) || null;
        setStudent(currentStudent);
        setAllSports(sportsData); // Store all sports
        setAllSessions(sessionsData); // Store all sessions

        if (currentStudent) {
          const currentStudentSelections = selectionsData[currentStudent.id] || {};
          setStudentSelections(currentStudentSelections);
          const currentRules = getComplianceRulesByAgeGroup(currentStudent.ageGroup);
          setRules(currentRules);

          if (currentRules) {
            const selectedSportIds = Object.keys(currentStudentSelections);
            const selectedSports = selectedSportIds.map(id => sportsData.find(act => act.id === id)).filter(Boolean) as Sport[];
            
            const actualSessions = calculateTotalWeeklySessions(currentStudent, currentStudentSelections, sportsData, sessionsData);
            const sessionsMet = actualSessions >= currentRules.minTotalSessions;

            const categoryResults: ComplianceDetails['categoriesMet'] = [];
            let allCategoriesReqMet = true;

            for (const catName of categoryOrder) {
                const rule = currentRules.categoryRules?.[catName];
                const selectedInCategory = selectedSports.filter(s => s.category === catName).length;
                let catMet = true; // Default to true, especially for optional or non-existent rules
                let required = 0;
                let isOptional = false;

                if (rule) { // If a rule exists for this category
                    required = rule.minSports;
                    isOptional = rule.isOptional || false; // Ensure isOptional is boolean
                    if (!isOptional) { // Only non-optional categories affect allCategoriesReqMet
                        catMet = selectedInCategory >= required;
                        if (!catMet) allCategoriesReqMet = false;
                    }
                    // For optional categories, 'catMet' remains true if not selected, or true if selected and meets/exceeds requirement
                    // If optional and selected count is less than required, it's still 'met' in terms of overall compliance impact.
                    // The display logic can show "0/1 (Optional)" without marking it as "Not Met" for overall compliance.
                } else {
                    // If no rule for a category (e.g. Yellow if not in rules object), treat as optional and met.
                    isOptional = true; 
                }
                 categoryResults.push({ name: catName, displayName: categoryDisplayNames[catName], isMet: catMet, selected: selectedInCategory, required, isOptional });
            }
            
            let customRuleCheck = { compliant: true, message: "" };
            if (currentRules.customRuleValidator) {
              customRuleCheck = currentRules.customRuleValidator(selectedSports, sessionsData);
            }

            setComplianceDetails({
              isOverallCompliant: sessionsMet && allCategoriesReqMet && customRuleCheck.compliant,
              sessionsMet,
              actualSessions,
              categoriesMet: categoryResults,
              customRuleResult: currentRules.customRuleValidator ? customRuleCheck : undefined,
            });
          } else {
            setComplianceDetails(null); // No rules, no specific details
          }
        }
      } catch (error) {
        console.error("Failed to load student details:", error);
        setStudent(null); // Ensure student is null on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  if (isLoading) return <AdminLayout><div className="text-center p-10">Loading student details...</div></AdminLayout>;
  if (!student) return <AdminLayout><div className="text-center p-10">Student not found.</div></AdminLayout>;
  if (!rules || !complianceDetails) return <AdminLayout><div className="text-center p-10">Compliance rules or details are not available for this student's age group.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="bg-white shadow-lg px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between pb-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
             <h2 className="text-3xl font-bold leading-tight text-gray-900 sm:truncate">
                {student.name}
             </h2>
             <p className="mt-1 text-md text-gray-600">Age Group: {student.ageGroup}</p>
             <p className={`mt-2 text-lg font-semibold ${complianceDetails.isOverallCompliant ? 'text-green-700' : 'text-red-700'}`}>
                Overall Compliance: {complianceDetails.isOverallCompliant ? 'Compliant' : 'Non-Compliant'}
             </p>
          </div>
        </div>

        <div className="mt-6">
            <h3 className="text-xl font-semibold leading-6 text-gray-800">Compliance Rules: <span className="font-normal text-gray-700">{rules.name}</span></h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {rules.description.map((desc, i) => <li key={i}>{desc}</li>)}
            </ul>
        </div>
        
        <div className="mt-8">
            <h3 className="text-xl font-semibold leading-6 text-gray-800 mb-3">Selected Sports & Category Compliance</h3>
            <div className="space-y-4">
            {complianceDetails.categoriesMet.map(catDetail => (
                <div key={catDetail.name} className="p-3 border border-gray-200 rounded-md shadow-sm bg-white">
                    <p className={`text-md font-semibold ${catDetail.isMet || (catDetail.isOptional && catDetail.selected < catDetail.required) ? 'text-gray-800' : 'text-red-600'}`}>
                        {catDetail.displayName}: {catDetail.selected}/{catDetail.required} selected
                        {catDetail.isOptional && catDetail.selected < catDetail.required ? <span className="text-xs text-gray-500 ml-1">(Optional)</span> : ""}
                        {!catDetail.isOptional && !catDetail.isMet ? <span className="text-red-600 font-normal ml-1">- Not Met</span> : ""}
                        {((catDetail.isOptional && catDetail.selected >= catDetail.required) || (!catDetail.isOptional && catDetail.isMet)) ? <span className="text-green-600 font-normal ml-1">- Met</span> : ""}
                         {catDetail.isOptional && catDetail.selected < catDetail.required && <span className="text-gray-500 font-normal ml-1">- Optional criteria</span>}
                    </p>
                    <ul className="list-disc list-inside ml-5 mt-1 text-sm text-gray-700 space-y-0.5">
                        {allSports.filter(s => s.category === catDetail.name && studentSelections[s.id]).map(s => <li key={s.id}>{s.name}</li>)}
                         {allSports.filter(s => s.category === catDetail.name && studentSelections[s.id]).length === 0 && <li className="text-gray-400 italic">No sports selected in this category.</li>}
                    </ul>
                </div>
            ))}
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-semibold leading-6 text-gray-800">Session Compliance</h3>
            <p className={`mt-2 text-md font-semibold ${complianceDetails.sessionsMet ? 'text-gray-800' : 'text-red-600'}`}>
                Total Weekly Sessions: {complianceDetails.actualSessions}/{rules.minTotalSessions}
                {complianceDetails.sessionsMet ? <span className="text-green-600 font-normal ml-1">- Met</span> : <span className="text-red-600 font-normal ml-1">- Not Met</span>}
            </p>
        </div>

        {complianceDetails.customRuleResult && (
             <div className="mt-8">
                <h3 className="text-xl font-semibold leading-6 text-gray-800">Custom Rule Status</h3>
                <p className={`mt-2 text-md font-semibold ${complianceDetails.customRuleResult.compliant ? 'text-gray-800' : 'text-red-600'}`}>
                    {complianceDetails.customRuleResult.message || (complianceDetails.customRuleResult.compliant ? "All custom rules met." : "Custom rule not met.")}
                </p>
            </div>
        )}
      </div>
    </AdminLayout>
  );
}
