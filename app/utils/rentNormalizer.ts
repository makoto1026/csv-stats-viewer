/**
 * 希望家賃の範囲定義（新フォームに合わせた表記）
 */
const RENT_RANGES = [
  { min: 0, max: 50000, label: '~50,000円' },
  { min: 50001, max: 60000, label: '~60,000円' },
  { min: 60001, max: 70000, label: '~70,000円' },
  { min: 70001, max: 80000, label: '~80,000円' },
  { min: 80001, max: 90000, label: '~90,000円' },
  { min: 90001, max: 100000, label: '~100,000円' },
  { min: 100001, max: 110000, label: '~110,000円' },
  { min: 110001, max: 120000, label: '~120,000円' },
  { min: 120001, max: 130000, label: '~130,000円' },
  { min: 130001, max: 140000, label: '~140,000円' },
  { min: 140001, max: 150000, label: '~150,000円' },
  { min: 150001, max: 160000, label: '~160,000円' },
  { min: 160001, max: 170000, label: '~170,000円' },
  { min: 170001, max: 180000, label: '~180,000円' },
  { min: 180001, max: 190000, label: '~190,000円' },
  { min: 190001, max: 200000, label: '~200,000円' },
  { min: 200001, max: 250000, label: '201,000~250,000円' },
  { min: 250001, max: 300000, label: '251,000~300,000円' },
  { min: 300001, max: 350000, label: '301,000~350,000円' },
  { min: 350001, max: 400000, label: '351,000~400,000円' },
  { min: 400001, max: 450000, label: '401,000~450,000円' },
  { min: 450001, max: 500000, label: '451,000~500,000円' },
  { min: 500001, max: Infinity, label: '501,000円~' },
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
 * 文字列から数値を抽出（範囲がある場合は上限を優先）
 */
function extractNumber(value: string): number | null {
  // 全角数字を半角に変換
  let cleaned = toHalfWidth(value);

  // カンマ・全角カンマを除去
  cleaned = cleaned.replace(/[,、]/g, '');

  // 範囲表現（例: "10万〜15万", "10万-15万"）の場合、上限（後ろの数値）を取得
  const rangeMatch = cleaned.match(/([\d.]+)万?[〜~\-ー]([\d.]+)万/);
  if (rangeMatch) {
    // 範囲の上限（後ろの数値）を使用
    return parseFloat(rangeMatch[2]) * 10000;
  }

  // 「万」を含む場合は10000倍
  if (cleaned.includes('万')) {
    // 複数の「万」が含まれる場合、最後の数値を使用（上限として扱う）
    const matches = cleaned.match(/([\d.]+)万/g);
    if (matches && matches.length > 0) {
      const lastMatch = matches[matches.length - 1].match(/([\d.]+)万/);
      if (lastMatch) {
        return parseFloat(lastMatch[1]) * 10000;
      }
    }
  }

  // 「以下」「以上」「〜」などを除去して数値を抽出
  cleaned = cleaned.replace(/[以下以上〜~ー\-]/g, ' ');

  // 複数の数値がある場合、最後の数値を使用（上限として扱う）
  const allMatches = cleaned.match(/\d+/g);
  if (allMatches && allMatches.length > 0) {
    return parseInt(allMatches[allMatches.length - 1], 10);
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
 * 希望家賃の値を正規化（範囲指定の場合は上限を使用）
 *
 * 入力例:
 * - "８万" → "~80,000円"
 * - "15万" → "~150,000円"
 * - "２０万" → "~200,000円"
 * - "150000" → "~150,000円"
 * - "150,000" → "~150,000円"
 * - "150,000以下" → "~150,000円"
 * - "15万以下" → "~150,000円"
 * - "10万〜15万" → "~150,000円" （上限の15万を使用）
 * - "10万-15万" → "~150,000円" （上限の15万を使用）
 * - "100,000〜150,000" → "~150,000円" （上限の150,000を使用）
 * - "30万" → "251,000~300,000円"
 * - "50万" → "451,000~500,000円"
 * - "60万" → "501,000円~"
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
  return header.includes('希望家賃') || header.includes('希望家賃上限');
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
