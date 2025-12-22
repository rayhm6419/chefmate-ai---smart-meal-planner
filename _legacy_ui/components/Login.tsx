import React, { useState } from "react";
import { useAuth } from "../services/auth/AuthProvider";

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      console.error("Auth failed", err);
      setError("Authentication failed. Please check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">{mode === "login" ? "Sign in" : "Create account"}</h1>
          <button
            className="text-sm underline"
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg px-3 py-2 text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-lg px-3 py-2 text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-200">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-400 text-slate-900 rounded-lg py-2 font-semibold hover:bg-amber-300 transition disabled:opacity-70"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <p className="text-xs text-white/60 mt-6 text-center">
          Your session is stored securely in Keychain. Restart the app to verify persistent login.
        </p>
      </div>
    </div>
  );
};

export default Login;
