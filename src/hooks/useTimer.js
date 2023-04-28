import { useEffect } from 'react';

export default function useTimer(setTimer, timerActive) {
  useEffect(() => {
    if (!timerActive) return;
    const intervalId = setInterval(() => {
      setTimer((prev) => ({
        start: !prev?.start ? new Date() : prev.start,
        current: new Date(),
      }));
    }, 1000);
    // eslint-disable-next-line consistent-return
    return () => clearInterval(intervalId);
  }, [timerActive]);
}
