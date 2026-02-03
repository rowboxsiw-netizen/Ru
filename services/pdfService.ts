import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Product } from '../types';

export const generateOfflineForm = () => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text('Stock Intake Form', 105, 20, { align: 'center' });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text('NexStock Inventory Control', 105, 28, { align: 'center' });

  const drawField = (label: string, y: number, width: number = 180) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, y);
    doc.rect(14, y + 2, width, 10);
  };

  let currentY = 45;
  const gap = 20;

  drawField('Product Name / Description:', currentY);
  currentY += gap;
  drawField('SKU / Barcode:', currentY);
  currentY += gap;
  drawField('Category:', currentY);
  currentY += gap;
  drawField('Supplier / Manufacturer:', currentY);
  currentY += gap;
  drawField('Unit Price (Rs.):', currentY);
  currentY += gap;
  drawField('Quantity Received:', currentY);
  
  doc.setFontSize(8);
  doc.text('SCAN THIS FORM TO UPDATE INVENTORY', 105, 280, { align: 'center' });

  doc.save('Stock_Intake_Form.pdf');
};

export const generateMasterReport = (products: Product[]) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd-MM-yyyy');

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text('NexStock Inventory Report', 14, 22);
  
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated On: ${dateStr}`, 14, 30);
  doc.text(`Total SKU Count: ${products.length}`, 14, 36);
  doc.text(`Total Inventory Value: Rs. ${totalValue.toLocaleString('en-IN')}`, 14, 42);

  const tableColumn = ["SKU", "Product", "Category", "Supplier", "Qty", "Price", "Value"];
  const tableRows: any[] = [];

  products.forEach(p => {
    const row = [
      p.sku,
      p.name,
      p.category,
      p.supplier,
      p.quantity,
      `Rs. ${p.price}`,
      `Rs. ${(p.price * p.quantity).toLocaleString('en-IN')}`
    ];
    tableRows.push(row);
  });

  // @ts-ignore
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 138] },
    styles: { fontSize: 8 },
  });

  doc.save(`Stock_Report_${format(new Date(), 'ddMMyyyy')}.pdf`);
};