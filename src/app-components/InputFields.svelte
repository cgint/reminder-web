<script>
  import { onMount } from "svelte";
  import ProcessingText from "./ProcessingText.svelte";
  export let processingValue, processingCount;
  let userInput = "";
  let password = "";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      processInputIfSet();
    }
  }
  function processInputIfSet() {
    dispatch("processInputIfSetWithFieldsUpdate", {userInput: getUpperCaseInputForAction(), password: password});
  }
  function deleteTodaysCacheInput() {
    dispatch("deleteTodaysCacheInputWithFieldsUpdate", {userInput: getUpperCaseInputForAction(), password: password});
  }
  function formInputChangeAnyField() {
    dispatch("formInputChange", {userInput: getUpperCaseInputForAction(), password: password});
  }

  onMount(() => {
    fetchAndPutToInputUserFieldsFromStorage();
    const urlParams = new URLSearchParams(window.location.search);
    const ticker = urlParams.get("ticker");
    if (ticker) {
      userInput = ticker;
    }
    processInputIfSet();
    focus_on_ticker_input();
  });

  function storeUserFieldsInStorage(userInput, password) {
    localStorage.setItem('userInput', userInput);
    localStorage.setItem('password', password);
  }
  function fetchAndPutToInputUserFieldsFromStorage() {
    userInput = localStorage.getItem('userInput') || "";
    password = localStorage.getItem('password') || "";
  }

  function getUpperCaseInputForAction() {
    if (userInput) {
      userInput = userInput.toUpperCase().trim();
      storeUserFieldsInStorage(userInput, password);
    }
    return userInput;
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
        <input type="text" on:change={formInputChangeAnyField} bind:value={userInput} placeholder="'VZ', 'T', ..." on:keydown={handleKeyDown} class="form-control" />
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

