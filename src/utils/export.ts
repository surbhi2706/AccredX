/**
 * Reusable helper for handling report exports.
 * Currently uses native window.print().
 * Future versions will integrate jsPDF or react-to-print here.
 */
export const handleExportReport = (reportType: string, filename?: string) => {
  console.log(`Initiating export for: ${reportType}`);
  const originalTitle = document.title;
  if (filename) {
    document.title = filename;
  }
  
  window.print();

  // Restore the original title on the next tick so the print dialog captures the custom title first.
  setTimeout(() => {
    document.title = originalTitle;
  }, 500);
};
