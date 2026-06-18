"use client";
import { useState, useEffect } from "react";
import { IconSearch } from "@/components/shared/icons";
import ModalBackdrop from "@/components/shared/modal-backdrop";

// Dynamic script loader for CDN files
const loadLibrary = (src: string, globalName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("Window undefined");
    if ((window as any)[globalName]) {
      resolve((window as any)[globalName]);
      return;
    }
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve((window as any)[globalName]));
      existingScript.addEventListener("error", () => reject(new Error(`Failed to load ${globalName}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve((window as any)[globalName]);
    script.onerror = () => reject(new Error(`Failed to load ${globalName}`));
    document.head.appendChild(script);
  });
};

interface DeletedUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  statusBeforeDeletion: string;
  created: string;
}

interface DeletionReport {
  reportId: string;
  dateGenerated: string;
  timeGenerated: string;
  totalRecordsDeleted: number;
  generatedBy: string;
  adminName: string;
  adminRole: string;
  adminEmail: string;
  adminAccountId: string;
  deletedUsers: DeletedUserRecord[];
  dateDeleted: string;
  timeDeleted: string;
  deletedBy: string;
  deletionCategory: string;
  reason: string;
  activityLog: { time: string; description: string }[];
  verifiedBy: string;
  verificationDate: string;
}

const mockInitialReports: DeletionReport[] = [
  {
    reportId: "DR-2026-00001",
    dateGenerated: "June 18, 2026",
    timeGenerated: "10:20 AM",
    totalRecordsDeleted: 3,
    generatedBy: "Maria Santos",
    adminName: "Maria Santos",
    adminRole: "Administrator",
    adminEmail: "maria@wbc.org",
    adminAccountId: "ADM-001",
    deletedUsers: [
      { id: "USR-023", name: "Juan Dela Cruz", email: "juan@faith.com", role: "Gamer", statusBeforeDeletion: "active", created: "May 12, 2026" },
      { id: "USR-024", name: "Ben Torres", email: "ben@faith.com", role: "Gamer", statusBeforeDeletion: "inactive", created: "Apr 25, 2026" },
      { id: "USR-025", name: "Liza Cruz", email: "liza@faith.com", role: "Gamer", statusBeforeDeletion: "active", created: "May 10, 2026" }
    ],
    dateDeleted: "June 18, 2026",
    timeDeleted: "10:15 AM",
    deletedBy: "Maria Santos",
    deletionCategory: "User Account Removal",
    reason: "The accounts were removed due to duplicate registration and inactive participation records.",
    activityLog: [
      { time: "2026-06-18 10:15:02", description: "Administrator Maria Santos opened User Details." },
      { time: "2026-06-18 10:15:08", description: "Administrator Maria Santos selected Delete User." },
      { time: "2026-06-18 10:15:12", description: 'Deletion reason submitted: "The accounts were removed due to duplicate..."' },
      { time: "2026-06-18 10:15:15", description: "User Accounts USR-023, USR-024, USR-025 permanently deleted." },
      { time: "2026-06-18 10:15:15", description: "Deletion activity successfully recorded in Deleted Reports." }
    ],
    verifiedBy: "Developer",
    verificationDate: "June 18, 2026"
  }
];

export default function DeletedReportsModule() {
  const [reports, setReports] = useState<DeletionReport[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<DeletionReport | null>(null);
  const [activeDropdownReportId, setActiveDropdownReportId] = useState<string | null>(null);

  // Load reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("vcf_deleted_reports");
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      setReports(mockInitialReports);
      localStorage.setItem("vcf_deleted_reports", JSON.stringify(mockInitialReports));
    }
    setHydrated(true);
  }, []);

  // Click away dropdown handler
  useEffect(() => {
    if (activeDropdownReportId === null) return;
    const handleClose = () => setActiveDropdownReportId(null);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [activeDropdownReportId]);

  const filteredReports = reports.filter(
    (r) =>
      r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.deletedUsers.some((u) => u.name.toLowerCase().includes(search.toLowerCase())) ||
      r.generatedBy.toLowerCase().includes(search.toLowerCase())
  );

  const exportToExcel = async (report: DeletionReport) => {
    try {
      const XLSX = await loadLibrary("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", "XLSX");
      
      const info = [
        ["DELETED RECORD AUDIT REPORT"],
        ["Report ID", report.reportId],
        ["Generated Date", report.dateGenerated],
        ["Generated Time", report.timeGenerated],
        ["Generated By", report.generatedBy],
        [],
        ["ADMINISTRATOR INFORMATION"],
        ["Admin Name", report.adminName],
        ["Role", report.adminRole],
        ["Email Address", report.adminEmail],
        ["Account ID", report.adminAccountId],
        [],
        ["DELETION DETAILS"],
        ["Date Deleted", report.dateDeleted],
        ["Time Deleted", report.timeDeleted],
        ["Deleted By", report.deletedBy],
        ["Deletion Category", report.deletionCategory],
        ["Reason for Deletion", report.reason],
        [],
        ["DELETED RECORDS"],
        ["Record ID", "Name", "Email", "Role", "Registration Date"]
      ];

      report.deletedUsers.forEach((u) => {
        info.push([u.id, u.name, u.email, u.role, u.created]);
      });

      info.push([]);
      info.push(["SYSTEM ACTIVITY LOG"]);
      info.push(["Date & Time", "Activity Description"]);
      report.activityLog.forEach((log) => {
        info.push([log.time, log.description]);
      });

      info.push([]);
      info.push(["VERIFICATION"]);
      info.push(["Verified By", report.verifiedBy]);
      info.push(["Verification Status", "Verified"]);
      info.push(["Verification Date", report.verificationDate]);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(info);
      XLSX.utils.book_append_sheet(wb, ws, "Audit Report");
      
      XLSX.writeFile(wb, `${report.reportId}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Could not generate Excel workbook.");
    }
  };

  const exportToPDF = async (report: DeletionReport) => {
    try {
      const jspdfLib = await loadLibrary("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jspdf");
      const jsPDFClass = (window as any).jspdf?.jsPDF || jspdfLib?.jsPDF;
      if (!jsPDFClass) throw new Error("jsPDF was not successfully loaded from CDN");

      const doc = new jsPDFClass({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Draw VCF Wings Logo emblem crest helper
      const drawWingsEmblem = (gdoc: any, cx: number, cy: number, scale = 1.0) => {
        gdoc.setDrawColor(255, 46, 68); // #FF2E44
        gdoc.setFillColor(255, 46, 68);
        gdoc.setLineWidth(0.4 * scale);

        // Center Shield
        gdoc.polygon([
          [cx, cy + 4.5 * scale],
          [cx - 5.5 * scale, cy - 3.5 * scale],
          [cx + 5.5 * scale, cy - 3.5 * scale]
        ], "F");

        // Wing feathers left
        gdoc.polygon([
          [cx - 5.5 * scale, cy - 3.5 * scale],
          [cx - 13.5 * scale, cy - 8.5 * scale],
          [cx - 9.5 * scale, cy - 0.5 * scale],
          [cx - 5.5 * scale, cy - 3.5 * scale]
        ], "F");
        gdoc.polygon([
          [cx - 5.5 * scale, cy - 1.0 * scale],
          [cx - 11.5 * scale, cy + 3.5 * scale],
          [cx - 8.5 * scale, cy + 5.5 * scale],
          [cx - 5.5 * scale, cy - 1.0 * scale]
        ], "F");

        // Wing feathers right
        gdoc.polygon([
          [cx + 5.5 * scale, cy - 3.5 * scale],
          [cx + 13.5 * scale, cy - 8.5 * scale],
          [cx + 9.5 * scale, cy - 0.5 * scale],
          [cx + 5.5 * scale, cy - 3.5 * scale]
        ], "F");
        gdoc.polygon([
          [cx + 5.5 * scale, cy - 1.0 * scale],
          [cx + 11.5 * scale, cy + 3.5 * scale],
          [cx + 8.5 * scale, cy + 5.5 * scale],
          [cx + 5.5 * scale, cy - 1.0 * scale]
        ], "F");

        // Center star
        gdoc.setFillColor(15, 15, 15);
        gdoc.circle(cx, cy - 6.5 * scale, 0.7 * scale, "F");
      };

      // Header border line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(10, 30, 200, 30);

      // Logo
      drawWingsEmblem(doc, 22, 17, 0.9);
      doc.setTextColor(255, 46, 68);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.text("VCF: LVL UP!", 38, 18);
      
      doc.setTextColor(80, 80, 80);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("ESPORTS MANAGEMENT SYSTEM", 38, 23);

      // Metadata Table (Right aligned)
      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 15, 15);
      doc.text("Report ID", 140, 12);
      doc.text("Generated Date", 140, 16);
      doc.text("Generated Time", 140, 20);
      doc.text("Generated By", 140, 24);
      doc.text("Report Type", 140, 28);

      doc.setFont("Helvetica", "normal");
      doc.text(`:  ${report.reportId}`, 165, 12);
      doc.text(`:  ${report.dateGenerated}`, 165, 16);
      doc.text(`:  ${report.timeGenerated}`, 165, 20);
      doc.text(`:  ${report.generatedBy}`, 165, 24);
      doc.text(":  Deleted Records Audit", 165, 28);

      // Title Section
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(10, 10, 10);
      doc.text("DELETED RECORD AUDIT REPORT", 105, 38, { align: "center" });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("This report contains the details of the record deleted by an administrator.", 105, 43, { align: "center" });

      // 1. Administrator Information
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text("1. ADMINISTRATOR INFORMATION", 10, 52);

      // Admin Data Box
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 55, 115, 28, "F");
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.3);
      doc.rect(10, 55, 115, 28, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Admin Name", 14, 60);
      doc.text("Role", 14, 66);
      doc.text("Email Address", 14, 72);
      doc.text("Account ID", 14, 78);

      doc.setFont("Helvetica", "normal");
      doc.text(`:  ${report.adminName}`, 38, 60);
      doc.text(`:  ${report.adminRole}`, 38, 66);
      doc.text(`:  ${report.adminEmail}`, 38, 72);
      doc.text(`:  ${report.adminAccountId}`, 38, 78);

      // Logo Crest Box (Right aligned)
      doc.setFillColor(255, 255, 255);
      doc.rect(135, 55, 65, 28, "S");
      drawWingsEmblem(doc, 167.5, 64, 0.85);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 46, 68);
      doc.text("VCF: LVL UP!", 167.5, 75, { align: "center" });
      doc.setFontSize(6);
      doc.setTextColor(120, 120, 120);
      doc.text("ESPORTS MANAGEMENT SYSTEM", 167.5, 79, { align: "center" });

      // 2. Deleted Record Information
      doc.setTextColor(10, 10, 10);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("2. DELETED RECORD INFORMATION", 10, 93);

      let nextY = 96;
      if (report.deletedUsers.length === 1) {
        const u = report.deletedUsers[0];
        doc.setFillColor(248, 249, 250);
        doc.rect(10, 96, 115, 30, "F");
        doc.rect(10, 96, 115, 30, "S");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Deleted Item (Name)", 14, 101);
        doc.text("Item Type", 14, 107);
        doc.text("Record ID", 14, 113);
        doc.text("Account Status", 14, 119);
        doc.text("Date Registered", 14, 125);

        doc.setFont("Helvetica", "normal");
        doc.text(`:  ${u.name}`, 58, 101);
        doc.text(`:  ${u.role} Account`, 58, 107);
        doc.text(`:  ${u.id}`, 58, 113);
        doc.text(`:  ${u.statusBeforeDeletion.toUpperCase()}`, 58, 119);
        doc.text(`:  ${u.created}`, 58, 125);
        nextY = 133;
      } else {
        // Render detailed users table (max space matching left side width 115)
        doc.setFillColor(248, 249, 250);
        const sec2Height = 8 + report.deletedUsers.length * 5.5;
        doc.rect(10, 96, 115, sec2Height, "F");
        doc.rect(10, 96, 115, sec2Height, "S");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("Record ID", 13, 101);
        doc.text("Item Name", 33, 101);
        doc.text("Role", 72, 101);
        doc.text("Reg Date", 97, 101);
        
        doc.line(10, 103, 125, 103);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        
        report.deletedUsers.forEach((u, idx) => {
          const rowY = 107 + idx * 5.5;
          doc.text(u.id, 13, rowY);
          doc.text(u.name.length > 18 ? u.name.slice(0, 16) + ".." : u.name, 33, rowY);
          doc.text(u.role, 72, rowY);
          doc.text(u.created, 97, rowY);
        });
        nextY = 96 + sec2Height + 7;
      }

      // Draw Circle 1 (Trash Icon) next to Section 2
      const circle1CenterY = 96 + (report.deletedUsers.length === 1 ? 15 : (8 + report.deletedUsers.length * 5.5) / 2);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.4);
      doc.circle(167.5, circle1CenterY, 9, "S");
      
      // Draw trash icon vectors inside circle
      doc.setDrawColor(156, 163, 175);
      doc.setLineWidth(0.5);
      doc.line(162.5, circle1CenterY - 3, 172.5, circle1CenterY - 3); // Lid
      doc.rect(164, circle1CenterY - 3, 7, 7, "S"); // Bin body
      doc.line(166, circle1CenterY, 166, circle1CenterY + 3);
      doc.line(169, circle1CenterY, 169, circle1CenterY + 3);

      // 3. Deletion Details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text("3. DELETION DETAILS", 10, nextY);
      
      doc.setFillColor(248, 249, 250);
      doc.rect(10, nextY + 3, 115, 25, "F");
      doc.setDrawColor(209, 213, 219);
      doc.rect(10, nextY + 3, 115, 25, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Date Deleted", 14, nextY + 8);
      doc.text("Time Deleted", 14, nextY + 14);
      doc.text("Deleted By", 14, nextY + 20);
      doc.text("Deletion Category", 14, nextY + 26);
      
      doc.setFont("Helvetica", "normal");
      doc.text(`:  ${report.dateDeleted}`, 42, nextY + 8);
      doc.text(`:  ${report.timeDeleted}`, 42, nextY + 14);
      doc.text(`:  ${report.deletedBy}`, 42, nextY + 20);
      doc.text(`:  ${report.deletionCategory}`, 42, nextY + 26);

      // Draw Circle 2 (Calendar Clock Icon) next to Section 3
      const circle2CenterY = nextY + 15.5;
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.4);
      doc.circle(167.5, circle2CenterY, 9, "S");

      // Draw calendar outline inside circle
      doc.setDrawColor(156, 163, 175);
      doc.setLineWidth(0.5);
      doc.rect(163.5, circle2CenterY - 3.5, 8, 7.5, "S");
      doc.line(163.5, circle2CenterY - 1, 171.5, circle2CenterY - 1);
      // Small clock indicator
      doc.circle(169, circle2CenterY + 2, 2.2, "S");
      doc.line(169, circle2CenterY + 2, 169, circle2CenterY + 1);
      doc.line(169, circle2CenterY + 2, 170.2, circle2CenterY + 2);

      nextY = nextY + 34;

      // 4. Reason for Deletion
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("4. REASON FOR DELETION", 10, nextY);
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(209, 213, 219);
      doc.rect(10, nextY + 3, 190, 12, "S");
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      const splitReason = doc.splitTextToSize(report.reason, 180);
      doc.text(splitReason, 14, nextY + 8);

      nextY = nextY + 20;

      // 5. System Activity Log
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("5. SYSTEM ACTIVITY LOG", 10, nextY);
      
      doc.setFillColor(243, 244, 246);
      doc.rect(10, nextY + 3, 190, 6, "F");
      doc.rect(10, nextY + 3, 190, 6, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Date & Time", 14, nextY + 7);
      doc.text("Activity Description", 60, nextY + 7);
      
      doc.setFont("Helvetica", "normal");
      report.activityLog.forEach((log, idx) => {
        const rowY = nextY + 13 + idx * 6;
        doc.rect(10, nextY + 9 + idx * 6, 190, 6, "S");
        doc.text(log.time, 14, rowY);
        doc.text(log.description, 60, rowY);
      });

      nextY = nextY + 9 + report.activityLog.length * 6 + 6;

      // 6. Verification & Digital Signature
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("6. VERIFICATION", 10, nextY);

      doc.setFillColor(248, 249, 250);
      doc.rect(10, nextY + 3, 95, 20, "F");
      doc.rect(10, nextY + 3, 95, 20, "S");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Verified By", 14, nextY + 7.5);
      doc.text("Verification Status", 14, nextY + 12.5);
      doc.text("Verification Date", 14, nextY + 17.5);
      
      doc.setFont("Helvetica", "normal");
      doc.text(`:  ${report.verifiedBy}`, 42, nextY + 7.5);
      doc.text(`:  Verified`, 42, nextY + 12.5);
      doc.text(`:  ${report.verificationDate}`, 42, nextY + 17.5);

      // Signature Box
      doc.rect(115, nextY + 3, 85, 20, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("Administrator Signature", 119, nextY + 7.5);
      
      // Draw signature cursive text
      doc.setFont("Times-Italic", "italic");
      doc.setFontSize(13);
      doc.setTextColor(30, 80, 180);
      doc.text(report.adminName, 134, nextY + 14);
      
      doc.setTextColor(120, 120, 120);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7);
      doc.text(`Date: ${report.dateDeleted}`, 119, nextY + 18);

      // Footer
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(6.5);
      const disclaimer = "This report is generated automatically by the VCF: LVL UP! eSports Management System and serves as an official audit trail for administrative deletion activities. Unauthorized modification, duplication, or distribution of this report is prohibited.";
      const splitDisclaimer = doc.splitTextToSize(disclaimer, 180);
      doc.text(splitDisclaimer, 15, 284);
      doc.text("Page 1 of 1", 185, 291);

      doc.save(`${report.reportId}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF document.");
    }
  };

  const triggerSystemPrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading reports...</div>;
  }

  return (
    <div>
      {/* Search area */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--c-text-dim)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            style={{
              paddingLeft: "36px",
              paddingRight: "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
              width: "220px",
              fontSize: "13px",
              backgroundColor: "var(--c-surface2)",
              border: "1px solid var(--c-border)",
              borderRadius: "8px",
              color: "var(--c-text)",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--c-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--c-border)")}
          />
        </div>
      </div>

      {/* Reports Table - Overflow visible locally to show floating download dropdowns */}
      <div className="dash-table-wrap" style={{ overflow: "visible" }}>
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <thead className="dash-thead">
            <tr>
              <th className="dash-th" style={{ width: "18%" }}>Report ID</th>
              <th className="dash-th" style={{ width: "20%" }}>Date Generated</th>
              <th className="dash-th" style={{ width: "18%" }}>Total Records Deleted</th>
              <th className="dash-th" style={{ width: "18%" }}>Generated By</th>
              <th className="dash-th" style={{ width: "13%" }}>View Details</th>
              <th className="dash-th" style={{ width: "13%" }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="dash-td text-center text-xs" style={{ color: "var(--c-text-dim)", padding: "24px" }}>
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.reportId} className="dash-tr">
                  <td className="dash-td font-semibold">{report.reportId}</td>
                  <td className="dash-td-muted">{report.dateGenerated}</td>
                  <td className="dash-td">{report.totalRecordsDeleted}</td>
                  <td className="dash-td-muted">{report.generatedBy}</td>
                  <td className="dash-td">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-[#00D4FF] hover:text-[#00B4D8] text-xs font-semibold uppercase tracking-wider bg-transparent border-none cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                  <td className="dash-td" style={{ position: "relative", overflow: "visible" }}>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownReportId(activeDropdownReportId === report.reportId ? null : report.reportId);
                        }}
                        className="text-[#00F5D4] hover:text-[#00C4AA] text-xs font-semibold uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        Download ▼
                      </button>
                      {activeDropdownReportId === report.reportId && (
                        <div
                          className="no-print"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "6px",
                            backgroundColor: "var(--c-surface3)",
                            border: "1px solid var(--c-border2)",
                            borderRadius: "8px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                            zIndex: 50,
                            minWidth: "160px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          <button
                            onClick={() => {
                              exportToPDF(report);
                              setActiveDropdownReportId(null);
                            }}
                            style={{
                              padding: "10px 14px",
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              textAlign: "left",
                              backgroundColor: "transparent",
                              color: "var(--c-text)",
                              border: "none",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                            }}
                            className="hover:bg-[rgba(255,70,85,0.1)] hover:text-[#FF4655]"
                          >
                            📄 Download PDF
                          </button>
                          <button
                            onClick={() => {
                              exportToExcel(report);
                              setActiveDropdownReportId(null);
                            }}
                            style={{
                              padding: "10px 14px",
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              textAlign: "left",
                              backgroundColor: "transparent",
                              color: "var(--c-text)",
                              border: "none",
                              cursor: "pointer",
                              transition: "background-color 0.15s",
                              borderTop: "1px solid var(--c-border)",
                            }}
                            className="hover:bg-[rgba(0,245,212,0.1)] hover:text-[#00F5D4]"
                          >
                            📊 Download Excel
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Printable CSS style tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area-wrapper, #print-area-wrapper * {
            visibility: visible !important;
          }
          #print-area-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 10mm !important;
            background-color: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            font-size: 11px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Audit Report Viewer Modal */}
      {selectedReport && (
        <ModalBackdrop
          onClose={() => setSelectedReport(null)}
          title={`Audit Report: ${selectedReport.reportId}`}
          maxWidth="840px"
        >
          {/* Action buttons inside the modal */}
          <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "12px" }}>
            <button
              onClick={() => exportToPDF(selectedReport)}
              className="text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded"
              style={{ backgroundColor: "var(--c-accent)", cursor: "pointer" }}
            >
              Save PDF Document
            </button>
            <button
              onClick={triggerSystemPrint}
              className="text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded"
              style={{ backgroundColor: "rgba(128, 128, 128, 0.25)", border: "1px solid var(--c-border)", cursor: "pointer" }}
            >
              Print Document
            </button>
            <button
              onClick={() => exportToExcel(selectedReport)}
              className="text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded"
              style={{ backgroundColor: "#00F5D4", color: "#000", cursor: "pointer" }}
            >
              Download Excel
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#2B2B2B",
              padding: "24px",
              maxHeight: "70vh",
              overflowY: "auto",
              display: "flex",
              justifyContent: "center",
              borderRadius: "8px",
              boxShadow: "inset 0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            {/* The professional A4 styled paper container */}
            <div
              id="print-area-wrapper"
              style={{
                width: "100%",
                maxWidth: "750px",
                backgroundColor: "#FFFFFF",
                color: "#1E1E1E",
                fontFamily: "Helvetica, Arial, sans-serif",
                padding: "36px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                lineHeight: 1.5,
                fontSize: "12px"
              }}
            >
              {/* Report Header Logo & Title */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #D1D5DB", paddingBottom: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Wings Logo Emblem SVG */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21L4 17.5V6.5L12 3L20 6.5V17.5L12 21Z" fill="none" stroke="#FF4655" strokeWidth="1.5" />
                    <path d="M12 6.5L7 11.5H17L12 6.5Z" fill="#FF4655" />
                    <circle cx="12" cy="14.5" r="1.5" fill="#1F2937" />
                  </svg>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FF4655", letterSpacing: "1px" }}>
                      VCF: LVL UP!
                    </div>
                    <div style={{ fontSize: "8px", fontWeight: 600, color: "#4B5563", letterSpacing: "1.5px", marginTop: "1px" }}>
                      ESPORTS MANAGEMENT SYSTEM
                    </div>
                  </div>
                </div>
                {/* Meta details right align */}
                <table style={{ fontSize: "10.5px", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: "bold", padding: "1px 6px" }}>Report ID</td>
                      <td style={{ padding: "1px 6px" }}>: {selectedReport.reportId}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold", padding: "1px 6px" }}>Generated Date</td>
                      <td style={{ padding: "1px 6px" }}>: {selectedReport.dateGenerated}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold", padding: "1px 6px" }}>Generated Time</td>
                      <td style={{ padding: "1px 6px" }}>: {selectedReport.timeGenerated}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold", padding: "1px 6px" }}>Generated By</td>
                      <td style={{ padding: "1px 6px" }}>: {selectedReport.generatedBy}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: "bold", padding: "1px 6px" }}>Report Type</td>
                      <td style={{ padding: "1px 6px" }}>: Deleted Records Audit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Document Title */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", margin: "0 0 4px 0", letterSpacing: "1.5px" }}>
                  DELETED RECORD AUDIT REPORT
                </h2>
                <div style={{ fontSize: "9.5px", color: "#6B7280", fontStyle: "italic" }}>
                  This report contains the details of the record deleted by an administrator.
                </div>
              </div>

              {/* 1. Administrator Information */}
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  1. ADMINISTRATOR INFORMATION
                </h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ flex: 1, backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "10px 14px" }}>
                    <table style={{ width: "100%", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", width: "120px", padding: "4px 0" }}>Admin Name</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.adminName}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Role</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.adminRole}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Email Address</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.adminEmail}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Account ID</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.adminAccountId}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Visual logo emblem box */}
                  <div style={{ width: "180px", border: "1px solid #E5E7EB", borderRadius: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px", backgroundColor: "#FFFFFF" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21L4 17.5V6.5L12 3L20 6.5V17.5L12 21Z" fill="none" stroke="#FF4655" strokeWidth="1.5" />
                      <path d="M12 6.5L7 11.5H17L12 6.5Z" fill="#FF4655" />
                      <circle cx="12" cy="14.5" r="1.5" fill="#1F2937" />
                    </svg>
                    <div style={{ fontSize: "9px", fontWeight: "bold", color: "#FF4655", marginTop: "4px" }}>VCF: LVL UP!</div>
                    <div style={{ fontSize: "7px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>ESPORTS SYSTEM</div>
                  </div>
                </div>
              </div>

              {/* 2. Deleted Record Information */}
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  2. DELETED RECORD INFORMATION
                </h3>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {/* Left Column: Data Grid */}
                  <div style={{ flex: 1 }}>
                    {selectedReport.deletedUsers.length === 1 ? (
                      <div style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "10px 14px" }}>
                        <table style={{ width: "100%", fontSize: "11px" }}>
                          <tbody>
                            <tr>
                              <td style={{ fontWeight: "bold", width: "180px", padding: "4px 0" }}>Deleted Item (Name)</td>
                              <td style={{ padding: "4px 0" }}>: {selectedReport.deletedUsers[0].name}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", padding: "4px 0" }}>Item Type</td>
                              <td style={{ padding: "4px 0" }}>: {selectedReport.deletedUsers[0].role} Account</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", padding: "4px 0" }}>Record ID</td>
                              <td style={{ padding: "4px 0" }}>: {selectedReport.deletedUsers[0].id}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", padding: "4px 0" }}>Account Status Before Deletion</td>
                              <td style={{ padding: "4px 0" }}>: {selectedReport.deletedUsers[0].statusBeforeDeletion}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: "bold", padding: "4px 0" }}>Date Registered</td>
                              <td style={{ padding: "4px 0" }}>: {selectedReport.deletedUsers[0].created}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ overflow: "hidden", border: "1px solid #E5E7EB", borderRadius: "4px" }}>
                        <table style={{ width: "100%", fontSize: "10.5px", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                              <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold" }}>Record ID</th>
                              <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold" }}>Deleted Item Name</th>
                              <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold" }}>User Role</th>
                              <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold" }}>Registration Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.deletedUsers.map((u, idx) => (
                              <tr key={u.id} style={{ borderBottom: idx < selectedReport.deletedUsers.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                                <td style={{ padding: "6px 10px", fontFamily: "monospace" }}>{u.id}</td>
                                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{u.name}</td>
                                <td style={{ padding: "6px 10px" }}>{u.role}</td>
                                <td style={{ padding: "6px 10px" }}>{u.created}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  {/* Right Column: Trash can circle visual graphic */}
                  <div style={{ width: "180px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid #E5E7EB", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Deletion Details */}
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  3. DELETION DETAILS
                </h3>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {/* Left Column: Details Box */}
                  <div style={{ flex: 1, backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "10px 14px" }}>
                    <table style={{ width: "100%", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", width: "150px", padding: "4px 0" }}>Date Deleted</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.dateDeleted}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Time Deleted</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.timeDeleted}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Deleted By</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.deletedBy}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Deletion Category</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.deletionCategory}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Right Column: Calendar clock circle visual graphic */}
                  <div style={{ width: "180px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid #E5E7EB", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <circle cx="12" cy="16" r="3" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1.5" />
                        <polyline points="12 14.5 12 16 13.5 16" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Reason for Deletion */}
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  4. REASON FOR DELETION
                </h3>
                <div style={{ border: "1px solid #E5E7EB", borderRadius: "4px", padding: "12px 14px", backgroundColor: "#FFFFFF", fontStyle: "italic", fontSize: "11px", color: "#374151" }}>
                  "{selectedReport.reason}"
                </div>
              </div>

              {/* 5. System Activity Log */}
              <div style={{ marginBottom: "18px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  5. SYSTEM ACTIVITY LOG
                </h3>
                <div style={{ overflow: "hidden", border: "1px solid #E5E7EB", borderRadius: "4px" }}>
                  <table style={{ width: "100%", fontSize: "10.5px", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid #E5E7EB" }}>
                        <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold", width: "140px" }}>Date & Time</th>
                        <th style={{ textAlign: "left", padding: "6px 10px", fontWeight: "bold" }}>Activity Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.activityLog.map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < selectedReport.activityLog.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <td style={{ padding: "6px 10px", color: "#4B5563", fontFamily: "monospace" }}>{log.time}</td>
                          <td style={{ padding: "6px 10px", color: "#1F2937" }}>{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Verification Section */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#111827", borderBottom: "1px solid #E5E7EB", paddingBottom: "4px", marginBottom: "8px" }}>
                  6. VERIFICATION
                </h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  {/* Verified specs */}
                  <div style={{ flex: 1, backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "10px 14px" }}>
                    <table style={{ width: "100%", fontSize: "11px" }}>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: "bold", width: "120px", padding: "4px 0" }}>Verified By</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.verifiedBy}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Verification Status</td>
                          <td style={{ padding: "4px 0", color: "#10B981", fontWeight: "bold" }}>: Verified</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: "bold", padding: "4px 0" }}>Verification Date</td>
                          <td style={{ padding: "4px 0" }}>: {selectedReport.verificationDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Digital Signature Card */}
                  <div style={{ width: "250px", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#FFFFFF" }}>
                    <div style={{ fontSize: "9px", fontWeight: "bold", color: "#4B5563", textTransform: "uppercase" }}>
                      Administrator Signature
                    </div>
                    {/* Handwritten signature visual representation */}
                    <div style={{ padding: "4px 0", textAlign: "center", fontFamily: "'Brush Script MT', cursive, Georgia", fontSize: "20px", color: "#1D4ED8", borderBottom: "1px solid #D1D5DB", userSelect: "none" }}>
                      {selectedReport.adminName}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#6B7280", marginTop: "4px" }}>
                      <span>Signature Secured</span>
                      <span>Date: {selectedReport.dateDeleted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom footer text */}
              <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: "12px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "8px", color: "#9CA3AF" }}>
                <div style={{ maxWidth: "80%" }}>
                  This report is generated automatically by the VCF: LVL UP! eSports Management System and serves as an official audit trail for administrative deletion activities. Unauthorized modification, duplication, or distribution of this report is prohibited.
                </div>
                <div>Page 1 of 1</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              onClick={() => setSelectedReport(null)}
              className="dash-btn-ghost text-xs px-5 py-2.5 rounded-lg no-print"
            >
              Close
            </button>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
