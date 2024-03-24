<script>
  import { onMount } from "svelte";
  import axios from "axios";

  let api_url = import.meta.env.VITE_BACKEND_URL;
  
  let userInput = "";
  let password = "";
  
  let infos_ticker_name ="";
  let info_links = "";
  let info_graphs = "";
  
  let gpt_info_info = "";
  let gpt_info_analysis = "";
  let gpt_info_prev_input = "";
  let gpt_info_processing = false;
  
  let info_key_value_pairs = {};
  let info_key_value_prev_input = "";
  let info_key_value_processing = false;
  
  let linksInfoOrNews = "info";
  
  let news_links_list = [];
  let news_links_prev_input = "";
  let news_links_processing = false;
  
  let gpt_news_analysis = "";
  let gpt_news_info = "";
  let gpt_news_analysis_prev_input = "";
  let gpt_news_analysis_processing = false;

  let processingCount = 0;
  let processingValue = "";
  const processingTexts = ["Processing", "Processing.", "Processing..", "Processing..."];
  let processingTextInitialSetTime = 100;
  let processingTextInitialTimeout = null;
  let processingTextIntervalTime = 500;
  let processingTextInterval = null;

  let delete_todays_cache_processing = false;

  function resetPrevInputValues() {
    info_key_value_prev_input = "";
    gpt_info_prev_input = "";
    gpt_news_analysis_prev_input = "";
    news_links_prev_input = "";
    info_key_value_processing = false;
    gpt_info_processing = false;
    gpt_news_analysis_processing = false;
    news_links_processing = false;
    delete_todays_cache_processing = false;
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
  async function startProcessing() {
    if (processingCount == 0) {
      processingTextInitialTimeout = setTimeout(() => {
        processingValue = processingTexts[0];
      }, processingTextInitialSetTime);
      let processingTextIndex = 1;
      processingTextInterval = setInterval(() => {
        processingValue = processingTexts[processingTextIndex];
        processingTextIndex = (processingTextIndex + 1) % processingTexts.length;
      }, processingTextIntervalTime);
    }
    processingCount += 1;
  }
  async function stopProcessing() {
    processingCount -= 1;
    if (processingCount == 0) {
      processingValue = "";
      clearTimeout(processingTextInitialTimeout);
      clearInterval(processingTextInterval);
      processingValue = "";
    }
  }
  async function processInputIfSet() {
    startProcessing();
    try {
      if (getUpperCaseInputForAction()) {
        await Promise.all([createStaticInfoLinks(), createSaticInfoGraphs(), fetchInfoData(), gptAnalysis()]);
      }
    } finally {
      stopProcessing();
    }
  }
  async function deleteTodaysCacheInput() {
    startProcessing();
    try {
      if (getUpperCaseInputForAction()) {
        await deleteTodaysCache()
      }
    } finally {
      stopProcessing();
    }
  }
  async function createStaticInfoLinks() {
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
  async function createSaticInfoGraphs() {
    info_graphs = "";
    info_graphs += `<a href="https://finviz.com/quote.ashx?t=${userInput}&p=m" target="_blank"><img src="https://charts2-node.finviz.com/chart.ashx?cs=m&t=${userInput}&tf=d&s=linear&ct=candle_stick"/></a>`;
    let history_graph_12m_url = `${api_url}/image/history/${userInput}/period/12mo`;
    info_graphs += `<a href="${history_graph_12m_url}" target="_blank"><img src="${history_graph_12m_url}" width="324px"/></a>`;
    let history_graph_24m_url = `${api_url}/image/history/${userInput}/period/24mo`;
    info_graphs += `<a href="${history_graph_24m_url}" target="_blank"><img src="${history_graph_24m_url}" width="324px"/></a>`;
    let history_graph_400m_url = `${api_url}/image/history/${userInput}/period/400mo`;
    info_graphs += `<a href="${history_graph_400m_url}" target="_blank"><img src="${history_graph_400m_url}" width="324px"/></a>`;
  }
  async function fetchInfoData() {
    if (info_key_value_processing) {
      return;
    }
    info_key_value_processing = true;
    try {
      if (userInput != info_key_value_prev_input) {
        infos_ticker_name = "";
        info_key_value_pairs = {'Loading.': 'Please wait...'};
      }
      await axios.get(
        `${api_url}/data/${userInput}`, { headers: { 'password': password } }
      ).then(response => {
        console.log("response:", response);
        info_key_value_prev_input = userInput;
        info_key_value_pairs = response.data;
        infos_ticker_name = ` for ${response.data['shortName']} (${userInput})`;
      }).catch(error => {
        console.error("Error fetching data:", error);
        info_key_value_pairs = {'Error:': "Error fetching data: " + error};
      }).finally(() => {
        info_key_value_processing = false;
      });
    } catch (error) {
      info_key_value_processing = false;
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
    if (gpt_info_processing) {
      return;
    }
    gpt_info_processing = true;
    try {
      if (userInput != gpt_info_prev_input) {
        gpt_info_info = "";
        gpt_info_analysis = 'Analysing. Please wait...';
      }
      await axios.get(
        `${api_url}/gpt/analysis/${userInput}/yfinance`, { headers: { 'password': password } }
      ).then(response => {
        gpt_info_prev_input = userInput;
        gpt_info_analysis = response.data['analysis'];
        gpt_info_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
      }).catch(error => {
        console.error("Error fetching data:", error);
        gpt_info_analysis = "Error fetching data: " + error;
      }).finally(() => {
        gpt_info_processing = false;
      });
    } catch (error) {
      gpt_info_processing = false;
      console.error("Error fetching gpt info analysis:", error);
    }
  }
  async function load_news_links() {
    if (news_links_processing) {
      return;
    }
    news_links_processing = true;
    try {
      if (userInput != news_links_prev_input) {
        news_links_list = [];
      }
      await axios.get(
        `${api_url}/data/${userInput}/news/overview`, { headers: { 'password': password } }
      ).then(response => {
        news_links_prev_input = userInput;
        news_links_list = response.data['news']['data'];
      }).catch(error => {
        console.error("Error fetching data:", error);
        news_links_list = [];
      }).finally(() => {
        news_links_processing = false;
      });
    } catch (error) {
      news_links_processing = false;
      console.error("Error fetching news links:", error);
    }
  }
  async function load_news_gpt_analysis() {
    if (gpt_news_analysis_processing) {
      return;
    }
    gpt_news_analysis_processing = true;
    try {
      if (userInput != gpt_news_analysis_prev_input) {
        gpt_news_info = "";
        gpt_news_analysis = 'Analysing. Please wait...';
      }
      await axios.get(
        `${api_url}/gpt/analysis/${userInput}/news`, { headers: { 'password': password } }
      ).then(response => {
        gpt_news_analysis_prev_input = userInput;
        gpt_news_analysis = response.data['analysis'];
        gpt_news_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
      }).catch(error => {
        console.error("Error fetching data:", error);
        gpt_news_analysis = "Error fetching data: " + error;
      }).finally(() => {
        gpt_news_analysis_processing = false;
      });
    } catch (error) {
      gpt_news_analysis_processing = false;
      console.error("Error fetching gpt news analysis:", error);
    }
  }
  async function deleteTodaysCache() {
    if (delete_todays_cache_processing) {
      return;
    }
    delete_todays_cache_processing = true;
    try {
      await axios.delete(
        `${api_url}/cache/${userInput}/today`, { headers: { 'password': password } }
      ).then(response => {
        resetPrevInputValues()
        console.log("response:", response);
      }).catch(error => {
        console.error("Error deleting cache:", error);
      }).finally(() => {
        delete_todays_cache_processing = false;
      });
    } catch (error) {
      delete_todays_cache_processing = false;
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
    if (linksInfoOrNews != "info") {
      linksInfoOrNews = "info";
      processInputIfSet();
    }
  }
  function activateNewsGptNews() {
    if (linksInfoOrNews != "news") {
      linksInfoOrNews = "news";
      processInputIfSet();
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
<button on:click={processInputIfSet}>Fetch Data</button>
<button on:click={deleteTodaysCacheInput}>Delete todays cache</button>
{#if processingValue != ""}
  <span class="processingtext">({processingCount}) {processingValue}</span>
{/if}
{#if info_links}
  <div class="infos" style="overflow: hidden;">
    <h3>Infos{infos_ticker_name}</h3>
    <table cellpadding="0">
      <thead>
        <tr>
          <td class="data">Numbers</td>
          <td class="graphs">Graphs</td>
          <td class="links">
            <div class="link-options">
              <div on:click={activateLinksGptData} class:active={linksInfoOrNews === 'info'}>Links/GPT-Data-Analysis</div>
              <div on:click={activateNewsGptNews} class:active={linksInfoOrNews === 'news'}>News/GPT-News-Analysis </div>
            </div>
          </td>
        </tr>
      </thead>
      <tr>
        <td class="content" valign="top">
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
        <td class="content" valign="top">{@html info_graphs}</td>
        <td class="content" valign="top">
          {#if linksInfoOrNews == "info"}
          <strong>Links:</strong><br/>
          <div class="contentindent">
            {@html info_links}
          </div>
          <br/><br/>
          <strong>GPT-Info-Analysis{gpt_info_info}:</strong><br/>
          <div class="contentindent">
            <i>{@html gpt_info_analysis}</i>
          </div>
          {/if}
          {#if linksInfoOrNews == "news"}
          <strong>News:</strong><br/>
          <div class="contentindent">
            {#each news_links_list as news_link}
              <a href="{news_link['link']}" target="_blank">{news_link['title']}</a><br/>
            {/each}
          </div>
          <br/><br/>
          <strong>GPT-News-Analysis{gpt_news_info}:</strong><br/>
          <div class="contentindent">
              <i>{@html gpt_news_analysis}</i>
          </div>
          {/if}
        </td>
      </tr>
    </table>
  </div>
{/if}

<style>
  .processingtext {
    font-style: italic;
    color: black;
  }
  .infos table thead td {
    font-weight: bold;
    background-color: lightblue;
    padding: 0px;
  }
  .infos table thead td.data {
    padding: 5px;
  }
  .infos table thead td.graphs {
    padding: 5px;
  }
  .infos table td.content {
    background-color: lightgray;
    padding: 5px;
  }
  .infos table div.contentindent {
    padding-left: 5px;
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
  .infos .link-options {
    display: flex;
  }
  .infos .link-options div {
    cursor: pointer;
    padding-left: 5px;
    flex: 1;
  }
  .infos .link-options div.active {
    font-weight: bold;
    background-color: rgb(58, 185, 227);
  }
</style>
