import React from "react";

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
            ✓
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          Log In / Open App
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center space-y-8 flex-1 justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Powered by React + PHP REST API
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Organize your tasks with effortless clarity and focus.
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
          TaskFlow gives you an intuitive space to manage daily priorities, monitor progress, and crush your goals with built-in dark mode and real-time alerts.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started Free ➔
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full pt-16">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <h3 className="font-bold text-base text-slate-100">Smart Prioritization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Categorize tasks by priority and project tags so you always focus on what matters most.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
              📊
            </div>
            <h3 className="font-bold text-base text-slate-100">Progress Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time progress overview, dynamic completion percentages, and built-in overdue indicators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
              🔔
            </div>
            <h3 className="font-bold text-base text-slate-100">Alert System</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never miss a deadline with instant task reminders and automatic overdue flagging.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} TaskFlow. Built with React & Tailwind CSS.
      </footer>
    </div>
  );
};

export default LandingPage;