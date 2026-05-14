import React, { useEffect, useState } from 'react';

const PointsCounter = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const incrementTime = Math.abs(Math.floor(1000 / (end - start)));
    
    let timer = setInterval(() => {
      start += (end > start ? 1 : -1);
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime || 10);

    return () => clearInterval(timer);
  }, [value, displayValue]);

  return <span>{displayValue}</span>;
};

export default PointsCounter;
