import EntityCard from './components/EntityCard.ts'

interface Vec2 {
  x: number
  y: number
}

interface Motion {
  extent: Vec2,
  position: Vec2,
  velocity: Vec2
}

export default class CardPhysics {
  velocityScale = 1 / 2 ** 9
  velocityDamping = 1 - 1 / 2 ** 7
  minVelocity = 1 / 2 ** 4

  elementToMotion = new Map<HTMLElement, Motion>()

  motionList: Motion[] = []

  needRebuild = false

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const motion = this.elementToMotion.get(entry.target as HTMLElement)!
      motion.extent.x = entry.borderBoxSize[0].inlineSize / 2
      motion.extent.y = entry.borderBoxSize[0].blockSize / 2
    }
  })

  animationFrame: number
  lastTime = 0

  test = 0

  constructor () {

  }

  addCard (card: EntityCard) {
    const entity = card.entity

    if (!entity.cardPosition) {
      entity.cardPosition = {
        x: 200 + 20 * this.test,
        y: 300 + 20 * this.test,
      }
    }
    this.test++

    const motion = {
      position: entity.cardPosition,
      velocity: { x: 0, y: 0 },
      extent: {
        x: card.element.offsetWidth / 2,
        y: card.element.offsetHeight / 2,
      },
    }

    this.elementToMotion.set(card.element, motion)
    this.resizeObserver.observe(card.element)

    this.needRebuild = true
    this.queueTick(true)
  }

  removeCard (card: EntityCard) {
    this.resizeObserver.unobserve(card.element)
    this.elementToMotion.delete(card.element)
  }

  queueTick (asMicrotask = false) {
    if (this.animationFrame) {
      return
    }
    if (asMicrotask) {
      queueMicrotask(() => this.tick())
      this.animationFrame = 1
    } else {
      this.animationFrame = requestAnimationFrame(() => this.tick())
      // this.animationFrame = setTimeout(() => this.tick(), 5)
    }
  }

  tick () {
    this.animationFrame = 0

    const elapsed = this.getElapsed()
    const list = this.getMotionList()

    for (let i = 0; i < list.length - 1; i++) {
      for (let j = i + 1; j < list.length; j++) {
        collide(list[i], list[j])
      }
    }

    let maxVelocity = -Infinity
    const vScale = this.velocityScale * elapsed * elapsed
    const vDamper = this.velocityDamping ** elapsed

    for (const motion of list) {
      maxVelocity = Math.max(maxVelocity,
          motion.velocity.x * motion.velocity.x + motion.velocity.y *
          motion.velocity.y)
      motion.position.x += motion.velocity.x * vScale
      motion.position.y += motion.velocity.y * vScale
      motion.velocity.x *= vDamper
      motion.velocity.y *= vDamper
    }

    for (const [element, { position }] of this.elementToMotion) {
      element.style.translate = `${position.x}px ${position.y}px`
    }

    if (maxVelocity < this.minVelocity) {
      return
    }

    this.queueTick()
  }

  getMotionList () {
    if (!this.needRebuild) {
      return this.motionList
    }
    this.needRebuild = false

    this.motionList = Array.from(this.elementToMotion.values())

    return this.motionList
  }

  getElapsed () {
    const time = performance.now()

    if (this.lastTime === 0) {
      this.lastTime = time
      return 1000 / 60
    }

    const elapsed = time - this.lastTime
    this.lastTime = time
    return elapsed
  }
}

function collide (a: Motion, b: Motion) {
  const xOverlap = Math.max(0,
      a.extent.x + b.extent.x - Math.abs(a.position.x - b.position.x))
  const yOverlap = Math.max(0,
      a.extent.y + b.extent.y - Math.abs(a.position.y - b.position.y))

  // not colliding
  if (!xOverlap || !yOverlap) {
    return
  }

  const totalOverlap = xOverlap + yOverlap
  const xOverlapPercent = 1 - xOverlap / totalOverlap
  const yOverlapPercent = 1 - yOverlap / totalOverlap

  let dx = a.position.x - b.position.x
  let dy = a.position.y - b.position.y
  const d = Math.sqrt(dx * dx + dy * dy)
  dx *= xOverlapPercent / d
  dy *= yOverlapPercent / d
  a.velocity.x += dx
  a.velocity.y += dy
  b.velocity.x -= dx
  b.velocity.y -= dy
}