import { CSVData, CSVParseResult } from '../types/csv.types';

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    // まずShift-JISとして読み込みを試みる
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          resolve({
            success: false,
            error: 'CSVファイルが空です',
          });
          return;
        }

        // エンコーディングを自動検出して読み込み
        let text = '';
        try {
          // Shift-JISで試す
          const decoder = new TextDecoder('shift-jis');
          text = decoder.decode(arrayBuffer);

          // 文字化けチェック（置換文字が多い場合はUTF-8を試す）
          const replacementCharCount = (text.match(/�/g) || []).length;
          if (replacementCharCount > text.length * 0.01) {
            // UTF-8で再試行
            const utf8Decoder = new TextDecoder('utf-8');
            text = utf8Decoder.decode(arrayBuffer);
          }
        } catch {
          // デコードエラーの場合はUTF-8で試す
          const utf8Decoder = new TextDecoder('utf-8');
          text = utf8Decoder.decode(arrayBuffer);
        }

        if (!text || text.trim() === '') {
          resolve({
            success: false,
            error: 'CSVファイルが空です',
          });
          return;
        }

        // 改行コードを統一（CRLF、LF、CRすべてに対応）
        const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalizedText.trim().split('\n');

        if (lines.length < 2) {
          resolve({
            success: false,
            error: 'CSVファイルにはヘッダー行とデータ行が必要です',
          });
          return;
        }

        // ヘッダー行の解析
        const headers = parseCSVLine(lines[0]);

        if (headers.length === 0) {
          resolve({
            success: false,
            error: 'ヘッダーが見つかりません',
          });
          return;
        }

        // データ行の解析
        const rows: Record<string, string | number>[] = [];
        const warnings: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === '') continue;

          const values = parseCSVLine(line);

          // カラム数が不一致の場合の処理
          if (values.length !== headers.length) {
            if (values.length < headers.length) {
              // フィールドが足りない場合はエラー
              resolve({
                success: false,
                error: `${i + 1}行目: カラム数が不足しています（期待: ${headers.length}, 実際: ${values.length}）`,
              });
              return;
            } else {
              // フィールドが多い場合は警告を出して余分なフィールドを切り捨て
              warnings.push(`${i + 1}行目: 余分なフィールドが ${values.length - headers.length} 個あります（切り捨てました）`);
            }
          }

          const row: Record<string, string | number> = {};
          headers.forEach((header, index) => {
            const value = values[index] || ''; // 値がない場合は空文字
            // 値をそのまま文字列として保存（型判定は統計計算時に行う）
            row[header] = value;
          });
          rows.push(row);
        }

        // 警告がある場合はコンソールに出力
        if (warnings.length > 0) {
          console.warn('CSV解析の警告:\n' + warnings.join('\n'));
        }

        const csvData: CSVData = {
          headers,
          rows,
          fileName: file.name,
          uploadedAt: new Date(),
        };

        resolve({
          success: true,
          data: csvData,
        });
      } catch (error) {
        resolve({
          success: false,
          error: `CSVの解析中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'ファイルの読み込み中にエラーが発生しました',
      });
    };

    // ArrayBufferとして読み込む（エンコーディング検出のため）
    reader.readAsArrayBuffer(file);
  });
}

/**
 * CSV行をパースして配列に変換
 * シンプルなカンマ区切りとダブルクォートで囲まれた値に対応
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // エスケープされたダブルクォート
        current += '"';
        i++; // 次の文字をスキップ
      } else {
        // クォートの開始/終了
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // 最後のフィールドを追加
  result.push(current.trim());

  return result;
}
