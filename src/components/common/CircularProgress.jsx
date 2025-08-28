import React from 'react';

const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
  // 限制percentage的最大值为100，确保进度条不会超过100%
  const clampedPercentage = Math.min(percentage, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="circular-progress-container">
      <svg
        className="circular-progress"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="circular-progress-background"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="circular-progress-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="circular-progress-text">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

export default CircularProgress;