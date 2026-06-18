import type { EducationEntry } from "@/types/profile";

/**
 * Reusable helper for handling report exports.
 * Currently uses native window.print().
 * Future versions will integrate jsPDF or react-to-print here.
 */
export const handleExportReport = (reportType: string, fileName?: string) => {
  // We can eventually use the reportType or fileName to set custom file names,
  // trigger specific tracking, or initialize jsPDF with appropriate options.
  console.log(`Initiating export for: ${reportType}${fileName ? ` (filename: ${fileName})` : ""}`);
  window.print();
};

type CvProfileInfo = {
  name: string;
  email: string;
  contact: string;
  department: string;
  college: string;
  doj: string;
  careerExp: string;
  industryExp: string;
  teachingExp: string;
  designationAcademic: string;
  designationAdmin: string;
};

type ExperienceEntry = {
  organization: string;
  designation: string;
  doj: string;
  dol: string;
  years: string;
};

type SomaiyaCvWordData = {
  fileName: string;
  profileInfo: CvProfileInfo;
  researchAreas: string[];
  coursesDelivered: string[];
  teacherUG: string;
  teacherPG: string;
  teacherPhD: string;
  recognitions: string[];
  educationHistory: EducationEntry[];
  notableExperience: ExperienceEntry[];
  researchAccomplishments: {
    studentsPhDActive: string;
    studentsPhDCompleted: string;
    studentsPGCompleted: string;
    studentsUGCompleted: string;
    publicationsTotal: string;
    publicationsJournal: string;
    publicationsConference: string;
  };
  detailsPublications: {
    internationalJournals: string[];
    nationalJournals: string[];
    conferences: string[];
    booksChapters: string[];
    patentsCopyrights: string[];
  };
  researchProjects: {
    completedRs: string;
    ongoingRs: string;
    appliedRs: string;
    completedDetails: string[];
    ongoingDetails: string[];
    appliedDetails: string[];
  };
  iprCopyrights: string[];
  fdpAttended: string[];
  fdpOrganized: string[];
  fdpDelivered: string[];
  keyAchievements: string[];
  positionsResponsibility: string[];
  cvDate: string;
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "_") || "Somaiya_CV";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const value = (text?: string) => escapeHtml((text || "").trim());

// Word ignores most CSS classes/positioning — use inline styles + bgcolor attributes.
const WORD_FONT = "font-family:'Times New Roman',Times,serif;";
const WORD_CELL =
  "border:1px solid #000000;padding:4px 8px;vertical-align:top;color:#000000;" + WORD_FONT + "font-size:9.8pt;line-height:1.35;";
const WORD_SECTION =
  WORD_CELL + "background:#F3F4F6;text-align:center;font-weight:bold;font-size:11pt;padding:2px 8px;";
const WORD_COLUMN =
  WORD_CELL + "background:#FAFAFA;font-weight:bold;";
const WORD_SUBHEAD =
  "color:#7F1D1D;font-family:Arial,Helvetica,sans-serif;font-size:9.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.4px;margin:8px 0 2px 16px;";
const WORD_MUTED = "color:#6B7280;font-size:9.5pt;font-style:italic;margin:0;";
const WORD_TABLE = "width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 6px 0;" + WORD_FONT;
const WORD_TITLE =
  "margin:0 0 12px 0;padding-top:8px;text-align:center;font-size:15pt;font-weight:bold;letter-spacing:0.4px;" + WORD_FONT;

const wordNumberedList = (items: string[]) => {
  const visibleItems = items.map((item) => item.trim()).filter(Boolean);
  if (visibleItems.length === 0) {
    return `<p style="margin:2px 0 0 18px;font-size:10.5pt;${WORD_FONT}">1.&nbsp;</p>`;
  }
  return visibleItems
    .map(
      (item, index) =>
        `<p style="margin:2px 0 0 18px;font-size:10.5pt;text-indent:-18pt;padding-left:18pt;${WORD_FONT}">${index + 1}.&nbsp;${escapeHtml(item)}</p>`
    )
    .join("");
};

const wordSectionTitle = (title: string, colspan: number) =>
  `<tr><th colspan="${colspan}" bgcolor="#F3F4F6" style="${WORD_SECTION}">${escapeHtml(title)}</th></tr>`;

// Must sit outside table cells — Word ignores page-break-* inside <td>.
const wordPageBreak = () =>
  `<br clear="all" style="page-break-before:always;mso-break-type:section-break;" />`;

const wordDocumentShell = (content: string, pageBreakAfter = false) => `
<table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;${pageBreakAfter ? "page-break-after:always;" : ""}">
  <tr>
    <td width="30" bgcolor="#991B1B" style="width:8mm;background:#991B1B;border:none;font-size:1pt;line-height:1pt;">&nbsp;</td>
    <td style="border:none;padding:38px 57px 38px 11px;vertical-align:top;">
      ${content}
    </td>
  </tr>
</table>`;

const wordStyles = `
  @page Section1 {
    size: 210mm 297mm;
    margin: 0;
  }
  div.Section1 {
    page: Section1;
  }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #000000;
    ${WORD_FONT}
  }
  p {
    margin: 0;
    padding: 0;
  }
`;

export const handleExportWord = (data: SomaiyaCvWordData) => {
  const {
    fileName,
    profileInfo,
    researchAreas,
    coursesDelivered,
    teacherUG,
    teacherPG,
    teacherPhD,
    recognitions,
    educationHistory,
    notableExperience,
    researchAccomplishments,
    detailsPublications,
    researchProjects,
    iprCopyrights,
    fdpAttended,
    fdpOrganized,
    fdpDelivered,
    keyAchievements,
    positionsResponsibility,
    cvDate,
  } = data;

  const bold = (text: string) => `<b>${text}</b>`;

  const educationRows = educationHistory
    .map(
      (edu) => `
        <tr>
          <td style="${WORD_CELL}"><b>${value(edu.examination)}</b></td>
          <td style="${WORD_CELL}">${value(edu.degree)}</td>
          <td style="${WORD_CELL}">${value(edu.university)}</td>
          <td style="${WORD_CELL}">${value(edu.institute)}</td>
          <td style="${WORD_CELL}text-align:center;">${value(edu.yearOfPassing)}</td>
          <td style="${WORD_CELL}text-align:center;">${value(edu.cgpaOrPercentage)}</td>
        </tr>
      `
    )
    .join("");

  const experienceRows = notableExperience
    .map(
      (exp, index) => `
        <tr>
          <td style="${WORD_CELL}text-align:center;"><b>${index + 1}.</b></td>
          <td style="${WORD_CELL}">${value(exp.organization)}</td>
          <td style="${WORD_CELL}">${value(exp.designation)}</td>
          <td style="${WORD_CELL}text-align:center;">${value(exp.doj)}</td>
          <td style="${WORD_CELL}text-align:center;">${value(exp.dol)}</td>
          <td style="${WORD_CELL}text-align:center;">${value(exp.years)}</td>
        </tr>
      `
    )
    .join("");

  const achievementRows = keyAchievements
    .map(
      (achievement, index) => `
        <tr>
          <td style="${WORD_CELL}width:8%;text-align:center;"><b>${index + 1}.</b></td>
          <td style="${WORD_CELL}">${value(achievement)}</td>
        </tr>
      `
    )
    .join("");

  const positionRows = positionsResponsibility
    .map(
      (position, index) => `
        <tr>
          <td style="${WORD_CELL}width:8%;text-align:center;"><b>${index + 1}.</b></td>
          <td style="${WORD_CELL}">${value(position)}</td>
        </tr>
      `
    )
    .join("");

  const page1Content = `
    <h1 style="${WORD_TITLE}">Somaiya Vidyavihar University</h1>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      <tr>
        <td style="${WORD_CELL}width:60%;">${bold("Name:")} ${value(profileInfo.name)}</td>
        <td style="${WORD_CELL}width:40%;">${bold("E-mail:")} ${value(profileInfo.email)}</td>
      </tr>
      <tr><td colspan="2" style="${WORD_CELL}">${bold("Contact No:")} ${value(profileInfo.contact)}</td></tr>
      <tr><td colspan="2" style="${WORD_CELL}">${bold("Department/Section:")} ${value(profileInfo.department)}</td></tr>
      <tr><td colspan="2" style="${WORD_CELL}">${bold("College:")} ${value(profileInfo.college)}</td></tr>
      <tr>
        <td colspan="2" style="${WORD_CELL}">
          ${bold("DOJ Somaiya:")} ${value(profileInfo.doj)}
          &nbsp;&nbsp;&nbsp;&nbsp;
          ${bold("Career Experience:")} ${value(profileInfo.careerExp)} Yrs
          &nbsp;&nbsp;&nbsp;&nbsp;
          ${bold("Industry Experience:")} ${value(profileInfo.industryExp)} Yrs
          &nbsp;&nbsp;&nbsp;&nbsp;
          ${bold("Teaching Experience:")} ${value(profileInfo.teachingExp)} Yrs
        </td>
      </tr>
      <tr>
        <td colspan="2" style="${WORD_CELL}padding:8px 10px;">
          <table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;border-collapse:collapse;">
            <tr>
              <td width="50%" style="border:none;padding:0 8px 0 0;vertical-align:top;${WORD_FONT}font-size:9.8pt;">
                <p>${bold("Present Academic Designation:")}</p>
                <p style="${WORD_MUTED}">(Professor/Associate Professor/Assistant Professor)</p>
                <p><b>${value(profileInfo.designationAcademic)}</b></p>
              </td>
              <td width="50%" style="border:none;border-left:1px solid #000;padding:0 0 0 16px;vertical-align:top;${WORD_FONT}font-size:9.8pt;">
                <p>${bold("Present Administrative Designation:")}</p>
                <p style="${WORD_MUTED}">(Principal/Vice-Principal/ Associate Dean/ HOD etc)</p>
                <p><b>${value(profileInfo.designationAdmin)}</b></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Area of research/specialization and Courses Delivered", 2)}
      <tr>
        <td style="${WORD_CELL}width:50%;padding:10px;">
          <p>${bold("Research domain/interests/areas")}</p>
          ${wordNumberedList(researchAreas)}
        </td>
        <td style="${WORD_CELL}width:50%;padding:10px;">
          <p>${bold("Courses Delivered")}</p>
          ${wordNumberedList(coursesDelivered)}
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      <tr>
        <td style="${WORD_CELL}width:55%;">${bold("Recognition as a teacher by any University")}</td>
        <td style="${WORD_CELL}width:15%;">${bold("UG:")} ${value(teacherUG)}</td>
        <td style="${WORD_CELL}width:15%;">${bold("PG:")} ${value(teacherPG)}</td>
        <td style="${WORD_CELL}width:15%;">${bold("Ph.D :")} ${value(teacherPhD)}</td>
      </tr>
      <tr>
        <td colspan="4" style="${WORD_CELL}padding:8px 10px;">
          <p>${bold("Details of Recognitions")}</p>
          ${wordNumberedList(recognitions)}
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Education", 6)}
      <tr>
        <th style="${WORD_COLUMN}width:16%;">Examination</th>
        <th style="${WORD_COLUMN}width:23%;">Name of the Degree</th>
        <th style="${WORD_COLUMN}width:23%;">University/Board</th>
        <th style="${WORD_COLUMN}width:20%;">Institute/College</th>
        <th style="${WORD_COLUMN}width:10%;">Year</th>
        <th style="${WORD_COLUMN}width:8%;">CPI/SPI/%Marks</th>
      </tr>
      ${educationRows}
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Notable Experience Details", 6)}
      <tr>
        <th style="${WORD_COLUMN}width:8%;">Sr. No</th>
        <th style="${WORD_COLUMN}width:35%;">Name of the organization</th>
        <th style="${WORD_COLUMN}width:23%;">Designation</th>
        <th style="${WORD_COLUMN}width:12%;">Date of Joining</th>
        <th style="${WORD_COLUMN}width:12%;">Date of Leaving</th>
        <th style="${WORD_COLUMN}width:10%;">Experience (Years)</th>
      </tr>
      ${experienceRows}
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Research Accomplishments and Projects", 4)}
      <tr>
        <td colspan="2" style="${WORD_CELL}width:50%;">${bold("No of students pursuing Ph.D as on date:")} ${value(researchAccomplishments.studentsPhDActive)}</td>
        <td colspan="2" style="${WORD_CELL}width:50%;">${bold("No of students completed Ph.D as on date:")} ${value(researchAccomplishments.studentsPhDCompleted)}</td>
      </tr>
      <tr>
        <td colspan="2" style="${WORD_CELL}">${bold("No of students completed PG thesis / Project work as on date:")} ${value(researchAccomplishments.studentsPGCompleted)}</td>
        <td colspan="2" style="${WORD_CELL}">${bold("No of students / groups completed UG projects as on date:")} ${value(researchAccomplishments.studentsUGCompleted)}</td>
      </tr>
      <tr>
        <td style="${WORD_CELL}width:25%;">${bold("Publications Total:")} ${value(researchAccomplishments.publicationsTotal)}</td>
        <td style="${WORD_CELL}width:40%;">${bold("Number of Peer review Journal papers:")} ${value(researchAccomplishments.publicationsJournal)}</td>
        <td colspan="2" style="${WORD_CELL}width:35%;">${bold("Number of Conference papers:")} ${value(researchAccomplishments.publicationsConference)}</td>
      </tr>
      <tr>
        <td colspan="4" style="${WORD_CELL}padding:8px 10px;">
          <p>${bold("Details of Publications:")}</p>
          <p style="${WORD_SUBHEAD}">International Journals</p>
          ${wordNumberedList(detailsPublications.internationalJournals)}
        </td>
      </tr>
    </table>
  `;

  const page2Content = `
    <h1 style="${WORD_TITLE}">Somaiya Vidyavihar University</h1>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      <tr>
        <td style="${WORD_CELL}padding:8px 10px;">
          <p>${bold("Details of Publications (Continued):")}</p>
          <p style="${WORD_SUBHEAD}">National Journals</p>
          ${wordNumberedList(detailsPublications.nationalJournals)}
          <p style="${WORD_SUBHEAD}">Conferences</p>
          ${wordNumberedList(detailsPublications.conferences)}
          <p style="${WORD_SUBHEAD}">Books/Book Chapters</p>
          ${wordNumberedList(detailsPublications.booksChapters)}
          <p style="${WORD_SUBHEAD}">Patents/Copy Rights</p>
          ${wordNumberedList(detailsPublications.patentsCopyrights)}
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      <tr>
        <td style="${WORD_CELL}width:33%;padding:8px 10px;vertical-align:top;">
          <p>${bold("No of Research / consultancy / projects completed:")}</p>
          <p>Rs: ${value(researchProjects.completedRs)}</p>
        </td>
        <td style="${WORD_CELL}width:33%;padding:8px 10px;vertical-align:top;">
          <p>${bold("No of Research / consultancy / projects on-going:")}</p>
          <p>Rs: ${value(researchProjects.ongoingRs)}</p>
        </td>
        <td style="${WORD_CELL}width:34%;padding:8px 10px;vertical-align:top;">
          <p>${bold("No of Research / consultancy / projects on applied as on date:")}</p>
          <p>Rs: ${value(researchProjects.appliedRs)}</p>
        </td>
      </tr>
      <tr>
        <td colspan="3" style="${WORD_CELL}padding:8px 10px;">
          <p>${bold("Details of Research / consultancy / projects:")}</p>
          <p style="${WORD_SUBHEAD}">Completed</p>
          ${wordNumberedList(researchProjects.completedDetails)}
          <p style="${WORD_SUBHEAD}">On-going</p>
          ${wordNumberedList(researchProjects.ongoingDetails)}
          <p style="${WORD_SUBHEAD}">Applied</p>
          ${wordNumberedList(researchProjects.appliedDetails)}
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      <tr>
        <td style="${WORD_CELL}padding:8px 10px;">
          <p>${bold("IPR/ Copyrights")}</p>
          ${wordNumberedList(iprCopyrights)}
        </td>
      </tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("FDPs/Seminars/Workshops/Training Programs Attended/ Organized/ Delivered", 1)}
      <tr><td style="${WORD_CELL}padding:8px 10px;"><p>${bold("Attended")}</p>${wordNumberedList(fdpAttended)}</td></tr>
      <tr><td style="${WORD_CELL}padding:8px 10px;"><p>${bold("Organized")}</p>${wordNumberedList(fdpOrganized)}</td></tr>
      <tr><td style="${WORD_CELL}padding:8px 10px;"><p>${bold("Delivered")}</p>${wordNumberedList(fdpDelivered)}</td></tr>
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Notable Key Scholastic Achievements", 2)}
      ${achievementRows}
    </table>

    <table border="1" cellspacing="0" cellpadding="0" style="${WORD_TABLE}">
      ${wordSectionTitle("Notable Positions and Responsibility", 2)}
      ${positionRows}
    </table>

    <table border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;margin-top:18px;border-collapse:collapse;${WORD_FONT}font-size:10.5pt;font-weight:bold;">
      <tr>
        <td style="border:none;padding:0 8px;width:50%;">Date: ${value(cvDate)}</td>
        <td style="border:none;padding:0 8px;width:50%;text-align:right;">Signature of Faculty Member</td>
      </tr>
    </table>
  `;

  const html = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Somaiya Faculty CV</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser />
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>${wordStyles}</style>
      </head>
      <body>
        <div class="Section1">
          ${wordDocumentShell(page1Content, true)}
        </div>
        ${wordPageBreak()}
        <div class="Section1">
          ${wordDocumentShell(page2Content)}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${sanitizeFileName(fileName)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};
