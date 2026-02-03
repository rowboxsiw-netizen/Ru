import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Employee } from '../types';

export const generateOfflineForm = () => {
  const doc = new jsPDF();
  
  // -- Header --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text('Employee Enrollment Form', 105, 20, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text('Nexus Systems Pvt. Ltd. - HR Department', 105, 28, { align: 'center' });

  // -- Instructions --
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Please fill in the following information clearly in BLOCK LETTERS.', 14, 45);

  // -- Form Fields helper --
  const drawField = (label: string, y: number, width: number = 180) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    
    // Draw Box
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(14, y + 2, width, 10); // x, y, w, h
  };

  let currentY = 55;
  const gap = 20;

  // 1. Full Name
  drawField('Full Name:', currentY);
  currentY += gap;

  // 2. Email Address
  drawField('Email Address:', currentY);
  currentY += gap;

  // 3. Department
  drawField('Department:', currentY);
  currentY += gap;

  // 4. Job Role / Title
  drawField('Job Role / Title:', currentY);
  currentY += gap;

  // 5. Annual Salary
  drawField('Annual Salary (Rs.):', currentY);
  currentY += gap;

  // 6. Join Date
  drawField('Join Date (DD-MM-YYYY):', currentY);
  currentY += gap + 10;

  // -- Footer Signature Section --
  const signatureY = currentY + 10;
  
  // Signature Line
  doc.text('Signature:', 14, signatureY + 8);
  doc.line(35, signatureY + 8, 100, signatureY + 8);

  // Date Line
  doc.text('Date:', 120, signatureY + 8);
  doc.line(135, signatureY + 8, 194, signatureY + 8);

  // Footer Metadata
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('FOR OFFICE USE ONLY: SCAN THIS DOCUMENT TO AUTO-FILL PORTAL FIELDS', 105, 280, { align: 'center' });

  doc.save('Nexus_Enrollment_Form_India.pdf');
};

export const generateMasterReport = (employees: Employee[]) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd-MM-yyyy');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text('NexAdmin Master Employee Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated On: ${dateStr}`, 14, 30);
  doc.text(`Total Headcount: ${employees.length}`, 14, 36);

  // Calculate Stats
  const deptCounts: Record<string, number> = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });
  
  // Summary Section
  let yPos = 45;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Department Distribution:', 14, yPos);
  yPos += 7;
  doc.setFontSize(10);
  
  Object.entries(deptCounts).forEach(([dept, count]) => {
     doc.text(`- ${dept}: ${count}`, 20, yPos);
     yPos += 5;
  });

  // Table
  const tableColumn = ["ID", "Name", "Department", "Role", "Email", "Join Date", "Salary (Rs)"];
  const tableRows: any[] = [];

  employees.forEach(emp => {
    const empData = [
      emp.employeeId,
      emp.fullName,
      emp.department,
      emp.designation,
      emp.email,
      format(new Date(emp.joinDate), 'dd-MM-yyyy'),
      `Rs. ${emp.salary.toLocaleString('en-IN')}`
    ];
    tableRows.push(empData);
  });

  // @ts-ignore - jspdf-autotable types are sometimes tricky in strict mode
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 10,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] }, // brand-900
    styles: { fontSize: 8, cellPadding: 3 },
  });

  doc.save(`Master_Report_${format(new Date(), 'ddMMyyyy')}.pdf`);
};