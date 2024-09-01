<script>
  import { onMount } from 'svelte';
  import InputFields from "./app-components/InputFields.svelte";
  import { api_url } from "./constants.js";
  import { prevInput } from './storePrevInput.js';
  import { tickerInput } from './storeTickerInput.js';
  import { processing } from './storeProcessing.js';
  import { bearer } from './storeBearer.js';
  import { result_cache_has_key, result_cache_get, result_cache_set, result_cache_delete_today_stock } from "./app-components/result_cache.js";
  import axios from "axios";
  
  $: userInputTicker = $tickerInput.ticker;
  $: password = $bearer.bearer;
  
  $: tickerSetDate = $tickerInput.tickerSetDate;
  $: if (tickerSetDate) {
      processInputIfSet();
  }

  let infos_ticker_name ="";
  
  let result_html = "";
  $: info_key_value_prev_input = $prevInput.info_key_value_prev_input;
  let info_key_value_running = false;
  
  onMount(async () => {
        await processInputIfSet();
    });

  async function processInputIfSet() {
    console.log("processInputIfSet start with input: ", userInputTicker);
    processing.startProcessing();
    try {
      if (userInputTicker) {
        await Promise.all([fetchInfoData()]);
      }
    } finally {
      processing.stopProcessing();
    }
  }
  async function fetchInfoData() {
    if (info_key_value_running || userInputTicker == info_key_value_prev_input) {
      return;
    }
    let main_data_key = "info_key_value_pairs";
    if(!result_cache_has_key(userInputTicker, main_data_key)) {
      info_key_value_running = true;
      try {
        if (userInputTicker != info_key_value_prev_input) {
          infos_ticker_name = "";
          result_html = 'Loading...';
        }
        console.log("userInputTicker:", userInputTicker);
        await axios.post('/api/fetch-info', { userInputTicker }).then(response => {
          console.log("response:", response);
          info_key_value_prev_input = userInputTicker;
          result_cache_set(userInputTicker, main_data_key, response.data);
        }).catch(error => {
          console.error("Error fetching data:", error);
          result_html = "Error fetching data: " + error;
        }).finally(() => {
          info_key_value_running = false;
        });
      } catch (error) {
        info_key_value_running = false;
        console.error("Error fetching data:", error);
      } 
    }
    if (result_cache_has_key(userInputTicker, main_data_key)) {
      result_html = result_cache_get(userInputTicker, main_data_key);
    }
  }

  function deleteTodaysCacheInputWithFieldsUpdate(event) {
    deleteTodaysCacheInput();
  }
</script>
<InputFields on:deleteTodaysCacheInputWithFieldsUpdate={deleteTodaysCacheInputWithFieldsUpdate} />
{#if userInputTicker != ""}
  <div class="row">
    <div class="col-12">
      <h3>Infos</h3>
    </div>
  </div>
  <div class="row contentrow infos">
    <div class="col-12">
      <p>{result_html}</p>
    </div>
  </div>
{/if}

<style>
  .infos.contentrow {
    background-color: lightgray;
  }
</style>
