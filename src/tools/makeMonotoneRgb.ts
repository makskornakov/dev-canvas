export function makeMonotoneRgb<T extends number>(gray: T) {
  return `rgb(${gray}, ${gray}, ${gray})` as const;
}
