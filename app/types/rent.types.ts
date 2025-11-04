/**
 * 個別の家賃回答の詳細情報
 */
export interface RentResponseDetail {
  /** 日付 */
  date: string;
  /** 家賃上限額 */
  rentValue: number;
  /** 元の入力値 */
  originalValue: string;
  /** 犬猫種別 */
  petType: string;
}

/**
 * 希望家賃の分析結果
 */
export interface RentAnalysis {
  /** 有効な回答の一覧 */
  rentValues: number[];
  /** 回答の詳細情報リスト */
  responses: RentResponseDetail[];
  /** 平均家賃上限額 */
  averageRent: number;
  /** 中央値 */
  medianRent: number;
  /** 最小値 */
  minRent: number;
  /** 最大値 */
  maxRent: number;
  /** 有効回答数 */
  validCount: number;
  /** 無効回答数（数値化できなかったもの） */
  invalidCount: number;
}

/**
 * 家賃のパース結果
 */
export interface RentParseResult {
  /** パース成功時の値（範囲の場合は上限） */
  value: number | null;
  /** パース前の元の値 */
  original: string;
  /** パースに成功したかどうか */
  isValid: boolean;
}
