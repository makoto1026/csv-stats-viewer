const fs = require('fs');
const content = fs.readFileSync('/Users/makoto/projects/csv-stats-viewer/希望家賃変換表.txt', 'utf-8');
const lines = content.trim().split('\n');
const map = {};

lines.forEach(line => {
  const [key, value] = line.split(': ');
  if (key && value) {
    map[key.trim()] = value.trim();
  }
});

const convertToUpperLimit = (v) => {
  if (v === 'なし') return 0;

  if (v.includes('~')) {
    const parts = v.split('~');
    if (parts.length === 2) {
      const upper = parts[1].trim();
      if (upper) {
        return parseInt(upper.replace(/,/g, ''), 10);
      } else {
        return parseInt(parts[0].replace(/,/g, '').replace(/^~/, ''), 10);
      }
    }
  } else if (v.match(/^\d{3},\d{3}~$/)) {
    return 500000;
  }

  return parseInt(v.replace(/,/g, ''), 10) || 0;
};

const uniqueEntries = Object.entries(map)
  .map(([k, v]) => [k, convertToUpperLimit(v)])
  .filter(([k, v]) => v !== undefined && !isNaN(v))
  .sort((a, b) => a[0].localeCompare(b[0]));

uniqueEntries.forEach(([k, v]) => {
  const escapedKey = k.replace(/'/g, "\\'");
  console.log(`  '${escapedKey}': ${v},`);
});
