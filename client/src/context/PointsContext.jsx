import React, { createContext, useContext, useState, useCallback } from 'react';

const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const [pointsEnabled, setPointsEnabled] = useState(() => {
    const stored = localStorage.getItem('pointsEnabled');
    return stored === null ? true : stored === 'true'; // default ON
  });

  const togglePoints = useCallback(() => {
    setPointsEnabled(prev => {
      const next = !prev;
      localStorage.setItem('pointsEnabled', String(next));
      return next;
    });
  }, []);

  return (
    <PointsContext.Provider value={{ pointsEnabled, togglePoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => useContext(PointsContext);
