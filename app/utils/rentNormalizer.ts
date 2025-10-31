/**
 * 希望家賃の範囲定義
 */
const RENT_RANGES = [
  { min: 0, max: 50000, label: '~50,000円' },
  { min: 51000, max: 75000, label: '51,000~75,000円' },
  { min: 76000, max: 100000, label: '76,000~100,000円' },
  { min: 101000, max: 125000, label: '101,000~125,000円' },
  { min: 126000, max: 150000, label: '126,000~150,000円' },
  { min: 151000, max: 170000, label: '151,000~170,000円' },
  { min: 171000, max: 200000, label: '171,000~200,000円' },
  { min: 201000, max: 225000, label: '201,000~225,000円' },
  { min: 226000, max: 250000, label: '226,000~250,000円' },
  { min: 251000, max: 275000, label: '251,000~275,000円' },
  { min: 276000, max: 300000, label: '276,000~300,000円' },
  { min: 301000, max: 325000, label: '301,000~325,000円' },
  { min: 326000, max: 350000, label: '326,000~350,000円' },
  { min: 351000, max: 375000, label: '351,000~375,000円' },
  { min: 376000, max: 400000, label: '376,000~400,000円' },
  { min: 401000, max: 425000, label: '401,000~425,000円' },
  { min: 426000, max: 450000, label: '426,000~450,000円' },
  { min: 451000, max: 475000, label: '451,000~475,000円' },
  { min: 476000, max: 500000, label: '476,000~500,000円' },
  { min: 510000, max: Infinity, label: '510,000円~' },
];

/**
 * 全角数字を半角数字に変換
 */
function toHalfWidth(str: string): string {
  return str.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
}

/**
 * 文字列から数値を抽出
 */
function extractNumber(value: string): number | null {
  // 全角数字を半角に変換
  let cleaned = toHalfWidth(value);

  // カンマ・全角カンマを除去
  cleaned = cleaned.replace(/[,、]/g, '');

  // 「万」を含む場合は10000倍
  if (cleaned.includes('万')) {
    const match = cleaned.match(/([\d.]+)万/);
    if (match) {
      return parseFloat(match[1]) * 10000;
    }
  }

  // 「以下」「以上」「〜」などを除去して数値を抽出
  cleaned = cleaned.replace(/[以下以上〜~]/g, '');

  // 数値を抽出
  const match = cleaned.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }

  return null;
}

/**
 * 数値を適切な範囲ラベルに変換
 */
function getRangeLabel(amount: number): string {
  for (const range of RENT_RANGES) {
    if (amount >= range.min && amount <= range.max) {
      return range.label;
    }
  }

  // どの範囲にも該当しない場合
  if (amount < RENT_RANGES[0].min) {
    return RENT_RANGES[0].label;
  }
  return RENT_RANGES[RENT_RANGES.length - 1].label;
}

/**
 * 希望家賃の値を正規化
 *
 * 入力例:
 * - "15万" → "126,000~150,000円"
 * - "８万" → "76,000~100,000円"
 * - "２０万" → "171,000~200,000円"
 * - "150000" → "126,000~150,000円"
 * - "150,000" → "126,000~150,000円"
 * - "150,000以下" → "126,000~150,000円"
 * - "15万以下" → "126,000~150,000円"
 * - "未定" → "その他"
 * - "相談" → "その他"
 */
export function normalizeRent(value: string | number): string {
  if (typeof value === 'number') {
    return getRangeLabel(value);
  }

  if (!value || typeof value !== 'string') {
    return 'その他';
  }

  // 空文字列または空白のみの場合
  if (value.trim() === '') {
    return 'その他';
  }

  // 数値を抽出
  const amount = extractNumber(value);

  if (amount === null) {
    // 数値が抽出できない場合は「その他」
    return 'その他';
  }

  // 範囲ラベルに変換
  return getRangeLabel(amount);
}

/**
 * ヘッダーに「希望家賃」が含まれているかチェック
 */
export function isRentColumn(header: string): boolean {
  return header.includes('希望家賃');
}

/**
 * CSVデータの希望家賃カラムを正規化
 */
export function normalizeRentInData(
  rows: Record<string, string | number>[],
  headers: string[]
): Record<string, string | number>[] {
  // 希望家賃カラムを特定
  const rentColumns = headers.filter(isRentColumn);

  if (rentColumns.length === 0) {
    return rows; // 希望家賃カラムがない場合はそのまま返す
  }

  // 各行の希望家賃を正規化
  return rows.map(row => {
    const newRow = { ...row };
    for (const column of rentColumns) {
      const value = row[column];
      if (value !== undefined && value !== null && value !== '') {
        newRow[column] = normalizeRent(value);
      }
    }
    return newRow;
  });
}
