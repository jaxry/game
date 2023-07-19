const animations = new Set<Animate>()

let time = performance.now()
let elapsed = 0
let lastTime = 0

export function runAnimations () {
  time = performance.now()
  const elapsed = time - lastTime
  lastTime = time

  for (const animation of animations) {
    animation.tick(time, elapsed)
  }
}

export abstract class Animate {
  startTime: number

  abstract tick(time: number, elapsed: number): void

  start () {
    this.startTime = time
    animations.add(this)
    return this
  }

  end () {
    animations.delete(this)
    this.onEnd?.()
    return this
  }

  onEnd?(): void
}



export abstract class Tween extends Animate {
  duration = 0
  easing = ease
  progress = 0
  lastProgress = 0

  tick () {
    const elapsed = Math.min(time - this.startTime, this.duration)

    this.progress = this.easing(elapsed / this.duration)

    this.onTick()

    if (elapsed >= this.duration) {
      this.end()
    }

    this.lastProgress = this.progress
  }

  interpolate (start: number, end: number, progress = this.progress) {
    return start + (end - start) * progress
  }

  interpolateDiff (start: number, end: number) {
    return this.interpolate(start, end) - this.interpolate(start, end, this.lastProgress)
  }

  abstract onTick(): void
}

export function linear (x: number): number {
  return x
}

export function easeInOutCubic (x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeInCubic (x: number): number {
  return x * x * x
}

export function easeOutCubic (x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

export const ease = easeOutCubic


