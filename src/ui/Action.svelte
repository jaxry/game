<script lang='ts'>
  import { Action } from '../behavior/Action'

  export let action: Action
</script>

<span class='action'>{action.name} ({action.time}s)</span>

<style>
  .action {
    text-transform: capitalize;
    color: var(--action);
  }
</style>