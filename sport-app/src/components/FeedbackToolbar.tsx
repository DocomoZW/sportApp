"use client";

import React from 'react';
import { Student, Sport, Session, AgeGroupComplianceRules, StudentSelection, SportCategoryName } from '@/lib/types';
import { calculateTotalWeeklySessions } from '@/lib/sessionCalculator';

interface FeedbackToolbarProps {
  student: Student | null;
  studentSelections: StudentSelection;
  allSports: Sport[];
  allSessions: Session[];
  rules: AgeGroupComplianceRules | undefined;
}

const categoryDisplayOrder: SportCategoryName[] = ["Red", "Green", "Blue", "Yellow"];

export default function FeedbackToolbar({ student, studentSelections, allSports, allSessions, rules }: FeedbackToolbarProps) {
  if (!student || !rules) {
    return (
      <div className="p-3 my-2 border border-gray-200 rounded-lg bg-gray-100 text-center text-sm text-gray-600 shadow">
        {student ? "Compliance rules not available for this age group, or student data is incomplete." : "Select a student to see compliance status."}
      </div>
    );
  }

  const selectedSportIds = Object.keys(studentSelections);

  // Calculate total selected sessions
  const totalSelectedSessions = calculateTotalWeeklySessions(student, studentSelections, allSports, allSessions);
  const minTotalSessionsRequired = rules.minTotalSessions;
  const sessionsRequirementMet = totalSelectedSessions >= minTotalSessionsRequired;

  // Custom Rule Validation
  let customRuleMet = true;
  let customRuleMessage: string | undefined = undefined;

  const selectedSportObjects = selectedSportIds
    .map(sportId => allSports.find(s => s.id === sportId))
    .filter(s => s !== undefined) as Sport[]; // Ensure only defined Sport objects

  if (rules.customRuleValidator) {
    const customResult = rules.customRuleValidator(selectedSportObjects, allSessions);
    customRuleMet = customResult.compliant;
    customRuleMessage = customResult.message;
  }

  return (
    <div className="p-4 my-4 border border-gray-300 rounded-xl bg-white shadow-lg sticky top-4 z-50">
      <div className="flex flex-col md:flex-row md:flex-wrap gap-y-2 gap-x-3 items-center">
        <div className="mb-2 md:mb-0">
          <span className="font-bold text-blue-700 text-lg">{student.name}</span>
          <span className="text-gray-600 text-sm ml-2">({student.ageGroup})</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center"> {/* Added items-center */}
          {rules.categoryRules && categoryDisplayOrder.map(catName => {
            const rule = rules.categoryRules?.[catName];
            if (!rule) return null;

            const selectedInCategory = selectedSportObjects.filter(s => s.category === catName).length;
            const minRequired = rule.minSports;
            const isMet = selectedInCategory >= minRequired;
            
            let bgColor = isMet ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
            let textColor = isMet ? 'text-green-700' : 'text-red-700';
            if (rule.isOptional && selectedInCategory === 0 && minRequired === 0) {
                bgColor = 'bg-gray-100 border-gray-300';
                textColor = 'text-gray-600';
            } else if (rule.isOptional && isMet) {
                bgColor = 'bg-blue-100 border-blue-300';
                textColor = 'text-blue-700';
            }

            return (
              <span key={catName} 
                    className={`p-1.5 px-3 rounded-full text-xs font-medium border ${bgColor} ${textColor} shadow-sm`}
                    title={`${catName} Category: ${selectedInCategory} selected / ${minRequired} required. ${rule.isOptional ? '(Optional)' : ''}`}>
                {catName}: {selectedInCategory}/{minRequired} {rule.isOptional && !isMet && minRequired > 0 ? '(Optional)' : ''}
              </span>
            );
          })}

          <span className={`p-1.5 px-3 rounded-full text-xs font-medium border ${sessionsRequirementMet ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'} shadow-sm`}
                title={`Total weekly sessions: ${totalSelectedSessions} selected / ${minTotalSessionsRequired} required.`}>
            Sessions: {totalSelectedSessions}/{minTotalSessionsRequired}
          </span>

          {/* Display Custom Rule Status */}
          {!customRuleMet && customRuleMessage && (
            <span className={`p-1.5 px-3 rounded-full text-xs font-medium border bg-orange-100 border-orange-300 text-orange-700 shadow-sm`}
                  title={`Custom Rule: ${customRuleMessage}`}>
              Rule Alert: {customRuleMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
