import { useState } from "react";
import type { EducationEntry } from "@/types/profile";
import Icon from "@/components/Icon";

type EducationSectionProps = {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
  isEditingProfile?: boolean;
};

export default function EducationSection({ education, onChange, isEditingProfile = false }: EducationSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentEntry, setCurrentEntry] = useState<Partial<EducationEntry>>({});

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingId(null);
    setCurrentEntry({});
  };

  const handleEditClick = (entry: EducationEntry) => {
    setIsAdding(false);
    setEditingId(entry.id);
    setCurrentEntry(entry);
  };

  const handleDeleteClick = (id: string) => {
    onChange(education.filter((entry) => entry.id !== id));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.degree || !currentEntry.institute) return; // Basic validation

    if (editingId) {
      onChange(
        education.map((entry) =>
          entry.id === editingId ? { ...entry, ...(currentEntry as EducationEntry) } : entry
        )
      );
      setEditingId(null);
    } else {
      onChange([
        ...education,
        {
          ...(currentEntry as EducationEntry),
          id: Date.now().toString(),
        },
      ]);
      setIsAdding(false);
    }
    setCurrentEntry({});
  };

  const handleCancelEntry = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentEntry({});
  };

  const isFormActive = isAdding || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-gray-950">
          Education History
        </h3>
        {!isFormActive && isEditingProfile && (
          <button
            type="button"
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add Education
          </button>
        )}
      </div>

      {isFormActive && (
        <div className="rounded-2xl border border-red-100 bg-red-50/20 p-5 shadow-sm">
          <h4 className="mb-4 text-sm font-black text-red-800">
            {editingId ? "Edit Education Entry" : "New Education Entry"}
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Degree</label>
              <input
                type="text"
                placeholder="e.g. Ph.D., M.Tech, B.E."
                value={currentEntry.degree || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, degree: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={currentEntry.specialization || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, specialization: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-bold text-gray-700">Institute / University</label>
              <input
                type="text"
                placeholder="e.g. Indian Institute of Technology"
                value={currentEntry.institute || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, institute: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">Year of Passing</label>
              <input
                type="text"
                placeholder="e.g. 2015"
                value={currentEntry.yearOfPassing || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, yearOfPassing: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">CGPA / Percentage</label>
              <input
                type="text"
                placeholder="e.g. 9.2 or 85%"
                value={currentEntry.cgpaOrPercentage || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, cgpaOrPercentage: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEntry}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEntry}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-md shadow-red-200 transition hover:bg-red-700"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {education.length > 0 ? (
        <div className="space-y-4">
          {education.map((entry) => (
            <div
              key={entry.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-red-100 hover:shadow-md md:flex-row md:items-center"
            >
              <div>
                <h4 className="font-black text-gray-950">
                  {entry.degree} <span className="font-semibold text-gray-500">in {entry.specialization}</span>
                </h4>
                <p className="mt-1 text-sm text-gray-600">{entry.institute}</p>
                <div className="mt-2 flex items-center gap-3 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <Icon name="calendar" className="h-3 w-3" /> {entry.yearOfPassing}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1">
                    <Icon name="award" className="h-3 w-3" /> {entry.cgpaOrPercentage}
                  </span>
                </div>
              </div>

              {!isFormActive && isEditingProfile && (
                <div className="mt-4 flex gap-2 md:mt-0 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleEditClick(entry)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Icon name="edit" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(entry.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isFormActive && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center">
            <p className="text-sm font-semibold text-gray-500">No education history added yet.</p>
          </div>
        )
      )}
    </div>
  );
}
