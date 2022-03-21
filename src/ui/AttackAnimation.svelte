<script lang="ts">
  import { onMount, tick } from 'svelte'
  import AttackAction from '../actions/Attack'
  import { gameObjectToCard } from './stores'

  export let attack: AttackAction

  let container: HTMLElement

  onMount(async () => {
    document.body.appendChild(container)
    await tick()
    const from = gameObjectToCard.get(attack.object).getBoundingClientRect()
    const to = gameObjectToCard.get(attack.target).getBoundingClientRect()
    container.animate({
      transform: [
          `translate(${Math.round(from.x)}px, ${Math.round(from.y)}px`,
          `translate(${Math.round(to.x)}px, ${Math.round(to.y)}px`
      ]
    }, 2000)
  })

</script>

<div class='container' bind:this={container}>
  attack
</div>

<style>
  .container {
    position: fixed;
    top: 0;
    left: 0;
  }
</style>