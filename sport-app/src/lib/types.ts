import { LucideIcon } from 'lucide-react';
import React from 'react'; // Added for React.ComponentType

// 1. SportCategoryName
export type SportCategoryName = "Red" | "Green" | "Blue" | "Yellow";

// 2. SportFirebaseData
export interface SportFirebaseData {
  name: string;
  category: string; // raw category string e.g., "blue"
  categoryId: string;
  staff?: Array<{ ageGroup?: string; name: string }>;
  dataAiHint?: string;
  // Add any other fields that might come from Firebase for activities
  // For example, location, maxCapacity, etc.
  location?: string;
  maxCapacity?: number;
  description?: string;
}

// 3. Sport
export interface Sport extends SportFirebaseData {
  id: string; // Firebase key of the activity
  category: SportCategoryName; // Mapped category name
  Icon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>; // Icon component
}

// 4. StudentFirebaseData
export interface StudentFirebaseData {
  fname: string;
  surname: string;
  ageGroup: string; // e.g., "Under 16"
  block?: string;
  dob?: string;
  email?: string;
  house?: string;
  id?: string; // Original ID from data source
  key?: string; // Original key from data source
  tutorGroup?: string;
  gender?: string; // Example of another field
  yearGroup?: string; // Example of another field
}

// 5. Student
export interface Student extends StudentFirebaseData {
  id: string; // Firebase key of the student
  name: string; // Combined fname + surname
}

// 6. StudentSelection
export interface StudentSelection {
  [activityId: string]: true; // Using true indicates selection, could also be session details if needed
}

// 7. Selections
export interface Selections {
  [studentId: string]: StudentSelection;
}

// 8. DayOfWeek
export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

// 9. SessionFirebaseData
export interface SessionFirebaseData {
  End: string; // e.g., "16:00:00"
  activity: string; // Name of the activity
  activityId: string; // ID of the activity (links to /activities)
  ageGroup?: string; // Specific age group for this session, if any
  category: string; // raw category string e.g., "red"
  day: string; // Day of the week e.g., "Monday"
  start: string; // e.g., "15:20:00"
  type?: string; // e.g., "Team", "Social"
  // Add any other fields like block, description, group, id, sessionNum, staff
  block?: string;
  description?: string;
  group?: string; // e.g. "A", "B", specific squad
  sessionId?: string; // Original ID if different from Firebase key
  sessionNum?: number;
  staff?: Array<{ name: string; role?: string }>; // Staff for this specific session
  location?: string; // Location for this specific session
  maxCapacity?: number; // Max capacity for this specific session
}

// 10. Session
export interface Session extends Omit<SessionFirebaseData, 'day' | 'category' | 'activityId' | 'activity' | 'start' | 'End'> {
  id: string; // Firebase key of the session
  sportId: string; // Renamed from activityId for clarity
  activityName: string; // Renamed from activity for clarity
  dayOfWeek: DayOfWeek;
  startTime: string; // Renamed from start
  endTime: string; // Renamed from End
  category: SportCategoryName; // Mapped category name
}

// 11. CategoryRule
export interface CategoryRule {
  minSports: number;
  isOptional?: boolean; // If true, this category is not mandatory but counts if chosen
  maxSports?: number; // Optional: Maximum sports allowed from this category
  specificSports?: string[]; // Optional: List of specific sport IDs that must be chosen from this category
}

// 12. AgeGroupComplianceRules
export interface AgeGroupComplianceRules {
  identifier: string; // e.g., 'U14-U16'
  name: string; // User-friendly rule set name, e.g., "Under 14 to Under 16"
  description: string[]; // UI display of rules, each string is a line/bullet
  minTotalSessions: number; // Minimum total sessions per cycle (e.g., week)
  maxTotalSessions?: number; // Optional: Maximum total sessions per cycle
  categoryRules: {
    [key in SportCategoryName]?: CategoryRule; // Rules per sport category
  };
  // Custom validator function for complex rules not covered by the structure
  customRuleValidator?: (selectedSports: Sport[], sessions: Session[]) => { compliant: boolean; message?: string };
}

// Example of a more specific selection type if needed, e.g., storing session IDs instead of just activity IDs
export interface DetailedStudentSelection {
  [sessionId: string]: {
    activityId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    // any other session details needed for quick access
  };
}

export interface DetailedSelections {
  [studentId: string]: DetailedStudentSelection;
}
