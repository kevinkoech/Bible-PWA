import React, { useState } from 'react';

interface AlertDialogProps {
  triggerText: string;
  children: React.ReactNode;
}

export const AlertDialog = ({ triggerText, children }: AlertDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        {triggerText}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            {children}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // call the inner action (should be passed as child button)
                  setOpen(false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
