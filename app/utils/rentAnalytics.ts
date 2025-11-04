import { SpreadsheetData } from '../types/spreadsheet.types';
import { RentAnalysis, RentParseResult } from '../types/rent.types';
import { MediaType } from '../types/media.types';
import { normalizeMediaName } from './mediaAnalytics';

/**
 * 希望家賃の変換マッピングテーブル
 * 変換表.txtから生成された入力値→価格帯上限値のマッピング
 */
const RENT_CONVERSION_MAP: Record<string, number> = {
  // 価格帯の正式な選択肢（2025年11月以降）
  '~60,000円': 60000,
  '~70,000円': 70000,
  '~80,000円': 80000,
  '~90,000円': 90000,
  '~100,000円': 100000,
  '~110,000円': 110000,
  '~120,000円': 120000,
  '~130,000円': 130000,
  '~140,000円': 140000,
  '~150,000円': 150000,
  '~160,000円': 160000,
  '~170,000円': 170000,
  '~180,000円': 180000,
  '~190,000円': 190000,
  '~200,000円': 200000,
  '201,000~250,000円': 250000,
  '251,000~300,000円': 300000,
  '301,000~350,000円': 350000,
  '351,000~400,000円': 400000,
  '401,000円~': 500000,

  // 既存の回答データ（変換表より、重複を排除した185エントリ）
  '〜100,000': 100000,
  '〜100000': 100000,
  '〜13万': 130000,
  '〜14万前後': 140000,
  '〜17': 170000,
  '〜20万円': 200000,
  '〜24万': 250000,
  '〜7万': 70000,
  '〜9万円': 90000,
  '~10.5万': 110000,
  '~80,000、85,000~の場合ネット込': 90000,
  '¥200000': 200000,
  '10': 100000,
  '10-25': 250000,
  '10〜14': 140000,
  '10〜20万': 200000,
  '10.5万までなら': 110000,
  '100000〜110000': 110000,
  '100万以内': 100000,
  '10万': 100000,
  '10万〜12万': 120000,
  '10万から13万くらい': 130000,
  '10万ぐらい': 100000,
  '10万以下': 100000,
  '10万以内': 100000,
  '10万位ない': 100000,
  '10万円': 100000,
  '10万円くらい': 100000,
  '10万円以下': 100000,
  '10万円以内': 100000,
  '10万円前後': 100000,
  '10万円前後、': 100000,
  '10万前後': 100000,
  '10万未満理想': 100000,
  '11.5:': 120000,
  '１１万': 110000,
  '11万以下': 110000,
  '11万円': 110000,
  '11万円〜12万円': 120000,
  '12-13万': 130000,
  '12.5万円 ~130,000': 130000,
  '120000': 120000,
  '12万': 120000,
  '12万以下': 120000,
  '12万円': 120000,
  '12万円まで': 120000,
  '13': 130000,
  '13〜14万': 140000,
  '130,000(駐車場込み)': 130000,
  '13000': 130000,
  '130000': 130000,
  '13以下': 130000,
  '13万': 130000,
  '13万以下': 130000,
  '13万以下（駐車場込みでこれくらいが理想': 130000,
  '13万円': 130000,
  '13万円以下': 130000,
  '14.5万': 150000,
  '14~18': 180000,
  '140000': 140000,
  '14万': 140000,
  '14万円': 140000,
  '15': 150000,
  '15〜20': 200000,
  '15〜22万円': 250000,
  '15〜48': 401000,
  '15.5万': 160000,
  '１５～１８万': 180000,
  '150,000': 150000,
  '150,000以下': 150000,
  '150000': 150000,
  '15万': 150000,
  '15万〜20万': 200000,
  '15万以下': 150000,
  '15万以内': 150000,
  '15万位内': 150000,
  '15万円': 150000,
  '15万円以下': 150000,
  '15万円程度': 150000,
  '15万円程度まで': 150000,
  '15万管理費込み': 150000,
  '15万前後': 150000,
  '15万程度': 150000,
  '16': 160000,
  '16〜22万円': 250000,
  '16万': 160000,
  '16万以内': 160000,
  '16万円前後': 160000,
  '17.5万': 180000,
  '170000': 170000,
  '17マン': 170000,
  '17万以下': 170000,
  '17万位内': 170000,
  '17万円以下': 170000,
  '18': 180000,
  '180,000円': 180000,
  '18万': 180000,
  '18万まで': 180000,
  '18万以下': 180000,
  '18万以内で、もっと安いと嬉しいです': 180000,
  '18万円まで': 180000,
  '20': 200000,
  '20万': 200000,
  '２０万': 200000,
  '20万以内': 200000,
  '20万位内': 200000,
  '20万円まで': 200000,
  '20万円以下が理想': 200000,
  '20万前後': 200000,
  '20万程度': 200000,
  '20萬': 200000,
  '210000円': 250000,
  '22万': 250000,
  '23万以下': 250000,
  '24': 250000,
  '25': 250000,
  '250000': 250000,
  '25万': 250000,
  '25万まで': 250000,
  '25万以下': 250000,
  '25万以内': 250000,
  '25万円前後': 250000,
  '25万前後': 250000,
  '26万円': 300000,
  '30': 300000,
  '30万ほどまで': 300000,
  '30万円': 300000,
  '30万円まで': 300000,
  '30万円以内': 300000,
  '35以内': 350000,
  '40': 400000,
  '400,000': 400000,
  '400000以下': 400000,
  '40万まで': 400000,
  '40万以内': 400000,
  '4０万前後': 400000,
  '45マン以内': 401000,
  '45以下': 401000,
  '500,000円': 401000,
  '50万以下': 401000,
  '55000': 60000,
  '5万': 60000,
  '60,000円以内': 60000,
  '65,000': 70000,
  '65000まで': 70000,
  '6万から10万前後': 100000,
  '6万以下': 60000,
  '7-10万くらい': 100000,
  '70,000円': 70000,
  '75000以内': 80000,
  '7万': 70000,
  '7万から13万': 130000,
  '7万以下を希望だけど、7.5万まで許容範囲です': 80000,
  '7万以下希望': 70000,
  '7万円': 70000,
  '8,5000円': 90000,
  '8.5': 90000,
  '85,000': 90000,
  '85000': 90000,
  '8万': 80000,
  '８万': 80000,
  '8万以内': 80000,
  '8万円': 80000,
  '8万円くらい': 80000,
  '8万円以内': 80000,
  '8万円前後': 80000,
  '9.5': 100000,
  '9.5万': 100000,
  '9.5万以下': 100000,
  '9.5万以内': 100000,
  '90,000': 90000,
  '90000': 90000,
  '95000': 100000,
  '9万': 90000,
  '9万円以内': 90000,
  '9万円台': 100000,
  '9万程度': 90000,
  'MAX15万まで': 150000,
  'できれば20万以下(管理費/駐車場代込み)': 200000,
  'ない': 0,
  '管理費込み11万ぐらいまで': 110000,
  '希望は10万 とにかく多頭飼い可能物件': 100000,
  '十万以下': 100000,
  '駐車場込みでMAX15万': 150000,
  '部屋次第': 0,
};

/**
 * 希望家賃カラムを検出
 *
 * @param headers - スプレッドシートのヘッダー配列
 * @returns 希望家賃カラム名（見つからなければ null）
 */
export function detectRentColumn(headers: string[]): string | null {
  const rentKeywords = ['希望家賃', '希望家賃上限'];
  return headers.find(header =>
    rentKeywords.some(keyword => header.includes(keyword))
  ) || null;
}

/**
 * 家賃文字列を数値にパース
 * 変換マッピングテーブルを使用して正確に変換
 *
 * @param value - 家賃の文字列表現
 * @returns パース結果
 *
 * @example
 * parseRentValue("15万") // { value: 150000, original: "15万", isValid: true }
 * parseRentValue("~150,000円") // { value: 150000, original: "~150,000円", isValid: true }
 * parseRentValue("251,000~300,000円") // { value: 300000, original: "251,000~300,000円", isValid: true }
 */
export function parseRentValue(value: string): RentParseResult {
  const original = value;
  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null, original, isValid: false };
  }

  // 変換マッピングテーブルで完全一致を確認
  if (trimmed in RENT_CONVERSION_MAP) {
    const converted = RENT_CONVERSION_MAP[trimmed];
    // 0は「ない」「部屋次第」などの無効値
    if (converted === 0) {
      return { value: null, original, isValid: false };
    }
    return { value: converted, original, isValid: true };
  }

  // マッピングテーブルにない場合（2025年11月以降の正式な選択肢の可能性）
  // 価格帯のパターンマッチング

  // パターン1: ~XX,XXX円 形式
  const pattern1 = trimmed.match(/^~(\d{1,3}(?:,\d{3})*)円$/);
  if (pattern1) {
    const value = parseInt(pattern1[1].replace(/,/g, ''), 10);
    if (!isNaN(value) && value > 0) {
      return { value, original, isValid: true };
    }
  }

  // パターン2: XXX,XXX~YYY,YYY円 形式（上限値を使用）
  const pattern2 = trimmed.match(/^(\d{1,3}(?:,\d{3})*)~(\d{1,3}(?:,\d{3})*)円$/);
  if (pattern2) {
    const upperValue = parseInt(pattern2[2].replace(/,/g, ''), 10);
    if (!isNaN(upperValue) && upperValue > 0) {
      return { value: upperValue, original, isValid: true };
    }
  }

  // パターン3: XXX,XXX円~ 形式（401,000円~のような最高額）
  const pattern3 = trimmed.match(/^(\d{1,3}(?:,\d{3})*)円~$/);
  if (pattern3) {
    // 最高額の場合は500,000として扱う
    return { value: 500000, original, isValid: true };
  }

  // それ以外は無効
  return { value: null, original, isValid: false };
}

/**
 * 希望家賃の分析を実行
 *
 * @param csvData - スプレッドシートデータ
 * @param mediaType - 媒体タイプ（フィルタ用）
 * @param yearMonth - 対象年月（'all-time' で全期間）
 * @param dateColumn - 日付カラム名
 * @param mediaColumn - 媒体カラム名
 * @returns 希望家賃分析結果
 */
export function analyzeRent(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string | 'all-time',
  dateColumn: string,
  mediaColumn: string = '何を見て知った？',
  petColumn: string = 'ペットは何匹？'
): RentAnalysis | null {
  // 希望家賃カラムを検出
  const rentColumn = detectRentColumn(csvData.headers);
  if (!rentColumn) {
    return null;
  }

  // 対象データをフィルタリング
  const filteredRows = csvData.rows.filter(row => {
    // 媒体でフィルタ
    const mediaValue = String(row[mediaColumn] || '');
    const normalizedMedia = normalizeMediaName(mediaValue);
    if (normalizedMedia !== mediaType) return false;

    // 期間でフィルタ
    if (yearMonth !== 'all-time') {
      const dateValue = String(row[dateColumn] || '');
      const datePart = dateValue.split(' ')[0]; // "2024-11-02"
      if (!datePart.startsWith(yearMonth)) return false;
    }

    return true;
  });

  // 家賃値をパースし、詳細情報を収集
  const parseResults = filteredRows.map(row => {
    const rentValue = String(row[rentColumn] || '');
    const dateValue = String(row[dateColumn] || '');
    const petValue = String(row[petColumn] || '');

    return {
      parseResult: parseRentValue(rentValue),
      date: dateValue.split(' ')[0], // "2024-11-02 12:34:56" → "2024-11-02"
      petType: petValue,
    };
  });

  // デバッグ: パース結果を確認
  if (typeof window !== 'undefined' && parseResults.length > 0) {
    console.log(`\n[希望家賃分析] ${mediaType} - ${yearMonth}`);
    console.log(`総回答数: ${parseResults.length}件`);
    console.log(`有効: ${parseResults.filter(r => r.parseResult.isValid).length}件, 無効: ${parseResults.filter(r => !r.parseResult.isValid).length}件`);
    console.log('\n詳細:');
    console.table(parseResults.map(r => ({
      '元の値': r.parseResult.original,
      '変換後': r.parseResult.value,
      '有効': r.parseResult.isValid ? '✓' : '✗'
    })));
  }

  // 有効な値のみを抽出
  const validResults = parseResults.filter(r => r.parseResult.isValid && r.parseResult.value !== null);
  const rentValues = validResults.map(r => r.parseResult.value as number);
  const responses = validResults.map(r => ({
    date: r.date,
    rentValue: r.parseResult.value as number,
    originalValue: r.parseResult.original,
    petType: r.petType,
  }));

  const validCount = rentValues.length;
  const invalidCount = parseResults.length - validCount;

  if (validCount === 0) {
    return {
      rentValues: [],
      responses: [],
      averageRent: 0,
      medianRent: 0,
      minRent: 0,
      maxRent: 0,
      validCount: 0,
      invalidCount,
    };
  }

  // 統計値を計算
  const averageRent = rentValues.reduce((sum, v) => sum + v, 0) / validCount;
  const sortedValues = [...rentValues].sort((a, b) => a - b);
  const medianRent = sortedValues[Math.floor(validCount / 2)];
  const minRent = Math.min(...rentValues);
  const maxRent = Math.max(...rentValues);

  return {
    rentValues,
    responses,
    averageRent,
    medianRent,
    minRent,
    maxRent,
    validCount,
    invalidCount,
  };
}
