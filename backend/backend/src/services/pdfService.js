const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePrescriptionPDF = (consultationData, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });

      // Pipe its output directly to the HTTP response to trigger a download
      doc.pipe(res);

      const { clinic, doctor, pet, owner, medicines, diagnosis, followUpDate } = consultationData;

      // 1. Header: Clinic Branding & Logo[cite: 1]
      // Assuming you have a default logo in your assets folder
      const logoPath = path.join(__dirname, '../assets/default-clinic-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 50 });
      }

      doc.fillColor('#333333')
         .fontSize(20)
         .text(clinic.name, 110, 50)
         .fontSize(10)
         .text(clinic.address, 110, 75)
         .moveDown();

      doc.moveTo(50, 110).lineTo(550, 110).stroke(); // Divider line

      // 2. Doctor & Patient Information
      doc.moveDown();
      doc.fontSize(12).text(`Doctor: Dr. ${doctor.name}`, 50, 130);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 130);
      
      doc.text(`Pet Name: ${pet.name} (${pet.species})`, 50, 150);
      doc.text(`Owner: ${owner.name}`, 400, 150);
      
      // 3. Diagnosis[cite: 1]
      doc.moveDown(2);
      doc.fontSize(14).text('Diagnosis', { underline: true });
      doc.fontSize(12).text(diagnosis);
      
      // 4. Medicines (Dose, Duration)[cite: 1]
      doc.moveDown(2);
      doc.fontSize(14).text('Prescription', { underline: true });
      doc.moveDown(0.5);

      medicines.forEach((med, index) => {
        doc.fontSize(12).text(`${index + 1}. ${med.medicine}`);
        doc.fontSize(10).fillColor('#555555').text(`   Dose: ${med.dose} | Duration: ${med.duration}`);
        doc.moveDown(0.5);
      });

      // 5. Follow-up
      if (followUpDate) {
        doc.moveDown(2);
        doc.fillColor('#ff0000').text(`Follow-up Date: ${new Date(followUpDate).toLocaleDateString()}`);
      }

      // Finalize the PDF and end the stream
      doc.end();
      resolve(true);

    } catch (error) {
      reject(error);
    }
  });
};