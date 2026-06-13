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
  disabled?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
};

// Complete field definitions for ALL detailed activities in PMS system
export const activityFields: Record<string, ActivityField[]> = {
  "Classroom Teaching Workload": [
    { name: "courseName", label: "Name of Course", type: "text", required: true },
    {
      name: "courseDeliveryType",
      label: "Course Delivery Type",
      type: "select",
      options: ["Lecture", "Practical", "Tutorial", "Seminar"],
      required: true,
    },
    { name: "sessionsAssigned", label: "Hours/Sessions Assigned", type: "number", min: 0, required: true },
    { name: "sessionsEngaged", label: "Hours/Sessions Engaged", type: "number", min: 0, required: true },
    {
      name: "engagementPercentage",
      label: "Engaged Hours/Sessions (%)",
      type: "number",
      min: 0,
      max: 100,
      helperText: "Calculate from official timetable and attendance records.",
      required: true,
    },
  ],
  "Student Feedback": [
    { name: "courseName", label: "Name of Course", type: "text", required: true },
    {
      name: "averageFeedback",
      label: "Average Student Feedback",
      type: "number",
      min: 0,
      max: 10,
      step: 0.1,
      helperText: "Enter the anonymous student feedback average on a 1-10 scale.",
      required: true,
    },
    { name: "studentCount", label: "Number of Responses", type: "number", min: 0 },
  ],
  // TEACHING, LEARNING & EVALUATION - Teaching Innovation
  "Innovative Teaching Pedagogy": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "pedagogyType", label: "Pedagogy Type", type: "text", required: true },
    { name: "implementationYear", label: "Implementation Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "description", label: "Description", type: "textarea", required: true, fullWidth: true },
  ],
  "Guest Lecture Organized": [
    { name: "speakerName", label: "Speaker Name", type: "text", required: true },
    { name: "topic", label: "Lecture Topic", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "department", label: "Department", type: "text" },
    { name: "studentCount", label: "Number of Students", type: "number" },
  ],
  "Development of Study Material": [
    { name: "materialTitle", label: "Material Title", type: "text", required: true },
    { name: "materialType", label: "Material Type", type: "select", options: ["Notes", "Textbook", "Case Studies", "Problem Sets", "Practical Guide", "Other"], required: true },
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "description", label: "Content Description", type: "textarea", fullWidth: true },
  ],
  "E-learning Content / LMS Material": [
    { name: "contentTitle", label: "Content Title", type: "text", required: true },
    { name: "lmsName", label: "LMS Platform", type: "text", required: true },
    { name: "courseName", label: "Course Name", type: "text" },
    { name: "moduleCount", label: "Number of Modules/Units", type: "number" },
    { name: "description", label: "Content Overview", type: "textarea", fullWidth: true },
  ],
  "Smart Classroom Practices": [
    { name: "practiceTitle", label: "Practice/Initiative Title", type: "text", required: true },
    { name: "technology", label: "Technology Used", type: "text", required: true },
    { name: "courseName", label: "Course Name", type: "text" },
    { name: "outcomes", label: "Learning Outcomes / Benefits", type: "textarea", fullWidth: true },
  ],
  "New Teaching Method Introduced": [
    { name: "methodName", label: "Method Name", type: "text", required: true },
    { name: "description", label: "Method Description", type: "textarea", required: true },
    { name: "courseName", label: "Course Name", type: "text" },
    { name: "studentEngagement", label: "Student Engagement Level", type: "select", options: ["High", "Moderate", "Low"] },
  ],
  "Activity-based Learning": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "activityType", label: "Activity Type", type: "select", options: ["Group Discussion", "Simulation", "Experiential Learning", "Collaborative Project", "Field-based Activity", "Other"] },
    { name: "outcomes", label: "Learning Outcomes", type: "textarea", fullWidth: true },
  ],
  "Project-based Learning": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "projectScope", label: "Project Scope", type: "textarea", required: true },
    { name: "studentCount", label: "Number of Students", type: "number" },
  ],
  "Outcome-based Teaching Practice": [
    { name: "practiceDescription", label: "Practice Description", type: "textarea", required: true, fullWidth: true },
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "associatedOutcomes", label: "Associated Course Outcomes", type: "textarea" },
  ],

  // TEACHING, LEARNING & EVALUATION - Curriculum Development
  "Syllabus Design": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "programName", label: "Program Name", type: "text" },
    { name: "semester", label: "Semester", type: "text" },
    { name: "outcomeAlignment", label: "Outcome Alignment", type: "textarea" },
  ],
  "BOS Participation": [
    { name: "bosTitle", label: "Board of Studies", type: "text", required: true },
    { name: "role", label: "Role", type: "select", options: ["Member", "Chairperson", "Convener"] },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "contribution", label: "Key Contributions", type: "textarea", fullWidth: true },
  ],
  "Course Revision / Upgradation": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "previousVersion", label: "Previous Version", type: "text" },
    { name: "academicYear", label: "Academic Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "revisionsApplied", label: "Revisions Applied", type: "textarea", fullWidth: true },
  ],
  "New Course Design": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "courseCode", label: "Course Code", type: "text" },
    { name: "credits", label: "Credits", type: "number" },
    { name: "objectives", label: "Course Objectives", type: "textarea", fullWidth: true },
  ],
  "CO Design": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "coCount", label: "Number of Course Outcomes", type: "number" },
    { name: "bloomLevel", label: "Bloom's Level Coverage", type: "text" },
    { name: "outcomes", label: "Defined Outcomes", type: "textarea", fullWidth: true },
  ],
  "PO/PSO Mapping": [
    { name: "programName", label: "Program Name", type: "text", required: true },
    { name: "mappingType", label: "Mapping Type", type: "select", options: ["PO-CO Mapping", "PSO-CO Mapping", "Both"] },
    { name: "courses", label: "Courses Mapped", type: "textarea" },
  ],
  "Gap Analysis in Curriculum": [
    { name: "programName", label: "Program Name", type: "text", required: true },
    { name: "gapIdentified", label: "Gaps Identified", type: "textarea", required: true },
    { name: "suggestedImprovements", label: "Suggested Improvements", type: "textarea", fullWidth: true },
  ],
  "Industry Suggested Curriculum Input": [
    { name: "organizationName", label: "Industry Organization", type: "text", required: true },
    { name: "suggestedTopics", label: "Suggested Topics / Skills", type: "textarea", required: true },
    { name: "relevance", label: "Relevance to Program", type: "textarea" },
  ],

  // TEACHING, LEARNING & EVALUATION - Exam / Evaluation Work
  "Question Paper Setting": [
    { name: "subjectName", label: "Subject Name", type: "text", required: true },
    { name: "examType", label: "Exam Type", type: "select", options: ["Midterm", "Final", "Practical", "Internal Assessment"] },
    { name: "semester", label: "Semester", type: "text" },
    { name: "academicYear", label: "Academic Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Question Paper Moderation": [
    { name: "subjectName", label: "Subject Name", type: "text", required: true },
    { name: "moderationType", label: "Moderation Type", type: "select", options: ["Internal", "External", "Peer Review"] },
    { name: "feedbackProvided", label: "Feedback Provided", type: "textarea", fullWidth: true },
  ],
  "Internal Assessment (ISE/CA)": [
    { name: "subjectName", label: "Subject Name", type: "text", required: true },
    { name: "assessmentMethod", label: "Assessment Method", type: "select", options: ["Quiz", "Assignment", "Project", "Presentation", "Class Test", "Mixed"] },
    { name: "semester", label: "Semester", type: "text" },
    { name: "studentCount", label: "Number of Students Assessed", type: "number" },
  ],
  "End Semester Evaluation": [
    { name: "subjectName", label: "Subject Name", type: "text", required: true },
    { name: "semester", label: "Semester", type: "text", required: true },
    { name: "studentCount", label: "Number of Students Evaluated", type: "number" },
  ],
  "Answer Sheet Evaluation": [
    { name: "examType", label: "Exam Type", type: "text", required: true },
    { name: "sheetsEvaluated", label: "Number of Answer Sheets", type: "number" },
    { name: "semester", label: "Semester", type: "text" },
    { name: "evaluationDate", label: "Evaluation Date", type: "date" },
  ],
  "Practical Examination": [
    { name: "subjectName", label: "Subject Name / Lab", type: "text", required: true },
    { name: "studentCount", label: "Number of Students", type: "number", required: true },
    { name: "practicalType", label: "Practical Type", type: "select", options: ["Lab Work", "Workshop", "Field Work", "Skill Demonstration"] },
    { name: "semester", label: "Semester", type: "text" },
  ],
  "Viva Examination": [
    { name: "subjectName", label: "Subject Name / Project", type: "text", required: true },
    { name: "studentCount", label: "Number of Students Examined", type: "number", required: true },
    { name: "examDate", label: "Exam Date", type: "date" },
  ],
  "Lab Evaluation": [
    { name: "labName", label: "Lab Name", type: "text", required: true },
    { name: "courseCode", label: "Course Code", type: "text" },
    { name: "studentCount", label: "Number of Students", type: "number" },
    { name: "evaluationCriteria", label: "Evaluation Criteria", type: "textarea" },
  ],
  "Exam Supervision / Invigilation": [
    { name: "examType", label: "Exam Type", type: "text", required: true },
    { name: "duration", label: "Duration (hours)", type: "number" },
    { name: "studentCount", label: "Number of Students Supervised", type: "number" },
    { name: "date", label: "Exam Date", type: "date" },
  ],
  "Result Analysis": [
    { name: "subjectName", label: "Subject Name", type: "text", required: true },
    { name: "classSize", label: "Class Size", type: "number" },
    { name: "avgScore", label: "Average Score", type: "text" },
    { name: "analysis", label: "Performance Analysis", type: "textarea", fullWidth: true },
  ],

  // TEACHING, LEARNING & EVALUATION - Student Projects / Internships
  "UG Project Guidance": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "studentNames", label: "Student Names", type: "textarea", required: true },
    { name: "domain", label: "Project Domain", type: "text" },
    { name: "outcomes", label: "Learning Outcomes", type: "textarea" },
  ],
  "Mini Project Guidance": [
    { name: "projectTitle", label: "Mini Project Title", type: "text", required: true },
    { name: "studentCount", label: "Number of Students", type: "number" },
    { name: "semester", label: "Semester", type: "text" },
    { name: "description", label: "Project Description", type: "textarea", fullWidth: true },
  ],
  "Internship Mentoring": [
    { name: "studentName", label: "Student Name", type: "text", required: true },
    { name: "organization", label: "Internship Organization", type: "text", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "projectDescription", label: "Internship Project Description", type: "textarea", fullWidth: true },
  ],
  "Industry Project Mentoring": [
    { name: "projectTitle", label: "Industry Project Title", type: "text", required: true },
    { name: "organizationName", label: "Organization Name", type: "text", required: true },
    { name: "studentTeamSize", label: "Student Team Size", type: "number" },
    { name: "outcomes", label: "Project Outcomes", type: "textarea", fullWidth: true },
  ],
  "Capstone Project Guidance": [
    { name: "projectTitle", label: "Capstone Project Title", type: "text", required: true },
    { name: "studentTeamSize", label: "Team Size", type: "number", required: true },
    { name: "scope", label: "Project Scope", type: "textarea", required: true },
    { name: "expectedOutcome", label: "Expected Outcome/Deliverable", type: "textarea" },
  ],
  "PG Dissertation Guidance": [
    { name: "studentName", label: "Student Name", type: "text", required: true },
    { name: "dissertationTitle", label: "Dissertation Title", type: "text", required: true },
    { name: "program", label: "Program", type: "text" },
    { name: "researchArea", label: "Research Area", type: "text" },
  ],
  "PhD Supervision": [
    { name: "scholarName", label: "PhD Scholar Name", type: "text", required: true },
    { name: "thesisTitle", label: "Thesis Title", type: "text", required: true },
    { name: "researchArea", label: "Research Area", type: "text", required: true },
    { name: "registrationYear", label: "Year of Registration", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Student Innovation Project": [
    { name: "projectTitle", label: "Innovation Project Title", type: "text", required: true },
    { name: "studentNames", label: "Student Names", type: "textarea", required: true },
    { name: "innovationType", label: "Type of Innovation", type: "text" },
    { name: "description", label: "Innovation Description", type: "textarea", fullWidth: true },
  ],
  "Hackathon / Competition Mentoring": [
    { name: "eventName", label: "Hackathon/Competition Name", type: "text", required: true },
    { name: "studentCount", label: "Number of Students Mentored", type: "number", required: true },
    { name: "achievement", label: "Achievement/Award Won", type: "text" },
    { name: "details", label: "Details", type: "textarea", fullWidth: true },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Journal Publications
  "Scopus Indexed Journal Paper": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "doi", label: "DOI", type: "text" },
    { name: "issn", label: "ISSN", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "quartile", label: "Quartile", type: "select", options: ["Q1", "Q2", "Q3", "Q4"] },
  ],
  "SCI / SCIE / ESCI Publication": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "doi", label: "DOI", type: "text" },
    { name: "indexingType", label: "Indexing Type", type: "select", options: ["SCI", "SCIE", "ESCI"], required: true },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Web of Science Publication": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "doi", label: "DOI", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "UGC CARE Journal Paper": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "journalList", label: "UGC CARE List", type: "select", options: ["List 1", "List 2", "List 3", "List 4"] },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Peer Reviewed Journal Paper": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "doi", label: "DOI / URL", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "First Author Research Publication": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "authors", label: "All Authors", type: "textarea" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Co-author Research Publication": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "correspondingAuthor", label: "Corresponding Author", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Book Review in Journal": [
    { name: "bookTitle", label: "Book Title Reviewed", type: "text", required: true },
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Conference Publications
  "International Conference Full Paper": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "conferenceLocation", label: "Location", type: "text" },
    { name: "publicationYear", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "doi", label: "DOI / URL", type: "text" },
  ],
  "National Conference Full Paper": [
    { name: "paperTitle", label: "Paper Title", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Conference Abstract Publication": [
    { name: "abstractTitle", label: "Abstract Title", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Poster Presentation": [
    { name: "posterTitle", label: "Poster Title", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Conference Participation": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Track Chair Role": [
    { name: "trackName", label: "Track Name", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Technical Program Committee (TPC) Member": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "role", label: "Committee Role", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Session Chair": [
    { name: "sessionTitle", label: "Session Title", type: "text", required: true },
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Books & Book Chapters
  "Textbook Publication": [
    { name: "bookTitle", label: "Textbook Title", type: "text", required: true },
    { name: "publisher", label: "Publisher", type: "text", required: true },
    { name: "isbn", label: "ISBN", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Reference Book Publication": [
    { name: "bookTitle", label: "Book Title", type: "text", required: true },
    { name: "publisher", label: "Publisher", type: "text", required: true },
    { name: "isbn", label: "ISBN", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "International Publisher Book": [
    { name: "bookTitle", label: "Book Title", type: "text", required: true },
    { name: "publisher", label: "International Publisher", type: "text", required: true },
    { name: "country", label: "Country of Publisher", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "National Publisher Book": [
    { name: "bookTitle", label: "Book Title", type: "text", required: true },
    { name: "publisher", label: "Publisher", type: "text", required: true },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "International Book Chapter": [
    { name: "chapterTitle", label: "Chapter Title", type: "text", required: true },
    { name: "bookTitle", label: "Book Title", type: "text", required: true },
    { name: "publisher", label: "Publisher", type: "text" },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "National Book Chapter": [
    { name: "chapterTitle", label: "Chapter Title", type: "text", required: true },
    { name: "bookTitle", label: "Book Title", type: "text", required: true },
    { name: "publicationYear", label: "Publication Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Edited Book Contribution": [
    { name: "contributionTitle", label: "Contribution Title", type: "text", required: true },
    { name: "editedBy", label: "Edited By", type: "textarea" },
    { name: "publishYear", label: "Publication Year", type: "text" },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Research Grants
  "Major Research Grant (>20L)": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Sanctioned Amount (INR)", type: "number", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "piDetails", label: "PI / Co-PI Role", type: "text" },
  ],
  "Major Grant (5L–20L)": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Sanctioned Amount (INR)", type: "number", required: true },
    { name: "duration", label: "Duration", type: "text" },
  ],
  "Minor Research Grant (<5L)": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Sanctioned Amount (INR)", type: "number", required: true },
  ],
  "Principal Investigator (PI) Role": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "fundingAgency", label: "Funding Agency", type: "text", required: true },
    { name: "amount", label: "Total Amount", type: "number" },
    { name: "scope", label: "Project Scope", type: "textarea", fullWidth: true },
  ],
  "Co-PI Role": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "piName", label: "Principal Investigator", type: "text" },
    { name: "fundingAgency", label: "Funding Agency", type: "text" },
    { name: "amount", label: "Total Amount", type: "number" },
  ],
  "Sponsored Industry Project": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "sponsoringOrganization", label: "Sponsoring Organization", type: "text", required: true },
    { name: "amount", label: "Project Amount (INR)", type: "number" },
    { name: "deliverables", label: "Key Deliverables", type: "textarea", fullWidth: true },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Patents & Copyrights
  "International Patent Filed": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "country", label: "Country/ies", type: "text", required: true },
    { name: "filingDate", label: "Filing Date", type: "date" },
    { name: "coInventors", label: "Co-Inventors", type: "textarea" },
  ],
  "International Patent Published": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "publicationNumber", label: "Publication Number", type: "text" },
    { name: "country", label: "Country/ies", type: "text" },
    { name: "publicationDate", label: "Publication Date", type: "date" },
  ],
  "International Patent Awarded": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "patentNumber", label: "Patent Number", type: "text", required: true },
    { name: "country", label: "Country/ies", type: "text" },
    { name: "awardDate", label: "Award Date", type: "date" },
  ],
  "National Patent Filed": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "filingDate", label: "Filing Date", type: "date" },
    { name: "applicationNumber", label: "Application Number", type: "text" },
  ],
  "National Patent Published": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "publicationNumber", label: "Publication Number", type: "text" },
    { name: "publicationDate", label: "Publication Date", type: "date" },
  ],
  "National Patent Granted": [
    { name: "patentTitle", label: "Patent Title", type: "text", required: true },
    { name: "patentNumber", label: "Patent Number", type: "text", required: true },
    { name: "grantDate", label: "Grant Date", type: "date" },
  ],
  "Copyright Filed": [
    { name: "workTitle", label: "Work Title", type: "text", required: true },
    { name: "workType", label: "Work Type", type: "select", options: ["Software", "Literary Work", "Artistic Work", "Musical Work", "Other"] },
    { name: "filingDate", label: "Filing Date", type: "date" },
  ],
  "Copyright Registered": [
    { name: "workTitle", label: "Work Title", type: "text", required: true },
    { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
    { name: "registrationDate", label: "Registration Date", type: "date" },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Review Work / Editorial Activities
  "Journal Reviewer (Scopus/WOS)": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "indexing", label: "Indexing", type: "select", options: ["Scopus", "Web of Science", "Both"] },
    { name: "papersReviewed", label: "Number of Papers Reviewed", type: "number" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Journal Reviewer": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    {
      name: "journalType",
      label: "Journal Type",
      type: "select",
      options: ["Scopus/WOS/SCI/ESCI/UGC CARE", "Other Journal"],
      required: true,
    },
    { name: "articleTitle", label: "Reviewed Article Title", type: "text" },
    { name: "reviewDate", label: "Review Date", type: "date" },
  ],
  "Reviewer for Other Journals": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "papersReviewed", label: "Number of Papers Reviewed", type: "number" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Conference Paper Reviewer": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "papersReviewed", label: "Number of Papers Reviewed", type: "number" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "PhD Thesis Reviewer": [
    { name: "thesesReviewed", label: "Number of Theses Reviewed", type: "number" },
    { name: "university", label: "University/Institute", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Editor-in-Chief": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "startYear", label: "Start Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Associate Editor": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "startYear", label: "Start Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Editorial Board Member": [
    { name: "journalName", label: "Journal Name", type: "text", required: true },
    { name: "joinYear", label: "Year Joined", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Conference Compendium Reviewer": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // RESEARCH & ACADEMIC CONTRIBUTIONS - Research Supervision
  "PhD Scholar Guidance": [
    { name: "scholarName", label: "Scholar Name", type: "text", required: true },
    { name: "thesisTitle", label: "Thesis Title", type: "text" },
    { name: "registrationYear", label: "Year of Registration", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "PhD Thesis Submitted": [
    { name: "scholarName", label: "Scholar Name", type: "text", required: true },
    { name: "thesisTitle", label: "Thesis Title", type: "text", required: true },
    { name: "submissionDate", label: "Submission Date", type: "date" },
  ],
  "PhD Thesis Awarded": [
    { name: "scholarName", label: "Scholar Name", type: "text", required: true },
    { name: "thesisTitle", label: "Thesis Title", type: "text", required: true },
    { name: "awardDate", label: "Award Date", type: "date" },
  ],
  "Masters Dissertation Guidance": [
    { name: "studentName", label: "Student Name", type: "text", required: true },
    { name: "dissertationTitle", label: "Dissertation Title", type: "text" },
    { name: "program", label: "Program", type: "text" },
  ],
  "Research Seminar Guidance": [
    { name: "seminarTitle", label: "Seminar Title", type: "text", required: true },
    { name: "studentsInvolved", label: "Number of Students", type: "number" },
  ],

  // INSTITUTION BUILDING & PROFESSIONAL DEVELOPMENT - Student Activities
  "Student Seminar Organized": [
    { name: "seminarTitle", label: "Seminar Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "studentParticipants", label: "Number of Student Participants", type: "number" },
    { name: "topics", label: "Topics Covered", type: "textarea" },
  ],
  "Workshop for Students": [
    { name: "workshopTitle", label: "Workshop Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "participants", label: "Number of Participants", type: "number" },
    { name: "skillsDeveloped", label: "Skills Developed", type: "textarea" },
  ],
  "Career Counselling Session": [
    { name: "sessionTopic", label: "Session Topic", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "studentsAttended", label: "Number of Students", type: "number" },
  ],
  "Study Visit / Industrial Visit": [
    { name: "visitTitle", label: "Visit Title", type: "text", required: true },
    { name: "organization", label: "Organization Visited", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "studentCount", label: "Number of Students", type: "number" },
  ],
  "Field Work Activity": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "location", label: "Location", type: "text" },
    { name: "duration", label: "Duration", type: "text" },
    { name: "learningOutcomes", label: "Learning Outcomes", type: "textarea", fullWidth: true },
  ],
  "Technical Event Coordinator": [
    { name: "eventName", label: "Event Name", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Hackathon Organized": [
    { name: "hackathonName", label: "Hackathon Name", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "participants", label: "Number of Participants", type: "number" },
    { name: "prizes", label: "Prizes/Awards", type: "textarea" },
  ],
  "Student Club Activity": [
    { name: "clubName", label: "Club Name", type: "text", required: true },
    { name: "activityTitle", label: "Activity Title", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "members", label: "Number of Members Involved", type: "number" },
  ],
  "Prakalp Activity Support": [
    { name: "activityTitle", label: "Prakalp Activity Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "studentsInvolved", label: "Number of Students Involved", type: "number" },
  ],
  "Technical Body Support": [
    { name: "bodyName", label: "Technical Body Name", type: "text", required: true },
    { name: "activitySupported", label: "Activity Supported", type: "textarea" },
  ],
  "Cultural Event Support (Skream/Symphony etc.)": [
    { name: "eventName", label: "Event Name", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "roleInEvent", label: "Role", type: "select", options: ["Organizer", "Coordinator", "Volunteer", "Judge", "Mentor"] },
  ],
  "Sports Event Support": [
    { name: "eventName", label: "Sports Event Name", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "role", label: "Role", type: "select", options: ["Organizer", "Coordinator", "Volunteer", "Mentor"] },
  ],

  // INSTITUTION BUILDING & PROFESSIONAL DEVELOPMENT - Faculty Development Activities
  "Conference Organized": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "participants", label: "Number of Participants", type: "number" },
    { name: "role", label: "Role", type: "select", options: ["Convener", "Coordinator", "Co-Coordinator", "Team Member"] },
  ],
  "FDP Organized": [
    { name: "fdpTitle", label: "FDP Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "participants", label: "Number of Participants", type: "number" },
    { name: "role", label: "Role", type: "select", options: ["Convener", "Coordinator", "Co-Coordinator"] },
  ],
  "STTP Organized": [
    { name: "sttpTitle", label: "STTP Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Faculty Workshop Organized": [
    { name: "workshopTitle", label: "Workshop Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Seminar Organized": [
    { name: "seminarTitle", label: "Seminar Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "speaker", label: "Speaker/Expert Name", type: "text" },
  ],
  "Coordinator Role in FDP": [
    { name: "fdpTitle", label: "FDP Title", type: "text", required: true },
    { name: "coordinationDetails", label: "Coordination Details", type: "textarea" },
  ],
  "Co-coordinator Role": [
    { name: "eventTitle", label: "Event Title", type: "text", required: true },
    { name: "eventType", label: "Event Type", type: "text" },
    { name: "roleDetails", label: "Role Details", type: "textarea" },
  ],
  "Team Member in Organizing": [
    { name: "eventTitle", label: "Event Title", type: "text", required: true },
    { name: "responsibilities", label: "Responsibilities", type: "textarea" },
  ],
  "Revenue-generating Academic Program": [
    { name: "programName", label: "Program Name", type: "text", required: true },
    { name: "revenue", label: "Revenue Generated (INR)", type: "number" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],

  // INSTITUTION BUILDING & PROFESSIONAL DEVELOPMENT - Interaction with Outside World
  "Invited Talk at Other Institute": [
    { name: "instituteOrganization", label: "Institute/Organization", type: "text", required: true },
    { name: "talkTitle", label: "Talk Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
  ],
  "Expert Session Conducted": [
    { name: "sessionTitle", label: "Session Title", type: "text", required: true },
    { name: "organizationName", label: "Organization", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Extension Lecture": [
    { name: "lectureTitle", label: "Lecture Title", type: "text", required: true },
    { name: "audience", label: "Target Audience", type: "text" },
    { name: "date", label: "Date", type: "date" },
  ],
  "Public Lecture": [
    { name: "lectureTitle", label: "Public Lecture Title", type: "text", required: true },
    { name: "venue", label: "Venue", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "audience", label: "Audience / Public Attended", type: "text" },
  ],
  "Conference Judge": [
    { name: "conferenceName", label: "Conference Name", type: "text", required: true },
    { name: "role", label: "Judging Role", type: "text" },
    { name: "date", label: "Date", type: "date" },
  ],
  "External Examiner": [
    { name: "universityOrInstitute", label: "University/Institute", type: "text", required: true },
    { name: "program", label: "Program", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "BOS Member": [
    { name: "bosMembership", label: "Board of Studies", type: "text", required: true },
    { name: "institution", label: "Institution", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "FOET / AAB / AC Member": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "institution", label: "Institution", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Auditor / Expert Committee Member": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "institution", label: "Institution", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "International Teaching Interaction": [
    { name: "interactionTitle", label: "Interaction Title", type: "text", required: true },
    { name: "country", label: "Country", type: "text" },
    { name: "institution", label: "Institution", type: "text" },
    { name: "date", label: "Date", type: "date" },
  ],
  "Corporate Interaction": [
    { name: "companyName", label: "Company Name", type: "text", required: true },
    { name: "interactionType", label: "Type of Interaction", type: "text" },
    { name: "date", label: "Date", type: "date" },
  ],
  "Recognition/Award from External Body": [
    { name: "awardTitle", label: "Award Title", type: "text", required: true },
    { name: "awardingBody", label: "Awarding Body", type: "text", required: true },
    { name: "date", label: "Date Received", type: "date" },
  ],

  // INSTITUTION BUILDING & PROFESSIONAL DEVELOPMENT - Administrative / Committee Work
  "HOD Role": [
    { name: "departmentName", label: "Department Name", type: "text", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "startYear", label: "Start Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "achievements", label: "Key Achievements", type: "textarea", fullWidth: true },
  ],
  "Associate Dean / Dean": [
    { name: "roleName", label: "Role (Associate Dean/Dean)", type: "select", options: ["Associate Dean", "Dean"], required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "IQAC Coordinator": [
    { name: "iqacRole", label: "IQAC Role", type: "text" },
    { name: "duration", label: "Duration", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "BOS Chairperson": [
    { name: "bosMembership", label: "Board of Studies", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Exam Committee Coordinator": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Timetable Committee": [
    { name: "role", label: "Role in Committee", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "PG Coordinator": [
    { name: "pgProgram", label: "PG Program", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Placement Coordinator": [
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "placementDetails", label: "Details", type: "textarea" },
  ],
  "Open Elective Coordinator": [
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "electives", label: "Electives Coordinated", type: "textarea" },
  ],
  "Minor/Honours Coordinator": [
    { name: "program", label: "Program", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Department Committee Convener": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
    { name: "responsibilities", label: "Key Responsibilities", type: "textarea" },
  ],
  "University Committee Member": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "university", label: "University", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Statutory Committee Work": [
    { name: "committeeName", label: "Committee Name", type: "text", required: true },
    { name: "role", label: "Role", type: "text" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // INSTITUTION BUILDING & PROFESSIONAL DEVELOPMENT - Contribution to Society
  "Blood Donation Activity": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "donors", label: "Number of Donors", type: "number" },
  ],
  "Yoga Class Organization": [
    { name: "activityTitle", label: "Yoga Class Title", type: "text", required: true },
    { name: "frequency", label: "Frequency", type: "text" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Induction Program Incharge": [
    { name: "programName", label: "Program Name", type: "text", required: true },
    { name: "batch", label: "Batch/Year", type: "text" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Medical / Health Camp": [
    { name: "campName", label: "Camp Name", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "beneficiaries", label: "Number of Beneficiaries", type: "number" },
  ],
  "Literacy Camp": [
    { name: "campTitle", label: "Camp Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "beneficiaries", label: "Number of Beneficiaries", type: "number" },
  ],
  "Tree Plantation": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "treeCount", label: "Number of Trees Planted", type: "number" },
    { name: "location", label: "Location", type: "text" },
  ],
  "Environmental Awareness Activity": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Swachh Bharat Mission": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
    { name: "impact", label: "Impact / Area Cleaned", type: "textarea" },
  ],
  "NSS / NCC Activities": [
    { name: "activityTitle", label: "Activity Title", type: "text", required: true },
    { name: "organization", label: "Organization (NSS/NCC)", type: "select", options: ["NSS", "NCC"] },
    { name: "date", label: "Date", type: "date" },
    { name: "participants", label: "Number of Participants", type: "number" },
  ],
  "Unnat Bharat Abhiyan": [
    { name: "villageOrArea", label: "Village/Area Name", type: "text", required: true },
    { name: "initiative", label: "Initiative/Activity", type: "textarea" },
    { name: "year", label: "Year", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // SKILL ENHANCEMENT & MISCELLANEOUS - FDP / Training Programs Attended
  "Faculty Development Program (FDP) Attended": [
    { name: "fdpTitle", label: "FDP Title", type: "text", required: true },
    { name: "organizer", label: "Organizer", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
    { name: "certificateReceived", label: "Certificate Received", type: "select", options: ["Yes", "No"] },
  ],
  "STTP Attended": [
    { name: "sttpTitle", label: "STTP Title", type: "text", required: true },
    { name: "organizer", label: "Organizer", type: "text" },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "Refresher Course": [
    { name: "courseTitle", label: "Course Title", type: "text", required: true },
    { name: "organizer", label: "Organizer", type: "text" },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "Orientation Program": [
    { name: "programTitle", label: "Program Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "HRDC Program": [
    { name: "programTitle", label: "HRDC Program Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "Workshop Attended": [
    { name: "workshopTitle", label: "Workshop Title", type: "text", required: true },
    { name: "organizer", label: "Organizer", type: "text" },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "Seminar Attended": [
    { name: "seminarTitle", label: "Seminar Title", type: "text", required: true },
    { name: "date", label: "Date", type: "date" },
  ],
  "National Training Program": [
    { name: "programTitle", label: "Program Title", type: "text", required: true },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],
  "International Training Program": [
    { name: "programTitle", label: "Program Title", type: "text", required: true },
    { name: "country", label: "Country", type: "text" },
    { name: "dates", label: "Dates", type: "text", placeholder: "DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY", pattern: "^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4}( to (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-[0-9]{4})?$", helperText: "Format: DD-MM-YYYY or DD-MM-YYYY to DD-MM-YYYY (e.g. 16-04-2025 or 16-04-2025 to 20-04-2025)" },
  ],

  // SKILL ENHANCEMENT & MISCELLANEOUS - MOOCs / Online Certifications
  "SWAYAM Course Completion": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "courseCode", label: "Course Code", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
    { name: "scoreGrade", label: "Score/Grade", type: "text" },
  ],
  "Coursera Certification": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "completionDate", label: "Completion Date", type: "date" },
    { name: "certificateId", label: "Certificate ID", type: "text" },
  ],
  "NPTEL Certification": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "completionDate", label: "Completion Date", type: "date" },
    { name: "scoreGrade", label: "Score/Grade", type: "text" },
  ],
  "edX / Udemy / Online Course": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "platform", label: "Platform", type: "select", options: ["edX", "Udemy", "Other"] },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "Credit-based MOOC": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "credits", label: "Credits Earned", type: "number" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "AI / Emerging Technology Course": [
    { name: "courseName", label: "Course Name", type: "text", required: true },
    { name: "technology", label: "Emerging Technology", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],

  // SKILL ENHANCEMENT & MISCELLANEOUS - Professional Qualification / Postdoc / Special Achievement
  "Postdoctoral Research": [
    { name: "institution", label: "Postdoctoral Institution", type: "text", required: true },
    { name: "researchArea", label: "Research Area", type: "text", required: true },
    { name: "duration", label: "Duration", type: "text" },
    { name: "mentor", label: "Mentor Name", type: "text" },
  ],
  "Additional Professional Qualification": [
    { name: "qualificationName", label: "Qualification Name", type: "text", required: true },
    { name: "issuingBody", label: "Issuing Body", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "Certified Industry Qualification": [
    { name: "qualificationName", label: "Qualification Name", type: "text", required: true },
    { name: "industry", label: "Industry/Company", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "International Certification": [
    { name: "certificationName", label: "Certification Name", type: "text", required: true },
    { name: "country", label: "Country", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "Specialized Technical Certification": [
    { name: "certificationName", label: "Certification Name", type: "text", required: true },
    { name: "technicalArea", label: "Technical Area", type: "text" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "Professional Membership Certification": [
    { name: "organizationName", label: "Professional Organization", type: "text", required: true },
    { name: "membershipType", label: "Membership Type", type: "text" },
    { name: "membershipDate", label: "Membership Date", type: "date" },
  ],

  // SKILL ENHANCEMENT & MISCELLANEOUS - Awards & Recognition
  "Best Faculty Award": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "awardingOrganization", label: "Awarding Organization", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Teaching Excellence Award": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "awardingOrganization", label: "Awarding Organization", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Research Excellence Award": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "awardingOrganization", label: "Awarding Organization", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Innovation Award": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "innovationDescription", label: "Innovation Description", type: "textarea" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "Industry Recognition": [
    { name: "recognitionTitle", label: "Recognition Title", type: "text", required: true },
    { name: "company", label: "Recognizing Company/Industry", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "National Academic Award": [
    { name: "awardName", label: "Award Name", type: "text", required: true },
    { name: "awardingBody", label: "Awarding Body", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],
  "International Recognition": [
    { name: "recognitionTitle", label: "Recognition Title", type: "text", required: true },
    { name: "awardingBody", label: "Awarding Body", type: "text" },
    { name: "country", label: "Country", type: "text" },
    { name: "year", label: "Year Received", type: "number", min: 1950, max: 2100, placeholder: "YYYY" },
  ],

  // SKILL ENHANCEMENT & MISCELLANEOUS - Consultancy Projects
  "Consultancy Project In Progress": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "client", label: "Client Organization", type: "text", required: true },
    { name: "amount", label: "Consultancy Amount (INR)", type: "number" },
    { name: "duration", label: "Duration", type: "text" },
  ],
  "Consultancy Project Completed": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "client", label: "Client Organization", type: "text", required: true },
    { name: "amount", label: "Consultancy Amount (INR)", type: "number" },
    { name: "completionDate", label: "Completion Date", type: "date" },
  ],
  "Industry Sponsored Consultancy": [
    { name: "projectTitle", label: "Project Title", type: "text", required: true },
    { name: "sponsor", label: "Sponsoring Industry", type: "text", required: true },
    { name: "deliverables", label: "Key Deliverables", type: "textarea", fullWidth: true },
  ],
  "Technical Advisory Role": [
    { name: "advisoryRole", label: "Advisory Role", type: "text", required: true },
    { name: "organization", label: "Organization", type: "text" },
    { name: "duration", label: "Duration", type: "text" },
  ],
  "Problem Solving Consultancy": [
    { name: "problem", label: "Problem Description", type: "textarea", required: true },
    { name: "solution", label: "Solution Provided", type: "textarea", required: true },
  ],
};
