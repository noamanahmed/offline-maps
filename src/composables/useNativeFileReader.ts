import { isAndroid, isIOS } from '@nativescript/core';

export function useNativeFileReader() {
  function readTextFile(absolutePath: string): string {
    try {
      if (isAndroid) {
        const f = new (global as any).java.io.File(absolutePath);
        if (!f.exists()) {
          console.error(`[VERBOSE] readTextFile: File does not exist: ${absolutePath}`);
          return '[]';
        }
        const fis = new (global as any).java.io.FileInputStream(f);
        const ch = new (global as any).java.io.InputStreamReader(fis, "UTF-8");
        const br = new (global as any).java.io.BufferedReader(ch);
        const sb = new (global as any).java.lang.StringBuilder();
        let line;
        while ((line = br.readLine()) !== null) {
          sb.append(line).append("\n");
        }
        br.close();
        return sb.toString();
      } else if (isIOS) {
        const data = (global as any).NSString.stringWithContentsOfFile_encoding_error_(absolutePath, 4, null);
        return data || '[]';
      }
    } catch (err) {
      console.error(`[VERBOSE] readTextFile Error:`, err);
    }
    return '[]';
  }

  function readBinaryFileToBase64(absolutePath: string): string {
    try {
      if (isAndroid) {
        const f = new (global as any).java.io.File(absolutePath);
        if (!f.exists()) {
          console.error(`[VERBOSE] readBinaryFileToBase64: File does not exist: ${absolutePath}`);
          return '';
        }
        const length = f.length();
        const buffer = (global as any).Array.create("byte", length);
        const fis = new (global as any).java.io.FileInputStream(f);
        const bis = new (global as any).java.io.BufferedInputStream(fis);
        let totalRead = 0;
        while (totalRead < length) {
          const read = bis.read(buffer, totalRead, length - totalRead);
          if (read === -1) break;
          totalRead += read;
        }
        bis.close();
        return (global as any).android.util.Base64.encodeToString(buffer, (global as any).android.util.Base64.NO_WRAP);
      } else if (isIOS) {
        const data = (global as any).NSData.dataWithContentsOfFile(absolutePath);
        if (data) return data.base64EncodedStringWithOptions(0);
      }
    } catch (err) {
      console.error(`[VERBOSE] readBinaryFileToBase64 Error:`, err);
    }
    return '';
  }

  return { readTextFile, readBinaryFileToBase64 };
}
