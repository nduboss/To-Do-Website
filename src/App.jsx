import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MiniCalendar from "./components/MiniCalendar";
import QuoteCard from "./components/QuoteCard";
import LandingPage from "./components/LandingPage";
import AuthModal from "./components/AuthModal";
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

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    return savedProfile
      ? JSON.parse(savedProfile)
      : { name: "Daniel", email: "daniel@example.com", avatarUrl: "" };
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });

  const [project, setProject] = useState("Personal");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(getTodayString());

  const [editingTodo, setEditingTodo] = useState(null);

  const handleLogin = (user) => {
    setAuthUser(user);
    localStorage.setItem("authUser", JSON.stringify(user));

    const updatedProfile = {
      ...userProfile,
      name: user.name,
      email: user.email,
    };
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

    setIsAuthModalOpen(false);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("authUser");
    setCurrentView("landing");
  };

  const handleOpenDashboard = () => {
    if (authUser) {
      setCurrentView("dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedProfile = { ...userProfile, avatarUrl: reader.result };
      setUserProfile(updatedProfile);
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    };
    reader.readAsDataURL(file);
  };

  const openProfileModal = () => {
    setProfileForm({ name: userProfile.name, email: userProfile.email });
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;

    const updatedProfile = {
      ...userProfile,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    setIsProfileModalOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const payload = {
      task: taskInput,
      project: project,
      priority: priority,
      due_date: dueDate,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setTaskInput("");
      setDueDate(getTodayString());
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleToggleTodo = async (id, currentStatus) => {
    const newStatus = Number(currentStatus) === 1 ? 0 : 1;

    try {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: newStatus }),
      });

      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: newStatus } : todo,
        ),
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTodo.task.trim()) return;

    try {
      await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTodo),
      });

      setTodos(
        todos.map((todo) => (todo.id === editingTodo.id ? editingTodo : todo)),
      );
      setEditingTodo(null);
    } catch (err) {
      console.error("Error saving edit:", err);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const todayTasks = todos.filter(
    (t) => t.due_date === getTodayString() && Number(t.completed) === 0,
  );
  const overdueTasks = todos.filter((t) =>
    isTaskOverdue(t.due_date, t.completed),
  );
  const totalAlertsCount = overdueTasks.length + todayTasks.length;
  const overdueCount = overdueTasks.length;

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
          onClose={() => setIsAuthModalOpen(false)}
        />
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
            onAvatarUpload={handleAvatarChange}
            onOpenProfileModal={openProfileModal}
          />

          <main className="flex-1 p-4 md:p-8 w-full min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row gap-8 transition-colors duration-200">
            <div className="flex-1 space-y-6">
              {/* Header Bar */}
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
                      <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                        Good Morning, {userProfile.name}! 👋
                      </h1>
                      <button
                        onClick={openProfileModal}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors"
                        title="Edit Profile Details"
                      >
                        
                      </button>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Here is what you have on your plate today.
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

              {/* Task Input Form */}
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

              {/* Filter Pills Header */}
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

              {/* Task Feed */}
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
                    const itemPriority = todo.priority || "medium";
                    const overdue = isTaskOverdue(
                      todo.due_date,
                      todo.completed,
                    );

                    return (
                      <div
                        key={todo.id}
                        className={`flex flex-wrap sm:flex-nowrap items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl border shadow-sm transition-all duration-200 animate-fade-in ${
                          overdue
                            ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20"
                            : "border-slate-100 dark:border-slate-700/60"
                        } ${
                          Number(todo.completed) === 1
                            ? "opacity-60 bg-slate-50/50 dark:bg-slate-800/50"
                            : "hover:border-slate-200 dark:hover:border-slate-600"
                        }`}
                      >
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

                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold transition-all ${
                                Number(todo.completed) === 1
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-800 dark:text-slate-100"
                              }`}
                            >
                              {todo.task || todo.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`w-2 h-2 rounded-sm ${color.bg}`}
                              />
                              <span
                                className={`text-xs font-medium ${color.text}`}
                              >
                                {itemProject}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2 sm:mt-0 ml-auto sm:ml-0">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize transition-colors ${
                              itemPriority === "high"
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400"
                                : itemPriority === "medium"
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400"
                                  : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400"
                            }`}
                          >
                            {itemPriority}
                          </span>

                          <span
                            className={`text-xs font-medium min-w-[65px] text-right ${
                              overdue
                                ? "text-rose-500 dark:text-rose-400 font-bold"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {overdue
                              ? "Overdue"
                              : formatDynamicDate(todo.due_date)}
                          </span>

                          <button
                            type="button"
                            onClick={() => setEditingTodo(todo)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors p-1"
                            title="Edit Task"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors p-1"
                            title="Delete Task"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sidebar Overview Widget */}
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Overview
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {todos.length}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Active
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {todos.filter((t) => Number(t.completed) === 0).length}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-1">
                      {todos.filter((t) => Number(t.completed) === 1).length}
                    </p>
                  </div>
                  <div
                    onClick={() => setSelectedProject("overdue")}
                    className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                  >
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Overdue
                    </p>
                    <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 mt-1">
                      {overdueCount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Progress
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {todos.length > 0
                        ? Math.round(
                            (todos.filter((t) => Number(t.completed) === 1)
                              .length /
                              todos.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${
                          todos.length > 0
                            ? (todos.filter((t) => Number(t.completed) === 1)
                                .length /
                                todos.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <MiniCalendar todos={todos} />
              <QuoteCard />
            </div>
          </main>

          {/* Edit Profile Modal */}
          {isProfileModalOpen && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    Edit Profile
                  </h3>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Task Modal */}
          {editingTodo && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    Edit Task
                  </h3>
                  <button
                    onClick={() => setEditingTodo(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Task Description
                    </label>
                    <input
                      type="text"
                      value={editingTodo.task || editingTodo.title || ""}
                      onChange={(e) =>
                        setEditingTodo({ ...editingTodo, task: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Project
                      </label>
                      <select
                        value={
                          editingTodo.project ||
                          editingTodo.category ||
                          "Personal"
                        }
                        onChange={(e) =>
                          setEditingTodo({
                            ...editingTodo,
                            project: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Work">Work</option>
                        <option value="Study">Study</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Fitness">Fitness</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Priority
                      </label>
                      <select
                        value={editingTodo.priority || "medium"}
                        onChange={(e) =>
                          setEditingTodo({
                            ...editingTodo,
                            priority: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editingTodo.due_date || ""}
                      onChange={(e) =>
                        setEditingTodo({
                          ...editingTodo,
                          due_date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTodo(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
