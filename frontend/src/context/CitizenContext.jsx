import React, { createContext, useState, useContext, useEffect } from 'react';

const CitizenContext = createContext();

export const CitizenProvider = ({ children }) => {
  const [citizenData, setCitizenData] = useState(() => {
    const saved = localStorage.getItem('citizenData');
    return saved ? JSON.parse(saved) : null;
  });

  const setCitizen = (userData) => {
    // Detect if this is the demo user
    const isDemo = userData.email === 'user@gmail.com';
    const data = { 
      profile: userData, 
      eligibleSchemes: userData.eligibleSchemes || [], 
      totalBenefits: userData.totalBenefits || "₹0", 
      isDemo 
    };
    setCitizenData(data);
    localStorage.setItem('citizenData', JSON.stringify(data));
  };

  const loadDemoCitizen = (profile, eligibleSchemes, totalBenefits) => {
    const data = { 
      profile, 
      eligibleSchemes: eligibleSchemes || [], 
      totalBenefits: totalBenefits || "₹0", 
      isDemo: true 
    };
    setCitizenData(data);
    localStorage.setItem('citizenData', JSON.stringify(data));
  };



  const updateCitizen = (updates) => {
    const data = { ...citizenData, profile: { ...citizenData.profile, ...updates } };
    setCitizenData(data);
    localStorage.setItem('citizenData', JSON.stringify(data));
  };

  const clearCitizen = () => {
    setCitizenData(null);
    localStorage.removeItem('citizenData');
  };

  return (
    <CitizenContext.Provider value={{ citizenData, setCitizen, updateCitizen, loadDemoCitizen, clearCitizen }}>

      {children}
    </CitizenContext.Provider>
  );
};

export const useCitizen = () => useContext(CitizenContext);

