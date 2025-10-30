// 日時検出のテスト

function isDateString(value) {
  // 値が空または短すぎる場合は日時ではない
  if (!value || value.length < 8) return false;

  // 一般的な日時フォーマットをチェック
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/, // YYYY-MM-DD or YYYY/MM/DD
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{1,2}/, // YYYY-MM-DD HH:mm
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // DD-MM-YYYY or MM/DD/YYYY
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}\s+\d{1,2}:\d{1,2}/, // DD-MM-YYYY HH:mm
  ];

  const matches = datePatterns.some(pattern => pattern.test(value.trim()));
  if (!matches) return false;

  // 実際にDateオブジェクトとして解析できるかチェック
  const date = new Date(value);
  return !isNaN(date.getTime());
}

const testValues = [
  '2024/11/02 19:17:22',
  '"2024/11/02 19:17:22"',
  '2024',
  '2025',
  '2024/11/02',
];

console.log('Date detection test:');
testValues.forEach(value => {
  const result = isDateString(value);
  console.log(`"${value}" -> ${result ? 'DATE' : 'NOT DATE'}`);
});
