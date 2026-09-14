import React, { useState } from "react";

const AuthModal = ({ onLogin, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);

    const endpoint = isSignUp ? "?action=signup" : "?action=login";
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`http://localhost/todo-api/api.php${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      onLogin(data.user);
    } catch (err) {
      console.error("Auth Error:", err);
      alert("Server error. Check PHP connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm"
        >
          ✕
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            ✓
          </div>
          <h2 className="text-xl font-extrabold tracking-tight pt-2">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? "Sign up to start organizing your tasks"
              : "Enter your credentials to access your dashboard"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daniel"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="daniel@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95 mt-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 font-semibold hover:underline"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;