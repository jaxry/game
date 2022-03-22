<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { gameObjectToCard, mainElementContext } from './stores'
  import Action from '../behavior/Action'

  export let action: Action

  let container: HTMLElement

  const mainElement = mainElementContext.get()

  function getElementPos(from: HTMLElement, to: HTMLElement) {
    const fromBbox = from.getBoundingClientRect()
    const toBbox = to.getBoundingClientRect()
    const offset = 0.2 + 0.8 * Math.random() * (fromBbox.width + toBbox.width) / 2
    return {
      fromX: Math.round(fromBbox.x + offset),
      fromY: Math.round(fromBbox.y + fromBbox.height / 2),
      toX: Math.round(toBbox.x + offset),
      toY: Math.round(toBbox.y + toBbox.height / 2)
    }
  }

  onMount(async () => {
    mainElement.appendChild(container)
    await tick()
    const pos = getElementPos(gameObjectToCard.get(action.object), gameObjectToCard.get(action.target))
    container.animate({
      transform: [
        `translate(-50%, -50%) translate(${pos.fromX}px, ${pos.fromY}px`,
        `translate(-50%, -50%) translate(${pos.toX}px, ${pos.toY}px`
      ]
    }, {
      duration: 2000,
      fill: 'forwards',
      easing: 'ease-in-out'
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
    transform: translate(-50%, -50%);
    transform-origin: center center;
  }
</style>