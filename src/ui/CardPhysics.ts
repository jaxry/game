import { putOnTop } from '../util/util.ts'
import makeDraggable from '../util/makeDraggable.ts'

interface Vec2 {
  x: number
  y: number
}

interface Motion {
  size: Vec2,
  anchor: HTMLElement
  anchorPosition: Vec2,
  position: Vec2,
  velocity: Vec2
}

export default class CardPhysics {
  velocityScale = 1 / 2 ** 11
  velocityDamping = 1 - 1 / 2 ** 8
  minVelocity = 1 / 2 ** 2

  private ignoring = new Set<Motion>()

  private elementToMotion = new Map<HTMLElement, Motion>()

  private motionList: Motion[] = []

  private needRebuild = false

  private resizeObserver = onResize((element, width, height) => {
    const motion = this.elementToMotion.get(element)!
    const anchorPosition = relativePosition(motion.anchor)
    motion.position.x += motion.anchorPosition.x - anchorPosition.x
    motion.position.y += motion.anchorPosition.y - anchorPosition.y
    motion.anchorPosition = anchorPosition
    motion.size.x = width
    motion.size.y = height

    this.updatePosition(element, motion.position)
    this.queueTick()
  })

  private animationFrame: number
  private lastTime = 0

  constructor (public container: HTMLElement) {
    new MutationObserver(([record]) => {
      for (const removed of record.removedNodes) {
        this.removeElement(removed as HTMLElement)
      }
    }).observe(container, {
      childList: true,
    })
  }

  addElement (
      element: HTMLElement, anchor: HTMLElement, position?: Vec2,
      create?: (position: Vec2) => void) {

    const size = {
      x: element.offsetWidth,
      y: element.offsetHeight,
    }

    if (!position) {
      position = {
        x: randomPosition(0, this.container.offsetWidth - size.x),
        y: randomPosition(0, this.container.offsetHeight - size.y),
      }
      create?.(position)
    }

    const motion: Motion = {
      position,
      anchor,
      anchorPosition: relativePosition(anchor),
      velocity: { x: 0, y: 0 },
      size,
    }

    element.addEventListener('pointerenter', () => {
      putOnTop(element)
    })

    makeDraggable(element, {
      onDown: () => {
        this.ignoring.add(motion)
      },
      onUp: () => {
        this.ignoring.delete(motion)
        this.queueTick()
      },
      onDrag: (e) => {
        motion.position.x += e.movementX
        motion.position.y += e.movementY
        this.queueTick()
      },
    })

    this.elementToMotion.set(element, motion)
    this.resizeObserver.observe(element)

    this.needRebuild = true
    this.queueTick(true)
  }

  removeElement (element: HTMLElement) {
    this.resizeObserver.unobserve(element)
    this.elementToMotion.delete(element)
    this.ignoring.delete(this.elementToMotion.get(element)!)
  }

  private queueTick (asMicrotask = false) {
    if (this.animationFrame) {
      return
    }
    if (asMicrotask) {
      this.animationFrame = 1
      queueMicrotask(() => {
        this.animationFrame = 0
        this.tick(performance.now())
      })
    } else {
      this.animationFrame = requestAnimationFrame(time => {
        this.animationFrame = 0
        this.tick(time)
      })
    }
  }

  private tick (currentTime: number) {
    const elapsed = this.getElapsed(currentTime)
    const list = this.getMotionList()

    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        collide(list[i], list[j])
      }
    }

    const width = this.container.offsetWidth
    const height = this.container.offsetHeight
    for (const motion of list) {
      bound(motion, width, height)
    }

    for (const motion of this.ignoring) {
      motion.velocity.x = 0
      motion.velocity.y = 0
    }

    const maxVelocity = applyMotion(list, elapsed, this.velocityScale,
        this.velocityDamping)

    for (const [element, { position }] of this.elementToMotion) {
      this.updatePosition(element, position)
    }

    if (maxVelocity > this.minVelocity) {
      this.queueTick()
    }
  }

  private updatePosition (element: HTMLElement, position: Vec2) {
    element.style.translate = `${position.x}px ${position.y}px`
  }

  private getMotionList () {
    if (!this.needRebuild) {
      return this.motionList
    }
    this.needRebuild = false

    this.motionList = Array.from(this.elementToMotion.values())

    return this.motionList
  }

  private getElapsed (currentTime: number) {
    const elapsed = currentTime - this.lastTime
    this.lastTime = currentTime
    return Math.min(elapsed, 1000 / 30)
  }
}

function collide (a: Motion, b: Motion) {
  const xOverlap = Math.max(0, 0.5 * (a.size.x + b.size.x) -
      Math.abs(a.position.x + 0.5 * a.size.x - b.position.x - 0.5 * b.size.x))
  const yOverlap = Math.max(0, 0.5 * (a.size.y + b.size.y) -
      Math.abs(a.position.y + 0.5 * a.size.y - b.position.y - 0.5 * b.size.y))

  // not colliding
  if (!xOverlap || !yOverlap) {
    return
  }

  const totalOverlap = xOverlap + yOverlap
  const xOverlapPercent = 1 - xOverlap / totalOverlap
  const yOverlapPercent = 1 - yOverlap / totalOverlap
  const forceX = xOverlapPercent * Math.sign(a.position.x - b.position.x)
  const forceY = yOverlapPercent * Math.sign(a.position.y - b.position.y)
  a.velocity.x += forceX
  a.velocity.y += forceY
  b.velocity.x -= forceX
  b.velocity.y -= forceY
}

function bound (
    { position, size, velocity }: Motion, width: number, height: number) {
  if (position.x < 0) {
    velocity.x += 2
  } else if (position.x + size.x > width) {
    velocity.x -= 2
  }

  if (position.y < 0) {
    velocity.y += 2
  } else if (position.y + size.y > height) {
    velocity.y -= 2
  }
}

function applyMotion (
    list: Motion[], elapsed: number, velocityScale: number, damping: number) {

  velocityScale *= elapsed * elapsed
  damping **= elapsed

  let maxVelocity = -Infinity
  for (const motion of list) {
    maxVelocity = Math.max(maxVelocity,
        motion.velocity.x * motion.velocity.x +
        motion.velocity.y * motion.velocity.y)
    motion.position.x += motion.velocity.x * velocityScale
    motion.position.y += motion.velocity.y * velocityScale
    motion.velocity.x *= damping
    motion.velocity.y *= damping
  }

  return Math.sqrt(maxVelocity)
}

function randomPosition (min: number, max: number) {
  const range = max - min
  const startDistance = range / 8
  return min + startDistance + Math.random() * (range - 2 * startDistance)
}

function relativePosition (element: HTMLElement, to = element.parentElement!) {
  const rect = element.getBoundingClientRect()
  const parentRect = to.getBoundingClientRect()
  return {
    x: rect.x - parentRect.x,
    y: rect.y - parentRect.y,
  }
}

function onResize (callback: (
    element: HTMLElement, width: number, height: number) => void) {
  return new ResizeObserver((entries) => {
    for (const entry of entries) {
      callback(entry.target as HTMLElement,
          entry.borderBoxSize[0].inlineSize,
          entry.borderBoxSize[0].blockSize)
    }
  })
}