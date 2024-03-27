<script>
  import { onMount } from 'svelte';
  import InputFields from "./app-components/InputFields.svelte";
  import InfoKeyValue from "./app-components/InfoKeyValue.svelte";
  import ChartGraphs from "./app-components/ChartGraphs.svelte";
  import LinkNews from "./app-components/LinkNews.svelte";
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
  let info_graphs = "";
  
  let info_key_value_pairs = {};
  $: info_key_value_prev_input = $prevInput.info_key_value_prev_input;
  let info_key_value_running = false;
  
  let activeInfoNewsChat = "info";
  
  onMount(async () => {
        await processInputIfSet();
    });

  async function processInputIfSet() {
    console.log("processInputIfSet start with input: ", userInputTicker);
    processing.startProcessing();
    try {
      if (userInputTicker) {
        await Promise.all([createSaticInfoGraphs(), fetchInfoData()]);
      }
    } finally {
      processing.stopProcessing();
    }
  }
  async function createSaticInfoGraphs() {
    info_graphs = "";
    let img_style = 'style="width: 100%; height: auto; padding-top: 5px;"';
    info_graphs += `<a href="https://finviz.com/quote.ashx?t=${userInputTicker}&p=m" target="_blank"><img ${img_style} src="https://charts2-node.finviz.com/chart.ashx?cs=m&t=${userInputTicker}&tf=d&s=linear&ct=candle_stick"/></a>`;
    let history_graph_12m_url = `${api_url}/image/history/${userInputTicker}/period/12mo`;
    info_graphs += `<a href="${history_graph_12m_url}" target="_blank"><img ${img_style} src="${history_graph_12m_url}"/></a>`;
    
    let history_graph_24m_url = `${api_url}/image/history/${userInputTicker}/period/24mo`;
    info_graphs += `<a href="${history_graph_24m_url}" target="_blank"><img ${img_style} src="${history_graph_24m_url}"/></a>`;
    let history_graph_400m_url = `${api_url}/image/history/${userInputTicker}/period/400mo`;
    info_graphs += `<a href="${history_graph_400m_url}" target="_blank"><img ${img_style} src="${history_graph_400m_url}"/></a>`;
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
          info_key_value_pairs = {'Loading.': 'Please wait...'};
        }
        await axios.get(
          `${api_url}/data/${userInputTicker}`, { headers: { 'password': password } }
        ).then(response => {
          console.log("response:", response);
          info_key_value_prev_input = userInputTicker;
          result_cache_set(userInputTicker, main_data_key, JSON.stringify(response.data));
          result_cache_set(userInputTicker, "infos_ticker_name", ` for ${response.data['shortName']} (${userInputTicker})`);
        }).catch(error => {
          console.error("Error fetching data:", error);
          info_key_value_pairs = {'Error:': "Error fetching data: " + error};
        }).finally(() => {
          info_key_value_running = false;
        });
      } catch (error) {
        info_key_value_running = false;
        console.error("Error fetching data:", error);
      } 
    }
    if (result_cache_has_key(userInputTicker, main_data_key)) {
      info_key_value_pairs = JSON.parse(result_cache_get(userInputTicker, main_data_key));
      infos_ticker_name = result_cache_get(userInputTicker, "infos_ticker_name");
    }
  }

  function sectionActivated(event) {
    let selectedSection = event.detail.selectedSection;
    if (activeInfoNewsChat != selectedSection) {
      activeInfoNewsChat = selectedSection;
      if (selectedSection != "chat") {
        processInputIfSet();
      }
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
      <h3>Infos{infos_ticker_name}</h3>
    </div>
  </div>
  <div class="row contentrow infos">
    <InfoKeyValue info_key_value_pairs={info_key_value_pairs} />
    <ChartGraphs info_graphs={info_graphs} />
    <LinkNews
      on:sectionActivated={sectionActivated}
      userInputTicker={userInputTicker}
      activeInfoNewsChat={activeInfoNewsChat}
    />
  </div>
{/if}

<style>
  .infos.contentrow {
    background-color: lightgray;
  }
</style>
