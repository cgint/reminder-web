<script>
  import { onMount } from "svelte";
  import ProcessingText from "./ProcessingText.svelte";
  export let processingValue, processingCount;
  let userInputTicker = "";
  let password = "";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function triggerOnEnter(event) {
    if (event.key === "Enter") {
      processInputIfSet();
    }
  }
  function processInputIfSet() {
    dispatch("processInputIfSetWithFieldsUpdate", {userInputTicker: getUpperCaseInputForAction(), password: password});
  }
  function deleteTodaysCacheInput() {
    dispatch("deleteTodaysCacheInputWithFieldsUpdate", {userInputTicker: getUpperCaseInputForAction(), password: password});
  }
  function formInputChangeAnyField() {
    dispatch("formInputChange", {userInputTicker: getUpperCaseInputForAction(), password: password});
  }

  onMount(() => {
    fetchAndPutToInputUserFieldsFromStorage();
    const urlParams = new URLSearchParams(window.location.search);
    const ticker = urlParams.get("ticker");
    if (ticker) {
      userInputTicker = ticker;
    }
    processInputIfSet();
    focus_on_ticker_input();
  });

  function storeUserFieldsInStorage(userInputTicker, password) {
    localStorage.setItem('userInputTicker', userInputTicker);
    localStorage.setItem('password', password);
  }
  function fetchAndPutToInputUserFieldsFromStorage() {
    userInputTicker = localStorage.getItem('userInputTicker') || "";
    password = localStorage.getItem('password') || "";
  }

  function getUpperCaseInputForAction() {
    if (userInputTicker) {
      userInputTicker = userInputTicker.toUpperCase().trim();
      storeUserFieldsInStorage(userInputTicker, password);
    }
    return userInputTicker;
  }
  function focus_on_ticker_input() {
    const input = document.querySelector("input");
    if (input) {
      input.focus();
      input.select();
    }
  }
  // Add event listener to set focus on input when 'f' key is pressed
  window.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.key === "/") {
      focus_on_ticker_input();
      event.preventDefault();
    }
  });
</script>
<div class="row inputfields wide d-none d-md-block">
  <div class="col">
    <div class="row">
      <div class="col-auto">
        <input type="text" on:change={formInputChangeAnyField} bind:value={userInputTicker} placeholder="'VZ', 'T', ..." on:keydown={triggerOnEnter} class="form-control" />
      </div>
      <div class="col-auto">
        <input type="password" bind:value={password} placeholder="Password" on:keydown={triggerOnEnter} class="form-control" />
      </div>
      <div class="col-auto">
        <button on:click={processInputIfSet} class="btn btn-primary">Fetch Data</button>
      </div>
      {#if userInputTicker != ""}
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
        <input type="text" bind:value={userInputTicker} placeholder="Ticker-Symbol 'T', ..." on:keydown={triggerOnEnter} class="form-control" />
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
          <input type="password" bind:value={password} placeholder="Password" on:keydown={triggerOnEnter} class="form-control" />
        </div>
        {#if userInputTicker != ""}
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

