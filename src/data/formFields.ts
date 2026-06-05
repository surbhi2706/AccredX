export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "file";

export type ActivityField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  fullWidth?: boolean;
};

const modeOptions = ["Offline", "Online", "Hybrid"];
const roleOptions = [
  "Participant",
  "Coordinator",
  "Convener",
  "Member",
  "Resource Person",
  "Evaluator",
];

export const activityFields: Record<string, ActivityField[]> = {
  "Teaching Innovation": [
    { name: "innovationTitle", label: "Innovation Title", type: "text", required: true },
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "implementationYear", label: "Implementation Year", type: "text" },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      required: true,
      fullWidth: true,
    },
  ],

  "Curriculum Development": [
    { name: "course", label: "Course", type: "text", required: true },
    { name: "academicYear", label: "Academic Year", type: "text" },
    {
      name: "contribution",
      label: "Contribution",
      type: "textarea",
      required: true,
      fullWidth: true,
    },
  ],

  "Exam / Evaluation Work": [
    { name: "subject", label: "Subject", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true },
    { name: "semester", label: "Semester", type: "text" },
    { name: "academicYear", label: "Academic Year", type: "text" },
  ],

  "Student Projects / Internships": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "studentNames", label: "Student Names", type: "textarea", required: true },
    { name: "guideName", label: "Guide Name", type: "text" },
    { name: "organization", label: "Organization", type: "text" },
  ],

  "Research Paper / Publication": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "authors", label: "Authors", type: "textarea", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "publisher", label: "Publisher", type: "text" },
    { name: "doi", label: "DOI / URL", type: "text" },
    {
      name: "indexing",
      label: "Indexing",
      type: "select",
      options: ["Scopus", "Web of Science", "UGC Care", "Peer Reviewed", "Other"],
    },
    { name: "publicationYear", label: "Publication Year", type: "text" },
  ],

  Patent: [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "patentNumber", label: "Patent Number", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Filed", "Published", "Granted"],
      required: true,
    },
    { name: "filingDate", label: "Filing Date", type: "date" },
    { name: "grantDate", label: "Grant Date", type: "date" },
  ],

  "Funded Project": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number" },
    { name: "duration", label: "Duration", type: "text" },
  ],

  "Research Grant": [
    { name: "grantTitle", label: "Grant Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number" },
  ],

  Consultancy: [
    { name: "clientOrganization", label: "Client Organization", type: "text", required: true },
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number" },
    { name: "duration", label: "Duration", type: "text" },
  ],

  "Research Collaboration / MoU": [
    { name: "organizationName", label: "Organization Name", type: "text", required: true },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
    { name: "purpose", label: "Purpose", type: "textarea", fullWidth: true },
  ],

  "FDP / Training Attended": [
    { name: "programmeTitle", label: "Programme Title", type: "text", required: true },
    { name: "organizer", label: "Organizer", type: "text", required: true },
    { name: "mode", label: "Mode", type: "select", options: modeOptions, required: true },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date" },
    { name: "duration", label: "Duration", type: "text" },
  ],

  "Event / FDP Organized": [
    { name: "eventTitle", label: "Event Title", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true },
    { name: "startDate", label: "Start Date", type: "date", required: true },
    { name: "endDate", label: "End Date", type: "date" },
    { name: "participants", label: "Participants", type: "number" },
    { name: "venue", label: "Venue", type: "text" },
  ],

  "Guest Lecture": [
    { name: "topic", label: "Topic", type: "text", required: true },
    { name: "organization", label: "Organization", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions },
  ],

  "Professional Society Activity": [
    { name: "societyName", label: "Society Name", type: "text", required: true },
    { name: "membershipType", label: "Membership Type", type: "text" },
    { name: "duration", label: "Duration", type: "text" },
  ],

  "Committee Role": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true },
    { name: "academicYear", label: "Academic Year", type: "text" },
  ],

  "Coordinator Role": [
    { name: "activityName", label: "Activity Name", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true },
    { name: "academicYear", label: "Academic Year", type: "text" },
  ],

  "NBA / NAAC Activity": [
    { name: "activityName", label: "Activity Name", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true },
    {
      name: "description",
      label: "Activity Description",
      type: "textarea",
      fullWidth: true,
    },
  ],

  "Faculty Achievement": [
    { name: "achievementTitle", label: "Achievement Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "description", label: "Description", type: "textarea", fullWidth: true },
  ],

  "Student Achievement": [
    { name: "studentName", label: "Student Name", type: "text", required: true },
    { name: "achievement", label: "Achievement", type: "textarea", required: true },
    { name: "date", label: "Date", type: "date" },
  ],

  "Award / Recognition": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "awardingOrganization", label: "Awarding Organization", type: "text" },
    { name: "date", label: "Date", type: "date" },
  ],

  "NPTEL Certification": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "score", label: "Score", type: "number" },
    { name: "certificationDate", label: "Certification Date", type: "date" },
  ],

  "MOOC Certification": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "platform", label: "Platform", type: "text", required: true },
    { name: "certificationDate", label: "Certification Date", type: "date" },
  ],

  Hackathon: [
    { name: "hackathonName", label: "Hackathon Name", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: roleOptions },
    { name: "result", label: "Result", type: "text" },
  ],

  "Innovation / Startup Activity": [
    { name: "startupName", label: "Startup Name", type: "text" },
    { name: "innovationTitle", label: "Innovation Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea", fullWidth: true },
  ],
};
