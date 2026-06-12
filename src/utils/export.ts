/**
 * Reusable helper for handling report exports.
 * Currently uses native window.print().
 * Future versions will integrate jsPDF or react-to-print here.
 */
export const handleExportReport = (reportType: string) => {
  // We can eventually use the reportType to set custom file names,
  // trigger specific tracking, or initialize jsPDF with appropriate options.
  console.log(`Initiating export for: ${reportType}`);
  window.print();
};
