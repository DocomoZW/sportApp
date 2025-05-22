import { AgeGroupComplianceRules, SportCategoryName, Sport, Session } from './types'; // Added Sport and Session

// --- Custom Validator for U17 ---
const u17CustomValidator = (selectedSports: Sport[], _sessions: Session[]): { compliant: boolean; message?: string } => {
  const selectedRedCount = selectedSports.filter(s => s.category === 'Red').length;
  const selectedGreenCount = selectedSports.filter(s => s.category === 'Green').length;
  const selectedBlueCount = selectedSports.filter(s => s.category === 'Blue').length;

  const redConditionMet = selectedRedCount >= 1;
  const otherActivitiesMet = (selectedGreenCount + selectedBlueCount) >= 2;

  if (redConditionMet && otherActivitiesMet) {
    return { compliant: true };
  } else {
    let messages = [];
    if (!redConditionMet) messages.push("Requires at least 1 Red sport.");
    if (!otherActivitiesMet) messages.push("Requires at least 2 additional activities from Green or Blue.");
    return { compliant: false, message: messages.join(' ') };
  }
};

// --- Custom Validator for U18-U20 ---
const u18u20CustomValidator = (selectedSports: Sport[], _sessions: Session[]): { compliant: boolean; message?: string } => {
  const selectedRedCount = selectedSports.filter(s => s.category === 'Red').length;
  const selectedBlueCount = selectedSports.filter(s => s.category === 'Blue').length;
  const selectedGreenCount = selectedSports.filter(s => s.category === 'Green').length;
  const selectedYellowCount = selectedSports.filter(s => s.category === 'Yellow').length;

  const condition1Met = selectedRedCount > 0 || selectedBlueCount > 0;

  if (!condition1Met) {
    return { compliant: false, message: "Requires at least 1 Red OR 1 Blue sport." };
  }

  let otherActivitiesCount = 0;
  let primaryFulfilledByRed = false;

  if (selectedRedCount > 0) {
    otherActivitiesCount += (selectedRedCount - 1); // Remaining Red sports
    primaryFulfilledByRed = true;
  }
  
  if (selectedBlueCount > 0) {
    if (primaryFulfilledByRed) { // Red already took the primary slot
      otherActivitiesCount += selectedBlueCount; // All Blue count as other
    } else { // Blue takes the primary slot
      otherActivitiesCount += (selectedBlueCount - 1); // Remaining Blue sports
    }
  }
  
  otherActivitiesCount += selectedGreenCount;
  otherActivitiesCount += selectedYellowCount;

  const condition2Met = otherActivitiesCount >= 2;

  if (condition1Met && condition2Met) {
    return { compliant: true };
  } else {
    // Specific messages based on which condition failed
    if (!condition1Met) return { compliant: false, message: "Requires 1 Red OR 1 Blue sport." }; // Should be caught above
    if (!condition2Met) return { compliant: false, message: "Requires 2 other activities from any category (excluding the primary Red/Blue choice)." };
    return { compliant: false, message: "Requires 1 Red OR 1 Blue sport, AND 2 other activities." }; // Generic fallback
  }
};


export const U14_U16_RULES: AgeGroupComplianceRules = {
  identifier: 'U14-U16',
  name: 'Under 14 to Under 16',
  description: [
    'Minimum 2 "Red" category sports.',
    'Minimum 1 "Green" category activity.',
    'Minimum 1 "Blue" category sport.',
    'Minimum 8 total weekly sessions.',
  ],
  minTotalSessions: 8,
  categoryRules: {
    Red: { minSports: 2 },
    Green: { minSports: 1 },
    Blue: { minSports: 1 },
    Yellow: { minSports: 0, isOptional: true },
  },
  customRuleValidator: undefined,
};

export const U17_RULES: AgeGroupComplianceRules = {
  identifier: 'U17',
  name: 'Under 17',
  description: [
    'Minimum 1 "Red" category sport.',
    'Minimum 2 other activities from "Green" or "Blue".',
    'Minimum 6 total weekly sessions.',
  ],
  minTotalSessions: 6,
  categoryRules: {
    Red: { minSports: 1 }, // This will be checked by the standard logic
    Green: { minSports: 0, isOptional: false }, // Custom validator handles the sum
    Blue: { minSports: 0, isOptional: false },  // Custom validator handles the sum
    Yellow: { minSports: 0, isOptional: true },
  },
  customRuleValidator: u17CustomValidator, // Assigned
};

export const U18_U20_RULES: AgeGroupComplianceRules = {
  identifier: 'U18-U20',
  name: 'Under 18 to Under 20',
  description: [
    'Minimum 1 "Red" OR 1 "Blue" category sport.',
    'Minimum 2 other activities from any category (excluding the one chosen for the first rule if Red/Blue).',
    'Minimum 5 total weekly sessions.',
  ],
  minTotalSessions: 5,
  categoryRules: { // These are effectively overridden or supplemented by the custom validator
    Red: { minSports: 0, isOptional: false },
    Green: { minSports: 0, isOptional: false },
    Blue: { minSports: 0, isOptional: false },
    Yellow: { minSports: 0, isOptional: true },
  },
  customRuleValidator: u18u20CustomValidator, // Assigned
};

export const ALL_COMPLIANCE_RULES: AgeGroupComplianceRules[] = [
  U14_U16_RULES,
  U17_RULES,
  U18_U20_RULES,
];

export const getComplianceRulesByAgeGroup = (ageGroup?: string): AgeGroupComplianceRules | undefined => {
  if (!ageGroup) return undefined;

  const normalizedAgeGroup = ageGroup.toLowerCase().replace(/\s+/g, '');

  if (normalizedAgeGroup.includes("under14") || normalizedAgeGroup.includes("u14") ||
      normalizedAgeGroup.includes("under15") || normalizedAgeGroup.includes("u15") ||
      normalizedAgeGroup.includes("under16") || normalizedAgeGroup.includes("u16")) {
    return U14_U16_RULES;
  }
  if (normalizedAgeGroup.includes("under17") || normalizedAgeGroup.includes("u17")) {
    return U17_RULES;
  }
  if (normalizedAgeGroup.includes("under18") || normalizedAgeGroup.includes("u18") ||
      normalizedAgeGroup.includes("under19") || normalizedAgeGroup.includes("u19") ||
      normalizedAgeGroup.includes("under20") || normalizedAgeGroup.includes("u20")) {
    return U18_U20_RULES;
  }

  console.warn(`No compliance rules found for age group: ${ageGroup} (Normalized: ${normalizedAgeGroup})`);
  return undefined;
};
