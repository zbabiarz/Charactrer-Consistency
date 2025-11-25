import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h3 className="text-xl font-bold text-white mb-2">Generating Masterpiece</h3>
      <p className="text-slate-300 text-center max-w-md animate-pulse">
        Our AI artists are studying your character and preparing the scene. This might take a moment.
      </p>
    </div>
  );
};