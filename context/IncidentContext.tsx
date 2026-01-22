import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FallIncident } from '../components/FallIncidentQueue';

interface IncidentContextType {
  incidents: FallIncident[];
  addIncident: (incident: FallIncident) => void;
  verifyIncident: (incidentId: string, notes: string) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within IncidentProvider');
  }
  return context;
};

interface IncidentProviderProps {
  children: ReactNode;
}

export const IncidentProvider: React.FC<IncidentProviderProps> = ({ children }) => {
  const [incidents, setIncidents] = useState<FallIncident[]>([]);

  const addIncident = (incident: FallIncident) => {
    setIncidents(prev => [incident, ...prev]);
  };

  const verifyIncident = (incidentId: string, notes: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: 'verified', 
            reviewedAt: new Date().toLocaleTimeString(),
            notes 
          }
        : incident
    ));
  };

  return (
    <IncidentContext.Provider value={{ incidents, addIncident, verifyIncident }}>
      {children}
    </IncidentContext.Provider>
  );
};
