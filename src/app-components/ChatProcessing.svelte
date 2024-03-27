<script>
    export let processingValue;
</script>

<div class="col-auto processingtext">
    {#if processingValue != ""}
        <div class="spinner-grow spinner-grow-sm" role="status">
            <span class="visually-hidden">{processingValue}</span>
        </div>
        {processingValue}
    {/if}
</div>

<style>
  .processingtext {
    padding-top: 6px;
    padding-left: 0px;
    color: darkgray;
  }
</style>

