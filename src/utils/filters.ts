export function excludeNames(names: Iterable<string>, patterns: string[]): string[] {
  if (!patterns || patterns.length === 0) return Array.from(names);
  const out: string[] = [];
  for (const n of names) {
    if (patterns.some((p) => matchPattern(n, p))) continue;
    out.push(n);
  }
  return out;
}

// Simple wildcard: * and ? only
export function matchPattern(text: string, pattern: string): boolean {
  const esc = pattern.replace(/[.+^${}()|\[\]\\]/g, '\\$&');
  const rx = '^' + esc.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
  return new RegExp(rx).test(text);
}
