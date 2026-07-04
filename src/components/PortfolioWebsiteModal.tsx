import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

export default function PortfolioWebsiteModal({
  profile,
  activities,
  onClose,
}: {
  profile: any;
  activities: any[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [htmlCode, setHtmlCode] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const nameStr = profile?.fullName
    ? profile.fullName.trim().replace(/[^a-zA-Z0-9\s-_]/g, "").replace(/\s+/g, "-").toLowerCase()
    : "faculty";

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Unable to convert image blob to data URL"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    async function buildHtml() {
      // Basic Profile Fields
      const name = profile?.fullName || "Faculty Member";
      const designation = profile?.designation || "Faculty";
      const department = profile?.department || "Department";
      const college = profile?.schoolInstitute || "";
      const email = profile?.officialEmail || "";
      const phone = profile?.phoneNumber || "";
      const address = profile?.officeAddress || "";
      const linkedinUrl = profile?.linkedinUrl || "";
      const bio = profile?.bio || "A passionate educator, researcher, and professional dedicated to advancing knowledge and fostering innovation.";
      const profilePictureUrl = profile?.profilePictureUrl
        ? new URL(profile.profilePictureUrl, window.location.origin).href
        : "";

      let profilePictureDataUrl = profilePictureUrl;
      if (profilePictureUrl) {
        try {
          const response = await fetch(profilePictureUrl);
          if (response.ok) {
            const blob = await response.blob();
            profilePictureDataUrl = await blobToDataUrl(blob);
          } else {
            console.warn(`Unable to fetch profile picture for export: ${response.status}`);
          }
        } catch (error) {
          console.warn("Profile picture embed failed:", error);
        }
      }

    // Education Timeline HTML
    let educationHtml = "";
    if (profile?.education && profile.education.length > 0) {
      // Filter out empty rows (which the normal CV has)
      const validEducation = profile.education.filter((ed: any) => 
        ed.degree?.trim() || ed.university?.trim() || ed.institute?.trim()
      );

      if (validEducation.length > 0) {
        // Sort from oldest to recent
        const sortedEducation = validEducation.sort((a: any, b: any) => {
          const yearA = parseInt(a.yearOfPassing?.match(/\d{4}/)?.[0] || "0");
          const yearB = parseInt(b.yearOfPassing?.match(/\d{4}/)?.[0] || "0");
          return yearA - yearB;
        });

        const edItems = sortedEducation.map((ed: any) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${ed.yearOfPassing || "N/A"}</div>
            <div class="timeline-content">
              <h3>${ed.degree} ${ed.examination ? `<span class="tag">${ed.examination}</span>` : ''}</h3>
              <h4>${ed.university || ed.institute}</h4>
              ${ed.institute && ed.university && ed.institute !== ed.university ? `<p class="sub-meta">${ed.institute}</p>` : ''}
              ${ed.cgpaOrPercentage ? `<p class="score">Score: <strong>${ed.cgpaOrPercentage}</strong></p>` : ''}
            </div>
          </div>
        `).join("");

        educationHtml = `
          <section id="education" class="content-section">
            <h2 class="section-title"><span class="icon">🎓</span> Education</h2>
            <div class="timeline">
              ${edItems}
            </div>
          </section>
        `;
      }
    }

    // Experience HTML mapped to "Notable Experience Details"
    let experienceHtml = "";
    const expParts = [];
    if (profile?.teachingExperience) expParts.push({ label: "Teaching Experience", val: profile.teachingExperience + " Years", icon: "📚" });
    if (profile?.industryExperience) expParts.push({ label: "Industry Experience", val: profile.industryExperience + " Years", icon: "🏢" });
    if (profile?.careerExperience) expParts.push({ label: "Total Career Experience", val: profile.careerExperience + " Years", icon: "⭐" });
    
    if (expParts.length > 0) {
      experienceHtml = `
        <section id="notable-experience-details" class="content-section">
          <h2 class="section-title"><span class="icon">💼</span> Notable Experience Details</h2>
          <div class="exp-grid">
            ${expParts.map(p => `
              <div class="exp-card">
                <div class="exp-icon">${p.icon}</div>
                <div class="exp-details">
                  <div class="exp-val">${p.val}</div>
                  <div class="exp-label">${p.label}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    // Group activities exactly by Somaiya CV Categories
    const categories: Record<string, any[]> = {
      "Area of research/specialization and Courses Delivered": [],
      "Research Accomplishments and Projects": [],
      "FDPs/Seminars/Workshops/Training Programs": [],
      "Notable Key Scholastic Achievements": [],
      "Notable Positions and Responsibility": [],
      "Other Activities": [] // Fallback
    };

    activities.forEach(act => {
      const type = act.activityType?.toLowerCase() || "";
      const cat = act.pmsCategory?.toLowerCase() || "";
      
      if (type.includes("fdp") || type.includes("seminar") || type.includes("workshop") || type.includes("training") || type.includes("sttp") || type.includes("talk") || type.includes("session") || type.includes("refresher") || type.includes("orientation")) {
        categories["FDPs/Seminars/Workshops/Training Programs"].push(act);
      } else if (cat.includes("award") || type.includes("achievement") || type.includes("award") || type.includes("recognition")) {
        categories["Notable Key Scholastic Achievements"].push(act);
      } else if (cat.includes("administrative") || type.includes("position") || type.includes("responsibility") || type.includes("role") || type.includes("coordinator") || type.includes("committee")) {
        categories["Notable Positions and Responsibility"].push(act);
      } else if (type.includes("research") || type.includes("project") || type.includes("patent") || type.includes("copyright") || type.includes("phd") || type.includes("doctoral") || type.includes("publication") || type.includes("journal") || type.includes("paper") || type.includes("book") || type.includes("grant") || type.includes("sponsored") || type.includes("consultancy") || type.includes("conference")) {
        categories["Research Accomplishments and Projects"].push(act);
      } else if (type.includes("course") || type.includes("subject") || type.includes("teaching")) {
        categories["Area of research/specialization and Courses Delivered"].push(act);
      } else {
        categories["Other Activities"].push(act);
      }
    });

    let activitiesHtml = "";
    let navLinksHtml = "";
    
    Object.entries(categories).forEach(([category, acts]) => {
      if (acts.length === 0) return; // skip empty categories

      const sectionId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      // Fix jump-to section by using onclick inside iframe
      navLinksHtml += `<a href="#${sectionId}" class="jump-link">${category.split('/')[0]}</a>`;

      const cardsHtml = acts.map((act: any) => {
        const d = act.data || {};
        const title = d.title || d.activityTitle || d.paperTitle || d.bookTitle || d.courseName || d.projectName || dataFallbackTitle(d) || act.activityType;
        const role = d.role || d.designation || d.authors || d.investigator || d.roleName || "";
        const date = d.date || d.startDate || d.academicYear || act.academicYear || d.publicationYear || d.year || "";
        const location = d.location || d.venue || d.organization || d.publisher || d.agency || d.organizationName || "";
        const desc = d.description || d.details || d.remarks || d.abstract || "";
        
        const evidenceFileName = act.evidenceFileName || "";
        const evidenceFileId = act.evidenceFileId || act.driveFileId || "";
        const evidenceFileUrl = act.driveFileUrl || (evidenceFileId ? `https://drive.google.com/file/d/${evidenceFileId}/view` : null);
        const hasUploadedEvidence = Boolean(evidenceFileName || evidenceFileUrl);
        const evidenceButton = hasUploadedEvidence
          ? `<a href="${evidenceFileUrl || '#'}" target="_blank" rel="noopener noreferrer" class="card-btn evidence-btn">View Evidence →</a>`
          : `<span class="card-btn evidence-btn disabled">No Evidence</span>`;

        return `
          <div class="academic-card">
            <div class="card-top">
              <span class="card-badge">${act.activityType}</span>
              ${date ? `<span class="card-date">${date}</span>` : ''}
            </div>
            <h3 class="card-title">${title}</h3>
            ${(role || location) ? `
              <div class="card-meta">
                ${role ? `<div class="meta-row"><strong>Role/Authors:</strong> ${role}</div>` : ''}
                ${location ? `<div class="meta-row"><strong>Location/Publisher:</strong> ${location}</div>` : ''}
              </div>
            ` : ''}
            ${desc ? `<p class="card-desc">${desc}</p>` : ''}
            ${hasUploadedEvidence ? `<div class="card-evidence"><strong>Evidence:</strong> ${evidenceFileName || 'Uploaded document'}</div>` : ''}
            <div class="card-actions">${evidenceButton}</div>
          </div>
        `;
      }).join("");

      activitiesHtml += `
        <section id="${sectionId}" class="content-section">
          <h2 class="section-title"><span class="icon">📑</span> ${category}</h2>
          <div class="card-grid">
            ${cardsHtml}
          </div>
        </section>
      `;
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Academic Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #6d28d9;
      --secondary: #ec4899;
      --accent: #f59e0b;
      --surface: rgba(255, 255, 255, 0.96);
      --surface-strong: #ffffff;
      --text-main: #0f172a;
      --text-muted: #4b5563;
      --text-light: #6b7280;
      --bg-page: #f8f3ff;
      --border: rgba(109, 40, 217, 0.18);
      --shadow: 0 30px 90px -60px rgba(15, 23, 42, 0.16);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      background: radial-gradient(circle at top left, rgba(236, 72, 153, 0.18), transparent 24%),
                  radial-gradient(circle at right, rgba(245, 158, 11, 0.12), transparent 22%),
                  var(--bg-page);
      color: var(--text-main);
      line-height: 1.6;
      display: block;
    }

    h1, h2, h3, h4 {
      font-family: 'Merriweather', serif;
      color: var(--text-main);
      margin: 0;
    }

    .hero-shell {
      position: relative;
      overflow: hidden;
      padding: 3rem 4rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-shell::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(109, 40, 217, 0.08));
      pointer-events: none;
    }

    .hero-panel {
      position: relative;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 244, 255, 0.95));
      border: 1px solid var(--border);
      border-radius: 2rem;
      box-shadow: var(--shadow);
      padding: 2.5rem;
      display: grid;
      gap: 2rem;
    }

    .hero-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .hero-left {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      min-width: 0;
      flex: 1 1 400px;
    }

    .hero-avatar {
      width: 110px;
      height: 110px;
      border-radius: 28px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      display: grid;
      place-items: center;
      font-size: 3rem;
      font-weight: 800;
      box-shadow: 0 20px 50px -20px rgba(109, 40, 217, 0.35);
      margin-bottom: 1rem;
    }

    .hero-avatar-wrapper {
      display: grid;
      place-items: center;
      width: 132px;
      height: 132px;
      border-radius: 34px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      box-shadow: 0 20px 56px -24px rgba(109, 40, 217, 0.35);
    }

    .hero-avatar-img {
      width: 132px;
      height: 132px;
      object-fit: cover;
      border-radius: 34px;
      border: 4px solid rgba(255, 255, 255, 0.85);
    }

    .hero-avatar-img {
      width: 110px;
      height: 110px;
      object-fit: cover;
      border-radius: 28px;
      border: 4px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 20px 55px -20px rgba(109, 40, 217, 0.35);
    }

    .hero-link {
      color: var(--secondary);
      text-decoration: none;
      word-break: break-all;
    }

    .hero-link:hover {
      text-decoration: underline;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 999px;
      background: rgba(236, 72, 153, 0.12);
      color: var(--secondary);
      padding: 0.45rem 0.95rem;
      font-size: 0.82rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .hero-title {
      font-size: clamp(2rem, 4vw, 3rem);
      line-height: 1.05;
      margin-bottom: 0.6rem;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .hero-description {
      font-size: 1rem;
      max-width: 63ch;
      color: var(--text-main);
    }

    .hero-meta-grid {
      display: grid;
      gap: 1rem;
      margin-top: 1rem;
    }

    .hero-meta-card {
      background: var(--surface);
      border-radius: 1.5rem;
      border: 1px solid rgba(109, 40, 217, 0.06);
      padding: 1.1rem 1.3rem;
      box-shadow: 0 24px 60px -45px rgba(109, 40, 217, 0.18);
    }

    .hero-meta-card strong {
      display: block;
      margin-bottom: 0.45rem;
      color: var(--text-main);
      font-size: 0.94rem;
    }

    .hero-meta-card span {
      display: block;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .jump-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin-top: 1.2rem;
    }

    .jump-link {
      display: inline-flex;
      align-items: center;
      padding: 0.85rem 1.15rem;
      border-radius: 999px;
      background: rgba(109, 40, 217, 0.08);
      color: var(--primary);
      font-weight: 700;
      text-decoration: none;
      font-size: 0.9rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: 1px solid transparent;
    }

    .jump-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -16px rgba(109, 40, 217, 0.28);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(109, 40, 217, 0.16);
    }

    .main-content {
      max-width: 1200px;
      margin: 2rem auto 4rem;
      padding: 0 4rem;
    }

    .content-section {
      margin-bottom: 4rem;
      animation: fadeIn 0.8s ease-out forwards;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.8rem;
      font-size: clamp(1.75rem, 2vw, 2.25rem);
      position: relative;
    }

    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(109, 40, 217, 0.15), rgba(236, 72, 153, 0.15));
    }

    .section-title .icon {
      font-size: 1.7rem;
    }

    .bio-text {
      background: var(--surface);
      border: 1px solid rgba(109, 40, 217, 0.08);
      border-radius: 24px;
      padding: 2rem;
      color: var(--text-main);
      box-shadow: var(--shadow);
      line-height: 1.85;
    }

    .exp-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .exp-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 1.8rem;
      border-radius: 24px;
      border: 1px solid rgba(109, 40, 217, 0.08);
      display: grid;
      gap: 1rem;
      box-shadow: 0 22px 50px -28px rgba(109, 40, 217, 0.16);
      transition: transform 0.2s ease;
    }

    .exp-card:hover {
      transform: translateY(-4px);
    }

    .exp-icon {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      font-size: 1.4rem;
      background: rgba(236, 72, 153, 0.14);
      color: var(--secondary);
    }

    .exp-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .exp-label {
      font-size: 0.9rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .timeline {
      position: relative;
      padding-left: 120px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 120px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, rgba(109, 40, 217, 0.16), transparent);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2.5rem;
    }

    .timeline-date {
      position: absolute;
      left: -145px;
      top: 2px;
      width: 130px;
      text-align: right;
      font-weight: 800;
      font-size: 1rem;
      color: var(--secondary);
    }

    .timeline-dot {
      position: absolute;
      left: -7px;
      top: 8px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--secondary);
      border: 4px solid var(--surface-strong);
      box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.18);
    }

    .timeline-content {
      background: rgba(255, 255, 255, 0.98);
      padding: 1.9rem 2rem;
      border-radius: 24px;
      border: 1px solid rgba(109, 40, 217, 0.08);
      box-shadow: var(--shadow);
      margin-left: 2rem;
    }

    .timeline-content h3 {
      font-size: 1.2rem;
      margin-bottom: 0.35rem;
      display: inline-flex;
      gap: 0.8rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .tag {
      font-size: 0.72rem;
      background: rgba(235, 73, 180, 0.12);
      color: var(--secondary);
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .timeline-content h4 {
      font-size: 1rem;
      color: var(--text-main);
      font-weight: 700;
      margin-bottom: 0.55rem;
    }

    .sub-meta {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 0.65rem;
    }

    .score {
      display: inline-flex;
      margin-top: 0.55rem;
      font-size: 0.88rem;
      background: rgba(245, 158, 11, 0.12);
      padding: 0.32rem 0.9rem;
      border-radius: 999px;
      color: #92400e;
      font-weight: 700;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.75rem;
    }

    .academic-card {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(109, 40, 217, 0.08);
      border-radius: 28px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .academic-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
    }

    .academic-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 30px 80px -40px rgba(15, 23, 42, 0.18);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.3rem;
      gap: 1rem;
      z-index: 1;
    }

    .card-badge {
      background: rgba(99, 102, 241, 0.12);
      color: var(--primary);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-date {
      font-size: 0.88rem;
      color: var(--secondary);
      font-weight: 800;
      white-space: nowrap;
    }

    .card-title {
      font-size: 1.2rem;
      line-height: 1.5;
      margin-bottom: 1.1rem;
      color: var(--text-main);
    }

    .card-meta {
      background: rgba(236, 72, 153, 0.08);
      padding: 1rem 1.2rem;
      border-radius: 18px;
      margin-bottom: 1.2rem;
      font-size: 0.95rem;
      color: #831843;
      line-height: 1.7;
      border: 1px solid rgba(236, 72, 153, 0.14);
    }

    .meta-row {
      margin-bottom: 0.55rem;
    }
    .meta-row:last-child { margin-bottom: 0; }

    .card-desc {
      font-size: 0.97rem;
      color: var(--text-muted);
      margin-bottom: 1.3rem;
      flex-grow: 1;
    }

    .card-evidence {
      font-size: 0.93rem;
      color: var(--secondary);
      background: rgba(236, 72, 153, 0.08);
      padding: 1rem 1.1rem;
      border-radius: 16px;
      margin-bottom: 1.2rem;
      border: 1px solid rgba(236, 72, 153, 0.16);
      font-weight: 700;
    }

    .card-actions {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px dashed rgba(109, 40, 217, 0.14);
      display: flex;
      justify-content: flex-end;
    }

    .card-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85rem 1.25rem;
      background: linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(236, 72, 153, 0.15));
      color: var(--text-main);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      border-radius: 999px;
      transition: all 0.2s ease;
      border: 1px solid rgba(109, 40, 217, 0.12);
    }

    .card-btn:hover {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      border-color: transparent;
    }

    .card-btn.disabled {
      pointer-events: none;
      opacity: 0.55;
      cursor: default;
    }

    .evidence-btn {
      background: transparent;
    }

    .evidence-btn:hover {
      box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.08);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 960px) {
      .hero-top { grid-template-columns: 1fr; }
      .hero-shell { padding: 2rem 1.5rem 1.5rem; }
      .main-content { padding: 0 1.5rem; }
      .timeline { padding-left: 90px; }
      .timeline::before { left: 90px; }
      .timeline-date { left: -110px; width: 90px; font-size: 0.88rem; }
    }

    @media (max-width: 680px) {
      .hero-shell { padding: 1.5rem 1rem 1rem; }
      .hero-panel { padding: 1.6rem; }
      .hero-avatar { width: 96px; height: 96px; border-radius: 22px; font-size: 2.4rem; }
      .section-title { font-size: 1.6rem; }
      .exp-grid { grid-template-columns: 1fr; }
      .card-grid { grid-template-columns: 1fr; }
      .jump-links { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <div class="hero-shell">
    <section class="hero-panel">
      <div class="hero-top">
        <div class="hero-left">
          <div class="hero-avatar-wrapper">
            ${profilePictureDataUrl ? `<img src="${profilePictureDataUrl}" alt="${name}" class="hero-avatar-img" />` : `<div class="hero-avatar">${name.charAt(0).toUpperCase()}</div>`}
          </div>
          <div>
            <p class="hero-eyebrow">Academic Portfolio</p>
            <h1 class="hero-title">${name}</h1>
            <p class="hero-subtitle">${designation}</p>
            <p class="hero-description">${department}${college ? ` • ${college}` : ''}</p>
          </div>
        </div>

        <div class="hero-meta-grid">
          ${email ? `<div class="hero-meta-card"><strong>Email</strong><span>${email}</span></div>` : ''}
          ${phone ? `<div class="hero-meta-card"><strong>Phone</strong><span>${phone}</span></div>` : ''}
          ${address ? `<div class="hero-meta-card"><strong>Office</strong><span>${address}</span></div>` : ''}
          ${linkedinUrl ? `<div class="hero-meta-card"><strong>LinkedIn</strong><span><a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="hero-link">${linkedinUrl}</a></span></div>` : ''}
      </div>
      </div>

      <div class="jump-links">
        <a href="#about" class="jump-link">About</a>
        ${educationHtml ? `<a href="#education" class="jump-link">Education</a>` : ''}
        ${experienceHtml ? `<a href="#notable-experience-details" class="jump-link">Experience</a>` : ''}
        ${navLinksHtml}
      </div>
    </section>
  </div>

  <main class="main-content">
    <section id="about" class="content-section">
      <h2 class="section-title"><span class="icon">👋</span> About Profile</h2>
      <p class="bio-text">${bio}</p>
    </section>

    ${educationHtml}
    ${experienceHtml}
    ${activitiesHtml}
  </main>

  <script>
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + targetId);
      });
    });
  </script>
</body>
</html>`;

    setHtmlCode(html);
    const blob = new Blob([html], { type: "text/html" });
    objectUrl = URL.createObjectURL(blob);
    setPreviewUrl(objectUrl);
  }

    buildHtml();

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile, activities]);

  // Helper to find any reasonable title from varied JSON data keys
  const dataFallbackTitle = (d: any) => {
    return d.patentTitle || d.awardTitle || d.talkTitle || d.sessionTitle || d.workshopTitle || d.seminarTitle || d.fdpTitle || d.registrationNumber || null;
  };

  const handleExportFile = async () => {
    try {
      const fileName = `${nameStr || "portfolio"}-website.html`;
      const blob = new Blob([htmlCode], { type: "text/html" });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to export file: ", err);
    }
  };

  const handleGoToWebsite = () => {
    sessionStorage.setItem("portfolioHtml", htmlCode);
    window.open(`/portfolio/${nameStr}-cv`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex h-full w-full max-w-[90vw] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5">
          <div>
            <h2 className="text-xl font-black text-gray-900">Academic Portfolio Website</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGoToWebsite}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            >
              <Icon name="grid" className="h-4 w-4" />
              Open in New Tab
            </button>
            <button
              type="button"
              onClick={handleExportFile}
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Icon name={copied ? "check" : "file"} className="h-4 w-4" />
              {copied ? "Exported!" : "Export File"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content - iframe */}
        <div className="flex-1 overflow-hidden bg-gray-100/80 p-6 sm:p-8">
          <div className="mx-auto h-full w-full overflow-hidden rounded-[1rem] border border-gray-200 bg-white shadow-lg">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="h-full w-full border-none"
                title="Portfolio Website Preview"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                <Icon name="spark" className="h-8 w-8 animate-pulse text-blue-400" />
                <p className="font-medium">Generating your comprehensive portfolio...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
