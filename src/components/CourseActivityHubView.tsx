"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

export type ActivityItem = {
  id: number;
  title: string;
  date: string;
  description: string;
  branch: string;
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  category: string;
  activityType: string;
  viewUrl: string;
  downloadUrl: string;
};

type Course = {
  code: string;
  name: string;
  type: "theory" | "laboratory" | "project" | "seminar" | "projectwork";
};

const branchesList = [
  "Computer Engineering (COMP)",
  "Information Technology (IT)",
  "Artificial Intelligence and Data Science (AIDS)",
  "Electronics and Telecommunication Engineering (EXTC)",
  "Electronics and Computer Engineering (EXCP)",
  "Computer Science and Business Systems (CSBS)",
  "Mechanical Engineering (MECH)",
  "Computer and Communication Engineering (CCE)",
  "Robotics and Artificial Intelligence (RAI)",
  "VLSI Design and Technology (VLSI)"
];

const semestersList = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8"
];


// Generates high-fidelity realistic accreditation-compliant activity mock data based on Course Type selection
function generateMockActivities(
  academicYear: string,
  branch: string,
  semester: string,
  course: Course
): ActivityItem[] {
  const baseYear = academicYear.split("-")[0] || "2025";
  const yr = baseYear;
  const activities: ActivityItem[] = [];

  if (course.type === "theory") {
    activities.push(
      {
        id: 1,
        title: `Detailed Course Plan & Syllabus Mapping`,
        date: `04 Jul ${yr}`,
        description: `Accreditation-ready theory course blueprint for ${course.name} detailing syllabus split-up, references, and PO/CO mapping.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Teaching Documents",
        activityType: "Course Plan",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 2,
        title: `Lecture-by-Lecture Lesson Plan`,
        date: `06 Jul ${yr}`,
        description: `Standard lecture schedule listing pedagogical tools, resources, and actual delivery dates.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Teaching Documents",
        activityType: "Lesson Plan",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 3,
        title: `Comprehensive Lecture Notes (Unit 1 to 4)`,
        date: `12 Aug ${yr}`,
        description: `Detailed study notes covering core theoretical concepts, definitions, and numerical examples.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Teaching Documents",
        activityType: "Lecture Notes",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 4,
        title: `Visual Slides and Presentation Deck`,
        date: `15 Aug ${yr}`,
        description: `PowerPoint slide deck incorporating flowcharts and diagrams used during classroom sessions.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Teaching Documents",
        activityType: "PPTs",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 5,
        title: `Continuous Assessment Assignment Guidelines`,
        date: `10 Sep ${yr}`,
        description: `Problem statements for home assignments with evaluation rubrics and submission instructions.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Assessments & Homework",
        activityType: "Assignments",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 6,
        title: `Continuous Assessment Quiz Sheets & Answers`,
        date: `25 Sep ${yr}`,
        description: `Google Forms MCQ summaries and grade spreadsheets assessing continuous learning.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Assessments & Homework",
        activityType: "Quizzes",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 7,
        title: `Mid-Semester Examination Question Paper & Solutions`,
        date: `15 Oct ${yr}`,
        description: `Evaluated mid-sem exam paper along with evaluation schemes and answer keys.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Mid-Sem & End-Sem Exams",
        activityType: "Mid-Sem Exams",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 8,
        title: `End-Semester Examination Format and Sample Sheets`,
        date: `30 Nov ${yr}`,
        description: `University end-semester final exam papers, grading patterns, and moderator worksheets.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Mid-Sem & End-Sem Exams",
        activityType: "End-Sem Exams",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 9,
        title: `Daily Student Theory Attendance Register`,
        date: `05 Dec ${yr}`,
        description: `Monthly student attendance logs, warning letters for default, and remedial engagements.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Execution & Outlines",
        activityType: "Attendance",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 10,
        title: `Result Analysis and Performance Grade Curve`,
        date: `20 Dec ${yr}`,
        description: `Statistical breakdown of grades, passing percentage, and comparative analysis with previous batches.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Execution & Outlines",
        activityType: "Result Analysis",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 11,
        title: `Course Outcome (CO) Attainment calculations`,
        date: `24 Dec ${yr}`,
        description: `Excel sheets calculating direct attainment metrics from exam marks and indirect attainment from exit surveys.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Execution & Outlines",
        activityType: "CO Attainment",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    );
  } else if (course.type === "laboratory") {
    activities.push(
      {
        id: 1,
        title: `Laboratory Course Manual`,
        date: `05 Jul ${yr}`,
        description: `Comprehensive guide detailing setup instructions, objective mapping, and safety measures.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Lab Resources & Setup",
        activityType: "Lab Manual",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 2,
        title: `Syllabus Experiment List`,
        date: `06 Jul ${yr}`,
        description: `Detailed index of 10 core experiments mapped to individual learning goals.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Lab Resources & Setup",
        activityType: "Experiment List",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 3,
        title: `Practical Question Bank`,
        date: `08 Sep ${yr}`,
        description: `List of coding scenarios and system tasks compiled for final practical assessment tests.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Lab Resources & Setup",
        activityType: "Practical Question Bank",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 4,
        title: `Laboratory Session Attendance Register`,
        date: `05 Dec ${yr}`,
        description: `Official attendance tracker signed by faculty for weekly batch laboratory sessions.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Lab Attendance & Execution",
        activityType: "Lab Attendance",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 5,
        title: `Student Lab Submissions & Portfolios`,
        date: `10 Nov ${yr}`,
        description: `Repository of student evaluations, submitted source code, circuit files, and certified lab journals.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Lab Attendance & Execution",
        activityType: "Student Submissions",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 6,
        title: `Continuous Practical Assessment Records`,
        date: `15 Nov ${yr}`,
        description: `Evaluations of weekly experiment logs tracked using direct rubric marks.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Assessments & Evaluation",
        activityType: "Practical Assessments",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 7,
        title: `Practical Examination Marksheets`,
        date: `02 Dec ${yr}`,
        description: `Gradesheets signed by internal and external examiners for end-semester laboratory exams.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Assessments & Evaluation",
        activityType: "Practical Examination Records",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 8,
        title: `End-Sem Viva Voce Evaluation Records`,
        date: `04 Dec ${yr}`,
        description: `Summary sheets detailing viva outcomes and oral performance grades for the batch.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Assessments & Evaluation",
        activityType: "Viva Records",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 9,
        title: `Lab Course Outcome (CO) Attainment Calculations`,
        date: `24 Dec ${yr}`,
        description: `Excel sheets compiling indirect feedback and direct lab exam grades to map CO attainments.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Outcomes & Attainment",
        activityType: "Lab CO Attainment",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    );
  } else {
    // Project Work / Mini Project / Seminar
    activities.push(
      {
        id: 1,
        title: `Course Guidelines & Assessment Rubrics`,
        date: `08 Jul ${yr}`,
        description: `Official handbook detailing project/seminar goals, format rules, review stages, and grading metrics.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Guidelines & Allocation",
        activityType: "Guidelines and Assessment Rubrics",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 2,
        title: `Student Group Allocation & Mentor Mappings`,
        date: `15 Jul ${yr}`,
        description: `Official lists showing mentor allocations, team structures, and roll numbers.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Guidelines & Allocation",
        activityType: "Student Group Allocations",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 3,
        title: `Problem Statement Approval Forms`,
        date: `30 Jul ${yr}`,
        description: `Forms detailing problem approvals, research gaps, HOD sign-offs, and literature survey references.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Guidelines & Allocation",
        activityType: "Problem Statement Approval Forms",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 4,
        title: `Weekly Progress Log Books`,
        date: `01 Oct ${yr}`,
        description: `Progress logs signed by internal guides detailing weekly accomplishments and blockers.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Progress Monitoring",
        activityType: "Weekly Progress Logs",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 5,
        title: `Synopsis & Mid-Term Review Evaluation Reports`,
        date: `25 Oct ${yr}`,
        description: `Mark sheets and feedback records compiled by the project review committee.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Progress Monitoring",
        activityType: "Synopsis/Presentation Review Reports",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 6,
        title: `Project Final Report & Thesis Document`,
        date: `28 Nov ${yr}`,
        description: `Soft copies of final student project reports containing implementation screenshots, code, and conclusions.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Evaluation Records",
        activityType: "Project Report / Thesis Document",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 7,
        title: `External Examiner Evaluation Sheets`,
        date: `03 Dec ${yr}`,
        description: `External mark sheets scoring presentation slides, project demos, and structural code quality.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Evaluation Records",
        activityType: "External Examination Sheets",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 8,
        title: `Viva Voce Evaluation Records`,
        date: `04 Dec ${yr}`,
        description: `Final oral evaluation logs with viva scores signed by external panels.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Evaluation Records",
        activityType: "Viva Voce Evaluation Records",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        id: 9,
        title: `Project CO/PO Attainment Sheets & Surveys`,
        date: `24 Dec ${yr}`,
        description: `Workbook maps, direct presentation scores, and exit surveys assessing project goals.`,
        branch,
        courseCode: course.code,
        courseName: course.name,
        academicYear,
        semester,
        category: "Outcomes & Attainments",
        activityType: "Attainment calculations and Student feedback surveys",
        viewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    );
  }

  return activities;
}

export type CourseMapping = {
  id: string;
  academicYear: string;
  branch: string;
  semester: string;
  courseCode: string;
  courseName: string;
  syllabusFile: { name: string; size?: number; type?: string } | null;
  uploadedBy: string;
  uploadedAt: string;
};

export type PortfolioDocument = {
  documentId: string;
  portfolioId: string;
  category: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: string;
};

export const categoryDocTypes: Record<string, string[]> = {
  "Teaching Documents": ["Syllabus", "Lesson Plan", "Lecture Notes", "PPT", "Lab Manual", "Tutorial Sheet"],
  "Assessments": ["Question Paper", "Answer Key", "Internal Assessment", "Unit Test", "Mid Semester Exam", "End Semester Exam", "Marksheet", "Result Analysis"],
  "Activities": ["Assignment", "Quiz", "Project", "Remedial Class Record", "Student Activity"],
  "Attendance": ["Attendance Sheet", "Defaulter List"],
  "Accreditation Evidence": ["CO Mapping", "PO Mapping", "CO-PO Attainment", "Student Feedback", "Course Exit Survey", "NBA Evidence", "NAAC Evidence", "Academic Audit Document"],
  "Events": ["Workshop", "Seminar", "Guest Lecture", "FDP", "Industrial Visit"]
};

function getStandardCategory(activityType: string): string {
  const t = activityType.toLowerCase();
  
  // Teaching Documents options: Syllabus, Lesson Plan, Lecture Notes, PPT, Lab Manual, Tutorial Sheet
  if (
    t.includes("course plan") ||
    t.includes("lesson plan") ||
    t.includes("lecture notes") ||
    t.includes("ppt") ||
    t.includes("lab manual") ||
    t.includes("experiment list") ||
    t.includes("guidelines and assessment rubrics") ||
    t.includes("tutorial sheet")
  ) {
    return "Teaching Documents";
  }
  
  // Assessments options: Question Paper, Answer Key, Internal Assessment, Unit Test, Mid Semester Exam, End Semester Exam, Marksheet, Result Analysis
  if (
    t.includes("mid-sem exam") ||
    t.includes("end-sem exam") ||
    t.includes("result analysis") ||
    t.includes("practical question bank") ||
    t.includes("practical assessment") ||
    t.includes("examination record") ||
    t.includes("viva") ||
    t.includes("synopsis/presentation review") ||
    t.includes("marksheet") ||
    t.includes("question paper") ||
    t.includes("answer key") ||
    t.includes("internal assessment") ||
    t.includes("unit test")
  ) {
    return "Assessments";
  }
  
  // Activities options: Assignment, Quiz, Project, Remedial Class Record, Student Activity
  if (
    t.includes("assignment") ||
    t.includes("quiz") ||
    t.includes("student submission") ||
    t.includes("student group allocation") ||
    t.includes("weekly progress log") ||
    t.includes("project report") ||
    t.includes("remedial") ||
    t.includes("project") ||
    t.includes("student activity")
  ) {
    return "Activities";
  }
  
  // Attendance options: Attendance Sheet, Defaulter List
  if (
    t.includes("attendance") ||
    t.includes("defaulter list")
  ) {
    return "Attendance";
  }
  
  // Accreditation Evidence options: CO Mapping, PO Mapping, CO-PO Attainment, Course Exit Survey, Student Feedback, Academic Audit Document, NBA Evidence, NAAC Evidence
  if (
    t.includes("attainment") ||
    t.includes("feedback") ||
    t.includes("co mapping") ||
    t.includes("po mapping") ||
    t.includes("audit") ||
    t.includes("nba") ||
    t.includes("naac") ||
    t.includes("problem statement approval") ||
    t.includes("exit survey")
  ) {
    return "Accreditation Evidence";
  }
  
  // Events options: Workshop, Seminar, Guest Lecture, FDP, Industrial Visit
  if (
    t.includes("workshop") ||
    t.includes("seminar") ||
    t.includes("guest lecture") ||
    t.includes("fdp") ||
    t.includes("industrial visit")
  ) {
    return "Events";
  }
  
  return "Teaching Documents"; // fallback
}

export default function CourseActivityHubView() {
  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];

  const [selectedYear, setSelectedYear] = useState<string>("2025-2026");
  const [selectedBranch, setSelectedBranch] = useState<string>(branchesList[0]);
  const [selectedSemester, setSelectedSemester] = useState<string>(semestersList[0]);

  // Text inputs for Course details
  const [inputCourseName, setInputCourseName] = useState<string>("Applied Mathematics-I (Theory)");
  const [inputCourseCode, setInputCourseCode] = useState<string>("COMP101");

  // Track if a saved mapping is selected
  const [selectedMappingId, setSelectedMappingId] = useState<string>("mapping-default-1");

  // Linked Category and Document Type state variables for staging
  const [selectedCategory, setSelectedCategory] = useState<string>("Teaching Documents");
  const [selectedDocType, setSelectedDocType] = useState<string>("Syllabus");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size?: number; type?: string } | null>(null);

  // --- FACULTY COURSE OWNFLOW STATE ---
  const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([
    {
      id: "mapping-default-1",
      academicYear: "2025-2026",
      branch: "Computer Engineering (COMP)",
      semester: "Semester 1",
      courseCode: "COMP101",
      courseName: "Applied Mathematics-I (Theory)",
      syllabusFile: null,
      uploadedBy: "Faculty Member",
      uploadedAt: new Date().toISOString()
    },
    {
      id: "mapping-default-2",
      academicYear: "2025-2026",
      branch: "Computer Engineering (COMP)",
      semester: "Semester 3",
      courseCode: "COMP301",
      courseName: "Data Structures & Algorithms",
      syllabusFile: null,
      uploadedBy: "Faculty Member",
      uploadedAt: new Date().toISOString()
    }
  ]);

  const [portfolioDocuments, setPortfolioDocuments] = useState<PortfolioDocument[]>([
    {
      documentId: "doc-default-1",
      portfolioId: "mapping-default-1",
      category: "Teaching Documents",
      documentType: "Syllabus",
      fileName: "Applied_Math_I_Syllabus.pdf",
      fileSize: 154200,
      uploadedBy: "Faculty Member",
      uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      documentId: "doc-default-2",
      portfolioId: "mapping-default-1",
      category: "Assessments",
      documentType: "Mid Semester Exam",
      fileName: "Applied_Math_I_MidSem_QP.pdf",
      fileSize: 112000,
      uploadedBy: "Faculty Member",
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      documentId: "doc-default-3",
      portfolioId: "mapping-default-1",
      category: "Accreditation Evidence",
      documentType: "CO-PO Attainment",
      fileName: "Applied_Math_I_CO_PO_Attainment.xlsx",
      fileSize: 45000,
      uploadedBy: "Faculty Member",
      uploadedAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ]);

  // --- HANDLERS ---
  const handleUploadSyllabus = (file: File) => {
    console.log("handleUploadSyllabus invoked with file:", file.name, file.size);
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type
    });
  };

  const handleSaveCourseMapping = () => {
    console.log("handleSaveCourseMapping invoked");
    const courseName = inputCourseName.trim();
    const courseCode = inputCourseCode.trim();

    if (!courseName) {
      alert("Please enter a Course Name.");
      return;
    }
    if (!courseCode) {
      alert("Please enter a Course Code.");
      return;
    }

    const now = new Date().toISOString();
    const uploadedBy = "Faculty Member";

    // Check if mapping already exists for the selected academicYear + branch + semester + courseCode
    const existingIndex = courseMappings.findIndex(m =>
      m.academicYear === selectedYear &&
      m.branch === selectedBranch &&
      m.semester === selectedSemester &&
      m.courseCode === courseCode
    );

    if (existingIndex !== -1) {
      // Update existing mapping
      setCourseMappings(prev => prev.map((m, idx) => idx === existingIndex ? {
        ...m,
        courseName,
        uploadedAt: now,
        uploadedBy
      } : m));
      alert("Course portfolio target updated successfully!");
    } else {
      // Create new mapping
      const newMapping: CourseMapping = {
        id: `mapping-${Date.now()}`,
        academicYear: selectedYear,
        branch: selectedBranch,
        semester: selectedSemester,
        courseCode,
        courseName,
        syllabusFile: null,
        uploadedBy,
        uploadedAt: now
      };
      setCourseMappings(prev => [...prev, newMapping]);
      setSelectedMappingId(newMapping.id);
      alert("Course portfolio target saved successfully!");
    }
  };

  const handleSaveEvidenceDocument = () => {
    console.log("handleSaveEvidenceDocument invoked");
    const courseName = inputCourseName.trim();
    const courseCode = inputCourseCode.trim();

    if (!courseName || !courseCode) {
      alert("Please define the Course Name and Course Code before uploading evidence.");
      return;
    }

    if (!uploadedFile) {
      alert("Please select a document file to upload.");
      return;
    }

    const now = new Date().toISOString();
    const uploadedBy = "Faculty Member";

    // 1. Find or create the CourseMapping portfolio
    let activeMapping = courseMappings.find(m =>
      m.academicYear === selectedYear &&
      m.branch === selectedBranch &&
      m.semester === selectedSemester &&
      m.courseCode === courseCode
    );

    let mappingId = "";
    if (activeMapping) {
      mappingId = activeMapping.id;
    } else {
      // Create new mapping on the fly
      const newMappingId = `mapping-${Date.now()}`;
      const newMapping: CourseMapping = {
        id: newMappingId,
        academicYear: selectedYear,
        branch: selectedBranch,
        semester: selectedSemester,
        courseCode,
        courseName,
        syllabusFile: null,
        uploadedBy,
        uploadedAt: now
      };
      setCourseMappings(prev => [...prev, newMapping]);
      setSelectedMappingId(newMappingId);
      mappingId = newMappingId;
    }

    // 2. Add the document to portfolioDocuments list
    const newDoc: PortfolioDocument = {
      documentId: `doc-${Date.now()}`,
      portfolioId: mappingId,
      category: selectedCategory,
      documentType: selectedDocType,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadedBy,
      uploadedAt: now
    };

    setPortfolioDocuments(prev => [...prev, newDoc]);
    setUploadedFile(null);
    alert(`Evidence document [${selectedDocType}] successfully mapped and uploaded to portfolio!`);
  };

  const handleEditMapping = (id: string) => {
    console.log("handleEditMapping invoked internally with ID:", id);
  };

  const handleDeleteMapping = (id: string) => {
    console.log("handleDeleteMapping invoked with ID:", id);
    if (confirm("Are you sure you want to remove this course target?")) {
      setCourseMappings(prev => prev.filter(m => m.id !== id));
      // Reset active states if deleted mapping was selected
      if (selectedMappingId === id) {
        setSelectedMappingId("");
        setUploadedFile(null);
      }
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    if (confirm("Are you sure you want to remove this evidence document from the course portfolio?")) {
      setPortfolioDocuments(prev => prev.filter(doc => doc.documentId !== documentId));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf' && ext !== 'docx') {
        alert("Please upload only PDF or DOCX files.");
        return;
      }
      handleUploadSyllabus(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  // Sync state helpers when filters change (clearing the staged uploadedFile state to prevent layout confusion)
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const mapping = courseMappings.find(m => m.academicYear === year && m.branch === selectedBranch && m.semester === selectedSemester);
    if (mapping) {
      setSelectedMappingId(mapping.id);
      setInputCourseName(mapping.courseName);
      setInputCourseCode(mapping.courseCode);
      setUploadedFile(null);
    } else {
      setSelectedMappingId("");
      setInputCourseName("");
      setInputCourseCode("");
      setUploadedFile(null);
    }
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    const mapping = courseMappings.find(m => m.academicYear === selectedYear && m.branch === branch && m.semester === selectedSemester);
    if (mapping) {
      setSelectedMappingId(mapping.id);
      setInputCourseName(mapping.courseName);
      setInputCourseCode(mapping.courseCode);
      setUploadedFile(null);
    } else {
      setSelectedMappingId("");
      setInputCourseName("");
      setInputCourseCode("");
      setUploadedFile(null);
    }
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    const mapping = courseMappings.find(m => m.academicYear === selectedYear && m.branch === selectedBranch && m.semester === semester);
    if (mapping) {
      setSelectedMappingId(mapping.id);
      setInputCourseName(mapping.courseName);
      setInputCourseCode(mapping.courseCode);
      setUploadedFile(null);
    } else {
      setSelectedMappingId("");
      setInputCourseName("");
      setInputCourseCode("");
      setUploadedFile(null);
    }
  };

  const handleLoadMapping = (id: string) => {
    if (id === "") {
      setSelectedMappingId("");
      setInputCourseName("");
      setInputCourseCode("");
      setUploadedFile(null);
      return;
    }

    const mapping = courseMappings.find(m => m.id === id);
    if (mapping) {
      setSelectedMappingId(mapping.id);
      setSelectedYear(mapping.academicYear);
      setSelectedBranch(mapping.branch);
      setSelectedSemester(mapping.semester);
      setInputCourseName(mapping.courseName);
      setInputCourseCode(mapping.courseCode);
      setUploadedFile(null);
    }
  };

  // Construct a dynamic course type to generate activities and accordions
  const activeCourseName = inputCourseName.trim();
  const activeCourseCode = inputCourseCode.trim();

  // Helper to resolve course type dynamically
  const getCourseTypeFromName = (name: string): "theory" | "laboratory" | "project" | "seminar" | "projectwork" => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("laboratory") || lowerName.includes("lab") || lowerName.includes("practical")) {
      return "laboratory";
    }
    if (lowerName.includes("capstone") || lowerName.includes("project work") || lowerName.includes("major project")) {
      return "projectwork";
    }
    if (lowerName.includes("mini project") || lowerName.includes("project")) {
      return "project";
    }
    if (lowerName.includes("seminar")) {
      return "seminar";
    }
    return "theory";
  };

  const dynamicCourse: Course = {
    code: activeCourseCode || "COURSE101",
    name: activeCourseName || "Unnamed Course",
    type: getCourseTypeFromName(activeCourseName)
  };

  // Generate activities for current selectors
  const activities = (activeCourseName || activeCourseCode)
    ? generateMockActivities(selectedYear, selectedBranch, selectedSemester, dynamicCourse)
    : [];

  // 6 standard categories for NAAC/NBA auditing
  const standardAccordionCategories = [
    "Teaching Documents",
    "Assessments",
    "Activities",
    "Attendance",
    "Accreditation Evidence",
    "Events"
  ];

  const currentCategories = (activeCourseName || activeCourseCode) ? standardAccordionCategories : [];

  // Initialize expanded accordion sections dynamically
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Teaching Documents": true,
    "Assessments": true,
  });

  const toggleSection = (cat: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Find if syllabus exists for the active portfolio
  const activeSyllabusDoc = portfolioDocuments.find(
    (doc) => doc.portfolioId === selectedMappingId && doc.documentType === "Syllabus"
  );

  // Summary Metrics calculations
  const totalBranches = new Set(courseMappings.map((m) => m.branch)).size;
  const totalCourses = new Set(courseMappings.map((m) => m.courseCode)).size;

  // Combined documents & activities in each category
  const activePortfolioDocs = portfolioDocuments.filter(d => d.portfolioId === selectedMappingId);
  const totalItemsCount = activePortfolioDocs.length + activities.length;

  const totalDocuments = activePortfolioDocs.filter(d => d.category === "Teaching Documents").length +
    activities.filter(a => getStandardCategory(a.activityType) === "Teaching Documents").length;

  const totalAssessmentsCount = activePortfolioDocs.filter(d => d.category === "Assessments").length +
    activities.filter(a => getStandardCategory(a.activityType) === "Assessments").length;

  const totalWorkshops = activePortfolioDocs.filter(d => d.category === "Events").length +
    activities.filter(a => getStandardCategory(a.activityType) === "Events").length;

  return (
    <div className="space-y-4">
      {/* Top Filter Panel */}
      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-3.5 border-b border-red-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Icon name="book" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-gray-950">
                  Course & Syllabus Mapping
                </h2>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  Accreditation target definition and syllabus evidence uploader.
                </p>
              </div>
            </div>

            {/* Quick Load Course Selector */}
            <div className="flex flex-col gap-1 sm:min-w-[200px] max-w-xs self-start lg:self-auto">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Icon name="history" className="h-3.5 w-3.5 text-gray-400" />
                <span>Quick Load Course</span>
              </label>
              <div className="relative">
                <select
                  value={selectedMappingId}
                  onChange={(e) => handleLoadMapping(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-slate-50 pl-3 pr-8 py-1.5 text-xs font-bold text-gray-700 outline-none transition hover:border-gray-300 hover:bg-slate-100 focus:border-red-500 focus:ring-4 focus:ring-red-50 truncate"
                >
                  <option value="">-- Create New Target --</option>
                  {courseMappings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.courseCode} ({m.academicYear})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
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

          {/* Workflow Inputs Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 w-full">
            {/* Academic Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Academic Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                >
                  {academicYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Branch / Dept.
              </label>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 truncate"
                >
                  {branchesList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

            {/* Semester */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Semester
              </label>
              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                >
                  {semestersList.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

            {/* Course Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Course Name (Subject Title)
              </label>
              <input
                type="text"
                placeholder="e.g. Applied Mathematics-I"
                value={inputCourseName}
                onChange={(e) => setInputCourseName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-950 placeholder-gray-400 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>

            {/* Course Code */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. COMP101"
                value={inputCourseCode}
                onChange={(e) => setInputCourseCode(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-950 placeholder-gray-400 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          {/* Categorized Document Upload & Mapping Row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between border-t border-red-50/50 pt-4 mt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center flex-1 gap-x-4">
              
              {/* Category Dropdown */}
              <div className="flex flex-col gap-1 sm:min-w-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Icon name="grid" className="h-3.5 w-3.5 text-red-500" />
                  <span>Document Category</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setSelectedCategory(newCat);
                      const types = categoryDocTypes[newCat] || [];
                      if (types.length > 0) {
                        setSelectedDocType(types[0]);
                      }
                    }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  >
                    {Object.keys(categoryDocTypes).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

              {/* Document Type Dropdown */}
              <div className="flex flex-col gap-1 sm:min-w-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Icon name="file" className="h-3.5 w-3.5 text-red-500" />
                  <span>Document Type</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2 text-xs font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                  >
                    {(categoryDocTypes[selectedCategory] || []).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
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

              {/* File Upload Selector */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Select File (PDF / DOCX)
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="file"
                    id="evidence-document-upload"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="evidence-document-upload"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 outline-none transition hover:border-red-200 hover:bg-red-50/5 cursor-pointer shadow-sm shrink-0"
                  >
                    <Icon name="upload" className="h-3.5 w-3.5 text-gray-400" />
                    <span>Choose File</span>
                  </label>
                  {uploadedFile ? (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm truncate max-w-[220px]">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="truncate font-bold" title={uploadedFile.name}>{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="ml-1 text-emerald-500 hover:text-emerald-700 font-extrabold focus:outline-none text-sm"
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 italic">No file selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mt-3 lg:mt-0">
              <button
                type="button"
                onClick={handleSaveCourseMapping}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                <Icon name="edit" className="h-3.5 w-3.5 text-slate-500" />
                <span>Save Target Only</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEvidenceDocument}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4.5 py-2 text-xs font-black text-white shadow-md shadow-red-100/50 hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-100"
              >
                <Icon name="check" className="h-3.5 w-3.5" />
                <span>Map & Upload Document</span>
              </button>
            </div>
          </div>

          {/* Required Note */}
          <p className="text-[10px] font-semibold text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Icon name="info" className="h-3.5 w-3.5 text-red-500 shrink-0" />
            NBA Criterion 2.1 Compliance: Uploading syllabus evidence is mandatory for direct attainment audit.
          </p>
        </div>
      </section>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Branches Taught" value={String(totalBranches)} icon="grid" color="text-red-600 bg-red-50" />
        <SummaryCard label="Subjects Taught" value={String(totalCourses)} icon="book" color="text-sky-600 bg-sky-50" />
        <SummaryCard label="Total Activities" value={String(totalItemsCount)} icon="clipboard" color="text-emerald-600 bg-emerald-50" />
        <SummaryCard label="Teaching Docs" value={String(totalDocuments)} icon="file" color="text-amber-600 bg-amber-50" />
        <SummaryCard label="Total Assessments" value={String(totalAssessmentsCount)} icon="award" color="text-indigo-600 bg-indigo-50" />
        <SummaryCard label="Total Events" value={String(totalWorkshops)} icon="education" color="text-violet-600 bg-violet-50" />
      </div>

      {/* Subject Information Section */}
      {(activeCourseName || activeCourseCode) && (
        <section className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-700 to-rose-600 p-5 text-white shadow-[0_20px_50px_rgba(185,28,28,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/95">
                Currently Audited Course
              </span>
              <h3 className="text-xl font-black tracking-tight mt-1 flex flex-wrap items-center gap-2.5">
                <span>{activeCourseName || "Unnamed Course"}</span>
                {activeSyllabusDoc ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-black text-emerald-200 border border-emerald-500/30">
                    ✓ Syllabus Mapped & Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-200 border border-amber-500/30">
                    ⚠ Syllabus Evidence Required
                  </span>
                )}
              </h3>
              <p className="text-xs font-semibold text-red-100">
                Course Code: <span className="font-extrabold">{activeCourseCode || "N/A"}</span>
              </p>

              {activeSyllabusDoc && (
                <div className="mt-2 text-xs font-bold text-red-150 flex items-center gap-1.5 bg-white/10 w-max px-3 py-1 rounded-lg">
                  <Icon name="file" className="h-3.5 w-3.5 text-red-200" />
                  <span>Mapped Syllabus: {activeSyllabusDoc.fileName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteDocument(activeSyllabusDoc.documentId);
                    }}
                    className="ml-2 text-red-200 hover:text-white transition duration-200 font-extrabold focus:outline-none"
                    title="Remove syllabus"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5 inline" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 border-t border-white/10 pt-3.5 md:border-t-0 md:pt-0">
              <div className="rounded-2xl bg-white/10 px-4 py-2 min-w-[120px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Branch
                </p>
                <p className="mt-0.5 text-xs font-black truncate max-w-[180px]" title={selectedBranch}>
                  {selectedBranch}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-2 min-w-[100px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Academic Year
                </p>
                <p className="mt-0.5 text-xs font-black">{selectedYear}</p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-2 min-w-[100px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Semester
                </p>
                <p className="mt-0.5 text-xs font-black">{selectedSemester}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accordion Categories */}
      {(activeCourseName || activeCourseCode) && (
        <div className="space-y-4">
          {currentCategories.map((cat) => {
            const isExpanded = !!expandedSections[cat];
            
            // Filter uploaded documents and mock activities by standard category
            const groupUploadedDocs = portfolioDocuments.filter(
              (doc) => doc.portfolioId === selectedMappingId && doc.category === cat
            );
            const groupMockActivities = activities.filter(
              (act) => getStandardCategory(act.activityType) === cat
            );
            
            const totalItemsInGroup = groupUploadedDocs.length + groupMockActivities.length;

            const getIconForCategory = (catName: string) => {
              if (catName === "Teaching Documents") return "book";
              if (catName === "Assessments") return "award";
              if (catName === "Activities") return "clipboard";
              if (catName === "Attendance") return "chart";
              if (catName === "Accreditation Evidence") return "spark";
              if (catName === "Events") return "education";
              return "file";
            };

            const resolvedIcon = getIconForCategory(cat);

            return (
              <div
                key={cat}
                className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_10px_40px_rgba(127,29,29,0.04)]"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(cat)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-red-50/25"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <Icon name={resolvedIcon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-black tracking-tight text-gray-900">
                        {cat}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                        {totalItemsInGroup} Evidence Documents Uploaded
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                        clipRule="clipRule"
                      />
                    </svg>
                  </span>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="border-t border-red-100/50 bg-slate-50/20 px-6 py-6">
                    {totalItemsInGroup > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {groupUploadedDocs.map((doc) => (
                          <DocumentCard
                            key={doc.documentId}
                            doc={doc}
                            onDelete={handleDeleteDocument}
                          />
                        ))}
                        {groupMockActivities.map((act) => (
                          <ActivityCard key={act.id} item={act} />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-red-150 bg-red-50/30 px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-gray-500">
                          No uploaded activities or documents found in this category.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: "grid" | "book" | "clipboard" | "file" | "award" | "education" | "user";
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-red-50 bg-white p-3.5 shadow-[0_12px_30px_rgba(127,29,29,0.03)] hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon name={icon} className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 truncate">
            {label}
          </p>
          <p className="text-xl font-black text-gray-950 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-red-200 hover:shadow-md transition duration-300">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700">
            {item.activityType}
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 whitespace-nowrap">
            {item.date}
          </span>
        </div>

        <h4 className="text-sm font-black text-slate-900 leading-snug">
          {item.title}
        </h4>

        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-450 pt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
          <span className="truncate" title={`${item.branch} • ${item.courseCode}`}>
            {item.branch} • {item.courseCode} - {item.courseName}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <a
          href={item.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
        >
          <Icon name="info" className="h-3.5 w-3.5 text-slate-500" />
          View
        </a>
        <a
          href={item.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100/70 cursor-pointer"
        >
          <Icon name="upload" className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  doc,
  onDelete
}: {
  doc: PortfolioDocument;
  onDelete: (documentId: string) => void;
}) {
  const formattedDate = new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/10 p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-300">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-800">
            {doc.documentType}
          </span>
          <span className="text-[10px] font-extrabold text-slate-400 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        <h4 className="text-sm font-black text-slate-900 leading-snug truncate" title={doc.fileName}>
          {doc.fileName}
        </h4>

        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          Uploaded by <span className="font-bold text-gray-700">{doc.uploadedBy}</span>. File size:{" "}
          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Unknown size"}.
        </p>

        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 pt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>Faculty Uploaded Evidence</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-emerald-100 pt-3">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Simulated view: opening " + doc.fileName);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-750 transition hover:bg-slate-50 cursor-pointer"
        >
          <Icon name="info" className="h-3.5 w-3.5 text-slate-500" />
          View
        </a>
        <button
          type="button"
          onClick={() => onDelete(doc.documentId)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 cursor-pointer"
        >
          <Icon name="trash" className="h-3.5 w-3.5 text-red-650" />
          Delete
        </button>
      </div>
    </div>
  );
}

