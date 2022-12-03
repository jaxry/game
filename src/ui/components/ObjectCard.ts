import Component from './Component'
import { GameObject } from '../../GameObject'
import { isPlayer } from '../../behavior/player'
import ObjectInfo from './ObjectInfo'
import Action from '../../behavior/Action'
import ActionComponent from './ActionComponent'
import { dragAndDropGameObject, staggerStateChange } from './GameUI'
import { game } from '../../Game'
import { Effect } from '../../behavior/Effect'
import { isTickInProgress } from '../../behavior/core'
import TargetActionAnimation from './TargetActionAnimation'
import { borderRadius, boxShadow, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import GameComponent from './GameComponent'

const objectToCard = new WeakMap<GameObject, ObjectCard>()

export default class ObjectCard extends GameComponent {
  // private readonly actionContainer: HTMLElement
  private actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()

    objectToCard.set(object, this)

    this.element.classList.add(containerStyle)
    if (isPlayer(object)) {
      this.element.classList.add(playerStyle)
    }

    const icon = document.createElement('div')
    icon.classList.add(iconStyle)
    icon.textContent = object.type.icon
    this.element.append(icon)

    // this.actionContainer = $('div')
    // this.element.append(this.actionContainer)

    if (object.activeAction) {
      this.setAction(object.activeAction)
    }

    this.element.addEventListener('click', () => {
      if (game.player === object) {
        return
      }
      this.newComponent(ObjectInfo, object,
          this.element.getBoundingClientRect())
    })

    dragAndDropGameObject.drag(this.element, object, icon)

    this.on(game.event.playerTickEnd, () => this.update())

    this.newEffect(class extends Effect {
      onActivate () {
        this.onEvent(object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            this.reactivate()
          }
        })
        this.onEvent(object.container, 'itemActionStart', ({ action }) => {
          if (action.object !== this.object) {
            return
          }

          // If player starts a new action,
          // show action immediately even if outside of tick.
          action.object === game.player && !isTickInProgress() ?
              self.setAction(action) :
              staggerStateChange.add(() => self.setAction(action))

        })
        this.onEvent(object.container, 'itemActionEnd', ({ action }) => {
          if (action.object !== this.object) {
            return
          }
          staggerStateChange.add(() => self.clearAction())
          if (action.target && objectToCard.has(action.target)) {
            const to = objectToCard.get(action.target)!.element
            self.newComponent(TargetActionAnimation, action, self.element, to)
          }
        })
      }
    }, object)

    const self = this
  }

  setAction (action: Action) {
    if (this.actionComponent) {
      this.actionComponent.remove()
    }
    this.actionComponent = this.newComponent(ActionComponent, action)
    this.element.append(this.actionComponent.element)

    this.actionComponent.element.animate(
        { opacity: [0, 1] },
        { duration: duration.fast })
  }

  clearAction () {
    if (!this.actionComponent) {
      return
    }

    const component = this.actionComponent

    component.element.animate({
      opacity: 0,
    }, {
      duration: duration.fast,
    }).onfinish = () => {
      component.remove()
      if (this.actionComponent === component) {
        this.actionComponent = undefined
      }
    }
  }

  update () {
    this.actionComponent?.update()
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  alignItems: `center`,
  justifyContent: `space-between`,
  padding: `0.25rem`,
  background: colors.cyan['900'],
  boxShadow,
  borderRadius,
  userSelect: `none`,
})

makeStyle(`.${containerStyle}:hover`, {
  background: colors.cyan['800'],
})

const playerStyle = makeStyle({
  background: colors.green['700'],
})

const iconStyle = makeStyle({
  fontSize: `3rem`,
})