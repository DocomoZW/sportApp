"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStudents, getActivities, getSelections, getSessions } from '@/services/appDataService';
import { Student, Sport, Session, Selections, AgeGroupComplianceRules, SportCategoryName } from '@/lib/types';
import { getComplianceRulesByAgeGroup } from '@/lib/complianceRules';
import { calculateTotalWeeklySessions } from '@/lib/sessionCalculator';

interface StudentComplianceInfo {
  student: Student;
  isCompliant: boolean;
  detailsLink: string;
  complianceNotes: string[];
}

export default function ComplianceOverviewPage() {
  const [studentComplianceData, setStudentComplianceData] = useState<StudentComplianceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDataAndDetermineCompliance = async () => {
      setIsLoading(true);
      try {
        const [students, activities, allSelections, sessions] = await Promise.all([
          getStudents(),
          getActivities(),
          getSelections(),
          getSessions(),
        ]);

        const complianceInfos: StudentComplianceInfo[] = students.map(student => {
          const rules = getComplianceRulesByAgeGroup(student.ageGroup);
          const studentSelections = allSelections[student.id] || {};
          let isCompliantOverall = false;
          const notes: string[] = [];

          if (rules) {
            const selectedSportIds = Object.keys(studentSelections);
            const selectedSports = selectedSportIds.map(id => activities.find(act => act.id === id)).filter(Boolean) as Sport[];

            const totalSessions = calculateTotalWeeklySessions(student, studentSelections, activities, sessions);
            const sessionsMet = totalSessions >= rules.minTotalSessions;
            if (!sessionsMet) notes.push(`Sessions: ${totalSessions}/${rules.minTotalSessions}`);

            let categoriesMet = true;
            if (rules.categoryRules) {
              for (const catKey in rules.categoryRules) {
                const categoryName = catKey as SportCategoryName;
                const catRule = rules.categoryRules[categoryName];
                if (catRule && !catRule.isOptional) {
                  const selectedInCategory = selectedSports.filter(s => s.category === categoryName).length;
                  if (selectedInCategory < catRule.minSports) {
                    categoriesMet = false;
                    notes.push(`${categoryName}: ${selectedInCategory}/${catRule.minSports}`);
                  }
                }
              }
            }

            let customRuleMet = true;
            if (rules.customRuleValidator) {
              const customResult = rules.customRuleValidator(selectedSports, sessions);
              customRuleMet = customResult.compliant;
              if (!customRuleMet && customResult.message) {
                notes.push(`Custom: ${customResult.message}`);
              }
            }
            isCompliantOverall = sessionsMet && categoriesMet && customRuleMet;
          } else {
            notes.push("No rules defined for age group.");
          }

          return {
            student,
            isCompliant: isCompliantOverall,
            detailsLink: `/admin/students/${student.id}`,
            complianceNotes: notes,
          };
        });
        setStudentComplianceData(complianceInfos);
      } catch (error) {
        console.error("Failed to load compliance data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataAndDetermineCompliance();
  }, []);

  if (isLoading) {
    return <AdminLayout><div className="text-center p-10">Loading compliance overview...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Student Compliance Overview</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Age Group</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Compliance Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Notes</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentComplianceData.map(info => (
              <tr key={info.student.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{info.student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{info.student.ageGroup}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    info.isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {info.isCompliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                  {info.complianceNotes.join("; ") || (info.isCompliant ? '-' : 'Details not specified')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={info.detailsLink} legacyBehavior={false}>
                    <a className="text-indigo-600 hover:text-indigo-900">View Details</a>
                  </Link>
                </td>
              </tr>
            ))}
            {studentComplianceData.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                  No student compliance data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
