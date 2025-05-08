
/**
 * Parses a CSV file in /Data into an array of products.
 * fileName must be an exact relative path like "Data/response_by-category_...csv".
 * This function expects CSVs with headers:
 * Brand,ItemName,SKU,UPC,MSRP,Price,ImageLink
 */
export function parseCsv(fileName: string) {
  // Use Vite's import.meta.glob to require all /Data/*.csv files at build time.
  // as 'raw' ensures we get the text content.
  const files = import.meta.glob('/Data/*.csv', { as: 'raw', eager: true }) as Record<string, string>;
  const relPath = fileName.startsWith('/') ? fileName : `/${fileName}`;
  const csv = files[relPath] ?? "";

  const rows: any[] = [];
  if (!csv) return rows;

  // Normalize line endings and split into lines
  const lines = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(line => line.trim() !== "");
  if (lines.length < 2) return [];

  // The first line is the header
  const rawHeader = lines[0].replace(/^\uFEFF/, ''); // remove BOM if present
  const header = rawHeader.split(',').map((h) => h.trim());
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    // If fewer columns than header, skip. If more, join last as ImageLink (may contain commas)
    if (parts.length < header.length) continue;
    let rowObj: Record<string, string> = {};
    for (let j = 0; j < header.length - 1; j++) {
      rowObj[header[j]] = parts[j] ?? "";
    }
    // Last column (ImageLink) may contain commas if it's quoted
    rowObj[header[header.length - 1]] = parts.slice(header.length - 1).join(",").replace(/^"(.+(?="$))"$/, '$1');
    // Add a generated id for React keys
    rowObj['id'] = `${fileName}-${i}`;
    rows.push(rowObj);
  }

  return rows;
}
