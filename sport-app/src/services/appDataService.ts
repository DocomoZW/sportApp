import { ref, get, child, set } from 'firebase/database'; // Added 'set'
import { database } from '@/lib/firebase';
import {
  Student,
  StudentFirebaseData,
  Sport,
  SportFirebaseData,
  SportCategoryName,
  Session,
  SessionFirebaseData,
  Selections,
  StudentSelection, // Explicitly import StudentSelection if used in function signature
  DayOfWeek
} from '@/lib/types';

// Helper function to map category strings to SportCategoryName
const mapCategoryStringToEnum = (categoryStr: string): SportCategoryName => {
  switch (categoryStr?.toLowerCase()) {
    case 'red':
      return 'Red';
    case 'green':
      return 'Green';
    case 'blue':
      return 'Blue';
    case 'yellow':
      return 'Yellow';
    default:
      console.warn(`Unknown category string: ${categoryStr}, defaulting to Yellow.`);
      return 'Yellow'; // Defaulting to Yellow as per example
  }
};

// Helper function to map day strings to DayOfWeek type
const mapDayStringToEnum = (dayStr: string): DayOfWeek => {
  if (!dayStr) { // Handle null or undefined dayStr
    console.warn(`Received null or undefined day string, defaulting to Monday.`);
    return 'Monday';
  }
  const capitalizedDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1).toLowerCase();
  if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(capitalizedDay)) {
    return capitalizedDay as DayOfWeek;
  }
  console.warn(`Unknown day string: ${dayStr}, defaulting to Monday.`);
  return 'Monday'; // Or handle as an error / default more appropriately
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const snapshot = await get(child(ref(database), 'students'));
    if (snapshot.exists()) {
      const studentsData = snapshot.val() as { [key: string]: StudentFirebaseData };
      if (!studentsData) {
        console.warn("Students data is null or undefined from Firebase.");
        return [];
      }
      return Object.entries(studentsData).map(([id, student]) => ({
        ...student,
        id,
        name: `${student.fname} ${student.surname}`,
      }));
    }
    console.log("No students data found at /students path.");
    return [];
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

export const getActivities = async (): Promise<Sport[]> => {
  try {
    const snapshot = await get(child(ref(database), 'activities'));
    if (snapshot.exists()) {
      const activitiesData = snapshot.val() as { [key: string]: SportFirebaseData };
      if (!activitiesData) {
        console.warn("Activities data is null or undefined from Firebase.");
        return [];
      }
      return Object.entries(activitiesData).map(([id, activity]) => ({
        ...activity,
        id,
        category: mapCategoryStringToEnum(activity.category),
        Icon: undefined,
      }));
    }
    console.log("No activities data found at /activities path.");
    return [];
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
};

export const getSelections = async (): Promise<Selections> => {
  try {
    const snapshot = await get(child(ref(database), 'selections'));
    if (snapshot.exists()) {
      const selectionsData = snapshot.val();
      if (typeof selectionsData === 'object' && selectionsData !== null) {
        return selectionsData as Selections;
      }
      console.warn("Selections data is not a valid object:", selectionsData);
      return {};
    }
    console.log("No selections data found at /selections path.");
    return {};
  } catch (error) {
    console.error("Error fetching selections:", error);
    return {};
  }
};

export const getSessions = async (): Promise<Session[]> => {
  try {
    const snapshot = await get(child(ref(database), 'sessions'));
    if (snapshot.exists()) {
      const sessionsData = snapshot.val() as { [key: string]: SessionFirebaseData };
      if (!sessionsData) {
        console.warn("Sessions data is null or undefined from Firebase.");
        return [];
      }
      return Object.entries(sessionsData).map(([id, sessionData]) => {
        const {
          activityId,
          activity,
          day,
          category,
          start,
          End,
          ...rest
        } = sessionData;

        return {
          ...rest,
          id,
          sportId: activityId,
          activityName: activity,
          dayOfWeek: mapDayStringToEnum(day),
          category: mapCategoryStringToEnum(category),
          startTime: start,
          endTime: End,
        };
      });
    }
    console.log("No sessions data found at /sessions path.");
    return [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
};

export const saveStudentSelections = async (studentId: string, selections: StudentSelection): Promise<void> => {
  if (!studentId) {
    console.error("Student ID is required to save selections.");
    return Promise.reject(new Error("Student ID is required."));
  }
  try {
    const selectionsRef = ref(database, `selections/${studentId}`);
    await set(selectionsRef, selections); // Using the ref function from firebase/database
    console.log(`Selections saved for student ${studentId}:`, selections);
  } catch (error) {
    console.error(`Error saving selections for student ${studentId}:`, error);
    return Promise.reject(error); // Ensure this rejects the promise on error
  }
};

// Example usage (optional, for testing during development)
// ... (existing example usage comments)
