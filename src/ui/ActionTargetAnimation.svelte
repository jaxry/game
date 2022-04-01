<script lang="ts" context="module">
  let offset = 1 / 3
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import type Action from '../behavior/Action'
import type ObjectCard from './ObjectCard.svelte';

  export let action: Action
  export let duration: number
  export let from: ObjectCard
  export let to: ObjectCard
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

  onMount(() => {
    const pos = getElementPos(from.getContainer(), to.getContainer())

    container.animate({
      transform: [
        `translate(-50%, -50%) translate(${pos.fromX}px, ${pos.fromY}px`,
        `translate(-50%, -50%) translate(${pos.toX}px, ${pos.toY}px`
      ]
    }, {
      duration,
      fill: 'forwards',
      easing: 'cubic-bezier(0.5,0,0,1)'
    })

    container.animate([
      {opacity: 1, offset: 0.9},
      {opacity: 0}
    ], {
      duration,
      fill: 'forwards'
    })

    setTimeout(destroy, duration)

    offset = 1 - offset
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