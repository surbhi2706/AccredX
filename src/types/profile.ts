export type EducationEntry = {
  id: string;
  degree: string;
  specialization: string;
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
  education: EducationEntry[];
};
