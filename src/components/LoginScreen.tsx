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



import { signIn } from "next-auth/react";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  function handleLogin() {
    setIsLoading(true);
    signIn("google");
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

            <div className="space-y-5">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 py-4 text-sm font-black tracking-wider text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin text-slate-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Redirecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>SIGN IN WITH GOOGLE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
