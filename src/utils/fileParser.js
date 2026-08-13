import * as XLSX from 'xlsx';

/**
 * File Parser & Chart Extractor Utility for TigerX AI
 */

export async function parseUploadedFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();

  return new Promise((resolve, reject) => {
    if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonContent = XLSX.utils.sheet_to_json(worksheet);

          resolve({
            name: file.name,
            type: 'excel',
            rowsCount: jsonContent.length,
            data: jsonContent,
            contentPreview: `[Excel File: ${file.name} - ${jsonContent.length} rows loaded]\nSample:\n${JSON.stringify(jsonContent.slice(0, 30), null, 2)}`
          });
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err.message}`));
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === 'csv') {
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
            contentPreview: `[CSV File: ${file.name} - ${jsonContent.length} rows]\nSample:\n${JSON.stringify(jsonContent.slice(0, 30), null, 2)}`
          });
        } catch (err) {
          reject(new Error(`Failed to parse CSV file: ${err.message}`));
        }
      };
      reader.readAsText(file);
    } else if (['txt', 'json', 'sql', 'log', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'md'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        resolve({
          name: file.name,
          type: 'text',
          contentPreview: `[Document: ${file.name}]\n${text.slice(0, 8000)}`
        });
      };
      reader.readAsText(file);
    } else if (['pdf', 'docx', 'doc'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const cleanText = typeof text === 'string' ? text.replace(/[^\x20-\x7E\n\r\t]/g, ' ') : `[Document Stream: ${file.name}]`;
        resolve({
          name: file.name,
          type: 'doc',
          contentPreview: `[Document File: ${file.name}]\nContent:\n${cleanText.slice(0, 8000)}`
        });
      };
      reader.readAsText(file);
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          type: 'image',
          dataUrl: e.target.result,
          contentPreview: `[Uploaded Image/Invoice: ${file.name}]`
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
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
 * Extracts and normalizes chart JSON data from AI response text
 */
export function extractChartDataFromResponse(responseText) {
  if (!responseText) return null;

  // Match any json chart block or json block with chart data
  const jsonRegex = /```json\s*(?:chart)?\s*\n([\s\S]*?)\n```/gi;
  let match;

  while ((match = jsonRegex.exec(responseText)) !== null) {
    if (match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed && parsed.data && Array.isArray(parsed.data)) {
          // Normalize data keys (date/category/x -> label, price/value/y/count -> value)
          const normalizedData = parsed.data.map(item => {
            const label = item.label || item.date || item.category || item.name || item.x || Object.values(item)[0] || 'Item';
            const value = item.value !== undefined ? item.value : (item.price !== undefined ? item.price : (item.count !== undefined ? item.count : (item.y !== undefined ? item.y : Object.values(item)[1] || 0)));
            return { label: String(label), value: Number(value) || 0 };
          });

          return {
            title: parsed.title || 'Data Visualizer',
            type: (parsed.type === 'line' || parsed.type === 'bar') ? 'bar' : (parsed.type === 'pie' ? 'pie' : 'table'),
            data: normalizedData
          };
        }
      } catch (e) {
        // Ignore non-chart JSON blocks
      }
    }
  }

  return null;
}
