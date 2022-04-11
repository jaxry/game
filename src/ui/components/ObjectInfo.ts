import style from './ObjectInfo.module.css'
import { GameObject } from '../../GameObject'
import FloatingBox from './FloatingBox'
import { isPlayer } from '../../behavior/player'
import { setPlayerAction } from '../../behavior/core'
import WaitAction from '../../actions/Wait'
import $ from '../makeDomTree'

export default class ObjectInfo extends FloatingBox {
  constructor(object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(style.container)

    this.element.append(object.type.name)

    if (isPlayer(object)) {
      const wait = $('button', null, 'Wait')
      wait.addEventListener('click', () => {
        setPlayerAction(new WaitAction(object))
      })
      this.element.append(wait)
    }
  }
}