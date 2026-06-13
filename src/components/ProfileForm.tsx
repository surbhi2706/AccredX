import { useState, useEffect } from "react";
import type { FacultyProfile, EducationEntry } from "@/types/profile";
import type { UserProfile } from "@/components/LoginScreen";
import EducationSection from "./EducationSection";
import Icon from "./Icon";

type ProfileFormProps = {
  user: UserProfile;
};

const defaultProfile: FacultyProfile = {
  fullName: "",
  employeeId: "",
  designation: "",
  department: "",
  schoolInstitute: "",
  officialEmail: "",
  alternateEmail: "",
  phoneNumber: "",
  officeAddress: "",
  dateOfJoining: "",
  careerExperience: "",
  industryExperience: "",
  teachingExperience: "",
  administrativeDesignation: "",
  education: [
    { examination: "Ph.D", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "PG", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "UG", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "Diploma", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "NET/SET/Other", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
  ],
};

const examinationsList: Array<"Ph.D" | "PG" | "UG" | "Diploma" | "NET/SET/Other"> = [
  "Ph.D", "PG", "UG", "Diploma", "NET/SET/Other"
];

function migrateEducation(savedEdu: any[]): EducationEntry[] {
  if (!Array.isArray(savedEdu)) return defaultProfile.education;
  
  const list = examinationsList.map((exam) => {
    const match = savedEdu.find((e: any) => {
      if (!e) return false;
      if (e.examination === exam) return true;
      const examLower = exam.toLowerCase();
      const degLower = (e.degree || "").toLowerCase();
      
      if (examLower === "ph.d" && (degLower.includes("phd") || degLower.includes("ph.d"))) return true;
      if (examLower === "pg" && (degLower.includes("m.tech") || degLower.includes("mtech") || degLower.includes("master") || degLower.includes("pg") || degLower.includes("mba") || degLower.includes("m.e") || degLower.includes("me"))) return true;
      if (examLower === "ug" && (degLower.includes("b.tech") || degLower.includes("btech") || degLower.includes("bachelor") || degLower.includes("ug") || degLower.includes("b.e") || degLower.includes("be") || degLower.includes("b.sc") || degLower.includes("bsc"))) return true;
      if (examLower === "diploma" && degLower.includes("diploma")) return true;
      return false;
    });

    if (match) {
      return {
        examination: exam,
        degree: match.degree || "",
        university: match.university || match.institute || "",
        institute: match.institute || "",
        yearOfPassing: match.yearOfPassing || "",
        cgpaOrPercentage: match.cgpaOrPercentage || "",
      };
    }

    return {
      examination: exam,
      degree: "",
      university: "",
      institute: "",
      yearOfPassing: "",
      cgpaOrPercentage: "",
    };
  });

  return list;
}

const STORAGE_KEY = "accredx_faculty_profile";

function Field({
  label,
  value,
  type = "text",
  name,
  isEditing,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  type?: string;
  name: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-bold text-gray-700">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
        />
      ) : (
        <div className="mt-1 rounded-xl bg-gray-50 px-4 py-3 border border-transparent">
          <p className="text-sm font-bold text-gray-900">{value || "—"}</p>
        </div>
      )}
    </div>
  );
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [profile, setProfile] = useState<FacultyProfile>(defaultProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.education) {
          parsed.education = migrateEducation(parsed.education);
        } else {
          parsed.education = defaultProfile.education;
        }
        setProfile({
          ...defaultProfile,
          ...parsed,
        });
      } catch (e) {
        console.error("Failed to parse profile data", e);
      }
    } else {
      // Fallback to initial user data
      setProfile((prev) => ({
        ...prev,
        fullName: user.name,
        officialEmail: user.email,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation,
      }));
    }
    setIsLoaded(true);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setIsSaved(true);
    setIsEditingProfile(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      setProfile(JSON.parse(savedData));
    } else {
      setProfile({
        ...defaultProfile,
        fullName: user.name,
        officialEmail: user.email,
        department: user.department,
        employeeId: user.employeeId,
        designation: user.designation,
      });
    }
    setIsSaved(false);
    setIsEditingProfile(false);
  };

  if (!isLoaded) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_24px_80px_rgba(127,29,29,0.08)]">
        <div className="border-b border-red-100 bg-gradient-to-r from-red-600 to-red-500 px-6 py-7 text-white md:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg">
                <Icon name="user" className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Faculty Profile
                </h2>
                <p className="mt-1 text-sm font-semibold text-red-100">
                  {isEditingProfile
                    ? "Update your personal and academic information."
                    : "Review your personal and academic information."}
                </p>
              </div>
            </div>
            {!isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-red-700 shadow-sm transition hover:bg-red-50"
              >
                <Icon name="edit" className="h-4.5 w-4.5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <section>
            <h3 className="mb-5 text-xl font-black tracking-tight text-gray-950">
              Personal Information
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Employee ID"
                name="employeeId"
                value={profile.employeeId}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Designation (Academic)"
                name="designation"
                value={profile.designation}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Present Administrative Designation"
                name="administrativeDesignation"
                value={profile.administrativeDesignation || ""}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Department"
                name="department"
                value={profile.department}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="School / Institute (College)"
                name="schoolInstitute"
                value={profile.schoolInstitute}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={profile.dateOfJoining}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <div className="flex flex-col gap-1 md:col-span-1">
                <label className="text-sm font-bold text-gray-700">Experience Details (Yrs)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Field
                    label="Career"
                    name="careerExperience"
                    value={profile.careerExperience || ""}
                    isEditing={isEditingProfile}
                    onChange={handleChange}
                  />
                  <Field
                    label="Industry"
                    name="industryExperience"
                    value={profile.industryExperience || ""}
                    isEditing={isEditingProfile}
                    onChange={handleChange}
                  />
                  <Field
                    label="Teaching"
                    name="teachingExperience"
                    value={profile.teachingExperience || ""}
                    isEditing={isEditingProfile}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h3 className="mb-5 text-xl font-black tracking-tight text-gray-950">
              Contact Information
            </h3>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Official Email"
                name="officialEmail"
                type="email"
                value={profile.officialEmail}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Alternate Email (optional)"
                name="alternateEmail"
                type="email"
                value={profile.alternateEmail || ""}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={profile.phoneNumber}
                isEditing={isEditingProfile}
                onChange={handleChange}
              />
              <Field
                label="Office Address"
                name="officeAddress"
                value={profile.officeAddress}
                isEditing={isEditingProfile}
                onChange={handleChange}
                className="md:col-span-2"
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          <EducationSection
            education={profile.education}
            isEditingProfile={isEditingProfile}
            onChange={(education) => {
              setProfile({ ...profile, education });
              setIsSaved(false);
            }}
          />

          {isEditingProfile && (
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                <Icon name="check" className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          )}
          {!isEditingProfile && isSaved && (
            <div className="mt-8 flex items-center justify-end border-t border-gray-100 pt-6">
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                <Icon name="check" className="h-4 w-4" />
                Profile saved successfully!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
