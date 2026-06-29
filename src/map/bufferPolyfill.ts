export function installBufferPolyfill() {
  if (typeof (window as any).Buffer !== 'undefined' && typeof (window as any).Buffer.alloc === 'function') return;

  const BufPolyfill: any = Uint8Array;
  if (typeof TextDecoder !== 'undefined') {
    BufPolyfill.prototype.toString = function(encoding: string): string {
      if (encoding === 'utf8' || encoding === 'utf-8') {
        return new TextDecoder('utf-8').decode(this);
      }
      return '';
    };
  }
  (window as any).Buffer = BufPolyfill;
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
