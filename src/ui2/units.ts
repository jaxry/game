const emScale = 16 * devicePixelRatio

export function em (x: number) {
  return x * emScale
}