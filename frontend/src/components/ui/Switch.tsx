import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, id }) => {
  return (
    <button
      id={id}
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};
