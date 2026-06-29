export type EducationEntry = {
  examination: "Ph.D" | "PG" | "UG" | "Diploma" | "NET/SET/Other";
  degree: string;
  university: string;
  institute: string;
  yearOfPassing: string;
  cgpaOrPercentage: string;
};

export type FacultyProfile = {
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  schoolInstitute: string;
  officialEmail: string;
  alternateEmail?: string;
  phoneNumber: string;
  officeAddress: string;
  dateOfJoining: string;
  careerExperience?: string;
  industryExperience?: string;
  teachingExperience?: string;
  administrativeDesignation?: string;
  profilePictureUrl?: string;
  linkedinUrl?: string;
  education: EducationEntry[];
};

