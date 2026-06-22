"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import LoginScreen from "@/components/LoginScreen";
import Icon from "@/components/Icon";

const TABS = ["Categories", "Activities", "Fields", "AcademicYears"] as const;
type TabName = (typeof TABS)[number];

const TAB_COPY: Record<TabName, { label: string; hint: string }> = {
  Categories: {
    label: "PMS Categories",
    hint: "Columns: Category, MaxMarks",
  },
  Activities: {
    label: "Activities",
    hint: "Columns: Category, Section, Activity, NBA, SubCriterion, Guidance",
  },
  Fields: {
    label: "Form Fields",
    hint: "Columns: Activity, FieldName, Label, Type, Required, FullWidth, Disabled, Options, HelperText, Placeholder, Pattern, Min, Max, Step",
  },
  AcademicYears: {
    label: "Academic Years",
    hint: "Columns: Year (e.g. 2021-22)",
  },
};

type RawRows = Record<TabName, Record<string, string>[]>;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/admin/check-access")
      .then((res) => (res.ok ? res.json() : { isAdmin: false }))
      .then((data) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setAccessChecked(true));
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <svg className="h-8 w-8 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <LoginScreen />;
  }

  if (!accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <svg className="h-8 w-8 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Icon name="lock" className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Admin access required</h1>
        <p className="max-w-sm text-sm font-medium text-gray-500">
          {session?.user?.email} isn&apos;t on the admin list for this AccredX instance.
        </p>
        <a
          href="/"
          className="mt-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
        >
          Back to dashboard
        </a>
      </div>
    );
  }

  return <AdminConsole userEmail={session?.user?.email || ""} />;
}

function AdminConsole({ userEmail }: { userEmail: string }) {
  const [activeTab, setActiveTab] = useState<TabName>("AcademicYears");
  const [rawRows, setRawRows] = useState<RawRows | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  async function loadConfig() {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
      const json = await res.json();
      if (!json.rawRows) {
        setLoadError(
          json.reason || "The live config sheet isn't returning raw rows yet."
        );
        return;
      }
      setRawRows(json.rawRows as RawRows);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load config.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  const rows = rawRows?.[activeTab] ?? [];
  const headers =
    rows.length > 0
      ? Object.keys(rows[0])
      : activeTab === "AcademicYears"
      ? ["Year"]
      : activeTab === "Categories"
      ? ["Category", "MaxMarks"]
      : activeTab === "Activities"
      ? ["Category", "Section", "Activity", "NBA", "SubCriterion", "Guidance"]
      : [
          "Activity",
          "FieldName",
          "Label",
          "Type",
          "Required",
          "FullWidth",
          "Disabled",
          "Options",
          "HelperText",
          "Placeholder",
          "Pattern",
          "Min",
          "Max",
          "Step",
        ];

  function switchTab(tab: TabName) {
    setActiveTab(tab);
    setFormValues({});
    setStatusMessage("");
  }

  async function handleAddRow() {
    if (headers.every((header) => !formValues[header]?.trim())) {
      setStatusMessage("Fill in at least one field before adding a row.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Adding row...");
    try {
      const row = headers.map((header) => formValues[header] || "");
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab, row }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Could not add row.");

      setFormValues({});
      setStatusMessage("Row added. It's now live for every user.");
      await loadConfig();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not add row.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRow(row: Record<string, string>) {
    const confirmed = window.confirm(
      "Delete this row? It will disappear from the live site for every user."
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    setStatusMessage("Deleting row...");
    try {
      const matchCriteria: Record<string, string> = {};
      // Match on every non-empty cell so we hit the exact row, not a partial.
      headers.forEach((header) => {
        if (row[header]?.trim()) matchCriteria[header] = row[header];
      });

      const res = await fetch(
        `/api/config?tab=${encodeURIComponent(activeTab)}&match=${encodeURIComponent(
          JSON.stringify(matchCriteria)
        )}`,
        { method: "DELETE" }
      );
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Could not delete row.");

      setStatusMessage("Row deleted.");
      await loadConfig();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not delete row.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-red-100 bg-gradient-to-r from-red-600 to-red-500 px-6 py-6 text-white md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Icon name="shield" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-xs font-medium text-red-100">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Back to app
            </a>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        <p className="mb-6 text-sm font-medium text-gray-500">
          Add or remove categories, activities, form fields, and academic years.
          Changes save to the live config sheet and apply to every signed-in user immediately — no code changes or redeploys needed.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                activeTab === tab
                  ? "bg-red-600 text-white shadow-lg shadow-red-100"
                  : "border border-red-100 bg-white text-gray-700 hover:bg-red-50"
              }`}
            >
              {TAB_COPY[tab].label}
            </button>
          ))}
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm font-medium text-gray-500">Loading live config…</p>
        ) : (
          <>
            {/* Add row */}
            <div className="mb-8 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-black uppercase tracking-wide text-red-700">
                Add to {TAB_COPY[activeTab].label}
              </h2>
              <p className="mb-4 text-xs font-medium text-gray-400">{TAB_COPY[activeTab].hint}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {headers.map((header) => (
                  <div key={header}>
                    <label className="mb-1 block text-xs font-bold text-gray-600">
                      {header}
                    </label>
                    <input
                      type="text"
                      value={formValues[header] || ""}
                      onChange={(event) =>
                        setFormValues((current) => ({ ...current, [header]: event.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                disabled={isSubmitting}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                <Icon name="plus" className="h-4 w-4" />
                Add row
              </button>

              {statusMessage && (
                <p className="mt-3 text-sm font-semibold text-gray-600">{statusMessage}</p>
              )}
            </div>

            {/* Existing rows */}
            <div className="rounded-2xl border border-red-100 bg-white shadow-sm">
              <h2 className="border-b border-red-50 px-5 py-4 text-sm font-black uppercase tracking-wide text-gray-700">
                Existing rows ({rows.length})
              </h2>

              {rows.length === 0 ? (
                <p className="px-5 py-6 text-sm font-medium text-gray-400">
                  Nothing here yet — add the first row above.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-red-50 text-xs font-bold uppercase text-gray-400">
                        {headers.map((header) => (
                          <th key={header} className="px-5 py-3 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index} className="border-b border-gray-50 last:border-0">
                          {headers.map((header) => (
                            <td key={header} className="px-5 py-3 text-gray-700 max-w-xs truncate">
                              {row[header] || "—"}
                            </td>
                          ))}
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row)}
                              disabled={isSubmitting}
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                              aria-label="Delete row"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
