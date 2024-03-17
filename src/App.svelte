<script>
  import { onMount } from "svelte";
  import axios from "axios";

  let api_url = import.meta.env.VITE_BACKEND_URL;
  
  let userInput = "";
  let password = "";
  let info_links = "";
  let info_graphs = "";
  let gpt_analysis = "";
  let gpt_info = "";
  let keyValuePairs = {};
  let processing = false;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticker = urlParams.get("ticker");
    if (ticker) {
      userInput = ticker;
      processInput();
    }
    focus_on_ticker_input();
  });

  async function processInput() {
    processing = true;
    try {
      if (userInput) {
        userInput = userInput.toUpperCase();
        await Promise.all([createInfoLinks(), createInfoGraphs(), fetchData(), gptAnalysis()]);
      }
    } finally {
      processing = false;
    }
  }
  async function deleteTodaysCacheInput() {
    processing = true;
    try {
      if (userInput) {
        userInput = userInput.toUpperCase();
        await deleteTodaysCache()
      }
    } finally {
      processing = false;
    }
  }
  async function createInfoLinks() {
    let curtimeEpoch = Math.floor(Date.now() / 1000);
    let linksToCreate = {
      FinViz: `https://finviz.com/quote.ashx?t=${userInput}&p=m`,
      "Yahoo Details": `https://finance.yahoo.com/quote/${userInput}`,
      "Yahoo Analysis": `https://finance.yahoo.com/quote/${userInput}/analysis`,
      "Yahoo Historic Dividends": `https://finance.yahoo.com/quote/${userInput}/history?period1=345427200&period2=${curtimeEpoch}&interval=capitalGain%7Cdiv%7Csplit&filter=div&frequency=1d&includeAdjustedClose=true`,
      "Yahoo Lookup": `https://finance.yahoo.com/lookup?s=${userInput}`,
      "Danelfin": `https://danelfin.com/stock/${userInput}`,
    };

    info_links = "";
    for (let link in linksToCreate) {
      info_links += `<a href="${linksToCreate[link]}" target="_blank">${link} for '${userInput}'</a><br/>`;
    }
  }
  async function createInfoGraphs() {
    info_graphs = "";
    info_graphs += `<a href="https://finviz.com/quote.ashx?t=${userInput}&p=m" target="_blank"><img src="https://charts2-node.finviz.com/chart.ashx?cs=m&t=${userInput}&tf=d&s=linear&ct=candle_stick"/></a>`;
    let history_graph_12m_url = `${api_url}/image/history/${userInput}/period/12mo`;
    info_graphs += `<a href="${history_graph_12m_url}" target="_blank"><img src="${history_graph_12m_url}" width="324px"/></a>`;
    let history_graph_24m_url = `${api_url}/image/history/${userInput}/period/24mo`;
    info_graphs += `<a href="${history_graph_24m_url}" target="_blank"><img src="${history_graph_24m_url}" width="324px"/></a>`;
    let history_graph_400m_url = `${api_url}/image/history/${userInput}/period/400mo`;
    info_graphs += `<a href="${history_graph_400m_url}" target="_blank"><img src="${history_graph_400m_url}" width="324px"/></a>`;
  }
  async function fetchData() {
    try {
      keyValuePairs = {'Loading.': 'Please wait...'};
      axios.get(
        `${api_url}/data/${userInput}`, { headers: { 'password': password } }
      ).then(response => {
        console.log("response:", response);
        keyValuePairs = response.data;
      }).catch(error => {
        console.error("Error fetching data:", error);
        keyValuePairs = {'Error:': "Error fetching data: " + error};
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  async function gptAnalysis() {
    try {
      gpt_info = ""
      gpt_analysis = 'Analysing. Please wait...';
      axios.get(
        `${api_url}/gpt/analysis/${userInput}/yfinance`, { headers: { 'password': password } }
      ).then(response => {
        gpt_analysis = response.data['analysis'];
        gpt_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
      }).catch(error => {
        console.error("Error fetching data:", error);
        gpt_analysis =  "Error fetching data: " + error;
      });
    } catch (error) {
      console.error("Error fetching gpt analysis:", error);
    }
  }
  async function deleteTodaysCache() {
    try {
      await axios.delete(
        `${api_url}/cache/${userInput}/today`, { headers: { 'password': password } }
      ).then(response => {
        console.log("response:", response);
      }).catch(error => {
        console.error("Error deleting cache:", error);
      });
    } catch (error) {
      console.error("Error deleting cache:", error);
    }
  }
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      processInput();
    }
  }
  function focus_on_ticker_input() {
    const input = document.querySelector("input");
    if (input) {
      input.focus();
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

<input type="text" bind:value={userInput} placeholder="Ticker-Symbol 'T', ..." on:keydown={handleKeyDown} />
<input type="password" bind:value={password} placeholder="Password" on:keydown={handleKeyDown} />
<button on:click={processInput}>Fetch Data</button>
<button on:click={deleteTodaysCacheInput}>Delete todays cache</button>
{#if processing}
  <span>Processing...</span>
{/if}
{#if info_links}
  <div class="infos" style="overflow: hidden;">
    <h3>Infos (Data is cached on same calendar day):</h3>
    <table cellpadding="10">
      <thead class="highlight">
        <tr>
          <td class="data">Numbers</td><td class="graphs">Graphs</td><td class="links">Links</td>
        </tr>
      </thead>
      <tr class="content">
        <td valign="top">
          {#if Object.entries(keyValuePairs).length}
            <table>
              <tbody>
                {#each Object.entries(keyValuePairs) as [key, value]}
                  <tr>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </td>
        <td valign="top">{@html info_graphs}</td>
        <td valign="top"><strong>
          Links:</strong><br/>{@html info_links}
          <br/><br/>
          <strong>GPT-Analysis{gpt_info}:</strong><br/><i>{@html gpt_analysis}</i>
        </td>
      </tr>
    </table>
  </div>
{/if}

<style>
  .infos table thead.highlight {
    font-weight: bold;
    background-color: lightblue;
  }
  .infos table .content {
    background-color: lightgray;
  }
  .infos td.data {
    width: 420px;
  }
  .infos td.graphs {
    width: 330px;
  }
  .infos td.links {
    width: 900px;
  }
</style>
