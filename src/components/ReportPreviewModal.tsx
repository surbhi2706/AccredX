"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import type { UserProfile } from "@/components/LoginScreen";

type SavedActivity = {
  id: number;
  academicYear: string;
  pmsCategory: string;
  activityType: string;
  data: Record<string, string>;
  evidenceFileName: string;
  createdAt: string;
};

type ReportPreviewModalProps = {
  reportType: "PMS Report" | "NBA Summary" | "Annual Report";
  activities: SavedActivity[];
  user: UserProfile;
  onClose: () => void;
};

// NBA Criteria mapping helper
const getNBACriteria = (category: string) => {
  switch (category) {
    case "Teaching, Learning & Evaluation":
      return { code: "Criteria 2", name: "Teaching-Learning Processes" };
    case "Research & Academic Contributions":
      return { code: "Criteria 5", name: "Faculty Contributions & Research" };
    case "Institution Building & Professional Development":
      return { code: "Criteria 8", name: "Institutional Support & FDPs" };
    case "Administrative / Committee Work":
      return { code: "Criteria 8", name: "Governance & Committee Roles" };
    case "Award / Recognition":
      return { code: "Criteria 5", name: "Faculty Achievements" };
    case "Skill Enhancement & Miscellaneous":
      return { code: "Criteria 5", name: "Self-Enhancement Certifications" };
    default:
      return { code: "Criteria 1", name: "General Compliance" };
  }
};

const getNBASectionCode = (criterionCode: string, pmsCategory: string): string => {
  const code = (criterionCode || "").trim();
  if (code.includes("2") || code.includes("3")) return "Criteria 2";
  if (code.includes("4") || code.includes("5")) return "Criteria 5";
  if (code.includes("6") || code.includes("7") || code.includes("8")) return "Criteria 8";
  
  // Fallback to category level mapping
  const cat = pmsCategory || "";
  if (cat.includes("Teaching")) return "Criteria 2";
  if (cat.includes("Research") || cat.includes("Skill") || cat.includes("Award")) return "Criteria 5";
  if (cat.includes("Institution") || cat.includes("Administrative")) return "Criteria 8";
  return "Criteria 2";
};

export default function ReportPreviewModal({
  reportType,
  activities,
  user,
  onClose,
}: ReportPreviewModalProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All Years");

  // Get distinct academic years from activities
  const academicYears = ["All Years", ...Array.from(new Set(activities.map((a) => a.academicYear))).sort()];

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (selectedYear === "All Years") return true;
    return act.academicYear === selectedYear;
  });

  // Calculate PMS score
  const pmsPointsPerActivity = 5;
  const totalPMSPoints = filteredActivities.length * pmsPointsPerActivity;

  // Group by Category for PMS
  const pmsGroups = filteredActivities.reduce<Record<string, SavedActivity[]>>((groups, act) => {
    if (!groups[act.pmsCategory]) {
      groups[act.pmsCategory] = [];
    }
    groups[act.pmsCategory].push(act);
    return groups;
  }, {});

  // Group by NBA Criteria
  const nbaCriteriaList = [
    { code: "Criteria 2", title: "Teaching-Learning Processes", keyCat: "Teaching, Learning & Evaluation" },
    { code: "Criteria 5", title: "Faculty Contributions & Research", keyCat: "Research & Academic Contributions" },
    { code: "Criteria 8", title: "Institutional Support & Governance", keyCat: "Institution Building & Professional Development" },
  ];

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    const headers = [
      "Activity ID",
      "Academic Year",
      "PMS Category",
      "Activity Type",
      "Details Summary",
      "Evidence Attached",
      "Submission Date",
    ];

    const rows = filteredActivities.map((act) => {
      const details = Object.entries(act.data)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1")}: ${v}`)
        .join(" | ");

      return [
        act.id,
        act.academicYear,
        act.pmsCategory,
        act.activityType,
        details,
        act.evidenceFileName || "No proof attached",
        act.createdAt,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join(
        "\n"
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType.replace(/\s+/g, "_")}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm md:p-6 no-print">
      {/* Injected Print Stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
            }
          }
        `,
        }}
      />

      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl">
        
        {/* Modal Controls Header */}
        <header className="flex flex-col gap-4 border-b border-gray-100 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Icon name="chart" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Report Live Preview
              </h2>
              <p className="text-xs font-semibold text-gray-500">
                Review and output {reportType}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter select */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-xs font-bold text-gray-800 outline-none hover:border-red-200 focus:border-red-650"
              >
                {academicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>

            {/* CSV button */}
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-slate-50"
            >
              <Icon name="upload" className="h-4 w-4 text-gray-500" />
              Export CSV
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-150 transition hover:bg-red-700"
            >
              <Icon name="check" className="h-4 w-4" />
              Print / PDF
            </button>

            {/* Divider */}
            <span className="h-6 w-px bg-gray-200 mx-1"></span>

            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-250 bg-white text-gray-500 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Close modal"
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
        </header>

        {/* Modal Scroll Content (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 print-container">
          <div id="printable-report-area" className="mx-auto max-w-4xl border border-gray-100 bg-white p-6 shadow-sm rounded-2xl md:p-8">
            
            {/* Institution Header */}
            <div className="border-b-2 border-red-700 pb-5 text-center">
              <h1 className="text-xl font-black uppercase tracking-wider text-red-700">
                AccredX Institute of Technology
              </h1>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                Office of Faculty Development and Quality Assurance
              </p>
              <h2 className="mt-4 text-2xl font-black text-slate-800 tracking-tight">
                {reportType === "PMS Report" && "Faculty Performance Measurement System (PMS) Report"}
                {reportType === "NBA Summary" && "National Board of Accreditation (NBA) Summary Portfolio"}
                {reportType === "Annual Report" && "Annual Faculty Activity Report"}
              </h2>
              <div className="mt-2 text-xs font-bold text-gray-400">
                Report Filter: <span className="text-gray-700 font-extrabold">{selectedYear}</span>
              </div>
            </div>

            {/* Profile Section */}
            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Faculty Name
                </p>
                <p className="font-extrabold text-slate-900 mt-0.5">{user.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Designation
                </p>
                <p className="font-bold text-slate-700 mt-0.5">{user.designation}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Department
                </p>
                <p className="font-bold text-slate-700 mt-0.5">{user.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Employee ID
                </p>
                <p className="font-bold text-slate-700 mt-0.5">{user.employeeId}</p>
              </div>
            </div>

            {/* Dynamic Report Content based on Report Type */}
            {filteredActivities.length === 0 ? (
              <div className="my-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                  <Icon name="clipboard" className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-800">
                  No Activities Recorded
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  There are no saved activities for the selected filters. Add activities from the portal to populate this report.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                
                {/* 1. PMS REPORT LAYOUT */}
                {reportType === "PMS Report" && (
                  <>
                    {/* Points summary card */}
                    <div className="flex items-center justify-between rounded-xl bg-red-50/50 p-4 border border-red-100">
                      <div>
                        <h4 className="text-sm font-black text-red-800">
                          Estimated Self-Assessment Credits
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Calculated based on {filteredActivities.length} activities ({pmsPointsPerActivity} points each)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-red-700">
                          {totalPMSPoints}
                        </span>
                        <span className="text-xs font-bold text-red-400 block mt-0.5">Points</span>
                      </div>
                    </div>

                    {/* Table group by category */}
                    {Object.keys(pmsGroups).map((categoryName) => (
                      <div key={categoryName} className="space-y-3">
                        <h3 className="border-b border-red-150 pb-2 text-md font-black text-red-700 uppercase tracking-wide">
                          {categoryName}
                        </h3>

                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-gray-400 font-extrabold uppercase">
                              <th className="py-2.5 font-black">Activity Type</th>
                              <th className="py-2.5 font-black">Details</th>
                              <th className="py-2.5 font-black w-24 text-center">Academic Year</th>
                              <th className="py-2.5 font-black w-20 text-center font-bold">Credits</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pmsGroups[categoryName].map((act) => (
                              <tr key={act.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
                                <td className="py-3 font-extrabold text-slate-800 align-top">
                                  {act.activityType}
                                </td>
                                <td className="py-3 align-top">
                                  {Object.entries(act.data).map(([key, val]) => {
                                    const label = key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase());
                                    return (
                                      <div key={key} className="mt-0.5 text-gray-600">
                                        <span className="font-black text-slate-800">{label}:</span> {val}
                                      </div>
                                    );
                                  })}
                                  {act.evidenceFileName && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                      <Icon name="check" className="h-3 w-3" />
                                      Evidence: {act.evidenceFileName}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 text-center align-top font-bold text-slate-500">
                                  {act.academicYear}
                                </td>
                                <td className="py-3 text-center align-top font-black text-slate-800">
                                  {pmsPointsPerActivity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </>
                )}

                {/* 2. NBA SUMMARY LAYOUT */}
                {reportType === "NBA Summary" && (
                  <>
                    {/* Compliance matrix checklist */}
                    <div className="space-y-4">
                      <h3 className="text-md font-black text-slate-850 uppercase tracking-wide border-b border-slate-200 pb-2">
                        NBA Alignment & Assessment Matrix
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {nbaCriteriaList.map((crit) => {
                          const matchingActs = filteredActivities.filter(
                            (act) => getNBASectionCode(act.data.nbaCriterion, act.pmsCategory) === crit.code
                          );
                          const isCompliant = matchingActs.length > 0;

                          return (
                            <div
                              key={crit.code}
                              className={`rounded-2xl border p-4 shadow-sm ${
                                isCompliant
                                  ? "border-emerald-100 bg-emerald-50/20"
                                  : "border-amber-100 bg-amber-50/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${
                                  isCompliant ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                }`}>
                                  {crit.code}
                                </span>
                                <span className={`text-xs font-black ${
                                  isCompliant ? "text-emerald-700" : "text-amber-700"
                                }`}>
                                  {isCompliant ? "Compliant" : "No Activity"}
                                </span>
                              </div>
                              <h4 className="mt-3 font-extrabold text-sm text-slate-800 leading-tight">
                                {crit.title}
                              </h4>
                              <p className="mt-2 text-xs font-semibold text-gray-500">
                                {matchingActs.length} activity entries mapped.
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed mapping list */}
                      <div className="mt-6 space-y-4">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                          NBA Criteria Mapping Table
                        </h4>

                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-gray-400 font-extrabold uppercase">
                              <th className="py-2.5 font-black w-28">NBA Criteria</th>
                              <th className="py-2.5 font-black">Accreditation Element</th>
                              <th className="py-2.5 font-black">Mapped Activity details</th>
                              <th className="py-2.5 font-black w-24 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredActivities.map((act) => {
                              const criteria = getNBACriteria(act.pmsCategory);
                              const displayCode = act.data.nbaCriterion || criteria.code;
                              const displayName = act.data.nbaSubCriterion || criteria.name;
                              return (
                                <tr key={act.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
                                  <td className="py-3 font-black text-red-700 align-top">
                                    {displayCode}
                                  </td>
                                  <td className="py-3 font-extrabold text-slate-800 align-top pr-3">
                                    {displayName}
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{act.activityType}</p>
                                  </td>
                                  <td className="py-3 align-top text-gray-600">
                                    <div className="text-xs">
                                      {Object.entries(act.data).slice(0, 3).map(([key, val]) => (
                                        <span key={key} className="mr-3 inline-block">
                                          <span className="font-bold text-slate-700">{key.replace(/([A-Z])/g, " $1")}:</span> {val}
                                        </span>
                                      ))}
                                    </div>
                                    {act.evidenceFileName && (
                                      <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Evidence Mapped: {act.evidenceFileName}</p>
                                    )}
                                  </td>
                                  <td className="py-3 text-center align-top">
                                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                                      Audited
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. ANNUAL REPORT LAYOUT */}
                {reportType === "Annual Report" && (
                  <div className="space-y-6">
                    <h3 className="text-md font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">
                      Academic Activities Timeline
                    </h3>

                    <div className="relative border-l-2 border-red-200 ml-3 pl-6 space-y-8 py-2">
                      {filteredActivities.map((act) => (
                        <div key={act.id} className="relative">
                          {/* Timeline node */}
                          <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 ring-4 ring-white">
                            <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h4 className="text-base font-black text-slate-800 leading-tight">
                                {act.activityType}
                              </h4>
                              <span className="text-xs font-bold text-red-650 bg-red-50/60 px-2.5 py-0.5 rounded-full mt-1 sm:mt-0 w-max">
                                {act.academicYear}
                              </span>
                            </div>
                            
                            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                              PMS Section: {act.pmsCategory}
                            </p>

                            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                              <table className="w-full text-xs border-collapse">
                                <tbody>
                                  {Object.entries(act.data).map(([key, val]) => {
                                    const label = key
                                      .replace(/([A-Z])/g, " $1")
                                      .replace(/^./, (str) => str.toUpperCase());
                                    return (
                                      <tr key={key} className="border-b border-slate-100/60 last:border-b-0">
                                        <td className="py-1.5 font-bold text-gray-500 w-1/3">{label}</td>
                                        <td className="py-1.5 font-bold text-slate-800">{val}</td>
                                      </tr>
                                    );
                                  })}
                                  {act.evidenceFileName && (
                                    <tr>
                                      <td className="py-1.5 font-bold text-gray-500">Supporting Evidence</td>
                                      <td className="py-1.5 font-bold text-emerald-700">
                                        🔗 {act.evidenceFileName} (Verified Compliance)
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Official Report Footer */}
            <div className="mt-16 border-t border-gray-200 pt-8 text-center text-[10px] font-bold text-gray-400">
              <p>This is a computer-generated summary compile from the AccredX Institutional Repository.</p>
              <p className="mt-1">Generated by user {user.name} (ID: {user.employeeId}) on {new Date().toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date().toLocaleTimeString("en-IN")}.</p>
              <div className="mt-6 flex justify-center gap-20">
                <div className="w-40 border-t border-gray-300 pt-2 mt-8">
                  Faculty Signature
                </div>
                <div className="w-40 border-t border-gray-300 pt-2 mt-8">
                  HOD Signature / Approval
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
