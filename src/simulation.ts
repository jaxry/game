import CustomEvent from './CustomEvent'
import Array2d from './Array2d'
import GameObject from './GameObject'

export interface Wall {
  x: number
  y: number
}

const width = 32
const height = 32

export const walls = new Array2d<Wall | null>(width, height, null)
export const grid = new Array2d<GameObject | null>(width, height, null)
export const gameObjects = new Set<GameObject>()
export const worldTick = new CustomEvent<void>()

const radius = 0.4

for (let i = 0; i < 50; i++) {
  const object = new GameObject()
  object.position.x = Math.random() * width
  object.position.y = Math.random() * height
  object.velocity.x = 0.02 * (Math.random() - 0.5)
  object.velocity.y = 0.02 * (Math.random() - 0.5)

  addGameObject(object)
}

for (const [x, y] of walls.iter2d()) {
  if (Math.random() < 0.1) {
    walls.set(x, y, { x, y })
  }
}


// walls.set(3, 3, { x: 3, y: 3 })
//
// const objy1 = new GameObject()
// objy1.position.set(2, 3)
// objy1.velocity.set(0.01, 0.01)
// addGameObject(objy1)
//
// const objy2 = new GameObject()
// objy2.position.set(3, 4)
// objy2.velocity.set(-0.01, -0.01)
// addGameObject(objy2)


function resolveBorderCollisions(object: GameObject) {
  if (object.position.x < radius || object.position.x > width - radius) {
    object.velocity.x = -object.velocity.x
  }
  if (object.position.y < radius || object.position.y > height - radius) {
    object.velocity.y = -object.velocity.y
  }
}

function elasticWallCollision(object: GameObject, x: number, y: number) {
  const dx = object.position.x - x
  const dy = object.position.y - y

  const orientation = dx * object.velocity.x + dy * object.velocity.y

  if (orientation >= 0) {
    return
  }

  const cornerDx = dx - Math.sign(dx) * 0.5
  const cornerDy = dy - Math.sign(dy) * 0.5
  const cornerDist2 = cornerDx * cornerDx + cornerDy * cornerDy

  const elasticity = 1

  if (Math.abs(dx) <= 0.5) {
    object.velocity.y *= -elasticity
    // object.position.y = y + Math.sign(dy) * (0.5 + radius)
  } else if (Math.abs(dy) <= 0.5) {
    object.velocity.x *= -elasticity
    // object.position.x = x + Math.sign(dx) * (0.5 + radius)
  } else if (cornerDist2 < radius * radius) {
    const scale =
        (1 + elasticity) * (object.velocity.x * cornerDx + object.velocity.y * cornerDy) /
        (cornerDx * cornerDx + cornerDy * cornerDy)

    object.velocity.x -= scale * cornerDx
    object.velocity.y -= scale * cornerDy

    // const cornerDist = Math.sqrt(cornerDist2)
    // object.position.x += -cornerDx + cornerDx / cornerDist * radius
    // object.position.y += -cornerDy + cornerDy / cornerDist * radius
  } else {
    return
  }

  // object.velocity.x *= 0
  // object.velocity.y *= 0
}

function resolveWallCollisions(object: GameObject) {
  const top = Math.round(object.position.y - radius)
  const bottom = Math.round(object.position.y + radius)
  const left = Math.round(object.position.x - radius)
  const right = Math.round(object.position.x + radius)

  for (let x = left; x <= right; x++) {
    for (let y = top; y <= bottom; y++) {
      if (!walls.get(x, y)) {
        continue
      }
      elasticWallCollision(object, x, y)
    }
  }
}

function elasticCircleCollision(o1: GameObject, o2: GameObject) {
  const dx = o1.position.x - o2.position.x
  const dy = o1.position.y - o2.position.y
  const dist2 = dx * dx + dy * dy
  const minDistance = 2 * radius
  if (dist2 > minDistance * minDistance) {
    return
  }

  const dvx = o1.velocity.x - o2.velocity.x
  const dvy = o1.velocity.y - o2.velocity.y

  const dot = dx * dvx + dy * dvy

  if (dot > 0) {
    return
  }

  const elasticity = 1

  const changeX = (0.5 + 0.5 * elasticity) * dot * dx / dist2
  const changeY = (0.5 + 0.5 * elasticity) * dot * dy / dist2
  //
  o1.velocity.x -= changeX
  o1.velocity.y -= changeY

  o2.velocity.x += changeX
  o2.velocity.y += changeY

  // const overlap = Math.sqrt(dist2) - 2 * radius
  // const dist = Math.sqrt(dist2)
  // o1.position.x -= dx / dist * overlap * 0.5
  // o1.position.y -= dy / dist * overlap * 0.5
  // o2.position.x += dx / dist * overlap * 0.5
  // o2.position.y += dy / dist * overlap * 0.5
}

function collideWithCell(object: GameObject, x: number, y: number) {
  let neighbor = grid.get(x, y)

  while (neighbor) {
    if (neighbor !== object) {
      elasticCircleCollision(object, neighbor)
    }
    neighbor = neighbor.cellAfter
  }
}

function resolveCircleCollisions(object: GameObject) {
  const x = Math.floor(object.position.x)
  const y = Math.floor(object.position.y)

  collideWithCell(object, x, y)
  if (x + 1 <= width) collideWithCell(object, x + 1, y)
  if (y + 1 <= height) collideWithCell(object, x, y + 1)
  if (x + 1 <= width && y + 1 <= height) collideWithCell(object, x + 1, y + 1)
  if (x + 1 <= width && y - 1 >= 0) collideWithCell(object, x + 1, y - 1)
}

function addGameObject(object: GameObject) {
  gameObjects.add(object)
  insertIntoGrid(object)
}

function insertIntoGrid(
    object: GameObject,
    x = Math.floor(object.position.x),
    y = Math.floor(object.position.y)
) {
  const neighbor = grid.get(x, y)
  if (neighbor) {
    object.cellAfter = neighbor
    neighbor.cellBefore = object
  }
  grid.set(x, y, object)
}

function removeFromGrid(object: GameObject,
    x = Math.floor(object.position.x),
    y = Math.floor(object.position.y)
) {

  if (object.cellBefore) {
    object.cellBefore.cellAfter = object.cellAfter
  } else {
    grid.set(x, y, object.cellAfter)
  }

  if (object.cellAfter) {
    object.cellAfter.cellBefore = object.cellBefore
  }

  object.cellBefore = null
  object.cellAfter = null
}

function updateGrid(object: GameObject) {
  const x = Math.floor(object.position.x)
  const y = Math.floor(object.position.y)

  // TODO: store previous position directly
  const prevX = Math.floor(object.position.x - object.velocity.x)
  const prevY = Math.floor(object.position.y - object.velocity.y)

  if (x !== prevX || y !== prevY) {
    removeFromGrid(object, prevX, prevY)
    insertIntoGrid(object, x, y)
  }
}

function computeMotion(gameObject: GameObject) {
  const dt = 0.01
  const tempX = gameObject.position.x
  const tempY = gameObject.position.y

  gameObject.position.x +=
      gameObject.velocity.x + gameObject.acceleration.x * dt * dt
  gameObject.position.y +=
      gameObject.velocity.y + gameObject.acceleration.y * dt * dt

  gameObject.velocity.x = gameObject.position.x - tempX
  gameObject.velocity.y = gameObject.position.y - tempY

}

function tick() {
  for (const object of gameObjects) {
    resolveBorderCollisions(object)
    resolveWallCollisions(object)
    resolveCircleCollisions(object)
    computeMotion(object)
    updateGrid(object)
  }
  worldTick.emit()
  // setTimeout(tick, 100)
  requestAnimationFrame(tick)
}

tick()
