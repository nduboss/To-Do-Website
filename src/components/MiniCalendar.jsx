import React, { useState } from "react";

const MiniCalendar = ({ todos }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar matrix
  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const hasTask = todos?.some((t) => t.due_date === dateStr);
    const isToday =
      new Date().toDateString() === new Date(year, month, d).toDateString();

    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      hasTask,
      isToday,
    });
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={prevMonth}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
          >
            ‹
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-slate-400 gap-y-1">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>

        {calendarDays.map((item, idx) => (
          <div
            key={idx}
            className={`py-1 text-xs flex flex-col items-center justify-center relative rounded-lg ${
              !item.isCurrentMonth
                ? "text-slate-300 dark:text-slate-600"
                : item.isToday
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            <span>{item.day}</span>
            {item.hasTask && !item.isToday && (
              <span className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;