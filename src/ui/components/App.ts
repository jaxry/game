import '../global.css'
import style from './App.module.css'
import Component from './Component'
import $ from '../makeDomTree'
import { game } from '../../Game'
import MapComponent from './Map'
import { playerTravelToZone } from '../../behavior/player'
import { Effect } from '../../behavior/Effect'
import Zone from './Zone'

export default class AppComponent extends Component {
  constructor(element: HTMLElement) {
    super(element)

    // setup game time
    let time = $('h2')
    function setTime() {
      time.textContent = game.time.getTimeOfDay()
    }

    setTime()
    this.on(game.event.playerTick, () => {
      setTime()
    })

    // setup map
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

    //setup zone
    const zone = this.newComponent(Zone)

    $(element, style.game, [
      [
        'div', style.global, [
        time,
      ]],
      [zone, style.zone],
      [map, style.map],
    ])
  }
}