export interface CSVData {
  headers: string[];
  rows: Record<string, string | number>[];
  fileName: string;
  uploadedAt: Date;
}

export interface CSVParseResult {
  success: boolean;
  data?: CSVData;
  error?: string;
}
