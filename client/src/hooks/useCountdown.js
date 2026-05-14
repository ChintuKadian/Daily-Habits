import { useState, useEffect } from 'react';

const useCountdown = (deadline) => {
  const [msRemaining, setMsRemaining] = useState(0);

  useEffect(() => {
    const target = new Date(deadline).getTime();

    const update = () => {
      setMsRemaining(target - Date.now());
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const absMs = Math.abs(msRemaining);
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((absMs % (1000 * 60)) / 1000);

  const isOverdue = msRemaining <= 0;

  return { msRemaining, days, hours, mins, secs, isOverdue };
};

export default useCountdown;
