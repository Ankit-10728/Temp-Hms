import { useState } from "react";
import { Menu } from "lucide-react";

export default function Header({
  title,
  subtitle,
  showSearch = true,
  onMenuClick,
}) {
  const [notifications] = useState(3);
  const [search, setSearch] = useState("");

  return (
    <div
      className="clinic-admin-header"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #EAE5DC",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      {/* Left Side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: 0,
        }}
      >
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EAE5DC] bg-white text-[#1A1D2E] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        )}

        <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "22px",
            fontWeight: "700",
            color: "#1A1D2E",
            margin: 0,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              color: "#6B7280",
              fontSize: "12px",
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
        </div>
      </div>

      {/* Right Side */}
      {showSearch && (
        <div
          className="clinic-admin-header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div className="clinic-admin-header-search" style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              🔍
            </span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff, records..."
              style={{
                background: "#FFFFFF",
                border: "1px solid #EAE5DC",
                borderRadius: "10px",
                padding: "9px 14px 9px 36px",
                fontSize: "13px",
                width: "min(220px, 100%)",
                outline: "none",
              }}
            />
          </div>

          {/* Notification */}
          <button
            style={{
              position: "relative",
              background: "#FFFFFF",
              border: "1px solid #EAE5DC",
              borderRadius: "10px",
              width: "38px",
              height: "38px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            🔔

            {notifications > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#E8630A",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "700",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {notifications}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#E8630A,#c4500a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            CA
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .clinic-admin-header {
            padding: 14px 16px !important;
            align-items: flex-start !important;
          }

          .clinic-admin-header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .clinic-admin-header-search {
            flex: 1;
            min-width: 0;
          }

          .clinic-admin-header-search input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
