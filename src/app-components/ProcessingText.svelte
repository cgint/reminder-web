<script>
  import { processing } from "../storeProcessing.js";
  $: processingValue = $processing.processingValue;
  $: processingCount = $processing.processingCount;
</script>

<div class="col-auto processingtext">
  {#if processingValue != ""}
    <div class="spinner-grow spinner-grow-sm" role="status">
      <span class="visually-hidden">({processingCount}) loading ...</span>
    </div>
    {processingCount} loading ...
  {/if}
</div>

<style>
  .processingtext {
    padding-top: 6px;
    padding-left: 0px;
    color: darkgray;
  }
</style>
