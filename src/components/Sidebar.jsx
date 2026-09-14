import React from "react";

function Sidebar({
  isOpen,
  setIsOpen,
  activeFilter,
  setActiveFilter,
  selectedProject,
  setSelectedProject,
  userProfile,
  onAvatarUpload,
  onOpenProfileModal,
}) {
  const projects = [
    { name: "Personal", color: "bg-blue-500" },
    { name: "Work", color: "bg-purple-500" },
    { name: "Study", color: "bg-emerald-500" },
    { name: "Shopping", color: "bg-amber-500" },
    { name: "Fitness", color: "bg-rose-500" },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container - Controlled by isOpen on all screen sizes */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-300 z-40 flex flex-col justify-between p-4 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:-translate-x-64"
        }`}
      >
        <div className="space-y-6">
          {/* Header / App Logo */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                ✓
              </div>
              <span className="font-bold text-lg text-white tracking-wide">
                Taskify
              </span>
            </div>
            
            {/* Collapse/Close Toggle Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation Filters */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Filters
            </p>
            {[
              { id: "all", label: "All Tasks", icon: "📋" },
              { id: "active", label: "Active", icon: "⏳" },
              { id: "completed", label: "Completed", icon: "✅" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveFilter(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === item.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Projects
            </p>
            <button
              onClick={() => {
                setSelectedProject("all");
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedProject === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>All Projects</span>
            </button>

            {projects.map((proj) => (
              <button
                key={proj.name}
                onClick={() => {
                  setSelectedProject(proj.name.toLowerCase());
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedProject.toLowerCase() === proj.name.toLowerCase()
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${proj.color}`} />
                <span>{proj.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Card */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <label
                htmlFor="avatar-input"
                className="relative cursor-pointer shrink-0"
                title="Change Avatar"
              >
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-500">
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "D"}
                  </div>
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={onAvatarUpload}
                  className="hidden"
                />
              </label>

              <div
                onClick={onOpenProfileModal}
                className="cursor-pointer overflow-hidden flex-1"
                title="Click to edit name or email"
              >
                <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {userProfile.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  {userProfile.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenProfileModal}
              className="text-slate-400 hover:text-blue-400 text-xs p-1 transition-colors"
              title="Edit Profile"
            >
              ✏️
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;