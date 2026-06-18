"use client";

import { useState, useEffect } from "react";
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
};

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
  isOriginal?: boolean;
};

export type DocumentItem = {
  id: string;
  name: string;
  fileSize?: number;
  uploadedBy: string;
  createdAt: string;
  resourceType?: "FILE" | "LINK";
  externalUrl?: string;
  driveFileId?: string;
  description?: string;
};

export type DocumentMapping = {
  id: string;
  documentId: string;
  portfolioId: string; // references CourseMapping.id
  category: string;    // e.g. "Teaching Documents"
  documentType: string; // Subcategory / docType
  mappedAt: string;
  isOriginal: boolean; // Indicates if this is the original upload mapping
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
  const branchesList = [
    "Artificial Intelligence & Data Science (AIDS)",
    "Computer and Communication Systems (CCS)",
    "Computer Engineering (COMP)",
    "Computer Science and Business Systems (CSBS)",
    "Electronics and Computer Engineering (EXCP)",
    "Electronics and Telecommunication Engineering (EXTC)",
    "Information Technology (IT)",
    "Mechanical Engineering (MECH)",
    "Robotics and Artificial Intelligence (RAI)",
    "VLSI Design and Technology (VLSI)"
  ];
  
  const academicYears = [
    "2025-2026",
    "2024-2025",
    "2023-2024",
    "2022-2023"
  ];
  
  const semestersList = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4", 
    "Semester 5", "Semester 6", "Semester 7", "Semester 8"
  ];

  const [selectedYear, setSelectedYear] = useState<string>("2025-2026");
  const [selectedBranch, setSelectedBranch] = useState<string>(branchesList[0]);
  const [selectedSemester, setSelectedSemester] = useState<string>(semestersList[0]);

  // Text inputs for Course details
  const [inputCourseName, setInputCourseName] = useState<string>("");
  const [inputCourseCode, setInputCourseCode] = useState<string>("");

  // Track if a saved mapping is selected
  const [selectedMappingId, setSelectedMappingId] = useState<string>("");

  // Linked Category and Document Type state variables for staging
  const [selectedCategory, setSelectedCategory] = useState<string>("Teaching Documents");
  const [selectedDocType, setSelectedDocType] = useState<string>("Syllabus");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // --- FACULTY COURSE OWNFLOW STATE ---
  const [courseMappings, setCourseMappings] = useState<CourseMapping[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [documentMappings, setDocumentMappings] = useState<DocumentMapping[]>([]);

  const fetchCourseActivities = async (
    targetYear = selectedYear,
    targetBranch = selectedBranch,
    targetSemester = selectedSemester
  ) => {
    setIsLoadingData(true);
    try {
      console.log(`[DEBUG] fetchCourseActivities started with filters - Year: ${targetYear}, Branch: ${targetBranch}, Semester: ${targetSemester}`);
      const res = await fetch("/api/course-activities");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      console.log("[DEBUG] Raw fetched activities from API:", data.activities);
      
      const newCourseMappings: CourseMapping[] = [];
      const newDocuments: DocumentItem[] = [];
      const newDocumentMappings: DocumentMapping[] = [];

      data.activities.forEach((activity: any) => {
        // Find or create course mapping
        let courseMapping = newCourseMappings.find(cm => 
          cm.academicYear === activity.academicYear &&
          cm.branch === activity.branch &&
          cm.semester === activity.semester &&
          cm.courseCode === activity.courseCode
        );

        if (!courseMapping) {
          courseMapping = {
            id: `course-${activity.courseCode}-${activity.semester}-${activity.branch}-${activity.academicYear}`.replace(/\s+/g, '-'),
            academicYear: activity.academicYear,
            branch: activity.branch,
            semester: activity.semester,
            courseCode: activity.courseCode,
            courseName: activity.courseName,
            syllabusFile: null,
            uploadedBy: activity.facultyName || activity.facultyEmail,
            uploadedAt: activity.timestamp
          };
          newCourseMappings.push(courseMapping);
        }

        // Add document
        let metadata: any = {};
        try { metadata = JSON.parse(activity.metadataJson || "{}"); } catch(e) {}
        
        const docId = `doc-${activity.recordId}`;
        newDocuments.push({
          id: docId,
          name: activity.evidenceFileName || "Unknown Link/File",
          fileSize: undefined,
          uploadedBy: activity.facultyName || activity.facultyEmail,
          createdAt: activity.timestamp,
          resourceType: activity.resourceType || metadata.resourceType || (activity.driveFileUrl?.includes("drive.google.com") ? "FILE" : "LINK"),
          externalUrl: activity.externalUrl || activity.driveFileUrl,
          driveFileId: activity.driveFileId,
          description: metadata.description || ""
        });

        // Add document mapping
        newDocumentMappings.push({
          id: `map-${activity.recordId}`,
          documentId: docId,
          portfolioId: courseMapping.id,
          category: activity.documentCategory,
          documentType: activity.documentType,
          mappedAt: activity.timestamp,
          isOriginal: true,
          recordId: activity.recordId // custom property to link back to Google Sheet row
        } as any);
      });

      console.log("[DEBUG] Reconstructed Course Mappings:", newCourseMappings);
      console.log("[DEBUG] Reconstructed Document Mappings:", newDocumentMappings);

      setCourseMappings(newCourseMappings);
      setDocuments(newDocuments);
      setDocumentMappings(newDocumentMappings);

      // Sync selectedMappingId with newly loaded courseMappings
      const matchingMapping = newCourseMappings.find(
        m => m.academicYear === targetYear && m.branch === targetBranch && m.semester === targetSemester
      );
      console.log("[DEBUG] Matching mapping lookup result:", matchingMapping);

      if (matchingMapping) {
        setSelectedMappingId(matchingMapping.id);
        setInputCourseName(matchingMapping.courseName);
        setInputCourseCode(matchingMapping.courseCode);
      } else {
        setSelectedMappingId("");
        setInputCourseName("");
        setInputCourseCode("");
      }

    } catch (err) {
      console.error("[DEBUG] Error fetching course activities:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCourseActivities();
  }, []);

  // Map To Modal State
  const [isMappingModalOpen, setIsMappingModalOpen] = useState<boolean>(false);
  const [mappingDocument, setMappingDocument] = useState<DocumentItem | null>(null);
  const [tempSelections, setTempSelections] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingMapping, setEditingMapping] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Resource Type and Link States
  const [resourceType, setResourceType] = useState<"FILE" | "LINK">("FILE");
  const [linkTitle, setLinkTitle] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkDescription, setLinkDescription] = useState<string>("");
  const [resourceSearchQuery, setResourceSearchQuery] = useState<string>("");

  // --- HANDLERS ---
  const handleUploadSyllabus = (file: File) => {
    console.log("handleUploadSyllabus invoked with file:", file.name, file.size);
    setUploadedFile(file);
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

  const handleSaveEvidenceDocument = async () => {
    console.log("handleSaveEvidenceDocument invoked");
    const courseName = inputCourseName.trim();
    const courseCode = inputCourseCode.trim();

    if (!courseName || !courseCode) {
      alert("Please define the Course Name and Course Code before uploading evidence.");
      return;
    }

    let name = "";
    let fileSize: number | undefined = undefined;
    let externalUrl: string | undefined = undefined;
    let description: string | undefined = undefined;

    if (resourceType === "FILE") {
      if (!uploadedFile) {
        alert("Please select a document file to upload.");
        return;
      }
      name = uploadedFile.name;
      fileSize = uploadedFile.size;
    } else {
      const title = linkTitle.trim();
      const url = linkUrl.trim();
      const desc = linkDescription.trim();

      if (!title) {
        alert("Please enter a Resource Title for the link.");
        return;
      }
      if (!url) {
        alert("Please enter a Resource URL.");
        return;
      }

      // URL validation: Support https / http URLs
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
          alert("URL must start with http:// or https://");
          return;
        }
      } catch (e) {
        alert("Please enter a valid URL (e.g. https://example.com/simulation).");
        return;
      }

      name = title;
      externalUrl = url;
      if (desc) {
        description = desc;
      }
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      if (resourceType === "FILE" && uploadedFile) {
        formData.append("file", uploadedFile);
      } else if (resourceType === "LINK") {
        formData.append("externalUrl", externalUrl || "");
        formData.append("linkTitle", name || "");
      }

      formData.append("academicYear", selectedYear);
      formData.append("branch", selectedBranch);
      formData.append("semester", selectedSemester);
      formData.append("courseName", courseName);
      formData.append("courseCode", courseCode);
      formData.append("documentCategory", selectedCategory);
      formData.append("documentType", selectedDocType);
      
      const metadataObj = {
        description: description || "",
        resourceType
      };
      formData.append("metadata", JSON.stringify(metadataObj));

      const res = await fetch("/api/course-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Course activity upload failed");
      }

      const uploadResult = await res.json();
      
      if (uploadResult.sheetsSuccess === false) {
        console.warn("Google Sheets update issue:", uploadResult.sheetsError);
      }

      // Refresh state from Google Sheets
      await fetchCourseActivities();
      
      // Reset Form States
      setUploadedFile(null);
      setLinkTitle("");
      setLinkUrl("");
      setLinkDescription("");

      alert(`Evidence ${resourceType === "LINK" ? "link" : "document"} [${selectedDocType}] successfully uploaded and added to portfolio!`);
    } catch (err: unknown) {
      console.error("Upload Error:", err);
      alert(`Failed to upload: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditMapping = (id: string) => {
    const mappingToEdit = documentMappings.find(m => m.id === id);
    if (!mappingToEdit) return;
    const recordId = (mappingToEdit as any).recordId;
    if (!recordId) {
      alert("This is a local mapping and cannot be edited via API. Refreshing the page.");
      fetchCourseActivities();
      return;
    }
    
    // Find the original course mapping details
    const courseDetails = courseMappings.find(c => c.id === mappingToEdit.portfolioId);
    const docDetails = documents.find(d => d.id === mappingToEdit.documentId);
    
    setEditingMapping(mappingToEdit);
    setEditFormData({
      recordId: recordId,
      academicYear: courseDetails?.academicYear || selectedYear,
      branch: courseDetails?.branch || selectedBranch,
      semester: courseDetails?.semester || selectedSemester,
      courseName: courseDetails?.courseName || "",
      courseCode: courseDetails?.courseCode || "",
      documentCategory: mappingToEdit.category,
      documentType: mappingToEdit.documentType,
      description: docDetails?.description || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/course-activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update course activity");
      }
      
      const result = await res.json();
      if (result.fileMoved) {
        alert("Metadata updated and file successfully moved to new folder hierarchy.");
      } else {
        alert("Metadata updated successfully.");
      }
      
      setIsEditModalOpen(false);
      await fetchCourseActivities();
    } catch (err: unknown) {
      console.error("Edit Error:", err);
      alert(`Failed to update: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteMapping = (id: string) => {
    console.log("handleDeleteMapping invoked with ID:", id);
    if (confirm("Are you sure you want to remove this course target?")) {
      setCourseMappings(prev => prev.filter(m => m.id !== id));
      // Remove all document mappings associated with this course mapping
      setDocumentMappings(prev => prev.filter(m => m.portfolioId !== id));
      // Reset active states if deleted mapping was selected
      if (selectedMappingId === id) {
        setSelectedMappingId("");
        setUploadedFile(null);
      }
    }
  };

  const handleDeleteDocumentMapping = async (mappingId: string) => {
    if (confirm("Are you sure you want to delete this course activity? This action cannot be undone.")) {
      const mappingToDelete = documentMappings.find(m => m.id === mappingId);
      if (!mappingToDelete) return;

      const recordId = (mappingToDelete as any).recordId;
      if (!recordId) {
        alert("This is a local mapping and cannot be deleted via API. Refreshing the page.");
        await fetchCourseActivities();
        return;
      }

      setIsLoadingData(true);
      try {
        const res = await fetch(`/api/course-activities?id=${recordId}`, {
          method: "DELETE"
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Deletion failed");
        }

        // Remove from UI immediately
        await fetchCourseActivities();
      } catch (error) {
        console.error("Delete Error:", error);
        alert(`Failed to delete: ${error instanceof Error ? error.message : "Unknown error"}`);
        setIsLoadingData(false);
      }
    }
  };

  // Modal open and save mapping handlers
  const handleOpenMapToModal = (doc: { documentId: string }) => {
    const docItem = documents.find(d => d.id === doc.documentId);
    if (!docItem) return;

    setMappingDocument(docItem);
    setSearchQuery("");
    
    // Initialize temporary selections based on existing mappings
    const currentMappings = documentMappings.filter(m => m.documentId === doc.documentId);
    const selections: Record<string, boolean> = {};
    currentMappings.forEach(m => {
      selections[`${m.portfolioId}||${m.category}||${m.documentType}`] = true;
    });
    setTempSelections(selections);
    setIsMappingModalOpen(true);
  };

  const handleSaveMapping = () => {
    if (!mappingDocument) return;

    const selectedKeys = Object.keys(tempSelections).filter(key => tempSelections[key]);
    if (selectedKeys.length === 0) {
      alert("Please select at least one mapping destination. To remove a document completely, please close this and use the Delete button.");
      return;
    }

    const documentId = mappingDocument.id;
    const now = new Date().toISOString();

    // Find existing mappings for this document
    const existingMappingsForDoc = documentMappings.filter(m => m.documentId === documentId);
    const otherMappings = documentMappings.filter(m => m.documentId !== documentId);

    const newMappingsList: DocumentMapping[] = [];

    selectedKeys.forEach(key => {
      const [portfolioId, category, documentType] = key.split("||");
      const existing = existingMappingsForDoc.find(
        m => m.portfolioId === portfolioId && m.category === category && m.documentType === documentType
      );

      if (existing) {
        newMappingsList.push(existing);
      } else {
        newMappingsList.push({
          id: `map-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          documentId,
          portfolioId,
          category,
          documentType,
          mappedAt: now,
          isOriginal: false
        });
      }
    });

    // Check if the original mapping is still preserved or needs to be promoted
    const hasOriginal = newMappingsList.some(m => m.isOriginal);
    if (!hasOriginal && newMappingsList.length > 0) {
      newMappingsList[0].isOriginal = true;
    }

    setDocumentMappings([...otherMappings, ...newMappingsList]);
    setIsMappingModalOpen(false);
    setMappingDocument(null);
    alert("Document mappings saved successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
      if (!ext || !allowedExts.includes(ext)) {
        alert("Please upload only PDF, DOC, DOCX, PPT, PPTX, XLS, or XLSX files.");
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
  const activeSyllabusMapping = documentMappings.find(
    (m) => m.portfolioId === selectedMappingId && m.documentType === "Syllabus"
  );
  const activeSyllabusDoc = activeSyllabusMapping
    ? documents.find((d) => d.id === activeSyllabusMapping.documentId)
    : null;

  // Summary Metrics calculations
  const totalBranches = new Set(courseMappings.map((m) => m.branch)).size;
  const totalCourses = new Set(courseMappings.map((m) => m.courseCode)).size;

  // Combined documents in each category
  const activeMappings = documentMappings.filter(m => m.portfolioId === selectedMappingId);
  const activePortfolioDocs = activeMappings.map(m => {
    const doc = documents.find(d => d.id === m.documentId);
    return {
      mappingId: m.id,
      documentId: m.documentId,
      portfolioId: m.portfolioId,
      category: m.category,
      documentType: m.documentType,
      fileName: doc ? doc.name : "Unknown Document",
      fileSize: doc ? doc.fileSize : 0,
      uploadedBy: doc ? doc.uploadedBy : "Unknown",
      uploadedAt: m.mappedAt,
      isOriginal: m.isOriginal,
      resourceType: doc ? (doc.resourceType || "FILE") : "FILE",
      externalUrl: doc ? doc.externalUrl : undefined,
      driveFileId: doc ? doc.driveFileId : undefined,
      description: doc ? doc.description : undefined
    };
  });
  const totalItemsCount = activePortfolioDocs.length;

  const totalDocuments = activePortfolioDocs.filter(d => d.category === "Teaching Documents").length;

  const totalAssessmentsCount = activePortfolioDocs.filter(d => d.category === "Assessments").length;

  const totalWorkshops = activePortfolioDocs.filter(d => d.category === "Events").length;

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
          <div className="flex flex-col gap-4 border-t border-red-50/50 pt-4 mt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {/* Category Dropdown */}
              <div className="flex flex-col gap-1">
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
              <div className="flex flex-col gap-1">
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

              {/* Resource Type Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Icon name="grid" className="h-3.5 w-3.5 text-red-500" />
                  <span>Resource Type</span>
                </label>
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 h-[38px]">
                  <button
                    type="button"
                    onClick={() => setResourceType("FILE")}
                    className={`flex-1 h-full rounded-lg text-xs font-black transition cursor-pointer text-center ${
                      resourceType === "FILE" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType("LINK")}
                    className={`flex-1 h-full rounded-lg text-xs font-black transition cursor-pointer text-center ${
                      resourceType === "LINK" 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Link
                  </button>
                </div>
              </div>

              {/* Dynamic Selector / Input */}
              {resourceType === "FILE" ? (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Select File (PDF, DOCX, PPTX, XLSX, etc.)
                  </label>
                  <div className="flex items-center gap-2.5 h-[38px]">
                    <input
                      type="file"
                      id="evidence-document-upload"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
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
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Resource Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DBMS Simulation"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-950 placeholder-gray-400 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 h-[38px]"
                  />
                </div>
              )}
            </div>

            {/* Link inputs sub-row */}
            {resourceType === "LINK" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Resource URL (Required)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://example.com/simulation"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-950 placeholder-gray-400 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 h-[38px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of this resource"
                    value={linkDescription}
                    onChange={(e) => setLinkDescription(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-950 placeholder-gray-400 outline-none transition hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 h-[38px]"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100/60 pt-3.5 mt-1 w-full">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1.5">
                  <Icon name="info" className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  NBA Criterion 2.1 Compliance: Uploading syllabus evidence is mandatory for direct attainment audit.
                </span>
              </div>
              
              <div className="flex items-center gap-2 self-end sm:self-auto">
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
                  disabled={isUploading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4.5 py-2 text-xs font-black text-white shadow-md shadow-red-100/50 hover:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                  <span>{isUploading ? "Uploading..." : resourceType === "LINK" ? "Map & Save Link" : "Map & Upload File"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Total Branches</p>
          <p className="text-lg font-black text-gray-900">{totalBranches}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Total Courses</p>
          <p className="text-lg font-black text-gray-900">{totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Total Items</p>
          <p className="text-lg font-black text-gray-900">{totalItemsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Teaching Docs</p>
          <p className="text-lg font-black text-gray-900">{totalDocuments}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Assessments</p>
          <p className="text-lg font-black text-gray-900">{totalAssessmentsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-red-100 shadow-sm">
          <p className="text-[9px] font-black uppercase text-gray-400">Events</p>
          <p className="text-lg font-black text-gray-900">{totalWorkshops}</p>
        </div>
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
            </div>
          </div>
        </section>
      )}

      {/* Accordion Categories */}
      {(activeCourseName || activeCourseCode) && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-red-100 rounded-3xl p-4 shadow-[0_10px_40px_rgba(127,29,29,0.02)]">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search evidence resources..."
                value={resourceSearchQuery}
                onChange={(e) => setResourceSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs font-bold text-gray-950 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          {currentCategories.map((cat) => {
            const isExpanded = !!expandedSections[cat];
            const q = resourceSearchQuery.toLowerCase().trim();
            const groupUploadedDocs = activePortfolioDocs.filter((doc: any) => {
              const categoryMatch = doc.category === cat;
              if (!categoryMatch) return false;
              if (!q) return true;
              return doc.fileName?.toLowerCase().includes(q) || doc.description?.toLowerCase().includes(q);
            });
            
            return (
              <div key={cat} className="overflow-hidden rounded-3xl border border-red-100 bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(cat)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-red-50/25"
                >
                  <h3 className="text-base font-black text-gray-900">{cat}</h3>
                  <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                </button>
                {isExpanded && (
                  <div className="border-t border-red-100/50 px-6 py-6">
                    {groupUploadedDocs.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {groupUploadedDocs.map((doc: any) => (
                          <DocumentCard
                            key={doc.mappingId}
                            doc={doc}
                            onDelete={handleDeleteDocumentMapping}
                            onMapTo={handleOpenMapToModal}
                            onEdit={handleEditMapping}
                            allMappings={documentMappings
                              .filter(m => m.documentId === doc.documentId)
                              .map(m => {
                                const course = courseMappings.find(c => c.id === m.portfolioId);
                                return {
                                  courseName: course ? course.courseName : "Unknown Course",
                                  courseCode: course ? course.courseCode : "",
                                  category: m.category,
                                  documentType: m.documentType
                                };
                              })}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-red-150 bg-red-50/30 px-6 py-10 text-center">
                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {resourceSearchQuery ? "No matching evidence resources found." : "No uploaded documents found in this category."}
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

      {/* Map To Modal */}
      {isMappingModalOpen && mappingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 scale-100 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Document Action
                  </p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">
                    Map Document Locations
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-200 font-bold truncate max-w-[500px]" title={mappingDocument.name}>
                    File: {mappingDocument.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMappingModalOpen(false);
                    setMappingDocument(null);
                  }}
                  className="rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/20 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search courses, categories, or subcategories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-bold text-slate-955 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                />
              </div>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
              {(() => {
                const q = searchQuery.toLowerCase().trim();

                const filteredTree = courseMappings.map(course => {
                  const courseMatches = !q || course.courseName.toLowerCase().includes(q) || course.courseCode.toLowerCase().includes(q);
                  
                  const categoriesList = Object.keys(categoryDocTypes).map(category => {
                    const categoryMatches = !q || category.toLowerCase().includes(q);
                    
                    const subcategoriesList = categoryDocTypes[category].filter(sub => {
                      const subMatches = !q || sub.toLowerCase().includes(q);
                      return courseMatches || categoryMatches || subMatches;
                    });
                    
                    return {
                      name: category,
                      subcategories: subcategoriesList,
                      isVisible: courseMatches || categoryMatches || subcategoriesList.length > 0
                    };
                  }).filter(catObj => catObj.isVisible);

                  return {
                    ...course,
                    categories: categoriesList,
                    isVisible: courseMatches || categoriesList.length > 0
                  };
                }).filter(courseObj => courseObj.isVisible);

                if (filteredTree.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 italic text-sm">
                      No courses, categories, or subcategories found matching &quot;{searchQuery}&quot;
                    </div>
                  );
                }

                return filteredTree.map(course => {
                  const isCourseExpanded = expandedCourses[course.id] !== false;
                  const toggleCourseExpand = (courseId: string) => {
                    setExpandedCourses(prev => ({
                      ...prev,
                      [courseId]: prev[courseId] === false ? true : false
                    }));
                  };

                  return (
                    <div key={course.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
                      {/* Course Node */}
                      <button
                        type="button"
                        onClick={() => toggleCourseExpand(course.id)}
                        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-650 shadow-sm border border-slate-100">
                            <Icon name="book" className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-900 leading-tight">
                              {course.courseName}
                            </span>
                            <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-black text-slate-750 uppercase whitespace-nowrap">
                              {course.courseCode}
                            </span>
                          </div>
                        </div>
                        <span className={`text-slate-450 text-[10px] transition-transform duration-200 ${isCourseExpanded ? "rotate-180" : ""}`}>
                          ▼
                        </span>
                      </button>

                      {/* Categories & Subcategories */}
                      {isCourseExpanded && (
                        <div className="p-4 space-y-3 border-t border-slate-100">
                          {course.categories.map(cat => (
                            <div key={cat.name} className="space-y-1.5">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                                {cat.name}
                              </h4>
                              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pl-3">
                                {cat.subcategories.map(sub => {
                                  const key = `${course.id}||${cat.name}||${sub}`;
                                  const isChecked = !!tempSelections[key];
                                  return (
                                    <label
                                      key={sub}
                                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-750 shadow-sm hover:bg-slate-50 hover:border-slate-200 transition cursor-pointer select-none"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          setTempSelections(prev => ({
                                            ...prev,
                                            [key]: !prev[key]
                                          }));
                                        }}
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-red-650 focus:ring-red-500 cursor-pointer focus:ring-offset-0 focus:ring-0"
                                      />
                                      <span>{sub}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMappingModalOpen(false);
                  setMappingDocument(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-705 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMapping}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-red-100 hover:bg-red-700 transition cursor-pointer"
              >
                Save Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {isEditModalOpen && editingMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-900/5">
            {/* Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                    Document Action
                  </p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">
                    Edit Document Metadata
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/20 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Academic Year
                  </label>
                  <select
                    value={editFormData.academicYear}
                    onChange={(e) => setEditFormData({ ...editFormData, academicYear: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {/* Semester */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Semester
                  </label>
                  <select
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {semestersList.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                {/* Branch */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Branch / Department
                  </label>
                  <select
                    value={editFormData.branch}
                    onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {branchesList.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                {/* Course Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Course Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.courseName}
                    onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                </div>
                {/* Course Code */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={editFormData.courseCode}
                    onChange={(e) => setEditFormData({ ...editFormData, courseCode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  />
                </div>
                {/* Document Category */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Document Category
                  </label>
                  <select
                    value={editFormData.documentCategory}
                    onChange={(e) => setEditFormData({ ...editFormData, documentCategory: e.target.value, documentType: categoryDocTypes[e.target.value][0] })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {Object.keys(categoryDocTypes).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {/* Document Type */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Document Type
                  </label>
                  <select
                    value={editFormData.documentType}
                    onChange={(e) => setEditFormData({ ...editFormData, documentType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {categoryDocTypes[editFormData.documentCategory]?.map((doc: string) => (
                      <option key={doc} value={doc}>{doc}</option>
                    ))}
                  </select>
                </div>
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Description / Remarks
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-705 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-red-100 hover:bg-red-700 transition cursor-pointer disabled:opacity-50"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
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
function DocumentCard({
  doc,
  onDelete,
  onMapTo,
  onEdit,
  allMappings
}: {
  doc: any;
  onDelete: (mappingId: string) => void;
  onMapTo: (doc: any) => void;
  onEdit: (mappingId: string) => void;
  allMappings: Array<{ courseName: string; courseCode: string; category: string; documentType: string }>;
}) {
  const formattedDate = new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm hover:shadow-md transition duration-300 ${
      doc.isOriginal 
        ? "border-emerald-200/80 bg-emerald-50/10 hover:border-emerald-300" 
        : "border-blue-200 bg-blue-50/10 hover:border-blue-300"
    }`}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              doc.isOriginal ? "bg-emerald-100 text-emerald-800" : "bg-blue-105 text-blue-800"
            }`}>
              {doc.documentType}
            </span>
            <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              doc.resourceType === "LINK" 
                ? "bg-amber-100 text-amber-800 border border-amber-200/70" 
                : "bg-slate-105 text-slate-700 border border-slate-200/70"
            }`}>
              {doc.resourceType === "LINK" ? "🔗 Link Resource" : "📄 File Resource"}
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        <h4 className="text-sm font-black text-slate-900 leading-snug truncate" title={doc.fileName}>
          {doc.resourceType === "LINK" ? "🔗 " : "📄 "}{doc.fileName}
        </h4>

        {doc.description && (
          <p className="text-xs font-medium text-slate-500 italic mt-1" title={doc.description}>
            {doc.description}
          </p>
        )}

        <p className="text-xs font-medium text-slate-500 leading-relaxed pt-0.5">
          Uploaded by <span className="font-bold text-gray-700">{doc.uploadedBy}</span>.{" "}
          {doc.resourceType === "LINK" 
            ? "External Link Resource" 
            : doc.fileSize 
              ? `File size: ${(doc.fileSize / 1024).toFixed(1)} KB` 
              : "Unknown size"}
        </p>

        {doc.isOriginal ? (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>Faculty Uploaded Evidence</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-800 border border-blue-200">
              Mapped Document
            </span>
          </div>
        )}

        {/* Display Mappings */}
        {allMappings && allMappings.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Mapped To ({allMappings.length}):
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] font-medium text-slate-600">
              {allMappings.map((m, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-red-500 shrink-0 select-none">•</span>
                  <span className="leading-tight">
                    <strong className="text-slate-800">{m.courseName || m.courseCode}</strong> &gt; {m.category} &gt; {m.documentType}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <div className="flex gap-2 flex-1">
          <button
            type="button"
            onClick={() => onEdit(doc.mappingId)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            <Icon name="edit" className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (doc.externalUrl) {
              window.open(doc.externalUrl, '_blank');
            } else if (doc.driveFileId) {
              window.open(`https://drive.google.com/file/d/${doc.driveFileId}/view`, '_blank');
            } else {
              alert("Error: Metadata is missing for this resource.");
            }
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 cursor-pointer text-center"
        >
          <Icon name="info" className="h-3.5 w-3.5 text-slate-500" />
          View
        </button>
        {doc.resourceType !== "LINK" && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (doc.driveFileId) {
                window.open(`https://drive.google.com/uc?export=download&id=${doc.driveFileId}`, '_blank');
              } else {
                alert("Error: Google Drive File ID is missing for this file.");
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 cursor-pointer text-center"
          >
            <Icon name="upload" className="h-3.5 w-3.5 text-emerald-600 rotate-180" />
            Download
          </button>
        )}
        <button
          type="button"
          onClick={() => onMapTo(doc)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-xs font-black text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          title="Map To"
        >
          <Icon name="grid" className="h-3.5 w-3.5 text-slate-500" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(doc.mappingId)}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-xs font-black text-red-700 transition hover:bg-red-100 cursor-pointer"
          title="Delete"
        >
          <Icon name="trash" className="h-3.5 w-3.5 text-red-650" />
        </button>
      </div>
    </div>
  );
}

