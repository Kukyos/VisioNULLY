
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <i className="fas fa-shield-halved text-xl"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">EdgeGuard</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Privacy-First Safety</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-700">Edge Analysis Active</span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-2 text-slate-400">
          <i className="fas fa-microchip"></i>
          <span className="text-xs font-mono">RAM BUFFER ONLY</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
