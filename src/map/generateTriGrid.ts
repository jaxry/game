import spawnZone from './spawnZone'
import { connectZones } from '../behavior/connections'
import { renderedConnectionDistance } from './ForceDirectedSim'
import GameObject from '../GameObject'

const triHeight = Math.sqrt(3) / 2

export default function generateTriGrid (rows: number) {
  const zones = []

  function connect (a: GameObject, b: GameObject) {
    if (Math.random() < 0.5) {
      connectZones(a, b)
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {

      const z = spawnZone()
      if (c > 0) {
        connect(zones.at(-1)!, z)
      }
      if (c > 0 && r > 0) {
        connect(zones.at(-r - 1)!, z)
      }
      if (c < r && r > 0) {
        connect(zones.at(-r)!, z)
      }

      z.position.x = renderedConnectionDistance * (-0.5 * r + c)
      z.position.y = renderedConnectionDistance * r * triHeight

      zones.push(z)
    }
  }
  
  return zones
}
