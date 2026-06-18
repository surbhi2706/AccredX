"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
import type { FacultyProfile, EducationEntry } from "@/types/profile";
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
  profile: FacultyProfile | null;
  activities: SavedActivity[];
  onClose: () => void;
};

// Editable cell component that updates parent state on blur to avoid cursor jumps
const EditableCell = ({
  value,
  onChange,
  className = "",
  style = {}
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      className={`hover:bg-red-50/50 focus:bg-red-50/30 focus:outline-none transition-all duration-150 rounded px-1 duration-editable cursor-text ${className}`}
      style={style}
    >
      {value}
    </div>
  );
};

// Editable list component for bullet points
const EditableList = ({
  items,
  onChange,
  placeholder
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) => {
  const handleItemChange = (index: number, val: string) => {
    const next = [...items];
    next[index] = val;
    onChange(next);
  };

  const handleAddItem = () => {
    onChange([...items, ""]);
  };

  const handleDeleteItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-1 space-y-1">
      <ol className="list-decimal pl-5 space-y-1 text-[10.5pt] font-serif">
        {items.map((item, index) => (
          <li key={index} className="relative group/list pl-1">
            <div className="flex items-start gap-1">
              <EditableCell
                value={item}
                onChange={(val) => handleItemChange(index, val)}
                className={`flex-1 ${!item.trim() ? "text-gray-300 italic min-h-[20px]" : "text-black"}`}
              />
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                className="print-hidden opacity-0 group-hover/list:opacity-100 text-red-500 hover:text-red-700 text-sm font-bold shrink-0 ml-1 px-1 rounded transition-opacity"
                title="Delete item"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={handleAddItem}
        className="print-hidden mt-1 text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1 pl-5"
      >
        <span>+ Add {placeholder}</span>
      </button>
    </div>
  );
};

export default function CvPreviewModal({ profile, activities, onClose }: CvPreviewModalProps) {

  // States for CV preview (editable)
  const [profileInfo, setProfileInfo] = useState({
    name: "",
    email: "",
    contact: "",
    department: "",
    college: "",
    doj: "",
    careerExp: "",
    industryExp: "",
    teachingExp: "",
    designationAcademic: "",
    designationAdmin: "",
  });

  const [researchAreas, setResearchAreas] = useState<string[]>([
    "Research Area 1",
    "Research Area 2"
  ]);

  const [coursesDelivered, setCoursesDelivered] = useState<string[]>([
    "Course 1",
    "Course 2"
  ]);

  const [teacherUG, setTeacherUG] = useState("Yes");
  const [teacherPG, setTeacherPG] = useState("Yes");
  const [teacherPhD, setTeacherPhD] = useState("No");

  const [recognitions, setRecognitions] = useState<string[]>([
    "Recognized PG Teacher by Mumbai University"
  ]);

  const [educationHistory, setEducationHistory] = useState<EducationEntry[]>([
    { examination: "Ph.D", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "PG", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "UG", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "Diploma", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
    { examination: "NET/SET/Other", degree: "", university: "", institute: "", yearOfPassing: "", cgpaOrPercentage: "" },
  ]);

  const [notableExperience, setNotableExperience] = useState<Array<{
    organization: string;
    designation: string;
    doj: string;
    dol: string;
    years: string;
  }>>([
    { organization: "K J Somaiya College of Engineering", designation: "Assistant Professor", doj: "01-07-2020", dol: "Present", years: "3" }
  ]);

  const [researchAccomplishments, setResearchAccomplishments] = useState({
    studentsPhDActive: "0",
    studentsPhDCompleted: "0",
    studentsPGCompleted: "0",
    studentsUGCompleted: "0",
    publicationsTotal: "0",
    publicationsJournal: "0",
    publicationsConference: "0",
  });

  const [detailsPublications, setDetailsPublications] = useState({
    internationalJournals: ["International Journal Paper 1"],
    nationalJournals: ["National Journal Paper 1"],
    conferences: ["Conference Paper 1"],
    booksChapters: ["Book/Book Chapter 1"],
    patentsCopyrights: ["Patent/Copyright 1"],
  });

  const [researchProjects, setResearchProjects] = useState({
    completedRs: "",
    ongoingRs: "",
    appliedRs: "",
    completedDetails: ["Completed Project Details 1"],
    ongoingDetails: ["Ongoing Project Details 1"],
    appliedDetails: ["Applied Project Details 1"],
  });

  const [iprCopyrights, setIprCopyrights] = useState<string[]>([
    "IPR / Copyright details..."
  ]);

  const [fdpAttended, setFdpAttended] = useState<string[]>([
    "FDP Attended 1"
  ]);
  const [fdpOrganized, setFdpOrganized] = useState<string[]>([
    "FDP Organized 1"
  ]);
  const [fdpDelivered, setFdpDelivered] = useState<string[]>([
    "Session Delivered 1"
  ]);

  const [keyAchievements, setKeyAchievements] = useState<string[]>([
    "Key Scholastic Achievement 1"
  ]);

  const [positionsResponsibility, setPositionsResponsibility] = useState<string[]>([
    "Positions and responsibility 1"
  ]);

  const [cvDate, setCvDate] = useState(() => {
    const year = new Date().getFullYear();
    return `   /   / ${year}`;
  });

  useEffect(() => {
    if (profile) {
      setProfileInfo({
        name: profile.fullName || "",
        email: profile.officialEmail || "",
        contact: profile.phoneNumber || "",
        department: profile.department || "",
        college: profile.schoolInstitute || "",
        doj: profile.dateOfJoining || "",
        careerExp: profile.careerExperience || "",
        industryExp: profile.industryExperience || "",
        teachingExp: profile.teachingExperience || "",
        designationAcademic: profile.designation || "",
        designationAdmin: profile.administrativeDesignation || "",
      });

      const EXAMINATIONS = ["Ph.D", "PG", "UG", "Diploma", "NET/SET/Other"] as const;
      let eduData: EducationEntry[] = EXAMINATIONS.map((exam) => ({
        examination: exam,
        degree: "",
        university: "",
        institute: "",
        yearOfPassing: "",
        cgpaOrPercentage: "",
      }));

      if (profile.education && profile.education.length > 0) {
        eduData = EXAMINATIONS.map((exam) => {
          const match = profile.education.find((e: any) => {
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
      }
      setEducationHistory(eduData);
    }
  }, [profile]);

  useEffect(() => {
    if (activities && activities.length > 0) {
      // 1. Research domains: collect "researchArea" or "domain" fields
      const areas: string[] = [];
      // 2. Courses delivered: collect "courseName", "subjectName", "courseTitle"
      const courses: string[] = [];
      
      // 3. FDP Attended, Organized, Delivered
      const fdpAtt: string[] = [];
      const fdpOrg: string[] = [];
      const fdpDel: string[] = [];
      
      // 4. Publications counts & details
      let pubTotal = 0;
      let journalCount = 0;
      let confCount = 0;
      const intJournalsList: string[] = [];
      const natJournalsList: string[] = [];
      const conferencesList: string[] = [];
      const booksList: string[] = [];
      const patentsList: string[] = [];
      
      // 5. Research projects counts & details
      let completedAmount = 0;
      let ongoingAmount = 0;
      let appliedAmount = 0;
      const completedProjDetails: string[] = [];
      const ongoingProjDetails: string[] = [];
      const appliedProjDetails: string[] = [];
      const copyrightsList: string[] = [];
      
      // 6. Notable experience details
      const expList: typeof notableExperience = [];
      
      // 7. Notable scholastic achievements
      const achList: string[] = [];
      
      // 8. Positions & responsibility
      const posList: string[] = [];

      // Ph.D, PG, UG student counts
      let activePhD = 0;
      let completedPhD = 0;
      let completedPG = 0;
      let completedUG = 0;

      activities.forEach((act) => {
        const type = act.activityType.toLowerCase();
        const cat = act.pmsCategory.toLowerCase();
        const data = act.data || {};
        
        // Extract research area / domain
        if (data.researchArea) areas.push(data.researchArea);
        if (data.domain) areas.push(data.domain);
        
        // Extract courses
        if (data.courseName) courses.push(data.courseName);
        if (data.subjectName) courses.push(data.subjectName);
        if (data.courseTitle) courses.push(data.courseTitle);
        
        // FDPs mapping
        if (type.includes("fdp") || type.includes("sttp") || type.includes("refresher") || type.includes("orientation") || type.includes("workshop") || type.includes("seminar") || type.includes("training")) {
          // Attended
          if (cat.includes("skill") || type.includes("attended")) {
            fdpAtt.push(`${data.fdpTitle || data.courseTitle || data.workshopTitle || data.seminarTitle || act.activityType}${data.dates ? ` (${data.dates})` : ""}${data.organizationName ? ` at ${data.organizationName}` : ""}`);
          }
          // Organized
          else if (cat.includes("institution") || type.includes("organized")) {
            fdpOrg.push(`${data.role || "Coordinator"} - ${data.fdpTitle || data.sttpTitle || data.workshopTitle || data.seminarTitle || data.conferenceName || act.activityType}${data.dates ? ` (${data.dates})` : ""}`);
          }
        }
        
        // Delivered (expert session, invited talk)
        if (type.includes("talk") || type.includes("expert session") || type.includes("delivered") || type.includes("conducted") || type.includes("invited")) {
          fdpDel.push(`${data.talkTitle || data.sessionTitle || act.activityType}${data.instituteOrganization || data.organizationName ? ` at ${data.instituteOrganization || data.organizationName}` : ""}${data.date ? ` on ${data.date}` : ""}`);
        }
        
        // Publications mapping
        if (type.includes("publication") || type.includes("journal") || type.includes("paper") || type.includes("book")) {
          pubTotal++;
          if (type.includes("journal") || type.includes("publication")) {
            journalCount++;
            const desc = `${data.authors ? `${data.authors}, ` : ""}"${data.paperTitle || data.bookTitle || ""}", ${data.journalName || data.publisher || ""}${data.publicationYear ? ` (${data.publicationYear})` : ""}`;
            const idxType = (data.indexingType || data.quartile || "").toLowerCase();
            const isInt = type.includes("scopus") || type.includes("sci") || type.includes("web of science") || idxType.includes("sci") || idxType.includes("scopus") || idxType.includes("q");
            if (isInt) {
              intJournalsList.push(desc);
            } else {
              natJournalsList.push(desc);
            }
          } else if (type.includes("conference")) {
            confCount++;
            conferencesList.push(`${data.authors ? `${data.authors}, ` : ""}"${data.paperTitle || data.abstractTitle || data.posterTitle || ""}", ${data.conferenceName || ""}${data.year || data.publicationYear ? ` (${data.year || data.publicationYear})` : ""}`);
          } else if (type.includes("book")) {
            booksList.push(`"${data.bookTitle || data.chapterTitle || ""}" published by ${data.publisher || ""}${data.publicationYear ? ` (${data.publicationYear})` : ""}`);
          }
        }

        // Patents & Copyrights
        if (type.includes("patent") || type.includes("copyright")) {
          const patentDesc = `${data.patentTitle || data.workTitle || ""}${data.patentNumber || data.registrationNumber ? ` (No: ${data.patentNumber || data.registrationNumber})` : ""}${data.filingDate || data.registrationDate || data.grantDate ? ` - ${data.filingDate || data.registrationDate || data.grantDate}` : ""}`;
          patentsList.push(patentDesc);
          if (type.includes("copyright")) {
            copyrightsList.push(patentDesc);
          }
        }

        // Research supervision (PhD, PG, UG)
        if (type.includes("phd") || type.includes("doctoral")) {
          if (type.includes("guidance") || type.includes("supervision") || type.includes("scholar")) {
            activePhD++;
          }
          if (type.includes("awarded") || type.includes("completed")) {
            completedPhD++;
          }
        } else if (type.includes("masters") || type.includes("pg dissertation") || type.includes("dissertation")) {
          completedPG++;
        } else if (type.includes("ug project") || type.includes("capstone") || type.includes("mini project")) {
          completedUG++;
        }

        // Research Grants & Consultancy
        if (type.includes("grant") || type.includes("sponsored") || type.includes("consultancy") || type.includes("project")) {
          const amt = parseFloat(data.amount || "0");
          const desc = `"${data.projectTitle || data.sponsoringOrganization || ""}" funding from ${data.fundingAgency || data.sponsoringOrganization || ""}${amt ? ` (Rs. ${amt})` : ""}`;
          
          if (type.includes("completed")) {
            completedAmount += amt;
            completedProjDetails.push(desc);
          } else if (type.includes("ongoing") || type.includes("progress")) {
            ongoingAmount += amt;
            ongoingProjDetails.push(desc);
          } else {
            appliedAmount += amt;
            appliedProjDetails.push(desc);
          }
        }

        // Notable achievements (Awards)
        if (cat.includes("award") || type.includes("award") || type.includes("recognition")) {
          achList.push(`${data.awardTitle || data.recognitionTitle || act.activityType} from ${data.awardingBody || data.organizationName || "External Body"}${data.date ? ` (${data.date})` : ""}`);
        }

        // Positions & Responsibility
        if (cat.includes("administrative") || type.includes("role") || type.includes("coordinator") || type.includes("committee")) {
          posList.push(`${data.roleName || data.role || data.departmentName || act.activityType}${data.duration ? ` (${data.duration})` : ""}`);
        }
      });

      if (areas.length > 0) setResearchAreas([...new Set(areas)]);
      if (courses.length > 0) setCoursesDelivered([...new Set(courses)]);
      
      if (fdpAtt.length > 0) setFdpAttended(fdpAtt);
      if (fdpOrg.length > 0) setFdpOrganized(fdpOrg);
      if (fdpDel.length > 0) setFdpDelivered(fdpDel);

      setResearchAccomplishments({
        studentsPhDActive: String(activePhD),
        studentsPhDCompleted: String(completedPhD),
        studentsPGCompleted: String(completedPG),
        studentsUGCompleted: String(completedUG),
        publicationsTotal: String(pubTotal),
        publicationsJournal: String(journalCount),
        publicationsConference: String(confCount),
      });

      setDetailsPublications({
        internationalJournals: intJournalsList.length > 0 ? intJournalsList : ["Enter International Journal Paper"],
        nationalJournals: natJournalsList.length > 0 ? natJournalsList : ["Enter National Journal Paper"],
        conferences: conferencesList.length > 0 ? conferencesList : ["Enter Conference Paper"],
        booksChapters: booksList.length > 0 ? booksList : ["Enter Book/Book Chapter"],
        patentsCopyrights: patentsList.length > 0 ? patentsList : ["Enter Patent/Copyright"],
      });

      setResearchProjects({
        completedRs: completedAmount ? String(completedAmount) : "",
        ongoingRs: ongoingAmount ? String(ongoingAmount) : "",
        appliedRs: appliedAmount ? String(appliedAmount) : "",
        completedDetails: completedProjDetails.length > 0 ? completedProjDetails : ["Enter Completed Research Project"],
        ongoingDetails: ongoingProjDetails.length > 0 ? ongoingProjDetails : ["Enter On-going Research Project"],
        appliedDetails: appliedProjDetails.length > 0 ? appliedProjDetails : ["Enter Applied Research Project"],
      });

      if (copyrightsList.length > 0) setIprCopyrights(copyrightsList);
      if (achList.length > 0) setKeyAchievements(achList);
      if (posList.length > 0) setPositionsResponsibility(posList);
    }
  }, [activities]);

  const updateProfileInfo = (field: string, val: string) => {
    setProfileInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleEducationChange = (index: number, field: keyof EducationEntry, val: string) => {
    const next = [...educationHistory];
    next[index] = { ...next[index], [field]: val };
    setEducationHistory(next);
  };

  const handleExperienceChange = (index: number, field: string, val: string) => {
    const next = [...notableExperience];
    next[index] = { ...next[index], [field]: val };
    setNotableExperience(next);
  };

  const handleAddExperience = () => {
    setNotableExperience([
      ...notableExperience,
      { organization: "", designation: "", doj: "", dol: "", years: "" }
    ]);
  };

  const handleDeleteExperience = (index: number) => {
    setNotableExperience(notableExperience.filter((_, i) => i !== index));
  };

  const handleAccomplishmentChange = (field: string, val: string) => {
    setResearchAccomplishments((prev) => ({ ...prev, [field]: val }));
  };

  const handleDetailPublicationsChange = (field: keyof typeof detailsPublications, val: string[]) => {
    setDetailsPublications((prev) => ({ ...prev, [field]: val }));
  };

  const handleProjectsChange = (field: string, val: string) => {
    setResearchProjects((prev) => ({ ...prev, [field]: val }));
  };

  const handleProjectDetailsChange = (field: 'completedDetails' | 'ongoingDetails' | 'appliedDetails', val: string[]) => {
    setResearchProjects((prev) => ({ ...prev, [field]: val }));
  };

  const handleAchievementChange = (index: number, val: string) => {
    const next = [...keyAchievements];
    next[index] = val;
    setKeyAchievements(next);
  };

  const handleAddAchievement = () => {
    setKeyAchievements([...keyAchievements, ""]);
  };

  const handleDeleteAchievement = (index: number) => {
    setKeyAchievements(keyAchievements.filter((_, i) => i !== index));
  };

  const handlePositionChange = (index: number, val: string) => {
    const next = [...positionsResponsibility];
    next[index] = val;
    setPositionsResponsibility(next);
  };

  const handleAddPosition = () => {
    setPositionsResponsibility([...positionsResponsibility, ""]);
  };

  const handleDeletePosition = (index: number) => {
    setPositionsResponsibility(positionsResponsibility.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm md:p-6 print:absolute print:inset-0 print:bg-transparent print:p-0 print:backdrop-blur-none print:block print:w-full print:h-auto print:static">
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden {
            display: none !important;
          }
          .cv-page {
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10mm 15mm 10mm 25mm !important;
          }
          .cv-page:last-child {
            page-break-after: avoid !important;
          }
          .cv-red-stripe {
            position: absolute !important;
            left: 10mm !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 8mm !important;
            background-color: #991b1b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        @media screen {
          .cv-page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            box-sizing: border-box;
            padding: 10mm 15mm 10mm 25mm;
          }
          .cv-red-stripe {
            position: absolute;
            left: 10mm;
            top: 0;
            bottom: 0;
            width: 8mm;
            background-color: #991b1b;
          }
        }

        .cv-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          margin-bottom: 6px;
          font-family: 'Times New Roman', Georgia, serif;
        }
        .cv-table th, .cv-table td {
          border: 1px solid #000000;
          padding: 4px 8px;
          font-size: 9.8pt;
          line-height: 1.35;
          text-align: left;
          color: #000000;
          font-family: 'Times New Roman', Georgia, serif;
        }
        .duration-editable:hover {
          outline: 1px dashed #ef4444 !important;
          background-color: #fef2f2 !important;
        }
      `}</style>

      <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-red-100 bg-slate-100 shadow-2xl print:border-none print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:overflow-visible print:bg-transparent">
        <header className="flex flex-col gap-4 border-b border-gray-150 bg-white px-6 py-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-55 text-red-600">
              <Icon name="file" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-gray-900 font-sans">
                Somaiya Faculty CV
              </h2>
              <p className="text-xs font-semibold text-gray-505 font-sans">
                Interactive Print-ready Layout (Dashed outline indicates editable text)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-500 font-sans italic">
              Profile information is automatically synced.
            </div>

            <button
              onClick={() => {
                const nameStr = profileInfo.name
                  ? profileInfo.name.trim().replace(/[^a-zA-Z0-9\s-_]/g, "").replace(/\s+/g, "_")
                  : "Faculty";
                handleExportReport("Somaiya CV", `${nameStr}_CV`);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-red-150 transition hover:bg-red-700 font-sans"
            >
              <Icon name="check" className="h-4 w-4" />
              Export PDF / Print
            </button>

            <span className="h-6 w-px bg-gray-200 mx-1"></span>

            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-250 bg-white text-gray-500 transition hover:bg-red-50 hover:text-red-600 font-sans"
              aria-label="Close modal"
            >
              <span className="text-lg font-bold">×</span>
            </button>
          </div>
        </header>

        {/* Scrollable document wrapper on screen */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:overflow-visible print:p-0 bg-slate-200 print:bg-transparent">
          <div id="report-content" className="print:p-0 print:max-w-none">
            
            {/* ================= PAGE 1 ================= */}
            <div className="cv-page">
              <div className="cv-red-stripe"></div>
              
              {/* Institution Title */}
              <h1 className="text-center text-xl font-bold tracking-wide font-serif mb-3 uppercase text-black pt-2">
                Somaiya Vidyavihar University
              </h1>

              {/* Personal Info Grid */}
              <table className="cv-table">
                <tbody>
                  <tr>
                    <td style={{ width: "60%" }}>
                      <div className="flex gap-2">
                        <strong>Name:</strong> 
                        <EditableCell value={profileInfo.name} onChange={(v) => updateProfileInfo("name", v)} className="flex-1 font-bold" />
                      </div>
                    </td>
                    <td style={{ width: "40%" }}>
                      <div className="flex gap-2">
                        <strong>E-mail:</strong> 
                        <EditableCell value={profileInfo.email} onChange={(v) => updateProfileInfo("email", v)} className="flex-1" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className="flex gap-2">
                        <strong>Contact No:</strong> 
                        <EditableCell value={profileInfo.contact} onChange={(v) => updateProfileInfo("contact", v)} className="flex-1" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className="flex gap-2">
                        <strong>Department/Section:</strong> 
                        <EditableCell value={profileInfo.department} onChange={(v) => updateProfileInfo("department", v)} className="flex-1" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className="flex gap-2">
                        <strong>College:</strong> 
                        <EditableCell value={profileInfo.college} onChange={(v) => updateProfileInfo("college", v)} className="flex-1" />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <div className="flex flex-wrap items-center gap-x-4">
                        <span><strong>DOJ Somaiya:</strong></span>
                        <EditableCell className="min-w-[80px]" value={profileInfo.doj} onChange={(v) => updateProfileInfo("doj", v)} />
                        <span><strong>Career Experience:</strong></span>
                        <EditableCell className="min-w-[30px] text-center" value={profileInfo.careerExp} onChange={(v) => updateProfileInfo("careerExp", v)} /><span>Yrs</span>
                        <span><strong>Industry Experience:</strong></span>
                        <EditableCell className="min-w-[30px] text-center" value={profileInfo.industryExp} onChange={(v) => updateProfileInfo("industryExp", v)} /><span>Yrs</span>
                        <span><strong>Teaching Experience:</strong></span>
                        <EditableCell className="min-w-[30px] text-center" value={profileInfo.teachingExp} onChange={(v) => updateProfileInfo("teachingExp", v)} /><span>Yrs</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ padding: "8px 10px" }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Present Academic Designation:</strong>
                          <div className="text-[9.5pt] text-gray-500 italic">(Professor/Associate Professor/Assistant Professor)</div>
                          <EditableCell value={profileInfo.designationAcademic} onChange={(v) => updateProfileInfo("designationAcademic", v)} className="mt-1 font-bold" />
                        </div>
                        <div className="border-l border-black pl-4">
                          <strong>Present Administrative Designation:</strong>
                          <div className="text-[9.5pt] text-gray-500 italic">(Principal/Vice-Principal/ Associate Dean/ HOD etc)</div>
                          <EditableCell value={profileInfo.designationAdmin} onChange={(v) => updateProfileInfo("designationAdmin", v)} className="mt-1 font-bold" />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Specialization & Courses */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={2} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Area of research/specialization and Courses Delivered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: "50%", verticalAlign: "top", padding: "10px" }}>
                      <strong>Research domain/interests/areas</strong>
                      <EditableList
                        items={researchAreas}
                        onChange={setResearchAreas}
                        placeholder="Research area"
                      />
                    </td>
                    <td style={{ width: "50%", verticalAlign: "top", padding: "10px" }}>
                      <strong>Courses Delivered</strong>
                      <EditableList
                        items={coursesDelivered}
                        onChange={setCoursesDelivered}
                        placeholder="Course delivered"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Recognitions */}
              <table className="cv-table">
                <tbody>
                  <tr>
                    <td style={{ width: "55%" }}>
                      <strong>Recognition as a teacher by any University</strong>
                    </td>
                    <td style={{ width: "15%" }}>
                      <strong>UG:</strong>
                      <select
                        value={teacherUG}
                        onChange={(e) => setTeacherUG(e.target.value)}
                        className="ml-2 border border-gray-300 rounded px-1 text-xs py-0.5 print-hidden"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <span className="hidden print:inline-block ml-1 font-bold">{teacherUG}</span>
                    </td>
                    <td style={{ width: "15%" }}>
                      <strong>PG:</strong>
                      <select
                        value={teacherPG}
                        onChange={(e) => setTeacherPG(e.target.value)}
                        className="ml-2 border border-gray-300 rounded px-1 text-xs py-0.5 print-hidden"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <span className="hidden print:inline-block ml-1 font-bold">{teacherPG}</span>
                    </td>
                    <td style={{ width: "15%" }}>
                      <strong>Ph.D :</strong>
                      <select
                        value={teacherPhD}
                        onChange={(e) => setTeacherPhD(e.target.value)}
                        className="ml-2 border border-gray-300 rounded px-1 text-xs py-0.5 print-hidden"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <span className="hidden print:inline-block ml-1 font-bold">{teacherPhD}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: "8px 10px" }}>
                      <strong>Details of Recognitions</strong>
                      <EditableList
                        items={recognitions}
                        onChange={setRecognitions}
                        placeholder="Recognition details"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Education history */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={6} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Education
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: "#fafafa" }}>
                    <th style={{ width: "16%" }}><strong>Examination</strong></th>
                    <th style={{ width: "23%" }}><strong>Name of the Degree</strong></th>
                    <th style={{ width: "23%" }}><strong>University/Board</strong></th>
                    <th style={{ width: "20%" }}><strong>Institute/College</strong></th>
                    <th style={{ width: "10%" }}><strong>Year</strong></th>
                    <th style={{ width: "8%" }}><strong>CPI/SPI/%Marks</strong></th>
                  </tr>
                </thead>
                <tbody>
                  {educationHistory.map((edu, idx) => (
                    <tr key={edu.examination}>
                      <td><strong>{edu.examination}</strong></td>
                      <td>
                        <EditableCell value={edu.degree} onChange={(v) => handleEducationChange(idx, "degree", v)} />
                      </td>
                      <td>
                        <EditableCell value={edu.university} onChange={(v) => handleEducationChange(idx, "university", v)} />
                      </td>
                      <td>
                        <EditableCell value={edu.institute} onChange={(v) => handleEducationChange(idx, "institute", v)} />
                      </td>
                      <td>
                        <EditableCell value={edu.yearOfPassing} onChange={(v) => handleEducationChange(idx, "yearOfPassing", v)} className="text-center" />
                      </td>
                      <td>
                        <EditableCell value={edu.cgpaOrPercentage} onChange={(v) => handleEducationChange(idx, "cgpaOrPercentage", v)} className="text-center" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Notable Experience details */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={6} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Notable Experience Details
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: "#fafafa" }}>
                    <th style={{ width: "8%" }}><strong>Sr. No</strong></th>
                    <th style={{ width: "35%" }}><strong>Name of the organization</strong></th>
                    <th style={{ width: "23%" }}><strong>Designation</strong></th>
                    <th style={{ width: "12%" }}><strong>Date of Joining</strong></th>
                    <th style={{ width: "12%" }}><strong>Date of Leaving</strong></th>
                    <th style={{ width: "10%" }}><strong>Experience (Years)</strong></th>
                  </tr>
                </thead>
                <tbody>
                  {notableExperience.map((exp, idx) => (
                    <tr key={idx}>
                      <td className="relative text-center">
                        <strong>{idx + 1}.</strong>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(idx)}
                          className="print-hidden absolute left-1 top-1 text-red-500 hover:text-red-700 text-xs font-bold"
                          title="Delete row"
                        >
                          ×
                        </button>
                      </td>
                      <td>
                        <EditableCell value={exp.organization} onChange={(v) => handleExperienceChange(idx, "organization", v)} />
                      </td>
                      <td>
                        <EditableCell value={exp.designation} onChange={(v) => handleExperienceChange(idx, "designation", v)} />
                      </td>
                      <td>
                        <EditableCell value={exp.doj} onChange={(v) => handleExperienceChange(idx, "doj", v)} className="text-center" />
                      </td>
                      <td>
                        <EditableCell value={exp.dol} onChange={(v) => handleExperienceChange(idx, "dol", v)} className="text-center" />
                      </td>
                      <td>
                        <EditableCell value={exp.years} onChange={(v) => handleExperienceChange(idx, "years", v)} className="text-center" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={handleAddExperience}
                className="print-hidden text-xs text-red-700 hover:text-red-950 font-bold mb-4"
              >
                + Add Experience Row
              </button>

              {/* Research accomplishments part 1 */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={4} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Research Accomplishments and Projects
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} style={{ width: "50%" }}>
                      <strong>No of students pursuing Ph.D as on date:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.studentsPhDActive} onChange={(v) => handleAccomplishmentChange("studentsPhDActive", v)} />
                    </td>
                    <td colSpan={2} style={{ width: "50%" }}>
                      <strong>No of students completed Ph.D as on date:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.studentsPhDCompleted} onChange={(v) => handleAccomplishmentChange("studentsPhDCompleted", v)} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <strong>No of students completed PG thesis / Project work as on date:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.studentsPGCompleted} onChange={(v) => handleAccomplishmentChange("studentsPGCompleted", v)} />
                    </td>
                    <td colSpan={2}>
                      <strong>No of students / groups completed UG projects as on date:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.studentsUGCompleted} onChange={(v) => handleAccomplishmentChange("studentsUGCompleted", v)} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ width: "25%" }}>
                      <strong>Publications Total:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.publicationsTotal} onChange={(v) => handleAccomplishmentChange("publicationsTotal", v)} />
                    </td>
                    <td style={{ width: "40%" }}>
                      <strong>Number of Peer review Journal papers:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.publicationsJournal} onChange={(v) => handleAccomplishmentChange("publicationsJournal", v)} />
                    </td>
                    <td colSpan={2} style={{ width: "35%" }}>
                      <strong>Number of Conference papers:</strong>
                      <EditableCell className="inline-block ml-1 min-w-[30px] text-center font-bold" value={researchAccomplishments.publicationsConference} onChange={(v) => handleAccomplishmentChange("publicationsConference", v)} />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} style={{ padding: "8px 10px" }}>
                      <strong>Details of Publications:</strong>
                      <div className="mt-1 pl-4">
                        <strong className="text-red-900 font-sans text-[9.5pt] uppercase tracking-wider">International Journals</strong>
                        <EditableList
                          items={detailsPublications.internationalJournals}
                          onChange={(v) => handleDetailPublicationsChange("internationalJournals", v)}
                          placeholder="International publication detail"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ================= PAGE 2 ================= */}
            <div className="cv-page">
              <div className="cv-red-stripe"></div>
              
              {/* Page 2 Institution Title */}
              <h1 className="text-center text-xl font-bold tracking-wide font-serif mb-3 uppercase text-black pt-2">
                Somaiya Vidyavihar University
              </h1>

              {/* Details of Publications Continued */}
              <table className="cv-table">
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 10px" }}>
                      <strong>Details of Publications (Continued):</strong>
                      
                      <div className="mt-3 pl-4">
                        <strong className="text-red-900 font-sans text-[9.5pt] uppercase tracking-wider">National Journals</strong>
                        <EditableList
                          items={detailsPublications.nationalJournals}
                          onChange={(v) => handleDetailPublicationsChange("nationalJournals", v)}
                          placeholder="National publication detail"
                        />
                      </div>

                      <div className="mt-4 pl-4">
                        <strong className="text-red-900 font-sans text-[9.5pt] uppercase tracking-wider">Conferences</strong>
                        <EditableList
                          items={detailsPublications.conferences}
                          onChange={(v) => handleDetailPublicationsChange("conferences", v)}
                          placeholder="Conference presentation detail"
                        />
                      </div>

                      <div className="mt-4 pl-4">
                        <strong className="text-red-900 font-sans text-[9.5pt] uppercase tracking-wider">Books/Book Chapters</strong>
                        <EditableList
                          items={detailsPublications.booksChapters}
                          onChange={(v) => handleDetailPublicationsChange("booksChapters", v)}
                          placeholder="Book/chapter detail"
                        />
                      </div>

                      <div className="mt-4 pl-4">
                        <strong className="text-red-900 font-sans text-[9.5pt] uppercase tracking-wider">Patents/Copy Rights</strong>
                        <EditableList
                          items={detailsPublications.patentsCopyrights}
                          onChange={(v) => handleDetailPublicationsChange("patentsCopyrights", v)}
                          placeholder="Patent/copyright detail"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Research projects / consultancy */}
              <table className="cv-table">
                <tbody>
                  <tr>
                    <td style={{ width: "33%", verticalAlign: "top", padding: "8px 10px" }}>
                      <strong>No of Research / consultancy / projects completed:</strong>
                      <div className="mt-1 flex items-center">
                        <span>Rs:</span>
                        <EditableCell className="inline-block ml-1 min-w-[50px] font-bold" value={researchProjects.completedRs} onChange={(v) => handleProjectsChange("completedRs", v)} />
                      </div>
                    </td>
                    <td style={{ width: "33%", verticalAlign: "top", padding: "8px 10px" }}>
                      <strong>No of Research / consultancy / projects on-going:</strong>
                      <div className="mt-1 flex items-center">
                        <span>Rs:</span>
                        <EditableCell className="inline-block ml-1 min-w-[50px] font-bold" value={researchProjects.ongoingRs} onChange={(v) => handleProjectsChange("ongoingRs", v)} />
                      </div>
                    </td>
                    <td style={{ width: "34%", verticalAlign: "top", padding: "8px 10px" }}>
                      <strong>No of Research / consultancy / projects on applied as on date:</strong>
                      <div className="mt-1 flex items-center">
                        <span>Rs:</span>
                        <EditableCell className="inline-block ml-1 min-w-[50px] font-bold" value={researchProjects.appliedRs} onChange={(v) => handleProjectsChange("appliedRs", v)} />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} style={{ padding: "8px 10px" }}>
                      <strong>Details of Research / consultancy / projects:</strong>
                      
                      <div className="mt-2 pl-4">
                        <strong className="text-red-900 font-sans text-[9pt] uppercase tracking-wider">Completed</strong>
                        <EditableList
                          items={researchProjects.completedDetails}
                          onChange={(v) => handleProjectDetailsChange("completedDetails", v)}
                          placeholder="Completed project"
                        />
                      </div>

                      <div className="mt-4 pl-4">
                        <strong className="text-red-900 font-sans text-[9pt] uppercase tracking-wider">On-going</strong>
                        <EditableList
                          items={researchProjects.ongoingDetails}
                          onChange={(v) => handleProjectDetailsChange("ongoingDetails", v)}
                          placeholder="On-going project"
                        />
                      </div>

                      <div className="mt-4 pl-4">
                        <strong className="text-red-900 font-sans text-[9pt] uppercase tracking-wider">Applied</strong>
                        <EditableList
                          items={researchProjects.appliedDetails}
                          onChange={(v) => handleProjectDetailsChange("appliedDetails", v)}
                          placeholder="Applied project"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* IPR/Copyrights */}
              <table className="cv-table">
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 10px" }}>
                      <strong>IPR/ Copyrights</strong>
                      <EditableList
                        items={iprCopyrights}
                        onChange={setIprCopyrights}
                        placeholder="IPR/Copyright details"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* FDP Attended, Organized, Delivered */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      FDPs/Seminars/Workshops/Training Programs Attended/ Organized/ Delivered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 10px" }}>
                      <strong>Attended</strong>
                      <EditableList
                        items={fdpAttended}
                        onChange={setFdpAttended}
                        placeholder="Attended FDP/Seminar/Workshop"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 10px" }}>
                      <strong>Organized</strong>
                      <EditableList
                        items={fdpOrganized}
                        onChange={setFdpOrganized}
                        placeholder="Organized FDP/Seminar/Workshop"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 10px" }}>
                      <strong>Delivered</strong>
                      <EditableList
                        items={fdpDelivered}
                        onChange={setFdpDelivered}
                        placeholder="Delivered session details"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Notable Key Scholastic Achievements */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={2} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Notable Key Scholastic Achievements
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keyAchievements.map((ach, idx) => (
                    <tr key={idx}>
                      <td style={{ width: "8%", textAlign: "center" }} className="relative group/ach">
                        <strong>{idx + 1}.</strong>
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievement(idx)}
                          className="print-hidden absolute left-1 top-1 text-red-500 hover:text-red-700 text-xs font-bold"
                          title="Delete row"
                        >
                          ×
                        </button>
                      </td>
                      <td>
                        <EditableCell value={ach} onChange={(v) => handleAchievementChange(idx, v)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={handleAddAchievement}
                className="print-hidden text-xs text-red-700 hover:text-red-950 font-bold mb-4"
              >
                + Add Achievement Row
              </button>

              {/* Notable Positions and Responsibility */}
              <table className="cv-table">
                <thead>
                  <tr>
                    <th colSpan={2} className="text-center font-bold text-[11pt]" style={{ backgroundColor: "#f3f4f6" }}>
                      Notable Positions and Responsibility
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {positionsResponsibility.map((pos, idx) => (
                    <tr key={idx}>
                      <td style={{ width: "8%", textAlign: "center" }} className="relative group/pos">
                        <strong>{idx + 1}.</strong>
                        <button
                          type="button"
                          onClick={() => handleDeletePosition(idx)}
                          className="print-hidden absolute left-1 top-1 text-red-500 hover:text-red-700 text-xs font-bold"
                          title="Delete row"
                        >
                          ×
                        </button>
                      </td>
                      <td>
                        <EditableCell value={pos} onChange={(v) => handlePositionChange(idx, v)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={handleAddPosition}
                className="print-hidden text-xs text-red-700 hover:text-red-950 font-bold mb-6"
              >
                + Add Position Row
              </button>

              {/* Date and Signature footer */}
              <div className="mt-6 flex justify-between items-center text-sm font-bold font-serif px-2">
                <div className="flex items-center gap-1">
                  <span>Date:</span>
                  <EditableCell className="min-w-[120px]" value={cvDate} onChange={setCvDate} />
                </div>
                <div>
                  Signature of Faculty Member
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
