import "@testing-library/jest-dom";

// jsdom / Node の環境差で localStorage が使えないことがあるため、テストでは
// 決定論的なインメモリ実装を必ず用意する（本番はブラウザの localStorage を使用）。
function createMemoryStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
  } as Storage;
}

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: createMemoryStorage(),
});
