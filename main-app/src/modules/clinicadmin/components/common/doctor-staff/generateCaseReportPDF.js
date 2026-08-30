import { jsPDF } from "jspdf";

export const generateCaseReportPDF = (data) => {
  if (!data) return;

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  const checkPageBreak = (neededHeight = 15) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 15;
    }
  };

  const formatVal = (val, suffix = "") => {
    if (val === undefined || val === null || String(val).trim() === "") return "N/A";
    return `${String(val).trim()}${suffix}`;
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("VET CLINIC & ANIMAL HOSPITAL", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text("Official Medical Record & Prescription Summary", margin, 19);

  // Date & Token on Header Right
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const tokenNumber =
    data.tokenNumber ||
    data.token ||
    `TK-${(data._id || data.id || "").slice(-4) || "00"}`;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`TOKEN: ${tokenNumber}`, pageWidth - margin, 12, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 19, { align: "right" });

  y = 34;

  // Patient & Owner Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("PATIENT DETAILS", margin + 4, y + 7);
  doc.text("OWNER DETAILS", margin + 95, y + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const petName =
    data.pet?.petName ||
    data.petId?.name ||
    data.petId?.petName ||
    data.petName ||
    "N/A";
  const species =
    data.pet?.species || data.petId?.species || data.species || "N/A";
  const breed = data.pet?.breed || data.petId?.breed || data.breed || "N/A";
  const gender = data.pet?.gender || data.petId?.gender || data.gender || "N/A";
  const age = data.pet?.age || data.petId?.age || data.age || "N/A";

  const ownerName =
    data.owner?.ownerName ||
    data.ownerId?.ownerName ||
    data.ownerName ||
    "N/A";
  const mobile =
    data.owner?.mobileNumber ||
    data.ownerId?.mobileNumber ||
    data.phoneNumber ||
    "N/A";

  doc.text(`Pet Name: ${petName}`, margin + 4, y + 14);
  doc.text(`Species/Breed: ${species} (${breed})`, margin + 4, y + 20);
  doc.text(`Gender / Age: ${gender} / ${age}`, margin + 4, y + 26);

  doc.text(`Owner Name: ${ownerName}`, margin + 95, y + 14);
  doc.text(`Mobile: ${mobile}`, margin + 95, y + 20);
  doc.text(`Status: Completed Consultation`, margin + 95, y + 26);

  y += 40;

  // Helper for printing key-value pairs cleanly
  const renderRow = (label, val, neededHeight = 6) => {
    checkPageBreak(neededHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${label}: `, margin, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const displayVal = formatVal(val);
    const maxW = pageWidth - margin * 2 - 45;
    const splitVal = doc.splitTextToSize(displayVal, maxW);
    doc.text(splitVal, margin + 45, y);
    y += Math.max(splitVal.length * 4.5, 5);
  };

  // Section 1: Clinical Vitals
  const vitals = data.vitals || data.preConsultationId || {};
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("1. CLINICAL VITALS", margin, y);
  y += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(232, 99, 10);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  renderRow("Body Temperature", vitals.bodyTemperature || vitals.temperature ? `${vitals.bodyTemperature || vitals.temperature} °F` : null);
  renderRow("Body Weight", vitals.bodyWeight || vitals.weight ? `${vitals.bodyWeight || vitals.weight} kg` : null);
  renderRow("Heart / Pulse Rate", vitals.heartRate || vitals.pulseRate ? `${vitals.heartRate || vitals.pulseRate} bpm` : null);
  renderRow("Respiratory Rate", vitals.respiratoryRate);
  renderRow("Blood Pressure", vitals.bloodPressure);
  renderRow("SpO2", vitals.spo2 !== undefined && vitals.spo2 !== null && vitals.spo2 !== "" ? `${vitals.spo2}%` : null);
  renderRow("Body Condition Score (BCS)", vitals.bcs ? `${vitals.bcs}/5` : null);
  renderRow("Vitals Recorded By", vitals.recordedBy);
  y += 3;

  // Section 2: Medical History
  const history = data.history || {};
  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. HISTORY - DOCTOR REVIEWS", margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  renderRow("Diet Type", history.dietType);
  renderRow("Diet Frequency", history.dietFrequency ? `${history.dietFrequency} meals/day` : null);
  renderRow("Water Intake", history.waterIntake);
  renderRow("Behavioral Habits", history.behaviour);
  renderRow("Exercise Level", history.exercise);
  renderRow("Vaccination Status", history.vaccinationStatus);
  renderRow("Known Allergies", history.allergies);

  const medConfirmed = Array.isArray(history.medicationsConfirmed) ? history.medicationsConfirmed : [];
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Confirmed Medications History: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (medConfirmed.length > 0 && medConfirmed.some(m => m.drug)) {
    y += 4.5;
    medConfirmed.forEach(m => {
      if (m.drug) {
        checkPageBreak(6);
        doc.text(`• Drug: ${m.drug} | Dose: ${formatVal(m.dose)} | Freq: ${formatVal(m.frequency)} | Since: ${formatVal(m.since)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }
  y += 3;

  // Section 3: Clinical Observations
  const obs = data.clinicalObservation || {};
  const obsList = [
    { key: "cardiovascular", label: "Cardiovascular" },
    { key: "respiratory", label: "Respiratory" },
    { key: "digestive", label: "Digestive" },
    { key: "musculoskeletal", label: "Musculoskeletal" },
    { key: "neurological", label: "Neurological" },
    { key: "urogenital", label: "Urogenital" },
    { key: "skin", label: "Skin & Coat" },
    { key: "eyes", label: "Eyes" },
    { key: "ears", label: "Ears" },
    { key: "lymphNodes", label: "Lymph Nodes" },
  ];

  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("3. CLINICAL OBSERVATIONS", margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  obsList.forEach(item => {
    renderRow(item.label, obs[item.key]);
  });
  renderRow("Doctor Observation Notes", obs.doctorNotes);
  y += 3;

  // Section 4: Diagnosis & Lab Requisition
  const diag = data.diagnosis || {};
  const labReq = data.labRequisition || {};
  const labRep = data.labReport || data.consultationDetails?.labReport || {};

  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("4. DIAGNOSIS & LAB REQUISITION", margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  renderRow("Confirmed Diagnosis", diag.confirmedDiagnosis);
  renderRow("Provisional Diagnosis", diag.provisionalDiagnosis);
  renderRow("Differential Diagnosis", diag.differentialDiagnosis);

  // Safely extract test names from labReq.tests (handles array of strings or array of objects)
  let testsList = [];
  if (Array.isArray(labReq.tests)) {
    testsList = labReq.tests
      .map(t => typeof t === "string" ? t : (t.testName || t.name || ""))
      .filter(Boolean);
  } else if (typeof labReq.tests === "string" && labReq.tests.trim()) {
    testsList = [labReq.tests.trim()];
  }

  // Also gather test names from uploaded lab reports if any
  if (Array.isArray(labRep.reports)) {
    labRep.reports.forEach(r => {
      if (r.testName && !testsList.includes(r.testName)) {
        testsList.push(r.testName);
      }
    });
  }

  const testsStr = testsList.length > 0 ? testsList.join(", ") : null;

  let sampleStr = null;
  if (Array.isArray(labReq.sampleType)) {
    sampleStr = labReq.sampleType.map(s => typeof s === "string" ? s : (s.name || s.label || "")).filter(Boolean).join(", ");
  } else if (typeof labReq.sampleType === "string") {
    sampleStr = labReq.sampleType;
  }

  renderRow("Lab Requisition Tests", testsStr);
  renderRow("Lab Sample Type", sampleStr);
  renderRow("Lab Instructions", labReq.instructions);

  // Render Uploaded Lab Reports & Download Links in PDF
  if (Array.isArray(labRep.reports) && labRep.reports.length > 0) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("Uploaded Lab Diagnostic Reports: ", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    y += 4.5;

    labRep.reports.forEach((r, idx) => {
      checkPageBreak(8);
      const testTitle = r.testName || `Lab Report #${idx + 1}`;
      const fileName = r.fileName || "Uploaded Attachment";
      const fileUrl = r.fileUrl || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${testTitle}: `, margin + 5, y);
      const titleWidth = doc.getTextWidth(`${idx + 1}. ${testTitle}: `);
      
      doc.setFont("helvetica", "normal");
      doc.text(fileName, margin + 5 + titleWidth, y);
      y += 4.5;

      if (fileUrl) {
        const backendOrigin = window.location.origin.includes("5173")
          ? "http://localhost:5000"
          : window.location.origin;

        const safeName = (r.fileName || r.testName || "Lab_Report")
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_\-]/g, "_");

        const downloadProxyUrl = `${backendOrigin}/api/v1/doctorModule/download-lab-file?url=${encodeURIComponent(fileUrl)}&name=${encodeURIComponent(safeName)}`;

        doc.setFont("helvetica", "bold");
        doc.setTextColor(234, 88, 12); // Vibrant link color
        const linkText = "   [Click to Download PDF Report]";
        doc.textWithLink(linkText, margin + 5, y, { url: downloadProxyUrl });
        const linkWidth = doc.getTextWidth(linkText);
        doc.link(margin + 5, y - 3, linkWidth, 4, { url: downloadProxyUrl });
        doc.setTextColor(51, 65, 85);
        y += 5;
      }
    });
  }
  y += 3;

  // Section 5: Treatment & Prescription Administered
  const treatment = data.treatment || {};
  const medsList = Array.isArray(treatment.medicationsList) ? treatment.medicationsList : [];
  const procList = Array.isArray(treatment.proceduresList) ? treatment.proceduresList : [];
  const vacList = Array.isArray(treatment.vaccinationsList) ? treatment.vaccinationsList : [];
  const dewList = Array.isArray(treatment.dewormingList) ? treatment.dewormingList : [];
  const fluidList = Array.isArray(treatment.fluidsList) ? treatment.fluidsList : [];

  checkPageBreak(35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("5. TREATMENT & PRESCRIPTION ADMINISTERED", margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 5.1 Medications Prescribed
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Medications Prescribed: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (medsList.length > 0 && medsList.some(m => m.drugName)) {
    y += 4.5;
    medsList.forEach((m, idx) => {
      if (m.drugName) {
        checkPageBreak(6);
        doc.text(`${idx + 1}. Drug: ${m.drugName} | Dose: ${formatVal(m.dose)} | Route: ${formatVal(m.route)} | Freq: ${formatVal(m.frequency)} | Duration: ${formatVal(m.duration)} | Instruction: ${formatVal(m.instruction)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else if (treatment.medicines) {
    const splitMeds = doc.splitTextToSize(String(treatment.medicines), pageWidth - margin * 2 - 45);
    doc.text(splitMeds, margin + 45, y);
    y += Math.max(splitMeds.length * 4.5, 5);
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }

  // 5.2 Procedures Done
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("In Clinic Procedures Done: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (procList.length > 0 && procList.some(p => p.procedure)) {
    y += 4.5;
    procList.forEach((p, idx) => {
      if (p.procedure) {
        checkPageBreak(6);
        doc.text(`${idx + 1}. Procedure: ${p.procedure} | Description: ${formatVal(p.description)} | Outcome: ${formatVal(p.outcome)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else if (treatment.procedures) {
    const splitProc = doc.splitTextToSize(String(treatment.procedures), pageWidth - margin * 2 - 45);
    doc.text(splitProc, margin + 45, y);
    y += Math.max(splitProc.length * 4.5, 5);
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }

  // 5.3 Vaccinations Administered
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Vaccination Administered: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (vacList.length > 0 && vacList.some(v => v.vaccine)) {
    y += 4.5;
    vacList.forEach((v, idx) => {
      if (v.vaccine) {
        checkPageBreak(6);
        doc.text(`${idx + 1}. Vaccine: ${v.vaccine} | Batch No: ${formatVal(v.batchNumber)} | Dose: ${formatVal(v.dose)} | Route: ${formatVal(v.route)} | Next Due: ${formatVal(v.nextDueDate)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else if (treatment.vaccinations) {
    doc.text(formatVal(treatment.vaccinations), margin + 45, y);
    y += 5;
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }

  // 5.4 Deworming Administered
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Deworming Administered: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (dewList.length > 0 && dewList.some(d => d.product)) {
    y += 4.5;
    dewList.forEach((d, idx) => {
      if (d.product) {
        checkPageBreak(6);
        doc.text(`${idx + 1}. Product: ${d.product} | Dose: ${formatVal(d.dose)} | Date: ${formatVal(d.date)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else if (treatment.deworming) {
    doc.text(formatVal(treatment.deworming), margin + 45, y);
    y += 5;
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }

  // 5.5 Fluids / IV Given
  checkPageBreak(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Fluids / IV Given: ", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  if (fluidList.length > 0 && fluidList.some(f => f.type)) {
    y += 4.5;
    fluidList.forEach((f, idx) => {
      if (f.type) {
        checkPageBreak(6);
        doc.text(`${idx + 1}. Type: ${f.type} | Volume: ${formatVal(f.volume)} | Rate: ${formatVal(f.rate)}`, margin + 5, y);
        y += 4.5;
      }
    });
  } else if (treatment.fluids) {
    doc.text(formatVal(treatment.fluids), margin + 45, y);
    y += 5;
  } else {
    doc.text("N/A", margin + 45, y);
    y += 5;
  }

  renderRow("Treatment Notes", treatment.treatmentNotes);
  y += 3;

  // Section 6: Discharge Advice & Suggestions
  const suggestion = data.suggestion || {};

  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("6. DISCHARGE ADVICE & FOLLOW-UP INSTRUCTIONS", margin, y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  renderRow("Prognosis", suggestion.prognosis);
  renderRow("Dietary Advice", suggestion.dietAdvice);
  renderRow("Activity Restriction", suggestion.activityRestriction);
  renderRow("Home Care", suggestion.homeCare);
  renderRow("Preventive Care", suggestion.preventiveCare);
  renderRow("Follow-Up Required / Date", suggestion.followUpDate || treatment.followUp);
  renderRow("Final Doctor Notes", suggestion.finalNotes);
  y += 5;

  // Doctor Signature Section
  checkPageBreak(30);
  y = Math.max(y + 10, pageHeight - 35);
  if (y > pageHeight - 30) {
    doc.addPage();
    y = pageHeight - 35;
  }

  doc.setLineWidth(0.4);
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const docName =
    data.consultationDetails?.doctorName ||
    data.doctorName ||
    "Authorized Veterinarian";
  doc.text(docName, pageWidth - margin - 60, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Doctor's Signature & Stamp", pageWidth - margin - 60, y + 9);

  // Footer Note
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for choosing our clinic for your pet's healthcare needs.",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  const sanitizedPetName = petName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Medical_Report_${sanitizedPetName}_${tokenNumber}.pdf`);
};
