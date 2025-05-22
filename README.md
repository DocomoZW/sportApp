# sportApp
Sport and Cultural Activity Selector
This app is designed to manage student sport selections, ensuring they meet specific compliance rules based on their age group. It has two main portals: one for students to make their selections and one for administrators to oversee compliance and view rosters.

Here's a breakdown:

1. Student Portal (Main Page - /): * Student Selection: Students (or their guardians) can select their name from a searchable dropdown list. * Dynamic Compliance Rules: Once a student is selected, the system loads specific compliance rules based on their age group (e.g., U14-U16, U17, U18-U20). These rules dictate minimum sports per category and total weekly sessions. * Sport Categories: Sports are organized into four color-coded categories with specific names: * Red: Category 1 Sport (Major Sports) * Green: Club/Skill (Cultural Clubs) * Blue: Category 2 Sport (Minor Sports) * Yellow: Service (Optional) * Sport Selection: Students can select/deselect sports within each category using interactive cards with checkboxes. Each sport card displays its name and an icon. * Real-time Feedback Toolbar: A sticky toolbar at the top (below the main header) displays: * The student selection dropdown. * "Pills" for each sport category showing the number of selected sports versus the required minimum (e.g., "Category 1 Sport: 1/2"). These pills are color-coded for quick compliance status (green if met, red if not). * A "Pill" showing the total selected weekly sessions versus the required minimum (e.g., "Sessions: 5/8"). * Session Calculation: The system calculates the total number of weekly sessions based on selected sports. This logic is quite specific: * For Red category sports and any sport session that has a specific ageGroup defined, only sessions of type "Team" that match the student's ageGroup are counted. "Social" or other types are ignored for these. * For other sports/sessions without a specific ageGroup or not in the Red category, the rules are less restrictive for session counting. * Submission: Students can submit their selections. The system allows submissions even if they are not fully compliant, but feedback is provided. * User Feedback: Toast notifications are used for actions like student changes, submission success/failure, and loading errors.

2. Admin Portal (/admin): * Navigation: Tabs for "Compliance Overview", "Student Details" (achieved by clicking on a student in the overview), and "Rosters". * Compliance Overview (/admin): * Displays a table of all students with their name, age group, and overall compliance status (Compliant/Non-Compliant). * Provides a link to view detailed selections for each student. * Student Details Page (/admin/students/[studentId]): * Shows a detailed breakdown of a specific student's selections. * Displays the student's age group and the applicable compliance rules. * Indicates overall compliance status and total selected sessions. * Lists selected sports, grouped by category, showing whether each category's requirement is met. * Sport Rosters Page (/admin/rosters): * Allows administrators to select a sport from a dropdown. * Displays a list of all students who have selected that particular sport.

3. Firebase Integration: * The app uses Firebase Realtime Database to store and retrieve all its data. * Data Fetching: Services are set up to fetch: * Students (/students) * Activities/Sports (/activities) * Student selections (/selections) * Weekly sessions for each activity (/sessions) * Data Updates: Student sport selections are saved back to the Firebase Realtime Database.

4. Technology & Styling: * Next.js: The app is built using the Next.js framework, utilizing its App Router. * TypeScript: For type safety and better code maintainability. * ShadCN UI & Tailwind CSS: For modern, pre-built UI components and utility-first styling. * Lucide Icons: For most icons, with custom SVGs for specific sports like Basketball and Football.

The application primarily interacts with data structured in your Firebase Realtime Database and maps it to TypeScript types defined in src/lib/types.ts.

1. Firebase Database Paths & Expected Structure:

/activities: Stores details for each sport/activity.

Each child key is an activity ID (e.g., activity-1).
Object structure:
{
  "name": "HORSE RIDING", // Name of the sport
  "category": "blue",      // Category, stored as lowercase (mapped to "Blue" in app)
  "categoryId": "1",       // Original category ID
  "staff": [ { "ageGroup": "", "name": "KTR" } ], // Staff info
  "dataAiHint": "horse riding" // Optional hint for image placeholders
}
/students: Stores details for each student.

Each child key is a unique student ID (Firebase key).
Object structure:
{
  "fname": "Rufaro Angela", // First name
  "surname": "Chengeta",    // Surname
  "ageGroup": "Under 16",   // Crucial for compliance rules
  "block": "B",
  "dob": "2009-04-20",
  "email": "mjmutenje@yahoo.co.uk",
  "house": "Sable",
  "id": "6",                // Original ID from data source
  "key": "B16",             // Original key from data source
  "tutorGroup": "1"
}
In the app, the Firebase key becomes Student.id, and Student.name is fname + " " + surname.
/selections: Stores which sports each student has selected.

Each child key is a student ID (from /students).
The value is an object where keys are activity IDs (from /activities) and values are true.
Example for one student:
{
  "student-firebase-key-1": {
    "activity-1": true,
    "activity-5": true
  }
}
/sessions: Stores details about when and how each activity/sport session occurs.

Each child key is a unique session ID.
Object structure:
{
  "End": "16:00:00",         // Session end time
  "activity": "BASKETBALL",  // Name of the activity (should match an activity in /activities)
  "activityId": "sport-2",   // ID of the activity (links to /activities)
  "ageGroup": "Under 14",    // Specific age group for this session, if any
  "category": "red",         // Category of the activity (lowercase)
  "day": "Monday",           // Day of the week
  "start": "15:20:00",       // Session start time
  "type": "Team"             // Type of session (e.g., "Team", "Social")
  // other fields like block, description, group, id, sessionNum, staff
}
2. Core TypeScript Types (from src/lib/types.ts):

SportCategoryName: An alias for "Red" | "Green" | "Blue" | "Yellow".
Sport: Represents an activity/sport in the application. Includes:
id: Firebase key of the activity.
name: Sport name.
category: SportCategoryName.
Icon: React component for the sport's icon.
dataAiHint: For image placeholders.
Other fields from SportFirebaseData.
Student: Represents a student in the application. Includes:
id: Firebase key of the student.
name: Combined first and last name.
ageGroup: Student's age group.
Other fields from StudentFirebaseData.
Session: Represents a weekly session for a sport. Includes:
id: Firebase key of the session.
sportId: ID of the sport this session belongs to.
activityName: Name of the activity.
dayOfWeek: Typed day (e.g., 'Monday').
startTime, endTime.
category: SportCategoryName.
ageGroup: Optional age group for the session.
type: Optional session type (e.g., "Team", "Social").
AgeGroupComplianceRules: Defines the structure for compliance rules for different age groups, including:
identifier: e.g., 'U14-U16'.
name: User-friendly rule set name.
description: UI display of rules.
minTotalSessions: Minimum total weekly sessions required.
categoryRules: An object mapping each SportCategoryName to its specific rules (e.g., minSports, isOptional).
customRuleValidator: An optional function for complex rules (like the U18-U20 "Red OR Blue" requirement).
The appDataService.ts file acts as an intermediary, fetching raw data via firebaseService.ts and often transforming or enriching it (e.g., mapping category strings, adding Icon components to sports) before it's used by the UI components. The compliance logic, defined in complianceRules.ts and used within appDataService.ts, is central to the app's functionality.

This setup allows for a clear separation of concerns, with Firebase interactions, data transformation, and UI rendering handled in distinct parts of the application.
