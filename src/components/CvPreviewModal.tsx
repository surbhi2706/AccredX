"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
import type { FacultyProfile } from "@/types/profile";
import { handleExportReport } from "@/utils/export";

type SavedActivity = {
  id: number;
  academicYear: string;
  pmsCategory: string;
  activityType: string;
  data: Record<string, string>;
  evidenceFileName: string;
  createdAt: string;
};

type CvPreviewModalProps = {
  activities: SavedActivity[];
  onClose: () => void;
};

const STORAGE_KEY = "accredx_faculty_profile";

export default function CvPreviewModal({ activities, onClose }: CvPreviewModalProps) {
  const [profile, setProfile] = useState<FacultyProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setProfile(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
  };

  function groupActivities(acts: SavedActivity[]) {
    const groups: Record<string, SavedActivity[]> = {
      Publications: [],
      Conferences: [],
      Workshops: [],
      FDPs: [],
      Projects: [],
      Patents: [],
      Awards: [],
      Certifications: [],
      "Positions & Responsibilities": [],
      Other: [],
    };

    acts.forEach((act) => {
      const cat = act.pmsCategory.toLowerCase();
      const type = act.activityType.toLowerCase();
      
      if (type.includes("patent")) {
        groups.Patents.push(act);
      } else if (type.includes("publication") || type.includes("journal") || type.includes("book")) {
        groups.Publications.push(act);
      } else if (type.includes("conference")) {
        groups.Conferences.push(act);
      } else if (type.includes("project") || type.includes("consultancy")) {
        groups.Projects.push(act);
      } else if (type.includes("fdp")) {
        groups.FDPs.push(act);
      } else if (type.includes("workshop") || type.includes("training") || type.includes("seminar")) {
        groups.Workshops.push(act);
      } else if (type.includes("certification") || type.includes("course") || type.includes("nptel")) {
        groups.Certifications.push(act);
      } else if (cat.includes("award") || type.includes("award") || type.includes("recognition")) {
        groups.Awards.push(act);
      } else if (cat.includes("administrative") || type.includes("committee") || type.includes("responsibility") || type.includes("coordinator")) {
        groups["Positions & Responsibilities"].push(act);
      } else {
        groups.Other.push(act);
      }
    });

    return groups;
  }

  const grouped = groupActivities(activities);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm md:p-6 no-print">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-red-100 bg-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-gray-100 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Icon name="file" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Somaiya Faculty CV
              </h2>
              <p className="text-xs font-semibold text-gray-500">
                Live Preview
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadProfile}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-slate-50"
            >
              <Icon name="info" className="h-4 w-4 text-gray-500" />
              Refresh CV
            </button>

            <button
              onClick={() => handleExportReport("Somaiya CV")}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-150 transition hover:bg-red-700"
            >
              <Icon name="check" className="h-4 w-4" />
              Export PDF
            </button>

            <span className="h-6 w-px bg-gray-200 mx-1"></span>

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

        <div className="flex-1 overflow-y-auto p-6 md:p-10 print-container">
          <div id="report-content" className="mx-auto max-w-4xl bg-white p-6 md:p-12 text-slate-900 font-sans">
            
            {/* CV Header */}
            <div className="border-b-2 border-red-800 pb-6 mb-8 text-center md:text-left flex flex-col md:flex-row md:justify-between md:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-red-800 uppercase">
                  {profile?.fullName || "Faculty Name"}
                </h1>
                <h2 className="mt-2 text-lg font-bold text-slate-600">
                  {profile?.designation || "Designation"}
                </h2>
                <p className="mt-1 text-md font-semibold text-slate-500">
                  {profile?.department || "Department"}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {profile?.schoolInstitute || "Institute"}
                </p>
              </div>
              <div className="mt-6 md:mt-0 text-sm font-medium text-slate-600 md:text-right space-y-1">
                <p>{profile?.officialEmail || "email@somaiya.edu"}</p>
                {profile?.alternateEmail && <p>{profile.alternateEmail}</p>}
                <p>{profile?.phoneNumber || "Phone Number"}</p>
                <p className="max-w-xs">{profile?.officeAddress || "Office Address"}</p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              
              {/* Education */}
              {(profile?.education && profile.education.length > 0) && (
                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-red-800 border-b border-red-100 pb-2 mb-4">
                    Education
                  </h3>
                  <ul className="space-y-4">
                    {profile.education.map((edu) => (
                      <li key={edu.id} className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-slate-800">{edu.degree} in {edu.specialization}</p>
                          <p className="text-sm text-slate-600">{edu.institute}</p>
                        </div>
                        <div className="text-right text-sm">
                          <span className="block font-bold text-slate-700">{edu.yearOfPassing}</span>
                          <span className="block text-slate-500">{edu.cgpaOrPercentage}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Research Interests (Placeholder if no data) */}
              <section>
                <h3 className="text-lg font-black uppercase tracking-widest text-red-800 border-b border-red-100 pb-2 mb-4">
                  Research Interests
                </h3>
                <p className="text-slate-600 italic">Data to be populated from future faculty input modules.</p>
              </section>

              {/* Courses Delivered (Placeholder) */}
              <section>
                <h3 className="text-lg font-black uppercase tracking-widest text-red-800 border-b border-red-100 pb-2 mb-4">
                  Courses Delivered
                </h3>
                <p className="text-slate-600 italic">Data to be populated from future academic load modules.</p>
              </section>

              {/* Dynamic Activities Mapping */}
              {Object.entries(grouped).map(([categoryName, acts]) => {
                if (acts.length === 0) return null;
                return (
                  <section key={categoryName}>
                    <h3 className="text-lg font-black uppercase tracking-widest text-red-800 border-b border-red-100 pb-2 mb-4">
                      {categoryName}
                    </h3>
                    <ul className="space-y-6 text-sm text-slate-700">
                      {acts.map((act) => {
                        // Create a formatted string from activity data
                        const detailsString = Object.entries(act.data)
                          .filter(([key]) => key !== "nbaCriterion" && key !== "nbaSubCriterion" && key !== "detailedActivity")
                          .map(([key, val]) => `${val}`)
                          .join(" • ");
                        
                        return (
                          <li key={act.id} className="leading-relaxed relative pl-5 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-red-300">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                              <span className="font-extrabold text-slate-900 text-base">{act.activityType}</span>
                              <span className="font-bold text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md text-xs sm:text-sm">{act.academicYear}</span>
                            </div>
                            <div className="mt-1.5 text-slate-600">{detailsString}</div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
