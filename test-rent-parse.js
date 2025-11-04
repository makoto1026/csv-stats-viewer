// 家賃パースのテスト

function parseRentValue(value) {
  const original = value;
  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null, original, isValid: false };
  }

  // 範囲指定の場合（〜、-、~で区切られている）
  const rangeMatch = trimmed.match(/(.+)[〜\-~](.+)/);
  if (rangeMatch) {
    // 上限値（2番目の値）を使用
    const upperValue = rangeMatch[2].trim();
    return parseRentValue(upperValue); // 再帰的に解析
  }

  // 「万」「マン」「萬」を含むかチェック
  const hasManKanji = trimmed.includes('万');
  const hasManKatakana = trimmed.includes('マン');
  const hasManOldKanji = trimmed.includes('萬');

  // 数値部分を抽出
  let numericString = trimmed
    .replace(/,/g, '')      // カンマ除去
    .replace(/円/g, '')     // 円除去
    .replace(/以下/g, '')   // 以下除去
    .replace(/以上/g, '')   // 以上除去
    .replace(/万/g, '')     // 万を除去（後で0000を追加）
    .replace(/マン/g, '')   // マンを除去（後で0000を追加）
    .replace(/萬/g, '')     // 萬を除去（後で0000を追加）
    .replace(/[^\d]/g, ''); // 数字以外を除去

  // 数字が抽出できなかった場合
  if (!numericString) {
    return { value: null, original, isValid: false };
  }

  let parsed = parseInt(numericString, 10);

  if (isNaN(parsed) || parsed <= 0) {
    return { value: null, original, isValid: false };
  }

  // 「万」「マン」「萬」がある場合は0000を追加
  if (hasManKanji || hasManKatakana || hasManOldKanji) {
    parsed = parsed * 10000;
  } else if (parsed < 100) {
    // 2桁の数値の場合は「万円」として扱う（例: 16 → 160,000）
    parsed = parsed * 10000;
  }

  return { value: parsed, original, isValid: true };
}

// テストケース
const testCases = [
  '10万',
  '16',
  '17マン',
  '20萬',
  '10万〜20万',
  '150,000',
];

console.log('=== 家賃パーステスト ===\n');
testCases.forEach(testCase => {
  const result = parseRentValue(testCase);
  console.log(`入力: "${testCase}"`);
  console.log(`結果: ${result.isValid ? result.value.toLocaleString() : '無効'}`);
  console.log('---');
});

// 平均値テスト
console.log('\n=== 平均値計算テスト ===');
const values = [
  parseRentValue('10万').value,
  parseRentValue('16').value,
  parseRentValue('7万').value,
];

console.log('値:', values.map(v => v.toLocaleString()));
const average = values.reduce((sum, v) => sum + v, 0) / values.length;
console.log('平均:', average.toLocaleString());

// 1000の位で四捨五入
const rounded = Math.round(average / 1000) * 1000;
console.log('四捨五入後:', rounded.toLocaleString());
