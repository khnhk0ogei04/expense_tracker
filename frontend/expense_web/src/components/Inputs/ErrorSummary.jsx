import React from 'react';

const ErrorSummary = ({ errors, isVisible = false }) => {
  const errorList = Object.entries(errors).filter(([_, error]) => error);

  if (!isVisible || errorList.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center mb-2">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-medium text-red-800">
          Please fix the following errors:
        </h3>
      </div>
      <ul className="text-sm text-red-700 space-y-1">
        {errorList.map(([field, error]) => (
          <li key={field} className="flex items-start">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
            <span>
              <strong className="capitalize">{field === 'category' || field === 'source' ? (field === 'category' ? 'Category' : 'Income source') : field}:</strong> {error}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorSummary; 