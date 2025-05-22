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

  const IconCmp = sport.Icon; // Get the icon component from the sport object

  return (
    <div className={`p-4 border rounded-lg shadow-sm transition-all duration-200 ease-in-out 
                    ${isSelected ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white hover:shadow-md'}`}>
      <div className="flex items-center space-x-3">
        {/* Render Sport Icon if IconCmp exists */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center 
                        ${isSelected ? 'bg-blue-100' : 'bg-gray-100'} 
                        text-gray-600 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          {IconCmp ? (
            <IconCmp className="w-6 h-6" /> // Adjust size as needed, e.g., w-6 h-6 or w-8 h-8
          ) : (
            <span className="text-sm">Icon</span> // Fallback text if no icon component
          )}
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
