import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Employee } from '../types';

export const generateOfflineForm = () => {
  const doc = new jsPDF();

  // Branding
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('NexAdmin Enrollment Form', 14, 13);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Please fill out the form below in clear block letters.', 14, 30);
  doc.text('This form is optimized for AI Automated Scanning.', 14, 35);

  // --- Anchor Boxes for OCR Optimization ---
  // We draw specific rectangles where users should write. 
  // This helps visual guidance.

  // 1. Full Name
  doc.setFontSize(11);
  doc.text('Full Name:', 14, 50);
  doc.setLineWidth(0.5);
  doc.setDrawColor(150);
  doc.rect(14, 55, 120, 12); // x, y, w, h
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('(First Name, Last Name)', 16, 62);

  // 2. Designation / Role
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text('Designation / Role:', 14, 80);
  doc.setDrawColor(150);
  doc.rect(14, 85, 120, 12);

  // 3. Department
  doc.text('Department:', 14, 110);
  doc.rect(14, 115, 80, 12);
  
  // 4. Employee ID (Optional manual override)
  doc.text('Employee ID (if assigned):', 110, 110);
  doc.rect(110, 115, 50, 12);

  // Footer Instructions
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('OFFICIAL USE ONLY - DO NOT FOLD', 14, 280);
  const generatedStr = `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
  doc.text(generatedStr, 150, 280);

  doc.save('NexAdmin_Enrollment_Template.pdf');
};

export const generateMasterReport = (employees: Employee[]) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'MMM dd, yyyy');

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
  const tableColumn = ["ID", "Name", "Department", "Role", "Email", "Join Date", "Salary"];
  const tableRows: any[] = [];

  employees.forEach(emp => {
    const empData = [
      emp.employeeId,
      emp.fullName,
      emp.department,
      emp.designation,
      emp.email,
      format(new Date(emp.joinDate), 'yyyy-MM-dd'),
      `$${emp.salary.toLocaleString()}`
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

  doc.save(`Master_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};