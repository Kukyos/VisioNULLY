
import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import DevTestingPage from './pages/DevTestingPage';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('DASHBOARD');

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden selection:bg-white selection:text-black">
      {view === 'DASHBOARD' ? (
        <DashboardPage onNavigateDemo={() => setView('DEMO')} />
      ) : (
        <DevTestingPage onBack={() => setView('DASHBOARD')} />
      )}
    </div>
  );
};

export default App;
