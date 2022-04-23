import '../global.css'
import style from './Game.module.css'
import Component from './Component'
import $ from '../makeDomTree'
import { game } from '../../Game'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { Effect } from '../../behavior/Effect'
import Zone from './Zone'
import { interruptPlayerLoop, startGameLoop } from '../../behavior/core'
import TimeComponent from './Time'

export const outsideElem = document.createElement('div')

export default class AppComponent extends Component {
  constructor(element: HTMLElement) {
    super(element)

    const time = this.newComponent(TimeComponent)

    const map = this.setupMap()

    //setup zone
    const zone = this.newComponent(Zone)

    $(element, style.game, [
      [
        'div', style.global, [
        time,
      ]],
      [zone, style.zone],
      [map, style.map],
      outsideElem
    ])

    startGameLoop()

    function visibilityChange() {
      if (document.hidden){
        interruptPlayerLoop()
      } else {
        startGameLoop()
      }
    }
    document.addEventListener('visibilitychange', visibilityChange);
    this.onDestroy(() => {
      document.removeEventListener('visibilitychange', visibilityChange)
    })
  }

  private setupMap() {
    const map = this.newComponent(MapComponent)

    map.onZoneClick = playerTravelToZone

    setTimeout(() => map.update(game.player.container))

    this.newEffect(class extends Effect {
      onActivate() {
        this.onEvent(this.object, 'move', () => {
          map.update(this.object.container)
        })
      }
    }, game.player)

    return map
  }
}