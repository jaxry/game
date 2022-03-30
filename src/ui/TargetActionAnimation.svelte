<script lang="ts" context="module">
  let offset = 1 / 3
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { gameObjectToCard, targetActionDuration } from './stores'
  import Action from '../behavior/Action'

  export let action: Action
  export let duration: number
  export let delay: number
  export let destroy: () => void

  let container: HTMLElement

  function getElementPos(from: HTMLElement, to: HTMLElement) {
    const fromBbox = from.getBoundingClientRect()
    const toBbox = to.getBoundingClientRect()

    return {
      fromX: Math.round(fromBbox.x + offset * fromBbox.width),
      fromY: Math.round(fromBbox.y + fromBbox.height / 2),
      toX: Math.round(toBbox.x + offset * toBbox.width),
      toY: Math.round(toBbox.y + toBbox.height / 2)
    }
  }

  offset = 1 - offset

  onMount(() => {
    const pos = getElementPos(gameObjectToCard.get(action.object), gameObjectToCard.get(action.target))

    container.animate({
      transform: [
        `translate(-50%, -50%) translate(${pos.fromX}px, ${pos.fromY}px`,
        `translate(-50%, -50%) translate(${pos.toX}px, ${pos.toY}px`
      ]
    }, {
      duration,
      delay,
      fill: 'forwards',
      easing: 'cubic-bezier(0.5,0,0,1)'
    })

    container.animate([
      {opacity: 1, offset: 0.9},
      {opacity: 0}
    ], {
      duration,
      delay,
      fill: 'forwards'
    })

    setTimeout(() => {
      container.style.display = 'initial'
    }, delay)
    setTimeout(destroy, delay + duration)
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
    display: none;
  }
</style>