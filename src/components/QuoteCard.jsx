import React from "react";

const QuoteCard = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-2">
      <span className="text-2xl text-blue-500 font-serif leading-none">“</span>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed -mt-2">
        The way to get started is to quit talking and begin doing.
      </p>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        — Walt Disney
      </p>
    </div>
  );
};

export default QuoteCard;