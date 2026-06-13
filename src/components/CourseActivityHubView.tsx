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

type SemesterMap = Record<string, Course[]>;
type BranchMap = Record<string, SemesterMap>;
type YearMap = Record<string, BranchMap>;

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

type BaseSubject = {
  name: string;
  hasLab: boolean;
};

// Base subjects mapped to Semesters 1-8 for each branch with realistic lab counterparts
const branchBases: Record<string, BaseSubject[]> = {
  "Computer Engineering (COMP)": [
    { name: "Applied Mathematics-I", hasLab: false },
    { name: "Structured Programming Approach", hasLab: true },
    { name: "Data Structures", hasLab: true },
    { name: "Database Management Systems", hasLab: true },
    { name: "Operating Systems", hasLab: true },
    { name: "Artificial Intelligence", hasLab: true },
    { name: "Machine Learning", hasLab: true },
    { name: "Distributed Computing", hasLab: true }
  ],
  "Information Technology (IT)": [
    { name: "Applied Mathematics-I", hasLab: false },
    { name: "Structured Programming Approach", hasLab: true },
    { name: "Data Structures & Analysis", hasLab: true },
    { name: "Database Management Systems", hasLab: true },
    { name: "Software Engineering", hasLab: false },
    { name: "Web Application Development", hasLab: true },
    { name: "Cloud Computing", hasLab: true },
    { name: "Big Data Analytics", hasLab: true }
  ],
  "Artificial Intelligence and Data Science (AIDS)": [
    { name: "Applied Mathematics-I", hasLab: false },
    { name: "Python for Data Science", hasLab: true },
    { name: "Data Structures & Algorithms", hasLab: true },
    { name: "Statistical Inference", hasLab: false },
    { name: "Machine Learning Basics", hasLab: true },
    { name: "Deep Learning", hasLab: true },
    { name: "Natural Language Processing", hasLab: true },
    { name: "Computer Vision", hasLab: true }
  ],
  "Electronics and Telecommunication Engineering (EXTC)": [
    { name: "Applied Physics-I", hasLab: false },
    { name: "Electronic Devices & Circuits", hasLab: true },
    { name: "Signals & Systems", hasLab: false },
    { name: "Microprocessors & Microcontrollers", hasLab: true },
    { name: "Electromagnetic Wave Propagation", hasLab: false },
    { name: "Digital Communication", hasLab: true },
    { name: "Mobile Communication Systems", hasLab: true },
    { name: "Satellite Communication", hasLab: false }
  ],
  "Electronics and Computer Engineering (EXCP)": [
    { name: "Applied Physics-I", hasLab: false },
    { name: "Electrical Technology", hasLab: true },
    { name: "Digital Logic Design", hasLab: true },
    { name: "Computer Organization & Architecture", hasLab: false },
    { name: "Microcontrollers & Applications", hasLab: true },
    { name: "Embedded Systems Design", hasLab: true },
    { name: "Internet of Things (IoT)", hasLab: true },
    { name: "VLSI Design", hasLab: true }
  ],
  "Computer Science and Business Systems (CSBS)": [
    { name: "Applied Mathematics-I", hasLab: false },
    { name: "Discrete Mathematics", hasLab: false },
    { name: "Data Structures & Algorithms", hasLab: true },
    { name: "Business Communication & Value Science", hasLab: false },
    { name: "Software Engineering & Finance", hasLab: false },
    { name: "Design Thinking", hasLab: false },
    { name: "Cognitive Science & Analytics", hasLab: true },
    { name: "Enterprise Systems", hasLab: true }
  ],
  "Mechanical Engineering (MECH)": [
    { name: "Systems in Mechanical Engineering", hasLab: false },
    { name: "Engineering Graphics & Drafting", hasLab: true },
    { name: "Strength of Materials", hasLab: false },
    { name: "Fluid Mechanics", hasLab: true },
    { name: "Thermodynamics & Heat Transfer", hasLab: true },
    { name: "CAD/CAM & Robotics", hasLab: true },
    { name: "Refrigeration & Air Conditioning", hasLab: true },
    { name: "Industrial Engineering & Management", hasLab: false }
  ],
  "Computer and Communication Engineering (CCE)": [
    { name: "Applied Mathematics-I", hasLab: false },
    { name: "Fundamentals of Communication", hasLab: true },
    { name: "Network Analysis & Synthesis", hasLab: false },
    { name: "Operating Systems & Programming", hasLab: true },
    { name: "Digital Signal Processing", hasLab: true },
    { name: "Computer Networks & Security", hasLab: true },
    { name: "Wireless Networks & Security", hasLab: true },
    { name: "Cyber Security & Forensics", hasLab: true }
  ],
  "Robotics and Artificial Intelligence (RAI)": [
    { name: "Systems in Mechanical Engineering", hasLab: false },
    { name: "Robotics Programming", hasLab: true },
    { name: "Kinematics of Machines", hasLab: false },
    { name: "Sensors & Actuators", hasLab: true },
    { name: "Robot Dynamics & Control", hasLab: true },
    { name: "Autonomous Robotics", hasLab: true },
    { name: "Artificial Intelligence in Robotics", hasLab: true },
    { name: "Human-Robot Interaction", hasLab: false }
  ],
  "VLSI Design and Technology (VLSI)": [
    { name: "Applied Physics-I", hasLab: false },
    { name: "Basic Semiconductor Physics", hasLab: false },
    { name: "Digital Logic Design", hasLab: true },
    { name: "CMOS Analog Circuits", hasLab: true },
    { name: "HDL Programming (Verilog/VHDL)", hasLab: true },
    { name: "VLSI Physical Design", hasLab: true },
    { name: "Testing & Verification of VLSI Circuits", hasLab: true },
    { name: "System-on-Chip (SoC) Design", hasLab: true }
  ]
};

// Programmatically build the complete dataTree supporting both Theory, Laboratory, Mini Project, Seminar, and Project Work
const dataTree: YearMap = {};
const academicYearsList = ["2023-2024", "2024-2025", "2025-2026"];

for (const yr of academicYearsList) {
  dataTree[yr] = {};
  for (const br of branchesList) {
    dataTree[yr][br] = {};
    const branchCode = br.match(/\(([^)]+)\)/)?.[1] || "GEN";

    semestersList.forEach((sem, index) => {
      const semesterNum = index + 1;
      const baseSubject = branchBases[br]?.[index] || { name: "Selected Subject", hasLab: false };
      
      const courses: Course[] = [
        {
          code: `${branchCode}${semesterNum}01`,
          name: `${baseSubject.name} (Theory)`,
          type: "theory"
        }
      ];

      if (baseSubject.hasLab) {
        courses.push({
          code: `${branchCode}L${semesterNum}01`,
          name: `${baseSubject.name} Laboratory`,
          type: "laboratory"
        });
      }

      // Add Mini Project in Semester 4
      if (semesterNum === 4) {
        courses.push({
          code: `${branchCode}P401`,
          name: `Mini Project - ${branchCode} Web Apps`,
          type: "project"
        });
      }

      // Add Seminar in Semester 6
      if (semesterNum === 6) {
        courses.push({
          code: `${branchCode}S601`,
          name: `Technical Seminar on ${baseSubject.name}`,
          type: "seminar"
        });
      }

      // Add Project Work in Semester 8
      if (semesterNum === 8) {
        courses.push({
          code: `${branchCode}W801`,
          name: `Capstone Project Work`,
          type: "projectwork"
        });
      }

      dataTree[yr][br][sem] = courses;
    });
  }
}

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

export default function CourseActivityHubView() {
  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];

  const [selectedYear, setSelectedYear] = useState<string>("2025-2026");

  // Dependent Branch list based on Year
  const yearBranchesMap = dataTree[selectedYear] || {};
  const branches = Object.keys(yearBranchesMap);
  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0] || "");

  // Update default branch when academic year changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    const newBranchesMap = dataTree[year] || {};
    const newBranches = Object.keys(newBranchesMap);
    if (newBranches.length > 0) {
      setSelectedBranch(newBranches[0]);
      const semestersMap = newBranchesMap[newBranches[0]] || {};
      const newSemesters = Object.keys(semestersMap);
      if (newSemesters.length > 0) {
        setSelectedSemester(newSemesters[0]);
        const newCourses = semestersMap[newSemesters[0]] || [];
        if (newCourses.length > 0) {
          setSelectedCourseCode(newCourses[0].code);
        } else {
          setSelectedCourseCode("");
        }
      } else {
        setSelectedSemester("");
        setSelectedCourseCode("");
      }
    } else {
      setSelectedBranch("");
      setSelectedSemester("");
      setSelectedCourseCode("");
    }
  };

  // Dependent Semester list based on Branch
  const branchSemestersMap = yearBranchesMap[selectedBranch] || {};
  const semesters = Object.keys(branchSemestersMap);
  const [selectedSemester, setSelectedSemester] = useState<string>(semesters[0] || "");

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    const semestersMap = yearBranchesMap[branch] || {};
    const newSemesters = Object.keys(semestersMap);
    if (newSemesters.length > 0) {
      setSelectedSemester(newSemesters[0]);
      const newCourses = semestersMap[newSemesters[0]] || [];
      if (newCourses.length > 0) {
        setSelectedCourseCode(newCourses[0].code);
      } else {
        setSelectedCourseCode("");
      }
    } else {
      setSelectedSemester("");
      setSelectedCourseCode("");
    }
  };

  // Dependent Course list based on Semester
  const courses = branchSemestersMap[selectedSemester] || [];
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(
    courses[0]?.code || ""
  );

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    const newCourses = branchSemestersMap[semester] || [];
    if (newCourses.length > 0) {
      setSelectedCourseCode(newCourses[0].code);
    } else {
      setSelectedCourseCode("");
    }
  };

  // Ensure current selection stays in bounds
  const currentBranch = branches.includes(selectedBranch)
    ? selectedBranch
    : branches[0] || "";
  const currentSemester = semesters.includes(selectedSemester)
    ? selectedSemester
    : semesters[0] || "";
  const currentCourseList =
    (yearBranchesMap[currentBranch] || {})[currentSemester] || [];
  const currentCourse =
    currentCourseList.find((s) => s.code === selectedCourseCode) ||
    currentCourseList[0];

  // Fallback state adjustments if selectors get out-of-sync
  if (currentBranch && selectedBranch !== currentBranch) {
    setSelectedBranch(currentBranch);
  }
  if (currentSemester && selectedSemester !== currentSemester) {
    setSelectedSemester(currentSemester);
  }
  if (currentCourse && selectedCourseCode !== currentCourse.code) {
    setSelectedCourseCode(currentCourse.code);
  }

  // Generate activities for current filters
  const activities = (currentCourse && currentBranch)
    ? generateMockActivities(selectedYear, currentBranch, currentSemester, currentCourse)
    : [];

  // Determine dynamic accordions based on selected course type
  const getAccordionCategories = (type?: string) => {
    if (type === "laboratory") {
      return [
        "Lab Resources & Setup",
        "Lab Attendance & Execution",
        "Assessments & Evaluation",
        "Outcomes & Attainment"
      ];
    } else if (type === "theory") {
      return [
        "Teaching Documents",
        "Assessments & Homework",
        "Mid-Sem & End-Sem Exams",
        "Execution & Outlines"
      ];
    } else {
      // mini project / seminar / capstone project work
      return [
        "Guidelines & Allocation",
        "Progress Monitoring",
        "Evaluation Records",
        "Outcomes & Attainments"
      ];
    }
  };

  const currentCategories = getAccordionCategories(currentCourse?.type);

  // Initialize expanded accordion sections dynamically
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Teaching Documents": true,
    "Lab Resources & Setup": true,
    "Guidelines & Allocation": true,
  });

  const toggleSection = (cat: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Summary Metrics calculations
  const totalBranches = branches.length;
  const totalCourses = currentCourseList.length;
  const totalActivities = activities.length;
  
  // Dynamic metrics derived from loaded lists
  const totalDocuments = activities.filter(
    (a) => a.category === "Teaching Documents" || a.category === "Lab Resources & Setup" || a.category === "Guidelines & Allocation"
  ).length;

  const totalAssessments = activities.filter(
    (a) => a.category === "Mid-Sem & End-Sem Exams" || a.category === "Assessments & Evaluation" || a.category === "Evaluation Records"
  ).length;

  const totalWorkshops = activities.filter(
    (a) => a.activityType === "Workshops" || a.category === "Progress Monitoring"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Filter Panel */}
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-[0_20px_60px_rgba(127,29,29,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Icon name="book" className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-950">
                Course Activity Hub
              </h2>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                Accreditation evidence repository mapped to NAAC/NBA metrics.
              </p>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 md:w-auto w-full">
            {/* Academic Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Academic Year
              </label>
              <div className="relative min-w-[120px]">
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
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

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Branch
              </label>
              <div className="relative min-w-[180px]">
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 truncate"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
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

            {/* Semester */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Semester
              </label>
              <div className="relative min-w-[120px]">
                <select
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                >
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
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

            {/* Course */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Course
              </label>
              <div className="relative min-w-[180px]">
                <select
                  value={selectedCourseCode}
                  onChange={(e) => setSelectedCourseCode(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-bold text-gray-950 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 truncate"
                >
                  {courses.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
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
          </div>
        </div>
      </section>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Branches Taught" value={String(totalBranches)} icon="grid" color="text-red-600 bg-red-50" />
        <SummaryCard label="Subjects Taught" value={String(totalCourses)} icon="book" color="text-sky-600 bg-sky-50" />
        <SummaryCard label="Total Activities" value={String(totalActivities)} icon="clipboard" color="text-emerald-600 bg-emerald-50" />
        <SummaryCard label="Total Documents" value={String(totalDocuments)} icon="file" color="text-amber-600 bg-amber-50" />
        <SummaryCard label="Total Assessments" value={String(totalAssessments)} icon="award" color="text-indigo-600 bg-indigo-50" />
        <SummaryCard label="Total Workshops" value={String(totalWorkshops)} icon="education" color="text-violet-600 bg-violet-50" />
      </div>

      {/* Subject Information Section */}
      {currentCourse && (
        <section className="rounded-3xl border border-red-100 bg-gradient-to-r from-red-700 to-rose-600 p-6 text-white shadow-[0_20px_50px_rgba(185,28,28,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/95">
                Currently Selected Course
              </span>
              <h3 className="text-2xl font-black tracking-tight mt-1">
                {currentCourse.name}
              </h3>
              <p className="text-sm font-semibold text-red-100">
                Course Code: <span className="font-extrabold">{currentCourse.code}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-white/10 pt-4 md:border-t-0 md:pt-0">
              <div className="rounded-2xl bg-white/10 px-4 py-3 min-w-[120px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Branch
                </p>
                <p className="mt-0.5 text-sm font-black truncate max-w-[180px]" title={selectedBranch}>
                  {selectedBranch}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3 min-w-[100px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Academic Year
                </p>
                <p className="mt-0.5 text-sm font-black">{selectedYear}</p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3 min-w-[100px] ring-1 ring-white/10">
                <p className="text-[9px] font-black uppercase tracking-wider text-red-200">
                  Semester
                </p>
                <p className="mt-0.5 text-sm font-black">{selectedSemester}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accordion Categories */}
      <div className="space-y-4">
        {currentCategories.map((cat) => {
          const isExpanded = !!expandedSections[cat];
          const filteredActivities = activities.filter((act) => act.category === cat);
          
          // Fallback icon mapping based on name keywords
          const getIconForCategory = (catName: string) => {
            if (catName.includes("Teaching") || catName.includes("Resources") || catName.includes("Guidelines")) return "book";
            if (catName.includes("Assessments") || catName.includes("Exams") || catName.includes("Evaluation")) return "award";
            if (catName.includes("Monitoring") || catName.includes("Attendance")) return "chart";
            if (catName.includes("Outcomes") || catName.includes("Attainment")) return "spark";
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
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600`}>
                    <Icon name={resolvedIcon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-gray-900">
                      {cat}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                      {filteredActivities.length} Evidence Documents Uploaded
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
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="border-t border-red-100/50 bg-slate-50/20 px-6 py-6">
                  {filteredActivities.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredActivities.map((act) => (
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
    <div className="rounded-2xl border border-red-50 bg-white p-4.5 shadow-[0_12px_30px_rgba(127,29,29,0.03)] hover:shadow-md transition">
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
