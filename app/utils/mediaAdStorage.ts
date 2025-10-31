import { DailyAdCost } from '../types/media.types';

const STORAGE_KEY = 'csv-stats-media-ad-costs';

/**
 * ローカルストレージから日別広告費用データを読み込む
 */
export function loadMediaAdCosts(): DailyAdCost[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('広告費用データの読み込みに失敗しました:', error);
    return [];
  }
}

/**
 * ローカルストレージに日別広告費用データを保存する
 */
export function saveMediaAdCosts(costs: DailyAdCost[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(costs));
  } catch (error) {
    console.error('広告費用データの保存に失敗しました:', error);
  }
}

/**
 * 特定の広告費用データを削除する
 */
export function removeMediaAdCost(id: string): void {
  const costs = loadMediaAdCosts();
  const filtered = costs.filter(cost => cost.id !== id);
  saveMediaAdCosts(filtered);
}

/**
 * 特定の月の広告費用データを取得する
 */
export function getMediaAdCostsByMonth(yearMonth: string): DailyAdCost[] {
  const costs = loadMediaAdCosts();
  return costs.filter(cost => cost.date.startsWith(yearMonth));
}

/**
 * 特定の媒体の広告費用データを取得する
 */
export function getMediaAdCostsByType(mediaType: string): DailyAdCost[] {
  const costs = loadMediaAdCosts();
  return costs.filter(cost => cost.mediaType === mediaType);
}

/**
 * 特定の月と媒体の広告費用データを取得する
 */
export function getMediaAdCostsByMonthAndType(
  yearMonth: string,
  mediaType: string
): DailyAdCost[] {
  const costs = loadMediaAdCosts();
  return costs.filter(
    cost => cost.date.startsWith(yearMonth) && cost.mediaType === mediaType
  );
}
