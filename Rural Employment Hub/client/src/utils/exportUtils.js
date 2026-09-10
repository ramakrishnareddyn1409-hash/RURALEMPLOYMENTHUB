/**
 * Utility functions for exporting tables to CSV, Excel, and PDF formats
 */

// 1. Export JSON / Table Data to CSV
export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  const csvRows = [];

  // Header row
  if (headers && headers.length) {
    csvRows.push(headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(","));
  }

  // Data rows
  data.forEach((row) => {
    const values = headers.map((h) => {
      const val = h.key.split(".").reduce((obj, key) => (obj ? obj[key] : ""), row);
      const strVal = val === undefined || val === null ? "" : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  const csvString = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvRows.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvString);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 2. Export Data to Excel (.xls/.xlsx compatible format)
export const exportToExcel = (filename, sheetName, data, headers) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
      <x:Name>${sheetName || "Report"}</x:Name>
      <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; }
        th { background-color: #059669; color: #ffffff; font-weight: bold; padding: 8px 12px; border: 1px solid #d1d5db; }
        td { padding: 6px 12px; border: 1px solid #e5e7eb; }
        tr:nth-child(even) { background-color: #f9fafb; }
      </style>
    </head>
    <body>
      <h2>Smart Rural Employment Hub - ${sheetName || "Government Report"}</h2>
      <p>Generated on: ${new Date().toLocaleString("en-IN")}</p>
      <table>
        <thead>
          <tr>
            ${headers.map((h) => `<th>${h.label}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${headers
                .map((h) => {
                  const val = h.key.split(".").reduce((obj, key) => (obj ? obj[key] : ""), row);
                  return `<td>${val === undefined || val === null ? "-" : val}</td>`;
                })
                .join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 3. Export Data to Clean Government Printable PDF
export const exportToPDF = (filename, title, subtitle, headers, data) => {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export printable PDF");
    return;
  }

  const tableRows = data
    .map(
      (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
        <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">${idx + 1}</td>
        ${headers
          .map((h) => {
            const val = h.key.split(".").reduce((obj, key) => (obj ? obj[key] : ""), row);
            return `<td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 11px;">${
              val === undefined || val === null ? "-" : val
            }</td>`;
          })
          .join("")}
      </tr>
    `
    )
    .join("");

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Smart Rural Employment Hub</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
          .gov-seal { font-size: 20px; font-weight: 800; color: #059669; letter-spacing: 0.5px; }
          .badge { display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #059669; color: white; padding: 9px 10px; border: 1px solid #047857; text-align: left; font-size: 11px; font-weight: 700; }
          .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="gov-seal">SMART RURAL EMPLOYMENT HUB</div>
            <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">${title}</div>
            <div style="font-size: 11px; color: #64748b;">${subtitle || "Official Government Employment & Direct Benefit Transfer Record"}</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">OFFICIAL RECORD</span>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              ${headers.map((h) => `<th>${h.label}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div>Report generated automatically by Smart Rural Employment Hub MERN System</div>
          <div>Page 1 of 1 • Digitally Authenticated</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
};
