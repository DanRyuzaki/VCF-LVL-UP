"use client";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { IconSearch, IconLock } from "@/components/shared/icons";
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
  deletedItemName?: string;
  itemType?: string;
}


// ---------------------------------------------------------------------------
// Access Denied guard
// ---------------------------------------------------------------------------
function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "16px", color: "var(--c-text-dim)" }}>
      <IconLock size={40} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-text)", marginBottom: "6px" }}>Access Restricted</p>
        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>Only Admins and Developers can view deletion reports.</p>
      </div>
    </div>
  );
}

function UnableToVerify() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px", gap: "16px", color: "var(--c-text-dim)" }}>
      <IconLock size={40} style={{ opacity: 0.4 }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--c-text)", marginBottom: "6px" }}>Couldn't Verify Role</p>
        <p style={{ fontSize: "13px", lineHeight: 1.6 }}>We couldn't confirm your access level right now. Try refreshing the page.</p>
      </div>
    </div>
  );
}

export default function DeletedReportsModule() {
  // ── Defense-in-depth: admin + developer only ──
  const { profile, profileError, loading: authLoading } = useAuth();
  if (profile && profile.role !== "admin" && profile.role !== "developer") return <AccessDenied />;
  if (!profile && !authLoading && profileError) return <UnableToVerify />;

  return <DeletedReportsInner />;
}

function DeletedReportsInner() {
  const [reports, setReports] = useState<DeletionReport[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<DeletionReport | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  // Load reports from Firestore
  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "deleted_user_reports"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const rows: DeletionReport[] = snap.docs.map((d) => {
          const data = d.data();
          // Derive display fields that weren't stored pre-migration
          const users: DeletedUserRecord[] = data.deletedUsers ?? [];
          const deletedItemName = data.deletedItemName
            ?? (users.length > 1
              ? `${users[0].name} (+${users.length - 1})`
              : users[0]?.name ?? "Unknown");
          const itemType = data.itemType ?? "User Account";
          const timeGenerated = data.timeGenerated
            ?? (data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
              : "");
          return {
            reportId: data.reportId ?? d.id,
            dateGenerated: data.dateGenerated ?? "",
            timeGenerated,
            totalRecordsDeleted: data.totalRecordsDeleted ?? users.length,
            generatedBy: data.generatedBy ?? data.adminName ?? "",
            adminName: data.adminName ?? data.generatedBy ?? "",
            adminRole: data.adminRole ?? "",
            adminEmail: data.adminEmail ?? "",
            adminAccountId: data.adminAccountId ?? data.adminUid ?? "",
            deletedUsers: users,
            dateDeleted: data.dateDeleted ?? data.dateGenerated ?? "",
            timeDeleted: data.timeDeleted ?? timeGenerated,
            deletedBy: data.deletedBy ?? data.generatedBy ?? "",
            deletionCategory: data.deletionCategory ?? "User Management",
            reason: data.reason ?? "",
            activityLog: data.activityLog ?? [],
            verifiedBy: data.verifiedBy ?? "",
            verificationDate: data.verificationDate ?? "",
            deletedItemName,
            itemType,
          };
        });
        setReports(rows);
      } catch (err) {
        console.error("deleted-reports: failed to load", err);
        setLoadError("Could not load deletion reports. Check your connection and try again.");
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  // Reset page on search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredReports = reports.filter(
    (r) =>
      r.reportId.toLowerCase().includes(search.toLowerCase()) ||
      r.adminName.toLowerCase().includes(search.toLowerCase()) ||
      (r.deletedItemName && r.deletedItemName.toLowerCase().includes(search.toLowerCase())) ||
      r.deletedUsers.some((u) => u.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination calculations
  const totalEntries = filteredReports.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredReports.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const startEntry = totalEntries === 0 ? 0 : indexOfFirstEntry + 1;
  const endEntry = indexOfLastEntry > totalEntries ? totalEntries : indexOfLastEntry;

  const handlePageChange = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

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
        ["DELETION DETAILS"],
        ["Date Deleted", report.dateDeleted],
        ["Time Deleted", report.timeDeleted],
        ["Deleted By", report.deletedBy],
        ["Deletion Category", report.deletionCategory],
        ["Reason for Deletion", report.reason]
      ];

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

      // 1. Report Details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text("1. REPORT DETAILS", 10, 52);

      // Admin Data Box
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 55, 115, 28, "F");
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.3);
      doc.rect(10, 55, 115, 28, "S");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Report ID", 14, 60);
      doc.text("Date Generated", 14, 66);
      doc.text("Time Generated", 14, 72);
      doc.text("Generated By", 14, 78);

      doc.setFont("Helvetica", "normal");
      doc.text(`:  ${report.reportId}`, 38, 60);
      doc.text(`:  ${report.dateGenerated}`, 38, 66);
      doc.text(`:  ${report.timeGenerated}`, 38, 72);
      doc.text(`:  ${report.generatedBy}`, 38, 78);

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

      let nextY = 93;

      // 2. Deletion Details
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text("2. DELETION DETAILS", 10, nextY);
      
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

      // 3. Reason for Deletion
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("3. REASON FOR DELETION", 10, nextY);
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(209, 213, 219);
      doc.rect(10, nextY + 3, 190, 12, "S");
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      const splitReason = doc.splitTextToSize(report.reason, 180);
      doc.text(splitReason, 14, nextY + 8);

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

  // Helper for rendering Item Type Icons in Table
  const renderItemTypeIcon = (type: string) => {
    const iconStyle = { marginRight: "8px", verticalAlign: "middle", opacity: 0.85 };
    if (type === "Gamer Account" || type.toLowerCase().includes("gamer")) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    }
    if (type === "Tournament" || type.toLowerCase().includes("tournament")) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
          <path d="M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
        </svg>
      );
    }
    if (type === "Livestream" || type.toLowerCase().includes("stream")) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    }
    if (type === "Team" || type.toLowerCase().includes("team")) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    if (type === "Announcement" || type.toLowerCase().includes("announcement")) {
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    }
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={iconStyle}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  };

  if (!hydrated) {
    return <div className="text-center py-8 text-sm" style={{ color: "var(--c-text-dim)" }}>Loading reports…</div>;
  }
  if (loadError) {
    return <div className="text-center py-8 text-sm" style={{ color: "#FF4655" }}>{loadError}</div>;
  }

  return (
    <div>
      {/* Search and Pagination Size Controls */}
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

        <div className="flex items-center gap-2">
          <span style={{ color: "var(--c-text-dim)", fontSize: "12.5px" }}>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: "4px 28px 4px 10px",
              height: "32px",
              fontSize: "12.5px",
              backgroundColor: "var(--c-surface3)",
              border: "1px solid var(--c-border)",
              borderRadius: "6px",
              color: "var(--c-text)",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span style={{ color: "var(--c-text-dim)", fontSize: "12.5px" }}>entries</span>
        </div>
      </div>

      {/* Reports Table - Overflow visible locally to show floating download dropdowns */}
      <div className="dash-table-wrap" style={{ overflow: "visible" }}>
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <thead className="dash-thead">
            <tr>
              <th className="dash-th" style={{ width: "13%" }}>REPORT ID</th>
              <th className="dash-th" style={{ width: "18%" }}>ADMIN NAME</th>
              <th className="dash-th" style={{ width: "23%" }}>DELETED ITEM</th>
              <th className="dash-th" style={{ width: "17%" }}>ITEM TYPE</th>
              <th className="dash-th" style={{ width: "15%" }}>DATE DELETED</th>
              <th className="dash-th" style={{ width: "14%" }}>TIME DELETED</th>
              <th className="dash-th" style={{ width: "15%" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="dash-td text-center text-xs" style={{ color: "var(--c-text-dim)", padding: "24px" }}>
                  No reports found matching your criteria.
                </td>
              </tr>
            ) : (
              currentEntries.map((report) => (
                <tr key={report.reportId} className="dash-tr">
                  <td className="dash-td font-semibold" style={{ color: "var(--c-text)" }}>{report.reportId}</td>
                  <td className="dash-td">
                    <span
                      onClick={() => setSelectedReport(report)}
                      style={{
                        color: "#FF4655",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 500,
                      }}
                    >
                      {report.adminName}
                    </span>
                  </td>
                  <td className="dash-td" style={{ color: "var(--c-text)" }}>{report.deletedItemName}</td>
                  <td className="dash-td" style={{ color: "var(--c-text-muted)", whiteSpace: "nowrap" }}>
                    {renderItemTypeIcon(report.itemType || "")}
                    {report.itemType}
                  </td>
                  <td className="dash-td-dim" style={{ color: "var(--c-text-dim)" }}>{report.dateDeleted}</td>
                  <td className="dash-td-dim" style={{ color: "var(--c-text-dim)" }}>{report.timeDeleted}</td>
                  <td className="dash-td">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer font-semibold uppercase tracking-wider"
                      style={{
                        fontSize: "11px",
                        backgroundColor: "rgba(255, 70, 85, 0.08)",
                        border: "1.2px solid #FF4655",
                        color: "#FF4655",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 70, 85, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 70, 85, 0.08)";
                      }}
                    >
                      {/* View Details Eye SVG */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Indicator Footer */}
      <div
        className="flex items-center justify-between mt-5"
        style={{
          color: "var(--c-text-dim)",
          fontSize: "12px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div>
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>
        <div className="flex gap-1">
          {/* Previous page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              border: "1px solid var(--c-border)",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              color: currentPage === 1 ? "var(--c-text-dim)" : "var(--c-text)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.4 : 1,
            }}
          >
            &lt;
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                style={{
                  padding: "6px 12px",
                  border: isActive ? "1px solid #FF4655" : "1px solid var(--c-border)",
                  borderRadius: "4px",
                  backgroundColor: isActive ? "#FF4655" : "rgba(255, 255, 255, 0.02)",
                  color: isActive ? "#FFFFFF" : "var(--c-text)",
                  cursor: "pointer",
                  fontWeight: isActive ? "bold" : "normal",
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{
              padding: "6px 12px",
              border: "1px solid var(--c-border)",
              borderRadius: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.02)",
              color: currentPage === totalPages || totalPages === 0 ? "var(--c-text-dim)" : "var(--c-text)",
              cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages || totalPages === 0 ? 0.4 : 1,
            }}
          >
            &gt;
          </button>
        </div>
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
          title="DELETION REPORT DETAILS"
          maxWidth="1000px"
        >
          {/* Main Content Layout Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.3fr",
              gap: "24px",
              marginTop: "12px",
              paddingBottom: "18px",
              borderBottom: "1px solid var(--c-border)",
              fontSize: "13px",
              color: "var(--c-text)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* COLUMN 1: Report Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Report Information */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF4655", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", marginBottom: "12px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  Report Details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Report ID</span><span>: {selectedReport.reportId}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Date Generated</span><span>: {selectedReport.dateGenerated}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Time Generated</span><span>: {selectedReport.timeGenerated}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Generated By</span><span>: {selectedReport.generatedBy}</span></div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Deletion Information & Reason for Deletion */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", borderLeft: "1px solid var(--c-border)", paddingLeft: "24px" }}>
              {/* Deletion Information */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF4655", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", marginBottom: "12px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Deletion Information
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Date Deleted</span><span>: {selectedReport.dateDeleted}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Time Deleted</span><span>: {selectedReport.timeDeleted}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Deleted By</span><span>: {selectedReport.deletedBy}</span></div>
                  <div style={{ display: "flex" }}><span style={{ width: "130px", color: "var(--c-text-dim)" }}>Deletion Category</span><span>: {selectedReport.deletionCategory}</span></div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "var(--c-border)" }} />

              {/* Reason for Deletion */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF4655", fontWeight: "bold", fontSize: "14px", textTransform: "uppercase", marginBottom: "12px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Reason for Deletion
                </div>
                <div
                  style={{
                    backgroundColor: "var(--c-surface3)",
                    border: "1px solid var(--c-border)",
                    borderRadius: "6px",
                    padding: "12px 14px",
                    color: "var(--c-text-muted)",
                    fontSize: "12.5px",
                    lineHeight: 1.5,
                  }}
                >
                  "{selectedReport.reason}"
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls (Download Excel, Print) */}
          <div
            className="no-print"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Download Excel Report Button */}
            <button
              onClick={() => exportToExcel(selectedReport)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer font-semibold uppercase tracking-wider text-xs"
              style={{
                backgroundColor: "rgba(0, 245, 212, 0.05)",
                border: "1.2px solid #00F5D4",
                color: "#00F5D4",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 245, 212, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 245, 212, 0.05)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              Download Excel Report
            </button>

            {/* Print Report Button */}
            <button
              onClick={triggerSystemPrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer font-semibold uppercase tracking-wider text-xs"
              style={{
                backgroundColor: "var(--c-surface2)",
                border: "1.2px solid var(--c-border)",
                color: "var(--c-text-dim)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--c-surface3)";
                e.currentTarget.style.color = "var(--c-text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--c-surface2)";
                e.currentTarget.style.color = "var(--c-text-dim)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Report
            </button>
          </div>

          {/* Hidden A4 Printable Container */}
          <div
            id="print-area-wrapper"
            style={{
              display: "none",
              backgroundColor: "#FFFFFF",
              color: "#1A202C",
              fontFamily: "Helvetica, Arial, sans-serif",
              padding: "40px",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            {/* Header branding */}
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #E2E8F0", paddingBottom: "12px", marginBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FF4655" }}>VCF: LVL UP!</div>
                <div style={{ fontSize: "9px", color: "#718096", textTransform: "uppercase" }}>ESPORTS MANAGEMENT SYSTEM</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "10px" }}>
                <div><strong>Report ID:</strong> {selectedReport.reportId}</div>
                <div><strong>Date Generated:</strong> {selectedReport.dateGenerated}</div>
                <div><strong>By:</strong> {selectedReport.generatedBy}</div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", textTransform: "uppercase", margin: "0 0 6px 0", color: "#1A202C" }}>DELETED RECORD AUDIT REPORT</h2>
              <div style={{ fontSize: "10px", color: "#718096" }}>This document certifies the deletion of administrative records.</div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <tbody>
                <tr style={{ backgroundColor: "#F7FAFC" }}>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold", width: "30%" }}>Report ID</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.reportId}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold" }}>Date & Time Generated</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.dateGenerated} at {selectedReport.timeGenerated}</td>
                </tr>
                <tr style={{ backgroundColor: "#F7FAFC" }}>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold" }}>Generated By</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.generatedBy}</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ fontSize: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "4px", marginTop: "16px" }}>Deletion Information</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", marginBottom: "20px" }}>
              <tbody>
                <tr style={{ backgroundColor: "#F7FAFC" }}>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold", width: "30%" }}>Date & Time Deleted</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.dateDeleted} at {selectedReport.timeDeleted}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold" }}>Deleted By</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.deletedBy}</td>
                </tr>
                <tr style={{ backgroundColor: "#F7FAFC" }}>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold" }}>Deletion Category</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0" }}>{selectedReport.deletionCategory}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontWeight: "bold" }}>Reason for Deletion</td>
                  <td style={{ padding: "8px", border: "1px solid #E2E8F0", fontStyle: "italic" }}>"{selectedReport.reason}"</td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "12px", marginTop: "32px", fontSize: "8px", color: "#718096" }}>
              This report is generated automatically by the VCF: LVL UP! eSports Management System and serves as an official audit trail for administrative deletion activities. Unauthorized modification, duplication, or distribution of this report is prohibited.
            </div>
          </div>
        </ModalBackdrop>
      )}
    </div>
  );
}
