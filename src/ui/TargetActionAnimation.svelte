<script lang="ts">
  import { onMount } from 'svelte'
  import { gameObjectToCard, mainElementContext, targetActionDuration } from './stores'
  import Action from '../behavior/Action'

  export let action: Action

  let container: HTMLElement

  const mainElement = mainElementContext.get()

  function getElementPos(from: HTMLElement, to: HTMLElement) {
    const fromBbox = from.getBoundingClientRect()
    const toBbox = to.getBoundingClientRect()
    const avgWidth = (fromBbox.width + toBbox.width) / 2
    const offset = avgWidth * (0.3 + 0.4 * Math.random())

    return {
      fromX: Math.round(fromBbox.x + offset),
      fromY: Math.round(fromBbox.y + fromBbox.height / 2),
      toX: Math.round(toBbox.x + offset),
      toY: Math.round(toBbox.y + toBbox.height / 2)
    }
  }

  onMount(async () => {
    mainElement.appendChild(container)
    const pos = getElementPos(gameObjectToCard.get(action.object), gameObjectToCard.get(action.target))

    container.animate({
      transform: [
        `translate(-50%, -50%) translate(${pos.fromX}px, ${pos.fromY}px`,
        `translate(-50%, -50%) translate(${pos.toX}px, ${pos.toY}px`
      ]
    }, {
      duration: targetActionDuration,
      fill: 'forwards',
      easing: 'ease-in-out'
    })

    container.animate([
      {opacity: 1, offset: 0.9},
      {opacity: 0}
    ], {
      duration: targetActionDuration,
      fill: 'forwards'
    })
  })

</script>

<div class='container' bind:this={container}>
  {action.name}
</div>

<style>
  .container {
    position: fixed;
    top: 0;
    left: 0;
  }
</style>