export interface SpreadsheetData {
  headers: string[];
  rows: Record<string, string | number>[];
  fileName: string;
  uploadedAt: Date;
}
