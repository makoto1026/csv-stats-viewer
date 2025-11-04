# 媒体別分析機能 実装ドキュメント

## 概要

Googleスプレッドシートから取得したリード情報を元に、各媒体（Instagram、TikTok、YouTube等）の広告効果を分析する機能。月次・全期間のレポート表示、詳細分析（時間帯・ペット種類）、広告費用・成約数の手動入力に対応。

## アーキテクチャ

### データフロー

```
Googleスプレッドシート (CSV形式でエクスポート)
  ↓
sheetsLoader.ts (データ取得・パース)
  ↓
SpreadsheetData (app/types/spreadsheet.types.ts)
  ↓
mediaAnalytics.ts (リード数集計)
  ↓
MediaAnalyticsView (統合UI)
  ├─ DailyMediaInputTable (日別入力)
  ├─ MonthlyMediaReportView (月次レポート)
  ├─ AllTimeReportView (全期間レポート)
  └─ DetailedAnalysisView (詳細分析)
```

### ストレージ構成

- **スプレッドシートデータ**: メモリ内（SpreadsheetData）- 読み取り専用
- **広告費用・成約数**: localStorage (`mediaAdCosts`) - 永続化

## コア機能

### 1. データ入力機能

#### 日別入力テーブル (DailyMediaInputTable)

**ファイル**: `app/components/DailyMediaInputTable.tsx`

**機能**:
- 選択月の全日付を表示（データがない日も含む）
- スプレッドシートから自動的にリード数を取得して表示
- 広告費用・成約数・メモを手動入力
- localStorage に保存

**実装のポイント**:
```typescript
// 月の全日付を生成
export function generateMonthDates(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  // 1日から最終日までループ
}

// 日付フォーマット変換
// スプレッドシート: "2024-11-02 07:17:22 pm"
// 比較用: "2024-11-02"
const datePart = dateValue.split(' ')[0];
```

**データ構造**:
```typescript
interface DailyAdCost {
  id: string;           // UUID
  date: string;         // YYYY-MM-DD
  mediaType: MediaType;
  cost: number;         // 広告費用
  contractCount: number; // 成約数
  note?: string;
}
```

### 2. レポート機能

#### 月次レポート (MonthlyMediaReportView)

**ファイル**: `app/components/MonthlyMediaReportView.tsx`

**表示項目**:
- リード数（スプレッドシートから集計）
- 広告費（入力データから集計）
- 成約数（入力データから集計）
- 成約率（成約数 / リード数 × 100）
- 日平均単価（広告費 / 日数）
- リード単価（広告費 / リード数）
- 成約単価（広告費 / 成約数）

**計算ロジック**: `app/utils/mediaAnalytics.ts`
```typescript
export function calculateMonthlyMediaReport(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): MonthlyMediaReport
```

#### 全期間レポート (AllTimeReportView)

**ファイル**: `app/components/AllTimeReportView.tsx`

**月次レポートとの違い**:
- 全データ期間を対象に集計
- 「データ月数」列を追加表示
- 対象期間（開始日〜終了日）を表示

**計算ロジック**: `app/utils/mediaAnalytics.ts`
```typescript
export function calculateAllTimeOverallReport(
  csvData: SpreadsheetData,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): AllTimeOverallReport
```

### 3. 詳細分析機能

#### 詳細分析ビュー (DetailedAnalysisView)

**ファイル**: `app/components/DetailedAnalysisView.tsx`

**分析内容**:
1. **時間帯分析**
   - 0-23時の各時間別リード数を棒グラフで表示
   - ピーク時間帯を自動検出してハイライト
   - 12時間表記（am/pm）を24時間表記に変換

2. **ペット種類分析**
   - 犬のみ/猫のみ/両方/不明に分類
   - 円グラフで比率を可視化
   - 詳細なペット種類分布をテーブル表示

**月次 vs 全期間の切り替え**:
```typescript
// 月次データ
const detailedAnalysis = calculateMediaDetailedAnalysis(
  csvData, selectedMedia, selectedMonth, dateColumn
);

// 全期間データ
const allTimeDetailedAnalysis = calculateMediaDetailedAnalysis(
  csvData, selectedMedia, 'all-time', dateColumn
);
```

**時刻変換ロジック**: `app/utils/detailedAnalytics.ts`
```typescript
// "2024-11-02 07:17:22 pm" から時刻を抽出
const timePart = dateValue.split(' ')[1]; // "07:17:22"
const period = dateValue.split(' ')[2];   // "pm"

let hour = parseInt(timePart.split(':')[0], 10);

// 12時間→24時間変換
if (period === 'pm' && hour !== 12) {
  hour += 12;
} else if (period === 'am' && hour === 12) {
  hour = 0;
}
```

## データ構造

### 型定義

**app/types/media.types.ts**:
```typescript
// 媒体種別
export const MEDIA_TYPES = [
  'Instagram', 'TikTok', 'YouTube', 'Lemon8', 'LINE',
  'ラグジュアリーカード', 'ホームページ', 'チラシ',
  'その他（紹介等）', 'CLASSY(雑誌)',
] as const;

export type MediaType = typeof MEDIA_TYPES[number];

// 日別広告費用
export interface DailyAdCost {
  id: string;
  date: string;
  mediaType: MediaType;
  cost: number;
  contractCount: number;
  note?: string;
}

// 月次レポート
export interface MonthlyMediaReport {
  yearMonth: string;
  mediaType: MediaType;
  leadCount: number;
  totalAdCost: number;
  totalContractCount: number;
  averageCostPerDay: number;
  contractRate: number;
  costPerLead: number;
  costPerContract: number;
}

// 全期間レポート
export interface AllTimeMediaReport {
  mediaType: MediaType;
  leadCount: number;
  totalAdCost: number;
  totalContractCount: number;
  contractRate: number;
  costPerLead: number;
  costPerContract: number;
  monthCount: number; // データがある月数
}
```

**app/types/analysis.types.ts**:
```typescript
export interface MediaDetailedAnalysis {
  mediaType: MediaType;
  yearMonth: string | 'all-time'; // 'all-time'は全期間
  totalLeads: number;
  hourlyDistribution: HourlyDistribution[];
  peakHour: number;
  petTypeDistribution: PetTypeDistribution[];
  dogCount: number;
  catCount: number;
  bothCount: number;
  unknownCount: number;
}
```

## 主要なユーティリティ関数

### mediaAnalytics.ts

```typescript
// 媒体名の正規化（部分一致対応）
export function normalizeMediaName(value: string): MediaType | null

// 特定日・媒体のリード数カウント
export function countLeadsByMediaAndDate(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  date: string,
  dateColumn: string,
  mediaColumn: string
): number

// 月全体の媒体別リード数カウント
export function countLeadsByMedia(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string
): number

// 全期間の媒体別リード数カウント
export function countAllTimeLeadsByMedia(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  mediaColumn: string
): number

// 日別リード数取得
export function getDailyLeadCounts(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string
): DailyLeadCount[]

// 月次レポート計算
export function calculateMonthlyMediaReport(...)
export function calculateMonthlyOverallReport(...)

// 全期間レポート計算
export function calculateAllTimeMediaReport(...)
export function calculateAllTimeOverallReport(...)
```

### detailedAnalytics.ts

```typescript
// 詳細分析実行
export function calculateMediaDetailedAnalysis(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string | 'all-time',
  dateColumn: string,
  mediaColumn: string,
  petColumn: string
): MediaDetailedAnalysis

// 内部関数
function calculateHourlyDistribution(...): HourlyDistribution[]
function findPeakHour(...): number
function calculatePetTypeDistribution(...): PetTypeDistribution[]
function calculatePetCategory(...): { dogCount, catCount, bothCount, unknownCount }
```

### mediaAdStorage.ts

```typescript
const STORAGE_KEY = 'mediaAdCosts';

// localStorage から読み込み
export function loadMediaAdCosts(): DailyAdCost[]

// localStorage に保存
export function saveMediaAdCosts(costs: DailyAdCost[]): void

// 特定データ削除
export function removeMediaAdCost(id: string): void

// 月・媒体でフィルタ
export function getMediaAdCostsByMonthAndType(
  yearMonth: string,
  mediaType: string
): DailyAdCost[]
```

## UI/UX設計

### MediaAnalyticsView 構造

```
MediaAnalyticsView
├─ ヘッダー（説明）
├─ 月選択ドロップダウン
└─ 選択月がある場合
   ├─ 表示モード切り替え（4タブ）
   │  ├─ データ入力
   │  ├─ 月次レポート
   │  ├─ 全期間レポート
   │  └─ 詳細分析
   │
   ├─ データ入力モード
   │  ├─ 媒体タブ（10種類）
   │  └─ DailyMediaInputTable
   │
   ├─ 月次レポートモード
   │  └─ MonthlyMediaReportView
   │
   ├─ 全期間レポートモード
   │  └─ AllTimeReportView
   │
   └─ 詳細分析モード
      ├─ 媒体タブ（10種類）
      ├─ 期間切り替え（月次/全期間）
      └─ DetailedAnalysisView
```

### 状態管理

**MediaAnalyticsView 内部状態**:
```typescript
const [adCosts, setAdCosts] = useState<DailyAdCost[]>([]);
const [selectedMonth, setSelectedMonth] = useState<string>('');
const [selectedMedia, setSelectedMedia] = useState<MediaType>('Instagram');
const [viewMode, setViewMode] = useState<'input' | 'report' | 'alltime' | 'analysis'>('input');
const [analysisTimeRange, setAnalysisTimeRange] = useState<'monthly' | 'alltime'>('monthly');
```

**useMemo による計算最適化**:
```typescript
// 日別リード数（選択月・選択媒体）
const dailyLeadCounts = useMemo(() => {
  if (!selectedMonth) return [];
  return getDailyLeadCounts(csvData, selectedMedia, selectedMonth, dateColumn);
}, [csvData, selectedMedia, selectedMonth, dateColumn]);

// 月次レポート
const monthlyReport = useMemo(() => {
  if (!selectedMonth) return null;
  return calculateMonthlyOverallReport(csvData, selectedMonth, dateColumn);
}, [csvData, selectedMonth, dateColumn, adCosts]);

// 全期間レポート
const allTimeReport = useMemo(() => {
  return calculateAllTimeOverallReport(csvData, dateColumn);
}, [csvData, dateColumn, adCosts]);

// 詳細分析（月次）
const detailedAnalysis = useMemo(() => {
  if (!selectedMonth) return null;
  return calculateMediaDetailedAnalysis(csvData, selectedMedia, selectedMonth, dateColumn);
}, [csvData, selectedMedia, selectedMonth, dateColumn]);

// 詳細分析（全期間）
const allTimeDetailedAnalysis = useMemo(() => {
  return calculateMediaDetailedAnalysis(csvData, selectedMedia, 'all-time', dateColumn);
}, [csvData, selectedMedia, dateColumn]);
```

### サイドバー連携

**page.tsx での実装**:
```typescript
const handleSelectColumn = (column: string) => {
  setSelectedColumn(column);
  // サイドバークリック時にパネルを閉じる
  setShowMediaAnalytics(false);
};
```

## 重要な実装パターン

### 1. 日付フォーマット処理

**問題**: スプレッドシートの日付は `"2024-11-02 07:17:22 pm"` 形式

**解決策**:
```typescript
// 日付部分のみを抽出して比較
const datePart = dateValue.split(' ')[0]; // "2024-11-02"
if (datePart === date) { ... }
if (datePart.startsWith(yearMonth)) { ... }
```

### 2. 文字エンコーディング

**問題**: 全角・半角の疑問符が混在（`?` vs `？`）

**解決策**: スプレッドシートの列名と完全一致させる
```typescript
mediaColumn: string = '何を見て知った？' // 全角
```

### 3. 媒体名の正規化

**問題**: スプレッドシートの入力値が揺れる可能性

**解決策**: 完全一致 → 部分一致の順でチェック
```typescript
export function normalizeMediaName(value: string): MediaType | null {
  const normalized = value.trim();

  // 完全一致
  for (const mediaType of MEDIA_TYPES) {
    if (normalized === mediaType) return mediaType;
  }

  // 部分一致（小文字変換して比較）
  const lowerValue = normalized.toLowerCase();
  if (lowerValue.includes('instagram') || lowerValue.includes('インスタ'))
    return 'Instagram';
  // ...
}
```

### 4. ゼロ除算対策

**すべての割り算で分母チェック**:
```typescript
const contractRate = leadCount > 0 ? (totalContractCount / leadCount) * 100 : 0;
const costPerLead = leadCount > 0 ? totalAdCost / leadCount : 0;
const costPerContract = totalContractCount > 0 ? totalAdCost / totalContractCount : 0;
```

### 5. データがない場合の表示

**フィルタリングしてから表示**:
```typescript
const activeMediaReports = report.mediaReports.filter(
  (mr) => mr.leadCount > 0 || mr.totalAdCost > 0 || mr.totalContractCount > 0
);

{activeMediaReports.length > 0 ? (
  <table>...</table>
) : (
  <div>データがありません</div>
)}
```

### 6. localStorage の使用

**保存タイミング**:
- DailyMediaInputTable の保存ボタンクリック時
- データは即座に localStorage に書き込み

**読み込みタイミング**:
- MediaAnalyticsView の初回マウント時（useEffect）

**データ構造**:
```typescript
localStorage.setItem('mediaAdCosts', JSON.stringify(adCosts));
```

## グラフ表示 (Recharts)

### 使用コンポーネント

- **BarChart**: 時間帯別リード数
- **PieChart**: 犬猫比率
- **ResponsiveContainer**: レスポンシブ対応

### 実装例

```typescript
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={analysis.hourlyDistribution}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="hour" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
      {analysis.hourlyDistribution.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.hour === analysis.peakHour ? '#3b82f6' : '#93c5fd'}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**型エラー回避**:
```typescript
// Rechartsの型定義が厳密なため、any を使用
label={(props: any) => {
  const { name, percent } = props;
  return `${name} ${(percent * 100).toFixed(0)}%`;
}}
```

## スタイリング方針

### Tailwind CSS クラス

**カラースキーム**:
- データ入力タブ: `bg-blue-500`
- 月次レポート: `bg-blue-500` (ヘッダー: `from-blue-50 to-blue-100`)
- 全期間レポート: `bg-blue-500` (ヘッダー: `from-purple-50 to-purple-100`)
- 詳細分析: `bg-blue-500` (切り替え: `bg-purple-500`)
- 媒体タブ: `bg-green-500`

**ダークモード対応**:
```typescript
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
```

**レスポンシブ**:
```typescript
className="grid grid-cols-1 md:grid-cols-4 gap-4"
```

## テスト・デバッグ

### データ確認

**スプレッドシートの実際のデータ範囲**:
- 2024-11 〜 2025-10（執筆時点）

**テスト用スクリプト例**:
```typescript
// countLeadsByMediaAndDate の動作確認
const testDate = '2024-11-02';
const count = countLeadsByMediaAndDate(csvData, 'Instagram', testDate, dateColumn);
console.log(`${testDate} Instagram: ${count}件`);
```

### よくある問題

1. **リード数が0になる**
   - 日付フォーマットの不一致
   - 列名の全角・半角違い
   - 媒体名の正規化失敗

2. **グラフが表示されない**
   - データが空配列
   - Recharts の型エラー

3. **保存できない**
   - localStorage の容量制限
   - JSON.stringify エラー

## パフォーマンス最適化

### useMemo の活用

**再計算が重い処理**:
- リード数集計（全行スキャン）
- 詳細分析（時間帯・ペット種類の集計）
- レポート計算

**依存配列の設計**:
```typescript
// csvData, selectedMedia, selectedMonth が変わった時のみ再計算
useMemo(() => { ... }, [csvData, selectedMedia, selectedMonth, dateColumn]);
```

### レンダリング最適化

**条件分岐による部分レンダリング**:
```typescript
{viewMode === 'input' && <DailyMediaInputTable />}
{viewMode === 'report' && <MonthlyMediaReportView />}
{viewMode === 'alltime' && <AllTimeReportView />}
{viewMode === 'analysis' && <DetailedAnalysisView />}
```

## 今後の拡張ポイント

### 1. フィルタリング機能

**ペット種類でフィルタ**:
```typescript
interface AnalysisFilter {
  petType?: string;
  hourRange?: { start: number; end: number };
}
```

実装済みの型定義があるため、UI追加で対応可能

### 2. データエクスポート

**CSV/Excel エクスポート**:
- レポートデータを CSV 形式でダウンロード
- 詳細分析結果をエクスポート

### 3. グラフの追加

**推奨グラフ**:
- 月次トレンド（折れ線グラフ）
- 媒体別比較（積み上げ棒グラフ）
- 成約率の推移

### 4. 成約データの詳細化

**現在**: 成約数のみ
**拡張案**: 成約単価、成約タイプ（新規/既存）など

### 5. バックエンド連携

**現在**: localStorage のみ
**拡張案**: API 経由でデータベースに保存

## 関連ファイル一覧

### コンポーネント
- `app/components/MediaAnalyticsView.tsx` (統合ビュー)
- `app/components/DailyMediaInputTable.tsx` (日別入力)
- `app/components/MonthlyMediaReportView.tsx` (月次レポート)
- `app/components/AllTimeReportView.tsx` (全期間レポート)
- `app/components/DetailedAnalysisView.tsx` (詳細分析)

### ユーティリティ
- `app/utils/mediaAnalytics.ts` (集計・計算ロジック)
- `app/utils/detailedAnalytics.ts` (詳細分析ロジック)
- `app/utils/mediaAdStorage.ts` (localStorage 操作)

### 型定義
- `app/types/media.types.ts` (媒体・レポート型)
- `app/types/analysis.types.ts` (詳細分析型)

### エントリーポイント
- `app/page.tsx` (メインページ、媒体別分析ボタン)

## まとめ

この実装は以下の原則に基づいています：

1. **データソースの分離**: スプレッドシート（読み取り専用）と localStorage（入力データ）
2. **型安全性**: TypeScript の厳密な型定義
3. **計算の最適化**: useMemo による再計算制御
4. **UI/UX**: 直感的なタブ切り替え、レスポンシブデザイン
5. **拡張性**: 新しい媒体・分析軸の追加が容易

今後の機能追加時も、この設計方針を継承することで保守性を維持できます。
