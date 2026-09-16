import React, { useState } from "react";

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {daysArray.map((day) => {
          const currentIsToday = isToday(day);
          return (
            <div
              key={day}
              className={`py-1.5 rounded-xl font-medium transition-colors ${
                currentIsToday
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}