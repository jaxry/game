const animations = new Set<Animate>()

let time = performance.now()

export function runAnimations () {
  time = performance.now()

  for (const animation of animations) {
    animation.tick(time)
  }
}

export abstract class Animate {
  startTime = time

  constructor () {
    animations.add(this)
  }

  get elapsed () {
    return time - this.startTime
  }

  abstract tick (time: number): void

  end () {
    animations.delete(this)
    this.onEnd?.()
    return this
  }

  onEnd? (): void
}

export abstract class Tween extends Animate {
  duration = 0
  easing = ease
  progress = 0
  lastProgress = 0

  tick (time: number) {
    const elapsed = Math.min(time - this.startTime, this.duration)

    this.progress = this.easing(elapsed / this.duration)

    this.onProgress()

    if (elapsed >= this.duration) {
      this.end()
    }

    this.lastProgress = this.progress
  }

  interpolate (start: number, end: number, progress = this.progress) {
    return start + (end - start) * progress
  }

  interpolateDiff (amount: number) {
    return amount * (this.progress - this.lastProgress)
  }

  abstract onProgress (): void
}

export function linear (x: number) {
  return x
}

export function easeInOutCubic (x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function easeInCubic (x: number) {
  return x * x * x
}

export function easeOutCubic (x: number) {
  return 1 - Math.pow(1 - x, 3)
}

export function ease (x: number) {
  return x * x * x * (3 * x * (2 * x - 5) + 10)
}