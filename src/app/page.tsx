"use client";

import { useState, useEffect } from "react";
import type { FormEvent, ReactNode } from "react";

import { useSession, signOut } from "next-auth/react";
import DynamicForm from "@/components/DynamicForm";
import Header from "@/components/Header";
import {
  useConfigSync,
  getAcademicYears,
  getPmsCategories,
  getPmsCategoryMeta,
  getPmsSectionGuidance,
  getActivityGroups,
  findDetailedActivity,
} from "@/lib/configStore";
import type { PmsDetailedActivity } from "@/data/pmsMapping";
import Icon from "@/components/Icon";
import Sidebar from "@/components/Sidebar";
import type { ViewId } from "@/components/Sidebar";
import LoginScreen from "@/components/LoginScreen";
import type { UserProfile } from "@/components/LoginScreen";
import ReportPreviewModal from "@/components/ReportPreviewModal";
import CvPreviewModal from "@/components/CvPreviewModal";
import PortfolioWebsiteModal from "@/components/PortfolioWebsiteModal";
import ProfileForm from "@/components/ProfileForm";
import TimelineView from "@/components/TimelineView";
import CourseActivityHubView from "@/components/CourseActivityHubView";
import { activityFields } from "@/data/formFields";
import type { ActivityField } from "@/data/formFields";
import AdminDashboard from "./admin/page";

const viewCopy: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Your activity progress and uploads at a glance.",
  },
  "add-activity": {
    title: "Add Faculty Activity",
    subtitle: "Enter an activity once and reuse it across reports.",
  },
  "my-activities": {
    title: "Document Timeline",
    subtitle: "Track and manage your uploaded evidence documents by academic year.",
  },
  reports: {
    title: "Reports",
    subtitle: "Generate PMS, NBA and annual activity outputs.",
  },
  profile: {
    title: "Profile",
    subtitle: "Faculty details and contribution summary.",
  },
  timeline: {
    title: "Document Timeline",
    subtitle: "Track and manage your uploaded evidence documents by academic year.",
  },
  "course-activity-hub": {
    title: "Course Activity Hub",
    subtitle: "Complete teaching history, activity tracking, and accreditation evidence.",
  },
  admin: {
  title: "Admin Dashboard",
  subtitle: "Manage PMS categories and configuration",
},
};

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-10 text-sm font-bold text-gray-900 shadow-sm outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

type SavedActivity = {
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

export default function Home() {
  useConfigSync();
  const academicYears = getAcademicYears();
console.log("PAGE YEARS:", academicYears);
  const [previewReportType, setPreviewReportType] = useState<
    "PMS Report" | "NBA Summary" | "Annual Report" | "Somaiya CV" | "Somaiya CV (Generalized)" | "Portfolio Website" | null
  >(null);

  const [activeView, setActiveView] = useState<ViewId>("add-activity");
  const [editingActivity, setEditingActivity] = useState<SavedActivity | null>(null);
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [selectedDetailedActivity, setSelectedDetailedActivity] =
    useState<PmsDetailedActivity | null>(null);
  const [activity, setActivity] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [evidenceFileName, setEvidenceFileName] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activityLoadError, setActivityLoadError] = useState("");
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
  const [savedProfile, setSavedProfile] = useState<any>(null);
  const { data: session, status } = useSession();

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
  if (status !== "authenticated") return;

  async function checkAdminAccess() {
    try {
      const response = await fetch("/api/admin/check-access");
      const data = await response.json();

      setIsAdmin(Boolean(data.isAdmin));
    } catch (error) {
      console.error("Admin access check failed:", error);
      setIsAdmin(false);
    }
  }

  checkAdminAccess();
}, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setSavedProfile(data.profile);
          }
        }
      } catch (e) {
        console.error("Failed to fetch profile", e);
      }
    }

    fetchProfile();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const controller = new AbortController();

    async function loadActivities() {
      setIsLoadingActivities(true);
      setActivityLoadError("");

      try {
        const response = await fetch("/api/activities", {
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "Unable to load saved activities.");
        }

        if (!controller.signal.aborted) {
          setSavedActivities(
            Array.isArray(result.activities) ? result.activities : []
          );
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error("Error loading saved activities:", error);
        setActivityLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load saved activities."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingActivities(false);
        }
      }
    }

    loadActivities();
    return () => controller.abort();
  }, [session?.user?.email, status]);

  const currentUser: UserProfile | null = session?.user
    ? {
        name: savedProfile?.fullName || session.user.name || "Faculty Member",
        email: session.user.email || "",
        employeeId: savedProfile?.employeeId || "FAC-0000",
        designation: savedProfile?.designation || "Faculty",
        department: savedProfile?.department || "",
        academicYear: "2025-26",
      }
    : null;

  function handleLogout() {
    signOut();
  }

  const activityGroups = getActivityGroups(category);
  const rawFields = activityFields[selectedDetailedActivity?.activity as keyof typeof activityFields] || [];

  const fields: ActivityField[] = selectedDetailedActivity
    ? [
        ...rawFields,
        {
          name: "selfAssessedMarks",
          label: "Self-Assessed PMS Marks",
          type: "number",
          min: 0,
          max: getPmsCategoryMeta(category)?.maxMarks,
          helperText:
            "Enter the marks you are claiming. Final marks remain subject to department and college assessment.",
          required: true,
        },
        {
          name: "nbaCriterion",
          label: "Auto-Mapped NBA Criterion",
          type: "text",
          disabled: true,
          required: false,
        },
        {
          name: "nbaSubCriterion",
          label: "Auto-Mapped NBA Subcriterion",
          type: "text",
          disabled: true,
          required: false,
        },
      ]
    : rawFields;

  const completedSteps = [year, category, selectedDetailedActivity].filter(Boolean).length;
  const header = viewCopy[activeView];

  const evidenceUploads = savedActivities.filter(
    (item) => item.evidenceFileName
  ).length;
  const completedFields = savedActivities.reduce(
    (total, item) =>
      total + Object.values(item.data).filter((value) => value.trim()).length,
    0
  );

  function handleActivityChange(value: string) {
    setActivity(value);
    setSelectedDetailedActivity(null);
    setFormValues({});
    setEvidenceFileName("");
    setEvidenceFile(null);
    setSavedMessage("");
    setEditingActivity(null);
  }

  function handleFieldChange(fieldName: string, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
    setSavedMessage("");
  }

  function handleEvidenceChange(file: File | null) {
    setEvidenceFile(file);
    setEvidenceFileName(file ? file.name : "");
  }

  function handleEditActivity(item: SavedActivity) {
    setEditingActivity(item);
    setYear(item.academicYear);
    setCategory(item.pmsCategory);
    
    const detailed = findDetailedActivity(item.pmsCategory, item.activityType);
    setSelectedDetailedActivity(detailed);
    setActivity(item.activityType);
    
    setFormValues(item.data || {});
    setEvidenceFileName(item.evidenceFileName || "");
    setEvidenceFile(null);
    setActiveView("add-activity");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteActivity(item: SavedActivity) {
    const confirmed = window.confirm(`Delete "${item.activityType}"?`);
    if (!confirmed) return;

    setSavedActivities((current) => current.filter((a) => a.id !== item.id));

    try {
      const response = await fetch(`/api/activities?id=${item.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete activity. Please refresh.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);

    let evidenceFileId = editingActivity ? editingActivity.evidenceFileId : "";
    let sheetsWarning = "";
    let repositoryWarning = "";
    let activityId = editingActivity ? editingActivity.id : Date.now();
    let createdAt = editingActivity ? editingActivity.createdAt : new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    try {
      if (evidenceFile && !editingActivity) {
        setSavedMessage("Uploading evidence...");
        const formData = new FormData();
        formData.append("file", evidenceFile);
        formData.append("academicYear", year);
        formData.append("pmsCategory", category);
        formData.append("activityType", selectedDetailedActivity?.activity || activity);
        formData.append("metadata", JSON.stringify(formValues));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.details || errData.error || "Upload failed");
        }

        const uploadResult = await res.json();
        evidenceFileId = uploadResult.fileId || "";
        repositoryWarning = uploadResult.repositoryWarning || "";
        if (uploadResult.sheetsSuccess === false) {
          sheetsWarning = uploadResult.sheetsError || "Unknown error";
        }
      } else {
        setSavedMessage(editingActivity ? "Updating activity..." : "Saving activity...");
        
        const method = editingActivity ? "PUT" : "POST";
        const bodyPayload = {
          ...(editingActivity ? { id: editingActivity.id } : {}),
          academicYear: year,
          pmsCategory: category,
          pmsSection: selectedDetailedActivity?.section || "",
          activityType: selectedDetailedActivity?.activity || activity,
          data: formValues,
        };

        const response = await fetch("/api/activities", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || `Unable to ${editingActivity ? 'update' : 'save'} activity.`);
        }

        if (!editingActivity) {
          activityId = result.id || activityId;
          createdAt = result.createdAt || createdAt;
        }
      }

      const activityPayload: SavedActivity = {
        id: activityId,
        academicYear: year,
        pmsCategory: category,
        pmsSection: selectedDetailedActivity?.section || "",
        activityType: selectedDetailedActivity?.activity || activity,
        data: formValues,
        evidenceFileName,
        evidenceFileId,
        createdAt,
      };

      setSavedActivities((currentActivities) => {
        if (editingActivity) {
          return currentActivities.map(a => a.id === activityId ? activityPayload : a);
        }
        return [activityPayload, ...currentActivities];
      });
      console.log("Activity ready for backend save:", activityPayload);

      if (sheetsWarning) {
        setSavedMessage(`PDF uploaded, but Google Sheets update failed: ${sheetsWarning}`);
      } else if (repositoryWarning) {
        setSavedMessage(repositoryWarning);
      } else {
        setSavedMessage(`Activity ${editingActivity ? 'updated' : 'saved'} successfully.`);
      }

      setEvidenceFile(null);
      setEvidenceFileName("");
      setFormValues({});
      setEditingActivity(null);
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error";
      setSavedMessage(`Failed to upload evidence: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-slate-600">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#fff_0%,#fff7f7_45%,#f8fafc_100%)] text-gray-950">
      <Sidebar activeView={activeView} onNavigate={setActiveView} user={currentUser} onLogout={handleLogout} isAdmin={isAdmin}/>

      <div className="min-w-0 flex-1 print:hidden">
        <Header title={header.title} subtitle={header.subtitle} />

        <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <MobileNav activeView={activeView} onNavigate={setActiveView} />

          {activeView === "dashboard" ? (
            <DashboardView
  activities={savedActivities}
  completedFields={completedFields}
  evidenceUploads={evidenceUploads}
  onAddActivity={() => setActiveView("add-activity")}
  onEdit={handleEditActivity}
  onDelete={handleDeleteActivity}
/>
          ) : null}

          {activeView === "add-activity" ? (
            <AddActivityView
  activity={activity}
  activityGroups={activityGroups}
  category={category}
  selectedDetailedActivity={selectedDetailedActivity}
  completedSteps={completedSteps}
  evidenceFileName={evidenceFileName}
  fields={fields}
	  formValues={formValues}
	  isSaving={isSaving}
	  savedMessage={savedMessage}
  year={year}
  onActivityChange={(value) => {
    handleActivityChange(value);
    const selected = findDetailedActivity(category, value);
    setSelectedDetailedActivity(selected);
    if (selected) {
      setFormValues({
        detailedActivity: selected.activity,
        pmsSection: selected.section,
        nbaCriterion: selected.nba,
        nbaSubCriterion: selected.subCriterion,
      });
    }
  }}
  onCategoryChange={(value) => {
    setCategory(value);
    handleActivityChange("");
    setSelectedDetailedActivity(null);
  }}
  onEvidenceChange={handleEvidenceChange}
  onFieldChange={handleFieldChange}
  onSubmit={handleSubmit}
  onYearChange={(value) => {
    setYear(value);
    setSavedMessage("");
  }}
/>
          ) : null}

          {activeView === "my-activities" ? (
            <TimelineView activities={savedActivities} />
          ) : null}

          {activeView === "reports" ? (
            <ReportsView
              activities={savedActivities}
              evidenceUploads={evidenceUploads}
              onPreview={(type) => setPreviewReportType(type)}
            />
          ) : null}

          {activeView === "profile" ? (
            <ProfileForm user={currentUser} profile={savedProfile} onSave={(p) => setSavedProfile(p)} />
          ) : null}

          {activeView === "timeline" ? (
            <TimelineView activities={savedActivities} />
          ) : null}

          {activeView === "admin" ? (
            <AdminDashboard />
          ) : null}

          {activeView === "course-activity-hub" ? (
            <CourseActivityHubView />
          ) : null}
        </main>
      </div>

      {previewReportType && previewReportType !== "Somaiya CV" && previewReportType !== "Somaiya CV (Generalized)" && previewReportType !== "Portfolio Website" && (
        <ReportPreviewModal
          reportType={previewReportType}
          activities={savedActivities}
          user={currentUser}
          onClose={() => setPreviewReportType(null)}
        />
      )}

      {(previewReportType === "Somaiya CV" || previewReportType === "Somaiya CV (Generalized)") && (
        <CvPreviewModal
          profile={savedProfile}
          activities={savedActivities}
          variant={previewReportType === "Somaiya CV (Generalized)" ? "generalized" : "standard"}
          onClose={() => setPreviewReportType(null)}
        />
      )}

      {previewReportType === "Portfolio Website" && (
        <PortfolioWebsiteModal
          profile={savedProfile}
          activities={savedActivities}
          onClose={() => setPreviewReportType(null)}
        />
      )}
    </div>
  );
}

type AddActivityViewProps = {
  activity: string;
  activityGroups: ReturnType<typeof getActivityGroups>;
  category: string;
  selectedDetailedActivity: PmsDetailedActivity | null;
  completedSteps: number;
  evidenceFileName: string;
  fields: ActivityField[];
  formValues: Record<string, string>;
  isSaving: boolean;
  savedMessage: string;
  year: string;
  onActivityChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEvidenceChange: (file: File | null) => void;
  onFieldChange: (fieldName: string, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onYearChange: (value: string) => void;
};

function AddActivityView({
  activity,
  activityGroups,
  category,
  selectedDetailedActivity,
  completedSteps,
  evidenceFileName,
  fields,
  formValues,
  isSaving,
  savedMessage,
  year,
  onActivityChange,
  onCategoryChange,
  onEvidenceChange,
  onFieldChange,
  onSubmit,
  onYearChange,
}: AddActivityViewProps) {
  const academicYears = getAcademicYears();
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_24px_80px_rgba(127,29,29,0.08)]"
      >
        <div className="border-b border-red-100 bg-gradient-to-r from-red-600 to-red-500 px-6 py-7 text-white md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-red-100">
                Faculty Input
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">
                Add New Activity
              </h2>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 ring-1 ring-white/20">
              <Icon name="check" className="h-5 w-5 text-white" />
              <span className="text-sm font-bold">{completedSteps}/3 selected</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <SelectionField
              icon="calendar"
              label="Academic Year"
              color="text-sky-600 bg-sky-50"
            >
              <select
                value={year}
                onChange={(event) => onYearChange(event.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select year</option>
                {academicYears.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </SelectionField>

            <SelectionField
              icon="layers"
              label="PMS Category"
              color="text-emerald-600 bg-emerald-50"
            >
              <select
                value={category}
                onChange={(event) => onCategoryChange(event.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select category</option>
                {getPmsCategories().map((cat) => (
                  <option key={cat} value={cat}>
  {cat} ({getPmsCategoryMeta(cat)?.maxMarks ?? 0} marks)
</option>
                ))}
              </select>
            </SelectionField>

            <SelectionField
              icon="spark"
              label="PMS Detailed Activity"
              color="text-amber-600 bg-amber-50"
            >
              <select
                value={activity}
                onChange={(event) => onActivityChange(event.target.value)}
                disabled={!category}
                required
                className={selectClass}
              >
                <option value="">Select detailed activity</option>
                {activityGroups.map((group) => (
                  <optgroup key={group.section} label={group.section}>
                    {group.activities.map((item) => (
                      <option key={item.activity} value={item.activity}>
                        {item.activity}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </SelectionField>
          </div>

          {selectedDetailedActivity ? (
            <>
              <DynamicForm
                fields={fields}
                values={formValues}
                evidenceFileName={evidenceFileName}
                scoringGuidance={
                  getPmsSectionGuidance(selectedDetailedActivity.section)
                }
                onChange={onFieldChange}
                onEvidenceChange={onEvidenceChange}
              />

              <div className="mt-8 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                  Required fields are marked in red.
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-red-400"
                >
                  <Icon name="check" className="h-4.5 w-4.5" />
                  {isSaving ? "Saving Activity..." : "Save Activity"}
                </button>
              </div>

              {savedMessage ? (
                <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${savedMessage.includes("failed") ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700"}`}>
                  {savedMessage.includes("failed") ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                    <Icon name="check" className="h-4 w-4" />
                  )}
                  {savedMessage}
                </p>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon="clipboard"
              title={category ? "Select a detailed activity" : "Select a PMS category"}
              text="The relevant form fields will appear here after selection."
            />
          )}
        </div>
      </form>

      <aside className="space-y-4">
        <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Icon name="clipboard" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black tracking-tight text-gray-950">
                Activity Snapshot
              </h3>
              <p className="text-xs font-semibold text-gray-500">
                Current entry
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <SnapshotRow icon="calendar" label="Year" value={year || "Not selected"} />
            <SnapshotRow icon="layers" label="Category" value={category || "Not selected"} />
            <SnapshotRow icon="spark" label="Section" value={selectedDetailedActivity?.section || "Not selected"} />
            <SnapshotRow icon="file" label="Activity" value={selectedDetailedActivity?.activity || "Not selected"} />
            <SnapshotRow icon="file" label="Fields" value={selectedDetailedActivity ? `${fields.length} fields` : "Waiting"} />
            <SnapshotRow icon="upload" label="Evidence" value={evidenceFileName || "Not attached"} />
          </div>
        </section>

        {/* Informative Guidance Card */}
        <section className="rounded-3xl border border-red-50 bg-gradient-to-br from-white to-red-50/50 p-5 shadow-sm">
          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-700">
            <Icon name="shield" className="h-4 w-4" />
            Accreditation Safe
          </h4>
          <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
            All entered fields are automatically mapped to official NBA tables and NAAC criteria formats.
          </p>
        </section>
      </aside>
    </div>
  );
}

function DashboardView({
  activities,
  completedFields,
  evidenceUploads,
  onAddActivity,
  onEdit,
  onDelete,
}: {
  activities: SavedActivity[];
  completedFields: number;
  evidenceUploads: number;
  onAddActivity: () => void;
  onEdit: (activity: SavedActivity) => void;
  onDelete: (activity: SavedActivity) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const progress = activities.length
    ? Math.min(100, Math.round((evidenceUploads / activities.length) * 100))
    : 0;

  const academicYears = Array.from(new Set(activities.map((a) => a.academicYear))).sort().reverse();
  const categories = Array.from(new Set(activities.map((a) => a.pmsCategory))).sort();

  const filteredActivities = activities.filter((item) => {
    const matchesSearch = item.activityType.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.pmsCategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = filterYear ? item.academicYear === filterYear : true;
    const matchesCategory = filterCategory ? item.pmsCategory === filterCategory : true;
    return matchesSearch && matchesYear && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          color="text-red-600 bg-red-50"
          icon="clipboard"
          label="Activities Uploaded"
          value={String(activities.length)}
        />
        <MetricCard
          color="text-emerald-600 bg-emerald-50"
          icon="upload"
          label="Evidence Attached"
          value={String(evidenceUploads)}
        />
        <MetricCard
          color="text-sky-600 bg-sky-50"
          icon="file"
          label="Fields Completed"
          value={String(completedFields)}
        />
      </div>

      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-950">
              Submission Progress
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Evidence completion for activities synced with Google Sheets.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddActivity}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add Activity
          </button>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-red-50">
          <div
            className="h-full rounded-full bg-red-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-bold text-gray-700">
          {progress}% of saved activities have evidence attached.
        </p>
      </section>

      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-950">
              Your Activities
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and filter your saved activities.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Icon name="search" className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-red-400 focus:bg-white"
              />
            </div>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-red-400 focus:bg-white cursor-pointer"
            >
              <option value="">All Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-red-400 focus:bg-white cursor-pointer max-w-[200px] truncate"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredActivities.length ? (
          <div className="space-y-3">
            {filteredActivities.map((item) => (
              <ActivityListItem key={item.id} activity={item} onEdit={onEdit} onDelete={onDelete}/>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="file"
            title="No matching activities"
            text={activities.length ? "Try adjusting your search or filters." : "Saved activities will appear here."}
          />
        )}
      </section>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MyActivitiesView({
  activities,
  error,
  isLoading,
}: {
  activities: SavedActivity[];
  error: string;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
      <h2 className="text-xl font-black tracking-tight text-gray-950">
        Uploaded Activities
      </h2>

      {isLoading ? (
        <p className="mt-5 text-sm font-bold text-gray-500">
          Loading activities from Google Sheets...
        </p>
      ) : error ? (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
          Could not load Google Sheets activities: {error}
        </p>
      ) : activities.length ? (
        <div className="mt-5 space-y-3">
          {activities.map((item) => (
            <ActivityListItem key={item.id} activity={item} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="clipboard"
          title="No activities found"
          text="Activities saved from Add Activity will be listed here."
        />
      )}
    </section>
  );
}

function ReportsView({
  activities,
  evidenceUploads,
  onPreview,
}: {
  activities: SavedActivity[];
  evidenceUploads: number;
  onPreview: (reportType: "PMS Report" | "NBA Summary" | "Annual Report" | "Somaiya CV" | "Somaiya CV (Generalized)" | "Portfolio Website") => void;
}) {
  const reportCards = [
    { title: "PMS Report", icon: "layers", color: "text-red-600 bg-red-50" },
    { title: "NBA Summary", icon: "award", color: "text-amber-600 bg-amber-50" },
    { title: "Annual Report", icon: "chart", color: "text-violet-650 bg-violet-50" },
    { title: "Somaiya CV", icon: "file", color: "text-sky-600 bg-sky-50" },
    { title: "Somaiya CV (Generalized)", icon: "clipboard", color: "text-emerald-600 bg-emerald-50" },
    { title: "Portfolio Website", icon: "grid", color: "text-blue-600 bg-blue-50" },
  ] as const;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {reportCards.map((report) => (
        <section
          key={report.title}
          className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]"
        >
          <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${report.color}`}>
            <Icon name={report.icon} className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-gray-950">{report.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Ready to generate from {activities.length} saved activities and {evidenceUploads} evidence files.
          </p>
          <button
            type="button"
            onClick={() => onPreview(report.title)}
            className="mt-5 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-50 cursor-pointer"
          >
            Preview
          </button>
        </section>
      ))}
    </div>
  );
}


type SelectionFieldProps = {
  children: ReactNode;
  color: string;
  icon: "calendar" | "layers" | "spark";
  label: string;
};

function SelectionField({ children, color, icon, label }: SelectionFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <label className="text-sm font-black text-gray-800">{label}</label>
      </div>
      <div className="relative">
        {children}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

function MobileNav({
  activeView,
  onNavigate,
}: {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  const items: Array<{ id: ViewId; label: string }> = [
    { id: "dashboard", label: "Dashboard" },
    { id: "add-activity", label: "Add" },
    { id: "reports", label: "Reports" },
    { id: "profile", label: "Profile" },
    { id: "timeline", label: "Timeline" },
    { id: "course-activity-hub", label: "Activity Hub" },
  ];

  return (
    <div className="mb-5 flex flex-wrap gap-2 lg:hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNavigate(item.id)}
          className={`rounded-full px-4 py-2 text-sm font-black ${activeView === item.id
            ? "bg-red-600 text-white"
            : "border border-red-100 bg-white text-gray-700"
            }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: "clipboard" | "file" | "upload";
  label: string;
  value: string;
}) {
  return (
    <section className="group rounded-3xl border border-red-100 bg-white p-5 shadow-[0_20px_60px_rgba(127,29,29,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_24px_80px_rgba(127,29,29,0.1)]">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${color}`}>
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <p className="text-3xl font-black tracking-tight text-gray-950 transition-colors group-hover:text-red-700">{value}</p>
      <p className="mt-1 text-sm font-bold text-gray-500">{label}</p>
    </section>
  );
}

function ActivityListItem({
  activity,
  onEdit,
  onDelete,
}: {
  activity: SavedActivity;
  onEdit: (activity: SavedActivity) => void;
  onDelete: (activity: SavedActivity) => void;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 p-4 transition hover:border-red-100 hover:bg-red-50/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-black text-gray-950">
            {activity.activityType}
          </h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {activity.pmsCategory}
          </p>
        </div>

        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
          {activity.academicYear}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
          {activity.createdAt}
        </span>

        <span
          className={`rounded-full px-3 py-1 ${
            activity.evidenceFileName
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {activity.evidenceFileName
            ? "Evidence attached"
            : "No evidence"}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(activity)}
          className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(activity)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function EmptyState({
  icon,
  text,
  title,
}: {
  icon: "clipboard" | "file";
  text: string;
  title: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black text-gray-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {text}
      </p>
    </div>
  );
}

function SnapshotRow({
  icon,
  label,
  value,
}: {
  icon: "calendar" | "layers" | "spark" | "file" | "upload";
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-t border-gray-100 py-3 first:border-t-0 first:pt-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <Icon name={icon} className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold leading-5 text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
