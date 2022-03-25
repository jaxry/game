<script lang='ts'>
  import Action from '../behavior/Action'

  export let action: Action
</script>

<span class='action'>
  <span class='name'>{action.name}</span>

  {#if action.target}
    <span class='target'>{action.target.type.name}</span>
  {/if}

  <span class='time'>
    {action.time}s
  </span>

</span>

<style>
  .name, .time {
    text-transform: capitalize;
    color: var(--action);
  }
</style>