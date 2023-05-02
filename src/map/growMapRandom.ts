import GameObject from '../GameObject'
import { connectZones } from '../behavior/connections'
import { game } from '../Game'
import { randomElement } from '../util'
import spawnZone from './spawnZone'

export default function growMapRandom () {
  const first = spawnZone()
  const zones = [first, spawnZone()]
  connectZones(zones[0], zones[1])

  setInterval(() => {
    if (Math.random() < 0.2) {
      connectExistingZone(zones) || addZone(zones)
    } else {
      addZone(zones)
    }
    game.event.worldModified.emit()
  }, 500)

  return first
}

function addZone (zones: GameObject[]) {
  const newZone = spawnZone()
  zones.push(newZone)
  connectZones(randomElement(zones), newZone)
}

function connectExistingZone (zones: GameObject[]) {
  const zone = randomElement(zones)

  const forbidden = new Set([zone, ...zone.connections])

  let neighbor = randomElement(zone.connections.filter(
      z => z.connections.length > 1))
  if (!neighbor) {
    return false
  }

  let connectingZone = randomElement(
      neighbor.connections.filter(z => !forbidden.has(z)))

  while (connectingZone && Math.random() < 0.25) {
    const next = randomElement(
        connectingZone.connections.filter(z => !forbidden.has(z)))
    if (!next) {
      break
    }
    forbidden.add(connectingZone)
    connectingZone = next
  }

  if (!connectingZone) {
    console.log('no')
    return false
  }
  connectZones(zone, connectingZone)
  return true
}
