import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MiniCalendar from "./components/MiniCalendar";
import QuoteCard from "./components/QuoteCard";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
import TaskTimer from "./components/TaskTimer";
import "material-icons/iconfont/material-icons.css";

const API_URL = "http://localhost/todo-api/api.php";

const getTodayString = () => new Date().toISOString().split("T")[0];

const formatDynamicDate = (dateStr) => {
  if (!dateStr || dateStr === "Today") return "Today";

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const isTaskOverdue = (dateStr, completed) => {
  if (!dateStr || Number(completed) === 1) return false;

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(year, month - 1, day);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate < today;
};

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : { id: 1, name: "NDUKA DANIEL WILLIAMS", email: "danielnduka45@gmail.com" };
  });

  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) return JSON.parse(savedProfile);

    const savedUser = localStorage.getItem("authUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        name: user.name || "NDUKA DANIEL WILLIAMS",
        email: user.email || "danielnduka45@gmail.com",
        avatarUrl: user.avatarUrl || user.avatar || "",
      };
    }
    return { name: "NDUKA DANIEL WILLIAMS", email: "danielnduka45@gmail.com", avatarUrl: "" };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  const handleOpenProfileModal = () => {
    setProfileForm({ name: userProfile.name, email: userProfile.email });
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      ...userProfile,
      name: profileForm.name,
      email: profileForm.email,
    };

    setUserProfile(updated);
    localStorage.setItem("userProfile", JSON.stringify(updated));

    if (authUser) {
      const updatedAuth = {
        ...authUser,
        name: profileForm.name,
        email: profileForm.email,
      };
      setAuthUser(updatedAuth);
      localStorage.setItem("authUser", JSON.stringify(updatedAuth));

      try {
        await fetch(`${API_URL}?action=update_profile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: authUser.id,
            name: profileForm.name,
            email: profileForm.email,
          }),
        });
      } catch (err) {
        console.error("Error updating profile on server:", err);
      }
    }
    setIsProfileModalOpen(false);
  };

  const [project, setProject] = useState("Personal");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(getTodayString());

  const handleLogin = (user) => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setAuthUser(user);
      localStorage.setItem("authUser", JSON.stringify(user));

      const freshProfile = {
        name: user.name || "User",
        email: user.email || "user@example.com",
        avatarUrl: user.avatarUrl || user.avatar || "",
      };
      setUserProfile(freshProfile);
      localStorage.setItem("userProfile", JSON.stringify(freshProfile));

      setIsLoggingIn(false);
      setIsAuthModalOpen(false);
      setCurrentView("dashboard");
    }, 1000);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setUserProfile({ name: "", email: "", avatarUrl: "" });
    localStorage.removeItem("authUser");
    localStorage.removeItem("userProfile");
    setCurrentView("landing");
  };

  const handleOpenDashboard = () => {
    if (authUser) {
      setCurrentView("dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [authUser]);

  const fetchTodos = async () => {
    const userId = authUser ? authUser.id : 1;
    try {
      const res = await fetch(`${API_URL}?action=get_tasks&user_id=${userId}`);
      if (!res.ok) throw new Error("API server returned error");
      const data = await res.json();

      setTodos(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTodos([]);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const userId = authUser ? authUser.id : 1;
    const currentSelectedProject = project;

    const payload = {
      user_id: userId,
      title: taskInput.trim(),
      project: currentSelectedProject,
      priority: priority,
      due_date: dueDate,
    };

    try {
      const res = await fetch(`${API_URL}?action=add_task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      const newTask = data.task
        ? {
            ...data.task,
            project: currentSelectedProject,
            priority: priority,
            due_date: dueDate,
          }
        : {
            id: Date.now(),
            task: taskInput.trim(),
            title: taskInput.trim(),
            project: currentSelectedProject,
            priority: priority,
            due_date: dueDate,
            completed: 0,
          };

      setTodos((prevTodos) => [newTask, ...prevTodos]);
      setTaskInput("");
      setDueDate(getTodayString());
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleToggleTodo = async (id, currentCompleted) => {
    try {
      const res = await fetch(`${API_URL}?action=toggle_task`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          completed: !currentCompleted,
        }),
      });
      const data = await res.json();

      if (data.success || res.ok) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id ? { ...todo, completed: !currentCompleted } : todo
          )
        );
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}?action=delete_task&id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success || res.ok) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const todayTasks = todos.filter(
    (t) => t.due_date === getTodayString() && Number(t.completed) === 0
  );
  const overdueTasks = todos.filter((t) =>
    isTaskOverdue(t.due_date, t.completed)
  );
  const completedTasks = todos.filter((t) => Number(t.completed) === 1);
  const activeTasks = todos.filter((t) => Number(t.completed) === 0);
  const totalAlertsCount = overdueTasks.length + todayTasks.length;

  const progressPercentage = todos.length > 0 ? Math.round((completedTasks.length / todos.length) * 100) : 0;

  const filteredTodos = todos.filter((todo) => {
    const statusMatch =
      filter === "all"
        ? true
        : filter === "active"
        ? Number(todo.completed) === 0
        : Number(todo.completed) === 1;

    const itemProject = todo.project || todo.category || "Personal";
    const projectMatch =
      selectedProject === "all"
        ? true
        : selectedProject === "overdue"
        ? isTaskOverdue(todo.due_date, todo.completed)
        : itemProject.toLowerCase() === selectedProject.toLowerCase();

    const taskText = todo.task || todo.title || "";
    const searchMatch = taskText
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return statusMatch && projectMatch && searchMatch;
  });

  return (
    <>
      {currentView === "landing" && (
        <LandingPage onGetStarted={handleOpenDashboard} />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onLogin={handleLogin}
          isLoading={isLoggingIn}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Edit Profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentView === "dashboard" && authUser && (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-x-hidden font-sans transition-colors duration-200">
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            activeFilter={filter}
            setActiveFilter={setFilter}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            userProfile={userProfile}
            onOpenProfileModal={handleOpenProfileModal}
          />

          <main className="flex-1 p-4 md:p-8 w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row gap-8 transition-colors duration-200">
            {/* Left Content Column */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    title="Toggle Sidebar"
                  >
                    ☰
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white uppercase">
                        Good morning, {userProfile.name.split(" ")[0]}! 👋
                      </h1>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Here's what's on your plate today.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  >
                    Log Out
                  </button>

                  <div className="relative flex-1 sm:flex-none">
                    <span className="left-3 absolute top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors text-base"
                    title={
                      isDarkMode
                        ? "Switch to Light Mode"
                        : "Switch to Dark Mode"
                    }
                  >
                    {isDarkMode ? "☀️" : "🌙"}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      className="relative p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                      title="Notifications"
                    >
                      🔔
                      {totalAlertsCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                          {totalAlertsCount}
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <>
                        <div
                          onClick={() => setIsNotificationsOpen(false)}
                          className="fixed inset-0 z-40"
                        />

                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 p-4 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              Notifications
                            </h4>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
                              {totalAlertsCount} New
                            </span>
                          </div>

                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {totalAlertsCount === 0 ? (
                              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                                No new alerts. You're all set! 🎉
                              </p>
                            ) : (
                              <>
                                {overdueTasks.map((t) => (
                                  <div
                                    key={t.id}
                                    onClick={() => {
                                      setSelectedProject("overdue");
                                      setIsNotificationsOpen(false);
                                    }}
                                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 cursor-pointer hover:opacity-90 transition-opacity"
                                  >
                                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                                      ⚠️ Overdue: {t.task || t.title}
                                    </p>
                                    <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-0.5">
                                      Due date: {t.due_date}
                                    </p>
                                  </div>
                                ))}

                                {todayTasks.map((t) => (
                                  <div
                                    key={t.id}
                                    onClick={() => {
                                      setFilter("active");
                                      setIsNotificationsOpen(false);
                                    }}
                                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 cursor-pointer hover:opacity-90 transition-opacity"
                                  >
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                      ⏳ Due Today: {t.task || t.title}
                                    </p>
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                      Priority: {t.priority || "medium"}
                                    </p>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Creation Form */}
              <form
                onSubmit={handleAddTodo}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none px-2 py-1"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Study">Study</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Fitness">Fitness</option>
                    </select>

                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 rounded-lg px-2 py-1 focus:outline-none font-medium cursor-pointer"
                    />

                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95 ml-auto sm:ml-0"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </form>

              {/* Task Header Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {selectedProject !== "all"
                      ? `${selectedProject} Tasks`
                      : "Tasks"}
                  </h2>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all">
                    {filteredTodos.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
                  {["all", "active", "completed"].map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                        filter === tab
                          ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {filteredTodos.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-2xl border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center justify-center space-y-3 animate-fade-in shadow-sm">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-xl sm:text-2xl border border-slate-100 dark:border-slate-600">
                      {searchQuery ? "🔍" : "✨"}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200">
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : "All caught up!"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                        {searchQuery
                          ? "Try checking for typos or clear your search query."
                          : "There are no tasks to display in this view."}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredTodos.map((todo) => {
                    const projectColors = {
                      Work: {
                        text: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-500",
                      },
                      Personal: {
                        text: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-500",
                      },
                      Study: {
                        text: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-500",
                      },
                      Shopping: {
                        text: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-500",
                      },
                      Fitness: {
                        text: "text-rose-600 dark:text-rose-400",
                        bg: "bg-rose-500",
                      },
                    };

                    const itemProject =
                      todo.project || todo.category || "Personal";
                    const color = projectColors[itemProject] || {
                      text: "text-slate-500 dark:text-slate-400",
                      bg: "bg-slate-400",
                    };
                    const overdue = isTaskOverdue(
                      todo.due_date,
                      todo.completed
                    );

                    return (
                      <div
                        key={todo.id}
                        className={`flex flex-col p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl border shadow-sm transition-all duration-200 animate-fade-in ${
                          overdue
                            ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20"
                            : "border-slate-100 dark:border-slate-700/60"
                        } ${
                          Number(todo.completed) === 1
                            ? "opacity-60 bg-slate-50/50 dark:bg-slate-800/50"
                            : "hover:border-slate-200 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full">
                          <div className="flex items-center gap-3 flex-1 min-w-[200px] mr-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleTodo(todo.id, todo.completed)
                              }
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                Number(todo.completed) === 1
                                  ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                                  : "border-slate-300 dark:border-slate-600 hover:border-blue-500"
                              }`}
                            >
                              {Number(todo.completed) === 1 && (
                                <span className="text-xs font-bold">✓</span>
                              )}
                            </button>
                            <span
                              className={`text-sm font-medium ${
                                Number(todo.completed) === 1
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {todo.task || todo.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${color.text} bg-slate-100 dark:bg-slate-700`}
                            >
                              {itemProject}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {formatDynamicDate(todo.due_date)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {/* Integrated Task Timer directly inside active tasks */}
                        {Number(todo.completed) === 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60">
                            <TaskTimer dueDate={todo.due_date} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Sidebar Widget Column */}
            <div className="w-full lg:w-80 space-y-6 shrink-0">
              {/* Overview Metrics Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Overview
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Your current task metrics
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                    {progressPercentage}% Completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Active
                    </p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                      {activeTasks.length}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Done
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {completedTasks.length}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Overdue
                    </p>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      {overdueTasks.length}
                    </p>
                  </div>
                </div>
              </div>

              <MiniCalendar />
              <QuoteCard />
            </div>
          </main>
        </div>
      )}
    </>
  );
}