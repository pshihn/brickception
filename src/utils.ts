export function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

export function setv(node: HTMLElement, text: string | number) {
  node.textContent = `${text}`;
}

export const store = {
  get<T>(key: string): T | null {
    if (!key) return null;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
    return null;
  },
  set(key: string, value: any): void {
    if (key && value) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }
};