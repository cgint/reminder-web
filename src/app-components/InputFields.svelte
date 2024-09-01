<script>
  import { onMount } from "svelte";
  import axios from "axios";
  import { api_url } from "../constants.js";
  import ProcessingText from "./ProcessingText.svelte";
  import { result_cache_delete_today_stock } from "./result_cache.js";
  import { bearer } from "../storeBearer.js";
  import { processing } from "../storeProcessing.js";
  import { tickerInput } from "../storeTickerInput.js";
  import { prevInput } from "../storePrevInput.js";

  let userInputTicker = "";
  let password = "";

  let delete_todays_cache_running = false;

  function triggerOnEnter(event) {
    if (event.key === "Enter") {
      processInputIfSet();
    }
  }
  function processInputIfSet() {
    console.log("URL entered:", userInputTicker); // Log the entered URL
    bearer.setBearer(password);
    tickerInput.setTicker(getInputForAction());
  }

  async function deleteTodaysCacheInput() {
    processing.startProcessing();
    try {
      if (userInputTicker) {
        await deleteTodaysCacheForStock();
      }
    } finally {
      processing.stopProcessing();
    }
  }
  function resetPrevInputValues() {
    prevInput.clear();
  }
  async function deleteTodaysCacheForStock() {
    if (delete_todays_cache_running) {
      return;
    }
    resetPrevInputValues();
    result_cache_delete_today_stock(userInputTicker);
    delete_todays_cache_running = true;
    try {
      await axios
        .delete(`${api_url}/cache/${userInputTicker}/today`, {
          headers: { password: password },
        })
        .then((response) => {
          console.log("response:", response);
        })
        .catch((error) => {
          console.error("Error deleting cache:", error);
        })
        .finally(() => {
          delete_todays_cache_running = false;
        });
    } catch (error) {
      delete_todays_cache_running = false;
      console.error("Error deleting cache:", error);
    }
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
    localStorage.setItem("userInputTicker", userInputTicker);
    localStorage.setItem("password", password);
  }
  function storePasswordAsBearer(password) {
    bearer.setBearer(password);
  }
  function fetchAndPutToInputUserFieldsFromStorage() {
    userInputTicker = localStorage.getItem("userInputTicker") || "";
    password = localStorage.getItem("password") || "";
  }

  function getInputForAction() {
    if (userInputTicker) {
      userInputTicker = userInputTicker.trim();
      storeUserFieldsInStorage(userInputTicker, password);
      storePasswordAsBearer(password);
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
</script>

<div class="row inputfields wide d-none d-md-block">
  <div class="col">
    <div class="row">
      <div class="col-auto">
        <input
          type="text"
          bind:value={userInputTicker}
          placeholder="https://..."
          on:keydown={triggerOnEnter}
          class="form-control"
        />
      </div>
      <div class="col-auto">
        <input
          type="password"
          bind:value={password}
          placeholder="Password"
          on:keydown={triggerOnEnter}
          class="form-control"
        />
      </div>
      <div class="col-auto">
        <button on:click={processInputIfSet} class="btn btn-primary"
          >Fetch Data</button
        >
      </div>
      {#if userInputTicker != ""}
        <div class="col-auto">
          <button on:click={deleteTodaysCacheInput} class="btn btn-warning"
            >Del stock cache today</button
          >
        </div>
      {/if}
      <ProcessingText />
    </div>
  </div>
</div>
<div class="row inputfields narrow d-block d-md-none">
  <div class="col-12">
    <div class="row">
      <div class="col-auto">
        <input
          type="text"
          bind:value={userInputTicker}
          placeholder="https://..."
          on:keydown={triggerOnEnter}
          class="form-control"
        />
      </div>
      <div class="col-auto">
        <button on:click={processInputIfSet} class="btn btn-primary"
          >Fetch Data</button
        >
      </div>
      <ProcessingText />
    </div>
  </div>
  <div class="row inputfields narrow d-block d-md-none">
    <div class="col-12">
      <div class="row">
        <div class="col-auto">
          <input
            type="password"
            bind:value={password}
            placeholder="Password"
            on:keydown={triggerOnEnter}
            class="form-control"
          />
        </div>
        {#if userInputTicker != ""}
          <div class="col-auto">
            <button on:click={deleteTodaysCacheInput} class="btn btn-warning"
              >Del stock cache today</button
            >
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
