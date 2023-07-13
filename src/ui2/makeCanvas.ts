export default function makeCanvas (width = 0, height = 0, options?: any) {
  const canvas = new OffscreenCanvas(
      width * devicePixelRatio, height * devicePixelRatio)

  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio

  const ctx = canvas.getContext('2d', { alpha: false, ...options })!

  return ctx as any as CanvasRenderingContext2D
}
