<script lang='ts'>
  import { onMount } from 'svelte'
  import { movePlayerToZone } from '../behavior/player'
  import MapRenderer from './MapRenderer'
  import { game } from './stores'

  let mapContainer: HTMLDivElement
  let map: MapRenderer

  onMount(() => {
    map = new MapRenderer(mapContainer)
    map.player = $game.player
    map.initMap($game.player.container)
    map.onZoneClicked = (area => {
      movePlayerToZone(area)
      // $selectedObject = area
    })
  })

  $: {
    $game
    map?.update()
  }

</script>

<svelte:window on:resize={() => map?.update() }/>

<div bind:this={mapContainer} class='map'/>

<style>
  .map {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>