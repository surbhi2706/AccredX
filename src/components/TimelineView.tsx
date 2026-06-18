"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export type SavedActivity = {
  id: number;
  academicYear: string;
  pmsCategory: string;
  pmsSection: string;
  activityType: string;
  data: Record<string, string>;
  evidenceFileName: string;
  evidenceFileId: string;
  createdAt: string;
};

type TimelineViewProps = {
  activities: SavedActivity[];
};

type DocumentRecord = {
  id: number;
  name: string;
  uploadDate: string;
  timestamp: number;
  category: string;
  fileType: string;
  fileId?: string;
  academicYear: string;
  isMock: boolean;
  branch?: string;
};

const academicYears = ["2025-2026", "2024-2025", "2023-2024"] as const;

// Mock document data to be shown ONLY when no real documents exist in activities
const mockDocuments: DocumentRecord[] = [
  {
    id: 101,
    name: "NPTEL_Cloud_Computing_Certificate.pdf",
    uploadDate: "12 May 2026",
    timestamp: new Date("2026-05-12").getTime(),
    category: "Skill Enhancement & Miscellaneous",
    fileType: "PDF",
    academicYear: "2025-26",
    isMock: true,
    branch: "Information Technology (IT)",
  },
  {
    id: 102,
    name: "IEEE_IoT_Journal_Paper.pdf",
    uploadDate: "28 Apr 2026",
    timestamp: new Date("2026-04-28").getTime(),
    category: "Research & Academic Contributions",
    fileType: "PDF",
    academicYear: "2025-26",
    isMock: true,
    branch: "Computer Engineering (COMP)",
  },
  {
    id: 201,
    name: "FDP_AI_ML_Attendance_Certificate.pdf",
    uploadDate: "15 Jan 2025",
    timestamp: new Date("2025-01-15").getTime(),
    category: "Institution Building & Professional Development",
    fileType: "PDF",
    academicYear: "2024-25",
    isMock: true,
    branch: "Artificial Intelligence & Data Science (AIDS)",
  },
  {
    id: 202,
    name: "Expert_Lecture_Feedback_Report.pdf",
    uploadDate: "10 Oct 2024",
    timestamp: new Date("2024-10-10").getTime(),
    category: "Teaching, Learning & Evaluation",
    fileType: "PDF",
    academicYear: "2024-25",
    isMock: true,
    branch: "Electronics and Telecommunication Engineering (EXTC)",
  },
  {
    id: 301,
    name: "International_Conference_Participation.pdf",
    uploadDate: "18 Nov 2023",
    timestamp: new Date("2023-11-18").getTime(),
    category: "Research & Academic Contributions",
    fileType: "PDF",
    academicYear: "2023-24",
    isMock: true,
    branch: "Computer and Communication Systems (CCS)",
  },
  {
    id: 302,
    name: "Syllabus_Revision_Meeting_Minutes.pdf",
    uploadDate: "12 Aug 2023",
    timestamp: new Date("2023-08-12").getTime(),
    category: "Teaching, Learning & Evaluation",
    fileType: "PDF",
    academicYear: "2023-24",
    isMock: true,
    branch: "Information Technology (IT)",
  },
];

export default function TimelineView({ activities }: TimelineViewProps) {
  const [selectedYear, setSelectedYear] = useState<typeof academicYears[number]>("2025-2026");
  const [sortBy, setSortBy] = useState<string>("newest");

  // TODO: Connect this to a persistent database/backend fetch.
  // Currently, we process files uploaded in the active session stored in React state.
  const realDocuments: DocumentRecord[] = activities
    .filter((act) => act.evidenceFileName && act.evidenceFileId)
    .map((act) => ({
      id: act.id,
      name: act.evidenceFileName,
      uploadDate: act.createdAt,
      timestamp: act.id, // Timestamp of session upload
      category: act.pmsCategory,
      fileType: act.evidenceFileName.split(".").pop()?.toUpperCase() || "FILE",
      fileId: act.evidenceFileId,
      academicYear: act.academicYear,
      isMock: false,
      branch: (act as any).branch || "General",
    }));

  // PRIORITY RULE: Use real activity data first. Show mock data ONLY when no real documents exist.
  const hasRealDocs = realDocuments.length > 0;
  const activeDocPool = hasRealDocs ? realDocuments : mockDocuments;

  const getShortYear = (y: string) => {
    if (y === "2025-2026" || y === "2025-26") return "2025-26";
    if (y === "2024-2025" || y === "2024-25") return "2024-25";
    if (y === "2023-2024" || y === "2023-24") return "2023-24";
    return y;
  };

  const filteredDocs = activeDocPool.filter(
    (doc) => getShortYear(doc.academicYear) === getShortYear(selectedYear)
  );

  // Apply sorting AFTER academic year filtering
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "newest") {
      return b.timestamp - a.timestamp;
    }
    if (sortBy === "oldest") {
      return a.timestamp - b.timestamp;
    }
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "filetype") {
      return a.fileType.localeCompare(b.fileType);
    }
    return 0;
  });

  // Extract Month + Year grouping string
  const getMonthYear = (dateStr: string) => {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      return `${parts[1]} ${parts[2]}`;
    }
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const monthName = date.toLocaleString("en-IN", { month: "short" });
      const yearVal = date.getFullYear();
      return `${monthName} ${yearVal}`;
    }
    return "Unknown Date";
  };

  // Group documents by Month + Year
  const groupsMap: Record<string, DocumentRecord[]> = {};
  const groupTimestamps: Record<string, number> = {};

  for (const doc of sortedDocs) {
    const my = getMonthYear(doc.uploadDate);
    if (!groupsMap[my]) {
      groupsMap[my] = [];
      groupTimestamps[my] = doc.timestamp;
    } else {
      if (doc.timestamp > groupTimestamps[my]) {
        groupTimestamps[my] = doc.timestamp;
      }
    }
    groupsMap[my].push(doc);
  }

  // Sort groups by newest months first
  const sortedGroups = Object.keys(groupsMap)
    .map((my) => ({
      monthYear: my,
      docs: groupsMap[my],
      timestamp: groupTimestamps[my],
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  const getDocLink = (doc: DocumentRecord, mode: "view" | "download") => {
    if (doc.isMock) {
      // Sample dummy PDF for testing view/download functionality on mock items
      return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    }
    // Google Drive links for real files
    return mode === "view"
      ? `https://drive.google.com/file/d/${doc.fileId}/view?usp=drivesdk`
      : `https://drive.google.com/uc?export=download&id=${doc.fileId}`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Widget / Filter bar */}
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon name="history" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-950">
                Document Timeline
              </h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                Browse and verify uploaded evidence files grouped by academic year.
              </p>
            </div>
          </div>

          {/* Filtering & Sorting Selectors */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                Academic Year
              </span>
              <div className="relative min-w-[140px]">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as typeof academicYears[number])}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
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
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                Sort By
              </span>
              <div className="relative min-w-[160px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Document Name (A-Z)</option>
                  <option value="name-desc">Document Name (Z-A)</option>
                  <option value="filetype">File Type</option>
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
            </div>
          </div>
        </div>

        {/* Real vs Mock Indicator */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Status:</span>
            {hasRealDocs ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Connected to Active Session Uploads
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 ring-1 ring-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                Displaying Simulation Mock Data
              </span>
            )}
          </div>

          <div className="font-bold text-gray-700">
            Total Documents: <span className="text-indigo-600 font-extrabold text-sm">{sortedDocs.length}</span>
          </div>
        </div>
      </section>

      {/* Documents Table/List */}
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        {sortedDocs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 font-black">Document Name</th>
                  <th className="py-3 font-black">Upload Date</th>
                  <th className="py-3 font-black">Branch</th>
                  <th className="py-3 font-black">Category</th>
                  <th className="py-3 font-black text-center w-24">File Type</th>
                  <th className="py-3 font-black text-center w-24">View</th>
                  <th className="py-3 font-black text-center w-24">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-indigo-50/20 transition-colors"
                  >
                    {/* Document Name */}
                    <td className="py-3.5 pr-4 align-middle font-extrabold text-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon name="file" className="h-4.5 w-4.5" />
                        </span>
                        <span className="truncate max-w-[240px] md:max-w-xs" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    {/* Upload Date */}
                    <td className="py-3.5 pr-4 align-middle font-bold text-slate-500 whitespace-nowrap">
                      {doc.uploadDate}
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 pr-4 align-middle text-xs font-black text-red-700 whitespace-nowrap">
                      {doc.branch || "General"}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 pr-4 align-middle text-xs font-semibold text-gray-500 leading-relaxed max-w-[200px] md:max-w-[300px]">
                      {doc.category}
                    </td>

                    {/* File Type */}
                    <td className="py-3.5 align-middle text-center">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-700 tracking-wider">
                        {doc.fileType}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="py-3.5 align-middle text-center">
                      <a
                        href={getDocLink(doc, "view")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                        title="View Document"
                      >
                        <Icon name="info" className="h-4 w-4" />
                      </a>
                    </td>

                    {/* Download Button */}
                    <td className="py-3.5 align-middle text-center">
                      <a
                        href={getDocLink(doc, "download")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-250 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer"
                        title="Download Document"
                      >
                        <Icon name="upload" className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-650 shadow-sm">
              <Icon name="file" className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-gray-950">
              No documents found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs font-semibold leading-relaxed text-gray-500">
              No documents found for this academic year.
            </p>
          </div>
        )}
      </section>

      {/* Chronological Activity Feed View */}
      {sortedDocs.length > 0 && (
        <section className="rounded-3xl border border-red-100 bg-white p-6 md:p-8 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon name="calendar" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-950">
                Timeline Activity Feed
              </h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                A chronological activity feed of your uploaded evidence documents.
              </p>
            </div>
          </div>

          <div className="relative border-l-2 border-indigo-100 ml-4 pl-6 space-y-8 py-2">
            {sortedGroups.map((group) => (
              <div key={group.monthYear} className="relative">
                {/* Custom Month Node Marker */}
                <div className="absolute -left-[32.5px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white shadow-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-indigo-700 uppercase tracking-wider bg-indigo-50/70 w-max px-3.5 py-1 rounded-full shadow-sm">
                    {group.monthYear}
                  </h3>

                  <div className="grid gap-3">
                    {group.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-150 p-4 bg-slate-50/20 hover:bg-indigo-50/10 hover:border-indigo-200 hover:shadow-sm transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm">
                            <Icon name="file" className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <a
                              href={getDocLink(doc, "view")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 transition truncate block hover:underline"
                            >
                              {doc.name}
                            </a>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5 leading-relaxed truncate">
                              {doc.branch ? `${doc.branch} • ` : ""}{doc.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-xs">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase text-slate-600 tracking-wider">
                            {doc.fileType}
                          </span>
                          <span className="font-bold text-gray-500 whitespace-nowrap">
                            {doc.uploadDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
