"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Icon from "@/components/Icon";

export type UserProfile = {
  email: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  academicYear: string;
};

const demoUsers: Record<string, UserProfile & { passwordHash: string }> = {
  "faculty@college.edu": {
    email: "faculty@college.edu",
    passwordHash: "password",
    name: "Dr. Sarah Jenkins",
    employeeId: "FAC-2025-001",
    designation: "Assistant Professor",
    department: "Department of Computer Science",
    academicYear: "2025-26",
  },
  "jane.doe@college.edu": {
    email: "jane.doe@college.edu",
    passwordHash: "password",
    name: "Dr. Jane Doe",
    employeeId: "FAC-2025-002",
    designation: "Associate Professor",
    department: "Department of Electrical Engineering",
    academicYear: "2025-26",
  },
  "admin@college.edu": {
    email: "admin@college.edu",
    passwordHash: "password",
    name: "Admin User",
    employeeId: "ADM-2025-001",
    designation: "Portal Administrator",
    department: "Department of Administration",
    academicYear: "2025-26",
  },
};

type LoginScreenProps = {
  onLogin: (user: UserProfile) => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate network latency (800ms)
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const matchedUser = demoUsers[normalizedEmail];

      if (matchedUser && password === matchedUser.passwordHash) {
        // Success
        const { passwordHash, ...profile } = matchedUser;
        onLogin(profile);
      } else {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    }, 850);
  }

  function handleFillCredentials(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100 via-white to-slate-100 p-4 font-sans text-slate-900 md:p-8">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-red-100/50 bg-white/70 shadow-[0_32px_100px_rgba(127,29,29,0.06)] backdrop-blur-xl md:grid md:grid-cols-12">
        
        {/* Left Col: Info / Welcome Panel */}
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-red-700 via-red-600 to-rose-700 p-8 text-white md:col-span-5 md:p-12">
          {/* Decorative light effects */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-red-800/30 blur-3xl"></div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 shadow-inner backdrop-blur-md">
              <Icon name="shield" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">AccredX</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-200">
                Institutional Portal
              </p>
            </div>
          </div>

          <div className="relative z-10 my-12">
            <h2 className="text-3xl font-black leading-tight tracking-tight md:text-4xl">
              Accreditation Compliance & Faculty Records
            </h2>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-red-100">
              Simplify PMS reporting, NBA compliance matching, and NAAC self-study reports. One click, permanent availability.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-md">
            <Icon name="lock" className="h-5 w-5 text-emerald-300" />
            <div className="text-xs">
              <p className="font-extrabold text-white">Encrypted Workspace</p>
              <p className="font-medium text-red-100/90 mt-0.5">SSL Secured Academic Vault</p>
            </div>
          </div>
        </div>

        {/* Right Col: Login Form Panel */}
        <div className="flex flex-col justify-between p-8 md:col-span-7 md:p-12">
          <div>
            <div className="mb-8">
              <h3 className="text-3xl font-black tracking-tight text-slate-900">
                Welcome Back
              </h3>
              <p className="mt-2 text-sm font-bold text-slate-400">
                Please enter your credentials to access your workspace.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700 ring-1 ring-rose-100">
                <Icon name="info" className="h-5 w-5 shrink-0 text-rose-600" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2"
                >
                  Faculty Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Icon name="user" className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-red-200 focus:border-red-600 focus:ring-4 focus:ring-red-50"
                    placeholder="name@college.edu"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password-field"
                    className="block text-xs font-black uppercase tracking-wider text-slate-500"
                  >
                    Portal Password
                  </label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Icon name="lock" className="h-4.5 w-4.5" />
                  </div>
                  <input
                    id="password-field"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-red-200 focus:border-red-600 focus:ring-4 focus:ring-red-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <span className="text-xs font-black tracking-tight text-red-600">HIDE</span>
                    ) : (
                      <span className="text-xs font-black tracking-tight text-slate-500">SHOW</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-slate-500">
                    Keep me signed in
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-4 text-sm font-black tracking-wider text-white shadow-lg shadow-red-100 transition hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>LOG IN TO PORTAL</span>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Logins Container */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Demo Faculty Accounts
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {Object.keys(demoUsers).map((demoEmail) => {
                const name = demoUsers[demoEmail].name.split(" ").slice(-1)[0];
                const dept = demoUsers[demoEmail].department.includes("Computer") ? "CS" : demoUsers[demoEmail].department.includes("Electrical") ? "EE" : "Admin";
                return (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => handleFillCredentials(demoEmail)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50/30 px-3 py-2 text-[11px] font-bold text-red-700 transition hover:bg-red-50 active:scale-95"
                  >
                    <span>{name} ({dept})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
