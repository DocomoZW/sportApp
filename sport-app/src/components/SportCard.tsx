"use client";

import React from 'react';
import { Sport } from '@/lib/types';

interface SportCardProps {
  sport: Sport;
  isSelected: boolean;
  onToggleSelect: (sportId: string, isSelected: boolean) => void;
}

export default function SportCard({ sport, isSelected, onToggleSelect }: SportCardProps) {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleSelect(sport.id, event.target.checked);
  };

  return (
    <div className={`p-4 border rounded-lg shadow-sm transition-all duration-200 ease-in-out 
                    ${isSelected ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white hover:shadow-md'}`}>
      <div className="flex items-center space-x-3">
        {/* Placeholder for Sport Icon */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
          Icon
        </div>

        <div className="flex-grow">
          <h3 className={`font-semibold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
            {sport.name}
          </h3>
          <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
            Category: {sport.category}
          </p>
          {sport.location && (
            <p className={`text-xs ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
              Location: {sport.location}
            </p>
          )}
        </div>

        <div className="ml-auto flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="form-checkbox h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition duration-150 ease-in-out cursor-pointer"
            aria-labelledby={`sport-name-${sport.id}`}
          />
          <label htmlFor={`sport-name-${sport.id}`} id={`sport-name-${sport.id}`} className="sr-only">
            Select {sport.name}
          </label>
        </div>
      </div>
    </div>
  );
}
