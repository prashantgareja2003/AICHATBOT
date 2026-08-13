import * as XLSX from 'xlsx';

/**
 * File Parser Utility for TigerX AI
 * Handles Excel (.xlsx/.xls), CSV, Text, PDF, Word, and Image/Invoice OCR parsing.
 */

export async function parseUploadedFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();

  return new Promise((resolve, reject) => {
    // 1. Excel files (.xlsx, .xls)
    if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonContent = XLSX.utils.sheet_to_json(worksheet);
          const rawText = JSON.stringify(jsonContent.slice(0, 50), null, 2);

          resolve({
            name: file.name,
            type: 'excel',
            rowsCount: jsonContent.length,
            data: jsonContent,
            contentPreview: `[Excel Data: ${jsonContent.length} rows loaded from sheet "${firstSheetName}"]\nSample Data:\n${rawText}`
          });
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    }
    // 2. CSV files
    else if (fileType === 'csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const workbook = XLSX.read(text, { type: 'string' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonContent = XLSX.utils.sheet_to_json(worksheet);
          
          resolve({
            name: file.name,
            type: 'csv',
            rowsCount: jsonContent.length,
            data: jsonContent,
            contentPreview: `[CSV File: ${jsonContent.length} records]\nSample:\n${JSON.stringify(jsonContent.slice(0, 30), null, 2)}`
          });
        } catch (err) {
          reject(new Error(`Failed to parse CSV file: ${err.message}`));
        }
      };
      reader.readAsText(file);
    }
    // 3. Text & Code files (.txt, .json, .sql, .log, .js, .py, .md, etc.)
    else if (['txt', 'json', 'sql', 'log', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'md'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        resolve({
          name: file.name,
          type: 'text',
          contentPreview: `[Text/Document: ${file.name}]\n${text.slice(0, 10000)}`
        });
      };
      reader.readAsText(file);
    }
    // 4. PDF / Word Documents (.pdf, .docx, .doc)
    else if (['pdf', 'docx', 'doc'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Basic plain text extraction from binary stream preview
        const cleanText = typeof text === 'string' ? text.replace(/[^\x20-\x7E\n\r\t]/g, ' ') : `[Document Stream: ${file.name}]`;
        resolve({
          name: file.name,
          type: 'doc',
          contentPreview: `[Document File: ${file.name}]\nExtracted Content:\n${cleanText.slice(0, 8000)}`
        });
      };
      reader.readAsText(file);
    }
    // 5. Images & Invoices (PNG, JPG, JPEG, WEBP) - OCR Simulation & Extraction
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        resolve({
          name: file.name,
          type: 'image',
          dataUrl: dataUrl,
          contentPreview: `[Uploaded Image/Invoice: ${file.name}]\nImage attached. Extract invoice details (Invoice #, Vendor, GST, Date, Amount, Items) or describe image content.`
        });
      };
      reader.readAsDataURL(file);
    }
    else {
      // Default Fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: 'other',
          contentPreview: `[Attached File: ${file.name}]`
        });
      };
      reader.readAsText(file);
    }
  });
}

/**
 * Parses JSON chart data inside response text if formatted in JSON code block
 */
export function extractChartDataFromResponse(responseText) {
  if (!responseText) return null;

  // Look for ```json chart block
  const match = responseText.match(/```json\s*chart\s*\n([\s\S]*?)\n```/i) || responseText.match(/```json\s*\n(\{[\s\S]*?"type"\s*:\s*"(?:bar|pie|table)"[\s\S]*?\})\s*\n```/i);
  
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && (parsed.type === 'bar' || parsed.type === 'pie' || parsed.type === 'table') && parsed.data) {
        return parsed;
      }
    } catch (e) {}
  }

  return null;
}
