"use client"

import * as React from "react"

interface StudentPDFTemplateProps {
  student: {
    name: string
    indexNumber: string
    birthDay?: string
    grade?: string
    section?: string
    stream?: string
    houseName?: string
    contactNo?: string
    guardianName?: string
    address?: string
    specialRemarks?: string
    siblingsAtSchool?: string
    enrollmentStatus?: string
    academicYear?: string
    createdAt?: string
    imageUrl?: string
  }
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function fmtDateTime(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function Row({
  label,
  value,
  shade,
  last,
}: {
  label: string
  value: string
  shade: boolean
  last?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: last ? "none" : "1px solid #cccccc",
        minHeight: "42px",
      }}
    >
      <div
        style={{
          width: "200px",
          flexShrink: 0,
          padding: "10px 14px",
          background: shade ? "#eeeeee" : "#f5f5f5",
          borderRight: "1.5px solid #aaaaaa",
          fontSize: "8.5pt",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px",
          color: "#333333",
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          padding: "10px 16px",
          background: shade ? "#fafafa" : "#ffffff",
          fontSize: "10.5pt",
          fontWeight: 400,
          color: "#111111",
          wordBreak: "break-word" as const,
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
        }}
      >
        {value}
      </div>
    </div>
  )
}

export const StudentPDFTemplate = React.forwardRef<
  HTMLDivElement,
  StudentPDFTemplateProps
>(({ student }, ref) => {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const classLabel = student.grade
    ? `Grade ${student.grade} — ${student.section}${student.stream ? ` (${student.stream})` : ""}`
    : "—"

  const rows: { label: string; value: string }[] = [
    { label: "Full Name", value: student.name },
    { label: "Index Number", value: student.indexNumber },
    { label: "Date of Birth", value: fmtDate(student.birthDay) },
    { label: "Grade & Section", value: classLabel },
    { label: "Stream", value: student.stream || "—" },
    { label: "House", value: student.houseName || "—" },
    { label: "Academic Year", value: student.academicYear || "—" },
    {
      label: "Enrollment Status",
      value: student.enrollmentStatus
        ? student.enrollmentStatus.charAt(0).toUpperCase() +
          student.enrollmentStatus.slice(1)
        : "—",
    },
    { label: "Contact Number", value: student.contactNo || "—" },
    { label: "Guardian / Parent", value: student.guardianName || "—" },
    { label: "Home Address", value: student.address || "—" },
  ]

  if (student.siblingsAtSchool) {
    rows.push({ label: "Siblings at School", value: student.siblingsAtSchool })
  }
  if (student.specialRemarks) {
    rows.push({ label: "Special Remarks", value: student.specialRemarks })
  }

  return (
    <div
      ref={ref}
      style={{
        display: "none",
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111111",
        boxSizing: "border-box",
        padding: "52px 56px 52px",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "18px",
          paddingBottom: "16px",
          borderBottom: "3px solid #111111",
          marginBottom: "22px",
        }}
      >
        <img
          src="/images/wcc-logo.png"
          alt="WCC Logo"
          style={{
            width: "72px",
            height: "72px",
            objectFit: "contain",
            flexShrink: 0,
            display: "block",
          }}
        />

        {/* School name aligned to top of logo */}
        <div style={{ flex: 1, paddingTop: "0px" }}>
          <div
            style={{
              fontSize: "22pt",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#111111",
              letterSpacing: "0.2px",
            }}
          >
            Wellawa Central College
          </div>
          <div
            style={{
              fontSize: "8.5pt",
              color: "#666666",
              marginTop: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Student Information System &nbsp;·&nbsp; Official Profile Record
          </div>
        </div>

        {/* Date — top-aligned */}
        <div
          style={{
            flexShrink: 0,
            textAlign: "right",
            fontSize: "8.5pt",
            color: "#555555",
            lineHeight: 1.8,
            paddingTop: "0px",
          }}
        >
          <div>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ── STUDENT SUMMARY ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "center",
          padding: "20px 20px",
          border: "2px solid #111111",
          marginBottom: "22px",
          background: "#f8f8f8",
        }}
      >
        {/* Photo */}
        <div
          style={{
            width: "100px",
            height: "120px",
            flexShrink: 0,
            border: "1.5px solid #111111",
            overflow: "hidden",
            background: "#dddddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {student.imageUrl ? (
            <img
              src={student.imageUrl}
              alt={student.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <span
              style={{ fontSize: "28pt", fontWeight: 800, color: "#888888" }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "19pt",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#111111",
              marginBottom: "6px",
              wordBreak: "break-word",
            }}
          >
            {student.name}
          </div>

          <div
            style={{
              fontSize: "11pt",
              fontWeight: 600,
              color: "#444444",
              marginBottom: "10px",
            }}
          >
            {classLabel}
          </div>

          {/* Index number — no border, just label + value inline */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11pt",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#666666",
              }}
            >
              Index No.
            </span>
            <span
              style={{
                fontSize: "11pt",
                fontWeight: 700,
                color: "#111111",
                letterSpacing: "0.8px",
              }}
            >
              {student.indexNumber}
            </span>
          </div>
        </div>
      </div>

      {/* ── DETAILS TABLE ──────────────────────────────────────── */}
      <div
        style={{
          background: "#111111",
          color: "#ffffff",
          fontSize: "8pt",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1.8px",
          padding: "8px 14px",
        }}
      >
        Student Details
      </div>

      <div
        style={{
          border: "1.5px solid #111111",
          borderTop: "none",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        {rows.map((row, i) => (
          <Row
            key={row.label}
            label={row.label}
            value={row.value}
            shade={i % 2 === 0}
            last={i === rows.length - 1}
          />
        ))}
      </div>

      {/* Record timestamp */}
      <div style={{ fontSize: "8.5pt", color: "#555555", marginBottom: "28px" }}>
        <span style={{ fontWeight: 700, color: "#111111" }}>Record Created: </span>
        {fmtDateTime(student.createdAt)}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: "2px solid #111111",
          paddingTop: "12px",
          fontSize: "8.5pt",
          color: "#555555",
        }}
      >
        <span style={{ fontWeight: 700, color: "#111111" }}>
          Wellawa Central College
        </span>
        &nbsp;·&nbsp;Student Information Platform
      </div>
    </div>
  )
})

StudentPDFTemplate.displayName = "StudentPDFTemplate"
