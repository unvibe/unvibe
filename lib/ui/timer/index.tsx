import React, { memo, useEffect, useRef, useState } from 'react';

export interface TimerProps {
  startTime: number; // in ms
  isEnded: boolean;
  className?: string;
}

function pad(n: number, width: number = 2) {
  const z = '0';
  const str = n + '';
  return str.length >= width
    ? str
    : new Array(width - str.length + 1).join(z) + str;
}

export const Timer: React.FC<TimerProps> = ({
  startTime,
  isEnded,
  className,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isEnded) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    function tick() {
      setNow(Date.now());
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isEnded]);

  const elapsed = Math.max(0, (isEnded ? now : Date.now()) - startTime);
  const totalSeconds = Math.floor(elapsed / 1000);
  const msms = pad(Math.floor((elapsed % 1000) / 10), 2); // two digits

  let display = '';
  let unit = 's';
  if (totalSeconds < 60) {
    // Format: ss.ms + 's', both two digits
    display = `${pad(totalSeconds)}.${msms}`;
    unit = 's';
  } else {
    // Format: mm.ss + 'm', both two digits
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    display = `${pad(minutes)}.${pad(seconds)}`;
    unit = 'm';
  }

  return (
    <span className={className}>
      {display}
      {unit}
    </span>
  );
};

export default memo(Timer);
