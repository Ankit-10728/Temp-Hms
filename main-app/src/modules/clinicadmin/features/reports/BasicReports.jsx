import { useEffect, useMemo, useState } from "react";
import API from "../../../../shared/api/axios";

const ACCENT = "#E8630A";
const INDIGO = "#6366F1";
const GREEN = "#22C55E";

const Card = ({ children }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #E8ECF0",
      borderRadius: 16,
      padding: 22,
      boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
    }}
  >
    {children}
  </div>
);

const KPI = ({ label, value, color, sub }) => (
  <Card>
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 28,
            fontWeight: 900,
            color: "#0F172A",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {sub ? (
          <div style={{ marginTop: 8, fontSize: 13, color: "#64748B" }}>{sub}</div>
        ) : null}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: `${color}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          color,
          flexShrink: 0,
        }}
      >
        {label === "Total Revenue" ? "₹" : "●"}
      </div>
    </div>
  </Card>
);

export default function BasicReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [patientRegistered, setPatientRegistered] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);

  const fmtINR = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clinic routes are mounted under backend: /clinic
        const dashboardSummaryRes = await API.get(
          "/clinic/reports/dashboard-summary"
        );

        const { totalRevenue = 0, newPatients = 0 } = dashboardSummaryRes?.data || {};

        setTotalRevenue(totalRevenue);
        setPatientRegistered(newPatients);

        const staffRoleRes = await API.get("/clinic/reports/staff-role");
        const roles = staffRoleRes?.data || [];
        const total = roles.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
        setTotalStaff(total);

        if (!cancelled) setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setLoading(false);
        setError(e?.response?.data?.message || e.message || "Failed to load reports");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        background: "#F8F9FB",
        minHeight: "100vh",
        padding: "28px 32px",
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: '"Inter","Plus Jakarta Sans",system-ui,sans-serif',
        color: "#0F172A",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Basic Reports</h1>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748B" }}>
          Key metrics for clinic administration.
        </p>
      </div>

      {loading ? (
        <div style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid #E8ECF0" }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ background: "#fff", padding: 18, borderRadius: 16, border: "1px solid #E8ECF0" }}>
          <div style={{ fontWeight: 800, color: "#B91C1C" }}>Error</div>
          <div style={{ marginTop: 8, color: "#64748B", fontSize: 13 }}>{error}</div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <KPI
            label="Total Revenue"
            value={`₹${fmtINR.format(totalRevenue)}`}
            color={ACCENT}
            sub="Sum of completed consultations"
          />
          <KPI
            label="Total Staff"
            value={totalStaff}
            color={INDIGO}
            sub="All staff roles"
          />
          <KPI
            label="Patient Registered"
            value={patientRegistered}
            color={GREEN}
            sub="Total pets registered"
          />
        </div>
      )}

      {/* Download buttons */}
      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "Download PDF", color: "#E8630A" },
          { label: "Download Excel", color: "#6366F1" },
          { label: "Download CSV", color: "#22C55E" },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => {
              // Placeholder: backend/pdfService can be plugged later
              // For now just trigger browser print as a lightweight export.
              window.print();
            }}
            style={{
              background: b.color,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "#94A3B8" }}>
        Data fetched from backend reports APIs.
      </div>
    </div>
  );
}

