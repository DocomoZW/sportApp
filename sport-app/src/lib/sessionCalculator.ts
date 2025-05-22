import { Student, Sport, Session, StudentSelection, SportCategoryName } from './types';

export const calculateTotalWeeklySessions = (
  student: Student | null,
  studentSelections: StudentSelection,
  allSports: Sport[],
  allSessions: Session[]
): number => {
  if (!student) {
    console.debug("SessionCalculator: No student provided, returning 0 sessions.");
    return 0;
  }

  const selectedSportIds = Object.keys(studentSelections);
  if (selectedSportIds.length === 0) {
    console.debug("SessionCalculator: No sports selected, returning 0 sessions.");
    return 0;
  }

  let totalSessions = 0;
  const studentAgeGroup = student.ageGroup; // e.g., "Under 16"
  console.debug(`SessionCalculator: Calculating for student ${student.name}, Age Group: ${studentAgeGroup}`);
  console.debug("SessionCalculator: Selected sport IDs:", selectedSportIds);

  for (const sportId of selectedSportIds) {
    const sport = allSports.find(s => s.id === sportId);
    if (!sport) {
      console.warn(`SessionCalculator: Sport with ID ${sportId} not found in allSports. Skipping.`);
      continue;
    }

    console.debug(`SessionCalculator: Processing sport: ${sport.name} (Category: ${sport.category})`);
    const relevantSessions = allSessions.filter(ses => ses.sportId === sportId);
    console.debug(`SessionCalculator: Found ${relevantSessions.length} sessions for sport ${sport.name}.`);

    for (const session of relevantSessions) {
      console.debug(`SessionCalculator: Evaluating session: ID=${session.id}, Type=${session.type}, SessionAgeGroup=${session.ageGroup}, SportCategory=${sport.category}`);
      // Rule 1: Red category sports OR sessions with a specific session.ageGroup defined
      // For these, only sessions of type "Team" that match the student's ageGroup are counted.
      if (sport.category === 'Red' || session.ageGroup) {
        if (session.type === 'Team' && session.ageGroup === studentAgeGroup) {
          totalSessions++;
          console.debug(`SessionCalculator: Counted (Rule 1): Session ${session.id} for sport ${sport.name}. New total: ${totalSessions}`);
        } else {
          console.debug(`SessionCalculator: Not Counted (Rule 1 Failed): Session ${session.id} for sport ${sport.name}. Reason: Type is "${session.type}" (expected Team) or session age group "${session.ageGroup}" doesn't match student's "${studentAgeGroup}".`);
        }
      } else {
        // Rule 2: Other sports/sessions (not Red AND no specific session.ageGroup)
        // README: "rules are less restrictive". Assume they count as 1.
        // This means if a sport is not 'Red' and its sessions do not have a specific age group, all its sessions count.
        totalSessions++;
        console.debug(`SessionCalculator: Counted (Rule 2): Session ${session.id} for sport ${sport.name}. New total: ${totalSessions}`);
      }
    }
  }
  console.debug(`SessionCalculator: Final total weekly sessions for student ${student.name}: ${totalSessions}`);
  return totalSessions;
};
