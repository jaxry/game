import spawnZone from './spawnZone'
import { connectZones, disconnectZones } from '../behavior/connections'
import GameObject from '../GameObject'
import { game } from '../Game'
import { randomElement } from '../util'
import Point from '../Point'

export default function growMapTri () {
  const zones = [spawnZone(), spawnZone(), spawnZone()]

  connectZones(zones[0], zones[1])
  connectZones(zones[1], zones[2])
  connectZones(zones[2], zones[0])

  setInterval(() => {
    const tri = findTri(zones)
    if (tri) {
      subdivideTri(tri[0], tri[1], tri[2], zones)
    }

    game.event.worldModified.emit()
  }, 2000)

  return zones[0]
}

function subdivideTri (
    z1: GameObject, z2: GameObject, z3: GameObject, zones: GameObject[]) {
  disconnectZones(z1, z2)
  disconnectZones(z2, z3)
  disconnectZones(z3, z1)

  const z4 = spawnZone()
  setAveragePosition(z1.position, z2.position, z4.position)

  const z5 = spawnZone()
  setAveragePosition(z2.position, z3.position, z5.position)

  const z6 = spawnZone()
  setAveragePosition(z3.position, z1.position, z6.position)

  zones.push(z4, z5, z6)

  function connect (a: GameObject, b: GameObject) {
    connectZones(a, b, false)
  }

  connect(z4, z5)
  connect(z5, z6)
  connect(z6, z4)

  connect(z1, z4)
  connect(z2, z4)

  connect(z2, z5)
  connect(z3, z5)

  connect(z3, z6)
  connect(z1, z6)
}

function findTri (zones: GameObject[]) {
  const z1 = randomElement(zones)
  const z2 = randomElement(z1.connections.filter(z => z.connections.length > 1))

  if (!z2) {
    return
  }

  const z3 = randomElement(z2.connections.filter(z =>
      z !== z1 && z.connections.includes(z1)))

  if (!z3) {
    return
  }

  return [z1, z2, z3]
}

function setAveragePosition (p1: Point, p2: Point, target: Point) {
  target.x = (p1.x + p2.x) / 2
  target.y = (p1.y + p2.y) / 2
}