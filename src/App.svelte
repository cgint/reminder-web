<script>
  import { onMount } from "svelte";
  import axios from "axios";

  let api_url = import.meta.env.VITE_BACKEND_URL;
  
  let userInput = "";
  let password = "";
  let info_links = "";
  let info_graphs = "";
  let gpt_info_analysis = "";
  let gpt_info_info = "";
  let info_key_value_pairs = {};
  let news_links_list = [];
  let gpt_news_analysis = "";
  let gpt_news_info = "";

  let processing = false;
  let linksInfoOrNews = "info";

  onMount(() => {
    fetchUserFieldsFromStorage();
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
  function fetchUserFieldsFromStorage() {
    userInput = localStorage.getItem('userInput') || "";
    password = localStorage.getItem('password') || "";
  }

  function getUpperCaseInputForAction() {
    if (userInput) {
      userInput = userInput.toUpperCase();
      storeUserFieldsInStorage(userInput, password);
    }
    return userInput;
  }

  async function processInputIfSet() {
    processing = true;
    try {
      if (getUpperCaseInputForAction()) {
        await Promise.all([createInfoLinks(), createInfoGraphs(), fetchData(), gptAnalysis()]);
      }
    } finally {
      processing = false;
    }
  }
  async function deleteTodaysCacheInput() {
    processing = true;
    try {
      if (getUpperCaseInputForAction()) {
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
      info_key_value_pairs = {'Loading.': 'Please wait...'};
      await axios.get(
        `${api_url}/data/${userInput}`, { headers: { 'password': password } }
      ).then(response => {
        console.log("response:", response);
        info_key_value_pairs = response.data;
      }).catch(error => {
        console.error("Error fetching data:", error);
        info_key_value_pairs = {'Error:': "Error fetching data: " + error};
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  async function gptAnalysis() {
    if (linksInfoOrNews == "info") {
      await load_info_gpt_analysis();
    } else {
      await load_news_links();
      await load_news_gpt_analysis();
    }
  }
  async function load_info_gpt_analysis() {
    try {
      gpt_info_info = ""
      gpt_info_analysis = 'Analysing. Please wait...';
      await axios.get(
        `${api_url}/gpt/analysis/${userInput}/yfinance`, { headers: { 'password': password } }
      ).then(response => {
        gpt_info_analysis = response.data['analysis'];
        gpt_info_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
      }).catch(error => {
        console.error("Error fetching data:", error);
        gpt_info_analysis = "Error fetching data: " + error;
      });
    } catch (error) {
      console.error("Error fetching gpt info analysis:", error);
    }
  }
  async function load_news_links() {
    try {
      news_links_list = [];
      await axios.get(
        `${api_url}/data/${userInput}/news/overview`, { headers: { 'password': password } }
      ).then(response => {
        news_links_list = response.data['news']['data'];
      }).catch(error => {
        console.error("Error fetching data:", error);
        news_links_list = [];
      });
    } catch (error) {
      console.error("Error fetching gpt news analysis:", error);
    }
  }
  async function load_news_gpt_analysis() {
    try {
      gpt_news_info = ""
      gpt_news_analysis = 'Analysing. Please wait...';
      await axios.get(
        `${api_url}/gpt/analysis/${userInput}/news`, { headers: { 'password': password } }
      ).then(response => {
        gpt_news_analysis = response.data['analysis'];
        gpt_news_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
      }).catch(error => {
        console.error("Error fetching data:", error);
        gpt_news_analysis = "Error fetching data: " + error;
      });
    } catch (error) {
      console.error("Error fetching gpt news analysis:", error);
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
      processInputIfSet();
    }
  }
  function focus_on_ticker_input() {
    const input = document.querySelector("input");
    if (input) {
      input.focus();
      input.select();
    }
  }
  function activateLinksGptData() {
    linksInfoOrNews = "info";
    processInputIfSet();
  }
  function activateNewsGptNews() {
    linksInfoOrNews = "news";
    processInputIfSet();
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
<button on:click={processInputIfSet}>Fetch Data</button>
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
          <td class="data">Numbers</td>
          <td class="graphs">Graphs</td>
          <td class="links">
            <a on:click={activateLinksGptData} href="#">Links/GPT-Data-Analysis</a>
             or 
            <a on:click={activateNewsGptNews} href="#">News/GPT-News-Analysis</a>
          </td>
        </tr>
      </thead>
      <tr class="content">
        <td valign="top">
          {#if Object.entries(info_key_value_pairs).length}
            <table>
              <tbody>
                {#each Object.entries(info_key_value_pairs) as [key, value]}
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
        <td valign="top">
          {#if linksInfoOrNews == "info"}
          <strong>Links:</strong><br/>{@html info_links}
          <br/><br/>
          <strong>GPT-Info-Analysis{gpt_info_info}:</strong><br/>
          <i>{@html gpt_info_analysis}</i>
          {/if}
          {#if linksInfoOrNews == "news"}
          <strong>News:</strong><br/>
          {#each news_links_list as news_link}
            <a href="{news_link['link']}" target="_blank">{news_link['title']}</a><br/>
          {/each}
          <br/><br/>
          <strong>GPT-News-Analysis{gpt_news_info}:</strong><br/>
          <i>{@html gpt_news_analysis}</i>
          {/if}
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
