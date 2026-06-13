import { useState } from "react";
import type { EducationEntry } from "@/types/profile";
import Icon from "@/components/Icon";

type EducationSectionProps = {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
  isEditingProfile?: boolean;
};

const EXAMINATIONS: Array<"Ph.D" | "PG" | "UG" | "Diploma" | "NET/SET/Other"> = [
  "Ph.D",
  "PG",
  "UG",
  "Diploma",
  "NET/SET/Other"
];

export default function EducationSection({
  education,
  onChange,
  isEditingProfile = false
}: EducationSectionProps) {
  const [editingExam, setEditingExam] = useState<string | null>(null);
  const [tempEntry, setTempEntry] = useState<Partial<EducationEntry>>({});

  // Ensure we always have all 5 examinations represented
  const fullEducationList = EXAMINATIONS.map((exam) => {
    const existing = education.find((e) => e.examination === exam);
    return (
      existing || {
        examination: exam,
        degree: "",
        university: "",
        institute: "",
        yearOfPassing: "",
        cgpaOrPercentage: ""
      }
    );
  });

  const handleEditClick = (entry: EducationEntry) => {
    setEditingExam(entry.examination);
    setTempEntry({ ...entry });
  };

  const handleSaveEntry = (examName: string) => {
    const updated = fullEducationList.map((entry) => {
      if (entry.examination === examName) {
        return {
          ...entry,
          ...tempEntry
        } as EducationEntry;
      }
      return entry;
    });
    onChange(updated);
    setEditingExam(null);
    setTempEntry({});
  };

  const handleClearEntry = (examName: string) => {
    const updated = fullEducationList.map((entry) => {
      if (entry.examination === examName) {
        return {
          examination: examName,
          degree: "",
          university: "",
          institute: "",
          yearOfPassing: "",
          cgpaOrPercentage: ""
        };
      }
      return entry;
    });
    onChange(updated);
    if (editingExam === examName) {
      setEditingExam(null);
      setTempEntry({});
    }
  };

  const handleCancelEdit = () => {
    setEditingExam(null);
    setTempEntry({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-gray-950">
          Education History
        </h3>
      </div>

      <div className="space-y-4">
        {fullEducationList.map((entry) => {
          const isEditing = editingExam === entry.examination;
          const hasDetails = entry.degree.trim() !== "";

          return (
            <div
              key={entry.examination}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition ${
                isEditing
                  ? "border-red-200 bg-red-50/10"
                  : "border-gray-100 bg-white hover:border-red-150 hover:shadow-md"
              }`}
            >
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-black text-red-700">
                        {entry.examination}
                      </span>
                      {hasDetails ? (
                        <h4 className="font-extrabold text-gray-950 text-base">
                          {entry.degree}
                        </h4>
                      ) : (
                        <span className="text-sm font-medium text-gray-400 italic">
                          Not added yet
                        </span>
                      )}
                    </div>

                    {hasDetails && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-650">
                        <p>
                          <span className="font-bold text-gray-500">College/Institute:</span> {entry.institute || "—"}
                        </p>
                        <p>
                          <span className="font-bold text-gray-500">University/Board:</span> {entry.university || "—"}
                        </p>
                        <p>
                          <span className="font-bold text-gray-500">Year:</span> {entry.yearOfPassing || "—"}
                        </p>
                        <p>
                          <span className="font-bold text-gray-500">Marks/CPI/Percentage:</span> {entry.cgpaOrPercentage || "—"}
                        </p>
                      </div>
                    )}
                  </div>

                  {isEditingProfile && (
                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleEditClick(entry)}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Icon name="edit" className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      {hasDetails && (
                        <button
                          type="button"
                          onClick={() => handleClearEntry(entry.examination)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-250 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          title="Clear Entry"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-red-100 pb-2">
                    <span className="text-sm font-black text-red-800 uppercase tracking-wider">
                      Edit {entry.examination} Details
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-600 text-lg font-black"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-500">Name of Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. Bachelor of Engineering, Doctor of Philosophy"
                        value={tempEntry.degree || ""}
                        onChange={(e) => setTempEntry({ ...tempEntry, degree: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-500">University / Board</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai University, CBSE"
                        value={tempEntry.university || ""}
                        onChange={(e) => setTempEntry({ ...tempEntry, university: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-gray-500">Institute / College</label>
                      <input
                        type="text"
                        placeholder="e.g. K. J. Somaiya College of Engineering"
                        value={tempEntry.institute || ""}
                        onChange={(e) => setTempEntry({ ...tempEntry, institute: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">Year of Passing</label>
                        <input
                          type="text"
                          placeholder="e.g. 2018"
                          value={tempEntry.yearOfPassing || ""}
                          onChange={(e) => setTempEntry({ ...tempEntry, yearOfPassing: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-gray-500">CPI / SPI / % Marks</label>
                        <input
                          type="text"
                          placeholder="e.g. 9.15 or 85%"
                          value={tempEntry.cgpaOrPercentage || ""}
                          onChange={(e) => setTempEntry({ ...tempEntry, cgpaOrPercentage: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleClearEntry(entry.examination)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50"
                    >
                      Clear Fields
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-55"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEntry(entry.examination)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700"
                    >
                      Save Row
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
