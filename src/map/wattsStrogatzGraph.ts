import spawnZone from './spawnZone'
import { connectZones } from '../behavior/connections'

export default function wattsStrogatzGraph (n = 50) {
  const zones = []
  for (let i = 0; i < n; i++) {
    zones.push(spawnZone())
  }

  for (let i = 0; i < n; i++) {
    connectZones(zones[i], zones[(i + 1) % n])
    if (Math.random() < 0.5) {
      connectZones(zones[i], zones[(i + 2) % n])
    }
    if (Math.random() < 0.25) {
      connectZones(zones[i], zones[(i + 3) % n])
    }
  }

  // for (const zone of zones) {
  //   for (const connection of zone.connections) {
  //     if (Math.random() < 0.2) {
  //       disconnectZones(zone, connection)
  //     }
  //   }
  // }

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.random() < 0.001) {
        connectZones(zones[i], zones[j])
      }
    }
  }

  return zones[0]
}