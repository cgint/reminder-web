<script>
  import ProcessingText from "./ProcessingText.svelte";
  export let userInput, password, processingValue, processingCount;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      processInputIfSet();
    }
  }
  function processInputIfSet() {
    dispatch("processInputIfSetWithInput", {userInput, password});
  }
  function deleteTodaysCacheInput() {
    dispatch("deleteTodaysCacheInput");
  }
</script>
<div class="row inputfields wide d-none d-md-block">
  <div class="col">
    <div class="row">
      <div class="col-auto">
        <input type="text" bind:value={userInput} placeholder="'VZ', 'T', ..." on:keydown={handleKeyDown} class="form-control" />
      </div>
      <div class="col-auto">
        <input type="password" bind:value={password} placeholder="Password" on:keydown={handleKeyDown} class="form-control" />
      </div>
      <div class="col-auto">
        <button on:click={processInputIfSet} class="btn btn-primary">Fetch Data</button>
      </div>
      {#if userInput != ""}
        <div class="col-auto">
          <button on:click={deleteTodaysCacheInput} class="btn btn-warning">Del stock cache today</button>
        </div>
      {/if}
      <ProcessingText processingValue={processingValue} processingCount={processingCount} />
    </div>
  </div>
</div>
<div class="row inputfields narrow d-block d-md-none">
  <div class="col-12">
    <div class="row">
      <div class="col-auto">
        <input type="text" bind:value={userInput} placeholder="Ticker-Symbol 'T', ..." on:keydown={handleKeyDown} class="form-control" />
      </div>
      <div class="col-auto">
        <button on:click={processInputIfSet} class="btn btn-primary">Fetch Data</button>
      </div>
      <ProcessingText processingValue={processingValue} processingCount={processingCount} />
    </div>
  </div>
  <div class="row inputfields narrow d-block d-md-none">
    <div class="col-12">
      <div class="row">
        <div class="col-auto">
          <input type="password" bind:value={password} placeholder="Password" on:keydown={handleKeyDown} class="form-control" />
        </div>
        {#if userInput != ""}
        <div class="col-auto">
          <button on:click={deleteTodaysCacheInput} class="btn btn-warning">Del stock cache today</button>
        </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  div.inputfields {
    margin-top: 5px;
  }
  div.inputfields input {
    width: 5em;
  }
</style>

