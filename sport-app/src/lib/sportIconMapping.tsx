import React from 'react';
import {
  Activity, Users, Swords, Palette, HelpingHand, Bike, Fish, Bird, Drama, Music, Brain, Landmark, ShieldQuestion, CircleHelp,
  PersonStanding, Grip, Weight, Footprints, Goal, Target, Dumbbell, Sailboat, MountainSnow, Tent, Piano, Mic2, BookOpen, HandHeart, Users2, Puzzle
  // Add more specific Lucide icons as needed for further refinement
} from 'lucide-react';
import { SportFirebaseData } from './types'; // Correct path as types.ts is in the same lib folder

// Placeholder for custom SVG components - these would be actual React components if SVGs were available
// const BasketballIcon = () => <Dumbbell />; // Placeholder using a Lucide icon
// const FootballIcon = () => <Goal />;     // Placeholder using a Lucide icon

export const getSportIconCmp = (sport: SportFirebaseData): React.ComponentType<any> => {
  // Try dataAiHint first, then fall back to sport name, ensuring lowercase for matching
  const hint = sport.dataAiHint?.trim().toLowerCase() || sport.name?.trim().toLowerCase() || "";

  switch (hint) {
    // Specific examples based on potential dataAiHint values or sport names
    case 'archery': return Target;
    case 'athletics': return Footprints;
    case 'badminton': return Grip; // Placeholder, consider a shuttlecock icon if available or custom
    case 'basketball': return Dumbbell; // TODO: Replace with custom BasketballIcon or a more specific Lucide like 'Basketball' if it exists
    case 'chess': return Brain;
    case 'choir': return Music;
    case 'community service': return HelpingHand;
    case 'computer club': return Puzzle; // Placeholder, 'Laptop' or 'Code' might be alternatives
    case 'cricket': return Grip; // Placeholder
    case 'cycling': return Bike;
    case 'debate': return Users2;
    case 'drama': return Drama;
    case 'environmental club': return Bird; // 'Leaf', 'Tree' might also work
    case 'fencing': return Swords;
    case 'field hockey': return Goal; // Placeholder
    case 'fishing': return Fish;
    case 'football': return Goal; // TODO: Replace with custom FootballIcon
    case 'golf': return Target; // Placeholder, 'Golf' icon if available
    case 'hockey': return Goal; // Placeholder, 'Stick' or 'Puck' icon if available
    case 'horse riding': return PersonStanding; // Placeholder, find a 'Horse' icon or similar
    case 'karate': return PersonStanding; // Placeholder
    case 'marimba band': return Music;
    case 'netball': return Dumbbell; // Placeholder
    case 'orchestra': return Music; // 'Piano', 'Violin' icons could be used too
    case 'public speaking': return Mic2;
    case 'quiz club': return ShieldQuestion;
    case 'rowing': return Sailboat;
    case 'rugby': return Dumbbell; // Placeholder
    case 'soccer': return Goal; // Same as Football, consider specific 'SoccerBall' icon
    case 'squash': return Grip; // Placeholder
    case 'swimming': return Fish; // Placeholder, 'Waves' or a swimmer icon
    case 'table tennis': return Grip; // Placeholder
    case 'tennis': return Grip; // Placeholder, 'TennisBall' or 'Racquet' icon
    case 'volleyball': return Dumbbell; // Placeholder
    case 'water polo': return Fish; // Placeholder

    // General categories or less specific terms that might appear in names or hints
    case 'art': return Palette;
    case 'art club': return Palette;
    case 'book club': return BookOpen;
    case 'climbing': return MountainSnow; // Or 'RockClimbing' icon if available
    case 'club': return Users;
    case 'cultural': return Palette; // Or 'Landmark' for cultural heritage
    case 'expedition': return Tent; // Or 'Map'
    case 'major sport': return Landmark; 
    case 'minor sport': return Activity;
    case 'music': return Music;
    case 'piano lessons': return Piano;
    case 'service': return HandHeart;
    case 'social service': return HandHeart;
    case 'sport': return Activity; // General sport
    case 'team sport': return Users; // Default for team sports
    
    default:
      // Fallback for common keywords if a direct match isn't found
      if (hint.includes('music') || hint.includes('band') || hint.includes('choir')) return Music;
      if (hint.includes('art') || hint.includes('craft')) return Palette;
      if (hint.includes('service')) return HandHeart;
      if (hint.includes('club')) return Users;
      if (hint.includes('sport')) return Activity;
      if (hint.includes('team')) return Users;

      console.warn(`No specific icon found for sport hint: "${hint}". Using default icon (CircleHelp). Sport Name: "${sport.name}"`);
      return CircleHelp; // Default icon
  }
};
