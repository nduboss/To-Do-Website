import React, { useState, useEffect } from "react";

/**
 * Calculates remaining time relative to an end-of-day deadline or explicit target date.
 */
export default function TaskTimer({ dueDate, completed }) {
  const [timeLeft, setTimeLeft] = useState({ totalMs: 0, hours: 0, minutes: 0, seconds: 0 });
  const [initialDuration, setInitialDuration] = useState(1);

  useEffect(() => {
    if (!dueDate || Number(completed) === 1) return;

    // Set deadline to 23:59:59 on the due date
    const [year, month, day] = dueDate.split("-").map(Number);
    const deadline = new Date(year, month - 1, day, 23, 59, 59).getTime();

    // Estimate initial duration starting from 24h prior to deadline
    const startWindow = deadline - 24 * 60 * 60 * 1000;
    const totalWindow = deadline - startWindow;
    setInitialDuration(totalWindow);

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft({ totalMs: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ totalMs: difference, hours, minutes, seconds });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [dueDate, completed]);

  if (Number(completed) === 1) return null;

  const isExpired = timeLeft.totalMs <= 0;

  // Calculate remaining percentage (100% full at start, 0% when time runs out)
  const remainingRatio = Math.min(Math.max(timeLeft.totalMs / initialDuration, 0), 1);
  const percentage = Math.round(remainingRatio * 100);

  // Dynamic progress color: Green (>50%) -> Yellow (20-50%) -> Red (<20%)
  const getProgressBarColor = () => {
    if (percentage > 50) return "bg-emerald-500";
    if (percentage > 20) return "bg-amber-500";
    return "bg-rose-500 animate-pulse";
  };

  const formatUnit = (num) => String(num).padStart(2, "0");

  return (
    <div className="w-full mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-sans font-medium">
          ⏱️ {isExpired ? "Time's Up!" : "Time Remaining:"}
        </span>
        <span className={`font-bold ${isExpired ? "text-rose-500" : "text-slate-700 dark:text-slate-200"}`}>
          {isExpired
            ? "00h 00m 00s"
            : `${formatUnit(timeLeft.hours)}h ${formatUnit(timeLeft.minutes)}m ${formatUnit(timeLeft.seconds)}s`}
        </span>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-linear ${getProgressBarColor()}`}
          style={{ width: `${isExpired ? 0 : percentage}%` }}
        />
      </div>
    </div>
  );
}