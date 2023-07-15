export default function makeCanvas (width = 0, height = 0, options?: any) {
  const canvas = new OffscreenCanvas(width, height)
  // const canvas = document.createElement('canvas')
  // canvas.width = width
  // canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false, ...options })!

  return ctx as any as CanvasRenderingContext2D
}
