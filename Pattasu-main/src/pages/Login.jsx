import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Flame, Lock, Mail, ChevronRight, AlertTriangle } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorStatus, setErrorStatus] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorStatus(null);
    if (!email || !password) {
      setErrorStatus("Please enter your registered credentials.");
      return;
    }
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErrorStatus(e.message || "Failed to authenticate dashboard login.");
    }
  };

  const fillCredentials = (role) => {
    if (role === "admin") {
      setEmail("admin@gmail.com");
      setPassword("admin");
    } else {
      setEmail("staff@gmail.com");
      setPassword("staff");
    }
    setErrorStatus(null);
  };

  return (
    <div className="min-h-screen bg-[#07121f] text-slate-100 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:flex flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-500/10 px-4 py-2 text-sm text-sky-200 ring-1 ring-sky-400/15">
              <Flame className="w-4 h-4 text-sky-300" />
              Pyrotech Billing Workspace
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">A modern ERP interface for your billing and inventory.</h1>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                Sign in to access a redesigned dashboard with sharper controls, richer analytics, and a polished workflow for retail, transport, and purchasing operations.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-700/80 bg-slate-900/80 p-6 text-slate-300">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Demo Credentials</p>
            <p className="mt-3 text-sm text-slate-200">Admin: <span className="font-semibold text-white">admin@gmail.com / admin</span></p>
            <p className="mt-2 text-sm text-slate-200">Staff: <span className="font-semibold text-white">staff@gmail.com / staff</span></p>
            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span>Use the quick buttons below to populate credentials.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
                <span>One-click login directly to the dashboard.</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Designed for smoother inventory management.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] border border-white/10 p-8 sm:p-10 shadow-2xl shadow-slate-950/30">
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200 border border-slate-700/70">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-500 text-white">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Pyrotech Staff Portal</p>
                <p className="mt-1 text-base font-semibold text-white">Secure workspace access</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white">Sign in to your account</h2>
              <p className="text-sm leading-6 text-slate-400">Enter your registered email and passkey to view the dashboard.</p>
            </div>
          </div>

          {errorStatus && (
            <div className="mt-6 flex items-center gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorStatus}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email-input" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-[1.5rem] border border-slate-700/80 bg-slate-950/90 py-4 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password-input" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Secret Passkey
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[1.5rem] border border-slate-700/80 bg-slate-950/90 py-4 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-[1.75rem] bg-gradient-to-r from-sky-500 to-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Authenticating…" : "Sign In to Workspace"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-slate-700/70 pt-6 text-sm text-slate-400">
            <p className="mb-4 uppercase tracking-[0.24em] text-xs text-slate-500">Quick login</p>
            <div className="flex flex-wrap gap-3">
              <button
                id="autofill-admin-credentials"
                type="button"
                onClick={() => fillCredentials("admin")}
                className="rounded-3xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                Admin credentials
              </button>
              <button
                id="autofill-staff-credentials"
                type="button"
                onClick={() => fillCredentials("staff")}
                className="rounded-3xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                Staff credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
