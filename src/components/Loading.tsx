import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-4">
          <Loader2 
            className="w-12 h-12 text-green-600 animate-spin" 
            strokeWidth={2.5}
          />
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold text-neutralral-800">
              Loading Content
            </h2>
            <p className="text-sm text-neutralral-500 font-medium animate-pulse">
              Please wait a moment...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;