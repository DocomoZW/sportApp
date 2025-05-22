"use client";

import React from 'react';
import { Sport, StudentSelection, SportCategoryName } from '@/lib/types'; // Ensure SportCategoryName is imported if used for categoryName prop type
import SportCard from './SportCard';

interface SportCategoryDisplayProps {
  categoryName: string; // User-friendly display name, e.g., "Category 1 Sport (Major Sports)"
  // categoryKey: SportCategoryName; // The key like "Red", "Green", etc. if needed for filtering, or assume sports are pre-filtered
  sports: Sport[];
  selectedSportIds: StudentSelection; // This is { [activityId: string]: true; }
  onToggleSportSelect: (sportId: string, isSelected: boolean) => void;
}

export default function SportCategoryDisplay({
  categoryName,
  sports,
  selectedSportIds,
  onToggleSportSelect,
}: SportCategoryDisplayProps) {
  // Assuming `sports` prop is already filtered for this specific category.
  // If not, an additional filter step would be needed here based on `categoryKey`.

  return (
    <div className="mb-8 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
        {categoryName}
      </h2>
      {sports.length === 0 ? (
        <p className="text-gray-500 italic">No sports available in this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map(sport => (
            <SportCard
              key={sport.id}
              sport={sport}
              isSelected={!!selectedSportIds[sport.id]} // Check if sport.id exists as a key
              onToggleSelect={onToggleSportSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
