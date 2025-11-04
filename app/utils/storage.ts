import { SpreadsheetData } from '../types/spreadsheet.types';

const STORAGE_KEY = 'csv-stats-viewer-data';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  csvData: SpreadsheetData;
  savedAt: string;
}

/**
 * CSVデータをlocalStorageに保存
 */
export function saveToStorage(csvData: SpreadsheetData): boolean {
  try {
    const storageData: StorageData = {
      version: STORAGE_VERSION,
      csvData,
      savedAt: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(storageData);

    // localStorageの容量制限チェック（約5MB）
    if (jsonString.length > 5 * 1024 * 1024) {
      console.warn('データサイズが大きすぎます。保存できない可能性があります。');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, jsonString);
    return true;
  } catch (error) {
    console.error('データの保存に失敗しました:', error);
    return false;
  }
}

/**
 * localStorageからCSVデータを読み込み
 */
export function loadFromStorage(): SpreadsheetData | null {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY);

    if (!jsonString) {
      return null;
    }

    const storageData: StorageData = JSON.parse(jsonString);

    // バージョンチェック
    if (storageData.version !== STORAGE_VERSION) {
      console.warn('保存データのバージョンが異なります。削除します。');
      clearStorage();
      return null;
    }

    // Date型の復元
    storageData.csvData.uploadedAt = new Date(storageData.csvData.uploadedAt);

    return storageData.csvData;
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    return null;
  }
}

/**
 * localStorageからデータを削除
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('データの削除に失敗しました:', error);
  }
}

/**
 * 保存されたデータの情報を取得
 */
export function getStorageInfo(): { exists: boolean; size: number; savedAt: string | null } {
  try {
    const jsonString = localStorage.getItem(STORAGE_KEY);

    if (!jsonString) {
      return { exists: false, size: 0, savedAt: null };
    }

    const storageData: StorageData = JSON.parse(jsonString);

    return {
      exists: true,
      size: new Blob([jsonString]).size,
      savedAt: storageData.savedAt,
    };
  } catch (error) {
    console.error('データ情報の取得に失敗しました:', error);
    return { exists: false, size: 0, savedAt: null };
  }
}
