import { useState, useEffect } from 'react';
import { Client } from '../../App';
import DemographicsView from '../DemographicsView';

type DemographicsTabProps = {
  client: Client;
};

export function DemographicsTab({ client }: DemographicsTabProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  // Listen for settings toggle event from ClientFolder
  useEffect(() => {
    const handleToggle = () => {
      setShowSettings((prev: boolean) => !prev);
    };
    
    window.addEventListener('toggleDemographicsSettings', handleToggle);
    return () => window.removeEventListener('toggleDemographicsSettings', handleToggle);
  }, []);

  return (
    <DemographicsView 
      client={client}
      showSettings={showSettings}
      onSettingsToggle={() => setShowSettings((prev: boolean) => !prev)}
      hideProfileHeader={false}
    />
  );
}
