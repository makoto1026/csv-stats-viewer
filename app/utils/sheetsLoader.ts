import { CSVData } from '../types/csv.types';
import { normalizeRentInData } from './rentNormalizer';

// スプレッドシートID（固定）
const SPREADSHEET_ID = '1Q-5OdrksGEg7rmxj-uxK_kcbREivBx8udFIf41R3rmA';

/**
 * GoogleスプレッドシートからCSV形式でデータを取得
 */
export async function loadFromGoogleSheets(): Promise<CSVData> {
  try {
    // Google SheetsをCSV形式でエクスポート
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`スプレッドシートの読み込みに失敗しました: ${response.status}`);
    }

    const text = await response.text();

    // CSVをパース
    const lines = text.trim().split('\n');

    if (lines.length < 2) {
      throw new Error('スプレッドシートにデータが見つかりません');
    }

    // ヘッダー行の解析
    let headers = parseCSVLine(lines[0]);

    if (headers.length === 0) {
      throw new Error('ヘッダーが見つかりません');
    }

    // 「希望家賃（管理費込）」を「希望家賃上限（管理費込）」に変更
    headers = headers.map(header => {
      if (header === '希望家賃(管理費込)') {
        return '希望家賃上限（管理費込）';
      }
      return header;
    });

    // データ行の解析
    const rows: Record<string, string | number>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      const values = parseCSVLine(line);

      // カラム数が不一致の場合はスキップ（警告のみ）
      if (values.length < headers.length) {
        console.warn(`${i + 1}行目: カラム数が不足しています（スキップしました）`);
        continue;
      }

      const row: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        row[header] = value;
      });
      rows.push(row);
    }

    // 希望家賃カラムを正規化
    const normalizedRows = normalizeRentInData(rows, headers);

    const csvData: CSVData = {
      headers,
      rows: normalizedRows,
      fileName: '賃貸フォーム回答統計',
      uploadedAt: new Date(),
    };

    return csvData;
  } catch (error) {
    console.error('スプレッドシート読み込みエラー:', error);
    throw new Error(
      `スプレッドシートの読み込みに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    );
  }
}

/**
 * CSV行をパースして配列に変換
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたダブルクォート
        current += '"';
        i++; // 次の文字をスキップ
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 最後のフィールドを追加
  result.push(current.trim());

  return result;
}
