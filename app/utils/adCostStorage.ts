import { AdCost } from '../types/advertisement.types';

const AD_COST_STORAGE_KEY = 'csv-stats-viewer-ad-costs';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  adCosts: AdCost[];
  savedAt: string;
}

/**
 * 広告費用をlocalStorageに保存
 */
export function saveAdCosts(adCosts: AdCost[]): boolean {
  try {
    const storageData: StorageData = {
      version: STORAGE_VERSION,
      adCosts: adCosts.map(cost => ({
        ...cost,
        startDate: cost.startDate.toISOString(),
        endDate: cost.endDate.toISOString(),
      })) as unknown as AdCost[],
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(AD_COST_STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('広告費用の保存に失敗しました:', error);
    return false;
  }
}

/**
 * localStorageから広告費用を読み込み
 */
export function loadAdCosts(): AdCost[] {
  try {
    const data = localStorage.getItem(AD_COST_STORAGE_KEY);
    if (!data) return [];

    const storageData: StorageData = JSON.parse(data);

    // バージョンチェック
    if (storageData.version !== STORAGE_VERSION) {
      console.warn('ストレージのバージョンが異なります');
      return [];
    }

    // 日付文字列をDateオブジェクトに変換
    return storageData.adCosts.map(cost => ({
      ...cost,
      startDate: new Date(cost.startDate as unknown as string),
      endDate: new Date(cost.endDate as unknown as string),
    }));
  } catch (error) {
    console.error('広告費用の読み込みに失敗しました:', error);
    return [];
  }
}

/**
 * 広告費用を追加
 */
export function addAdCost(newCost: AdCost): boolean {
  const adCosts = loadAdCosts();
  adCosts.push(newCost);
  return saveAdCosts(adCosts);
}

/**
 * 広告費用を削除
 */
export function removeAdCost(id: string): boolean {
  const adCosts = loadAdCosts();
  const filtered = adCosts.filter(cost => cost.id !== id);
  return saveAdCosts(filtered);
}

/**
 * 広告費用をクリア
 */
export function clearAdCosts(): boolean {
  try {
    localStorage.removeItem(AD_COST_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('広告費用のクリアに失敗しました:', error);
    return false;
  }
}
