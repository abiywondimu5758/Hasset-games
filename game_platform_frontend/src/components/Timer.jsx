/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';

const CountdownTimer = ({ time, initialTime,color = '#263238' }) => {
  const [percent, setPercent] = useState(100); // Start progress at 100%

  useEffect(() => {
    // Calculate the percentage based on the remaining time
    const newPercent = (time / initialTime) * 100;
    setPercent(newPercent);
  }, [time, initialTime]); // Update whenever the `time` prop changes

  return (
    <div className="flex justify-center items-center bg-opacity-70 rounded-md w-full">
      {/* Seconds with circular progress */}
      <div className="relative flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
        {/* SVG Circle */}
        <svg className="absolute inset-0" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            className="text-green-300"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            cx="18"
            cy="18"
            r="16"
          />
          {/* Progress circle */}
          <circle
            className={`text-${color} transition-all`}
            strokeDasharray="100" // Full circumference
            strokeDashoffset={100 - (100 * percent) / 100} // Animate progress based on `time` prop
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            cx="18"
            cy="18"
            r="16"
          />
        </svg>
        {/* Time left display */}
        <p className={`text-${color} font-semibold text-[16px] sm:text-[18px]`}>{time || 0}</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
