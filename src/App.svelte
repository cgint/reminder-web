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
  let gpt_info_running = false;
  
  let info_key_value_pairs = {};
  let info_key_value_prev_input = "";
  let info_key_value_running = false;
  
  let linksInfoOrNews = "info";
  
  let news_links_list = [];
  let news_links_prev_input = "";
  let news_links_running = false;
  
  let gpt_news_analysis = "";
  let gpt_news_info = "";
  let gpt_news_analysis_prev_input = "";
  let gpt_news_analysis_running = false;

  let processingCount = 0;
  let processingValue = "";
  const processingTexts = ["Processing", "Processing.", "Processing..", "Processing..."];
  let processingTextInitialSetTime = 100;
  let processingTextInitialTimeout = null;
  let processingTextIntervalTime = 500;
  let processingTextInterval = null;

  let delete_todays_cache_running = false;

  function resetPrevInputValues() {
    info_key_value_prev_input = "";
    gpt_info_prev_input = "";
    gpt_news_analysis_prev_input = "";
    news_links_prev_input = "";
  }
  function resetRunningStates() {
    info_key_value_running = false;
    gpt_info_running = false;
    gpt_news_analysis_running = false;
    news_links_running = false;
    delete_todays_cache_running = false;
  }

  function result_cache_today_key_base() {
    let today = new Date().toISOString().split('T')[0];
    return `result_cache-${today}`;
  }
  function result_cache_today_key_for_stock(stock) {
    return `${result_cache_today_key_base()}-${stock}`;
  }
  function result_cache_key_today(ticker, section) {
    return `${result_cache_today_key_for_stock(ticker)}-${section}`;
  }
  function result_cache_set(ticker, section, value) {
    localStorage.setItem(result_cache_key_today(ticker, section), value);
  }
  function result_cache_has_key(ticker, section) {
    return localStorage.getItem(result_cache_key_today(ticker, section)) != null;
  }
  function result_cache_get(ticker, section) {
    return localStorage.getItem(result_cache_key_today(ticker, section));
  }
  function result_cache_find_with_prefix(prefix) {
      console.log("result_cache_find_with_prefix - prefix:", prefix);
      let keys_found = [];
      console.log("result_cache_find_with_prefix - keys in localstorage:", localStorage.length);
      for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith(prefix)) {
          keys_found.push(key);
        }
      }
      return keys_found;
    }

  function result_cache_delete_today_stock(ticker) {
    let today_key_stock = result_cache_today_key_for_stock(ticker);
    let keys_to_remove = result_cache_find_with_prefix(today_key_stock);
    console.log("keys_to_remove:", keys_to_remove);
    keys_to_remove.forEach(key => localStorage.removeItem(key));
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
        await Promise.all([createStaticInfoLinks(), createSaticInfoGraphs(), gptDataAndAnalysis()]);
      }
    } finally {
      stopProcessing();
    }
  }
  async function deleteTodaysCacheInput() {
    startProcessing();
    try {
      if (getUpperCaseInputForAction()) {
        await deleteTodaysCacheForStock()
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
    let img_style = 'style="width: 100%; height: auto; padding-top: 5px;"';
    info_graphs += `<a href="https://finviz.com/quote.ashx?t=${userInput}&p=m" target="_blank"><img ${img_style} src="https://charts2-node.finviz.com/chart.ashx?cs=m&t=${userInput}&tf=d&s=linear&ct=candle_stick"/></a>`;
    let history_graph_12m_url = `${api_url}/image/history/${userInput}/period/12mo`;
    info_graphs += `<a href="${history_graph_12m_url}" target="_blank"><img ${img_style} src="${history_graph_12m_url}"/></a>`;
    
    let history_graph_24m_url = `${api_url}/image/history/${userInput}/period/24mo`;
    info_graphs += `<a href="${history_graph_24m_url}" target="_blank"><img ${img_style} src="${history_graph_24m_url}"/></a>`;
    let history_graph_400m_url = `${api_url}/image/history/${userInput}/period/400mo`;
    info_graphs += `<a href="${history_graph_400m_url}" target="_blank"><img ${img_style} src="${history_graph_400m_url}"/></a>`;
  }
  async function gptDataAndAnalysis() {
    if (linksInfoOrNews == "info") {
      await fetchInfoData();
      await load_info_gpt_analysis();
    } else {
      fetchInfoData(); // do not wait
      await load_news_links();
      await load_news_gpt_analysis();
    }
  }
  async function fetchInfoData() {
    if (info_key_value_running || userInput == info_key_value_prev_input) {
      return;
    }
    let main_data_key = "info_key_value_pairs";
    if(!result_cache_has_key(userInput, main_data_key)) {
      info_key_value_running = true;
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
          result_cache_set(userInput, main_data_key, JSON.stringify(response.data));
          result_cache_set(userInput, "infos_ticker_name", ` for ${response.data['shortName']} (${userInput})`);
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
    if (result_cache_has_key(userInput, main_data_key)) {
      info_key_value_pairs = JSON.parse(result_cache_get(userInput, main_data_key));
      infos_ticker_name = result_cache_get(userInput, "infos_ticker_name");
    }
  }
  async function load_info_gpt_analysis() {
    if (gpt_info_running || userInput == gpt_info_prev_input) {
      return;
    }
    let main_data_key = "gpt_info_analysis";
    if(!result_cache_has_key(userInput, main_data_key)) {
      gpt_info_running = true;
      try {
        if (userInput != gpt_info_prev_input) {
          gpt_info_info = "";
          gpt_info_analysis = 'Analysing. Please wait...';
        }
        await axios.get(
          `${api_url}/gpt/analysis/${userInput}/yfinance`, { headers: { 'password': password } }
        ).then(response => {
          gpt_info_prev_input = userInput;
          result_cache_set(userInput, main_data_key, response.data['analysis']);
          result_cache_set(userInput, "gpt_info_info", " ("+response.data['source']+" for "+response.data['ticker']+")");
        }).catch(error => {
          console.error("Error fetching data:", error);
          gpt_info_analysis = "Error fetching data: " + error;
        }).finally(() => {
          gpt_info_running = false;
        });
      } catch (error) {
        gpt_info_running = false;
        console.error("Error fetching gpt info analysis:", error);
      }
    }
    if (result_cache_has_key(userInput, main_data_key)) {
      gpt_info_analysis = result_cache_get(userInput, main_data_key);
      gpt_info_info = result_cache_get(userInput, "gpt_info_info");
    }
  }
  async function load_news_links() {
    if (news_links_running || userInput == news_links_prev_input) {
      return;
    }
    let main_data_key = "news_links_list";
    if(!result_cache_has_key(userInput, main_data_key)) {
      news_links_running = true;
      try {
        if (userInput != news_links_prev_input) {
          news_links_list = [];
        }
        await axios.get(
          `${api_url}/data/${userInput}/news/overview`, { headers: { 'password': password } }
        ).then(response => {
          news_links_prev_input = userInput;
          result_cache_set(userInput, main_data_key, JSON.stringify(response.data['news']['data']));
        }).catch(error => {
          console.error("Error fetching data:", error);
          news_links_list = [];
        }).finally(() => {
          news_links_running = false;
        });
      } catch (error) {
        news_links_running = false;
        console.error("Error fetching news links:", error);
      }
    }
    if (result_cache_has_key(userInput, main_data_key)) {
      news_links_list = JSON.parse(result_cache_get(userInput, main_data_key));
    }
  }
  async function load_news_gpt_analysis() {
    if (gpt_news_analysis_running || userInput == gpt_news_analysis_prev_input) {
      return;
    }
    if(!result_cache_has_key(userInput, "gpt_news_analysis")) {
      gpt_news_analysis_running = true;
      try {
        if (userInput != gpt_news_analysis_prev_input) {
          gpt_news_info = "";
          gpt_news_analysis = 'Analysing. Please wait...';
        }
        await axios.get(
          `${api_url}/gpt/analysis/${userInput}/news`, { headers: { 'password': password } }
        ).then(response => {
          gpt_news_analysis_prev_input = userInput;
          result_cache_set(userInput, "gpt_news_analysis", response.data['analysis']);
          result_cache_set(userInput, "gpt_news_info", " ("+response.data['source']+" for "+response.data['ticker']+")");
        }).catch(error => {
          console.error("Error fetching data:", error);
          gpt_news_analysis = "Error fetching data: " + error;
        }).finally(() => {
          gpt_news_analysis_running = false;
        });
      } catch (error) {
        gpt_news_analysis_running = false;
        console.error("Error fetching gpt news analysis:", error);
      }
    }
    if (result_cache_has_key(userInput, "gpt_news_analysis")) {
      gpt_news_analysis = result_cache_get(userInput, "gpt_news_analysis");
      gpt_news_info = result_cache_get(userInput, "gpt_news_info");
    }
  }
  async function deleteTodaysCacheForStock() {
    if (delete_todays_cache_running) {
      return;
    }
    resetPrevInputValues();
    resetRunningStates();
    result_cache_delete_today_stock(userInput);
    delete_todays_cache_running = true;
    try {
      await axios.delete(
        `${api_url}/cache/${userInput}/today`, { headers: { 'password': password } }
      ).then(response => {
        console.log("response:", response);
      }).catch(error => {
        console.error("Error deleting cache:", error);
      }).finally(() => {
        delete_todays_cache_running = false;
      });
    } catch (error) {
      delete_todays_cache_running = false;
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
  function activateLinksAndGptInfo() {
    if (linksInfoOrNews != "info") {
      linksInfoOrNews = "info";
      processInputIfSet();
    }
  }
  function activateNewsAndGptNews() {
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
    <div class="row">
      <div class="col-12">
        <h3>Infos{infos_ticker_name}</h3>
      </div>
    </div>
    <div class="row contentrow">
      <div class="col-md-3 col-sm-12">
        <div class="row">
          <div class="col-12 columnheader textonly">
            Numbers
          </div>
        </div>
        <div class="row">
          <div class="col-12 columncontent textcontent">
            {#if Object.entries(info_key_value_pairs).length}
            <table class="info_key_value_table">
              <tbody>
                {#each Object.entries(info_key_value_pairs) as [key, value]}
                  <tr>
                    <td>
                      <div class="info_key_value">
                        <div class="info_key">{key}</div>
                        <div class="info_value">{value}</div>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
          </div>
        </div>

      </div>
      <div class="col-md-2 col-sm-12">
        <div class="row">
          <div class="col-12 columnheader textonly">
            Graphs
          </div>
        </div>
        <div class="row">
          <div class="col-12 columncontent">
            <div class="graphs_wrapper">
              {@html info_graphs}
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-7 col-sm-12">
        <div class="row">
          <div class="col-12 columnheader link-options">
              <div on:click={activateLinksAndGptInfo} class:active={linksInfoOrNews === 'info'}>Links/GPT-Data-Analysis</div>
              <div on:click={activateNewsAndGptNews} class:active={linksInfoOrNews === 'news'}>News/GPT-News-Analysis </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12 columncontent textcontent">
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
                <a href="{news_link['link']}" target="_blank">{news_link['title']}</a>
                <span class="newsdate">({new Date(news_link['providerPublishTime'] * 1000).toISOString().slice(0, 10)})</span>
                <br/>
              {/each}
            </div>
            <br/><br/>
            <strong>GPT-News-Analysis{gpt_news_info}:</strong><br/>
            <div class="contentindent">
                <i>{@html gpt_news_analysis}</i>
            </div>
            {/if}
          </div>
        </div>
        <!-- Content for the third column -->
      </div>
    </div>
  </div>
{/if}

<style>
  .processingtext {
    font-style: italic;
    color: black;
  }
  .infos .contentrow {
    background-color: lightgray;
  }
  .infos .graphs_wrapper {
    display: block;
    width: 100%;
  }
  .infos .columnheader.textonly {
    padding-left: 15px;
  }
  .infos .columnheader {
    font-weight: bold;
    background-color: lightblue;
  }
  .infos .columncontent.textcontent {
    padding-left: 15px;
    padding-right: 15px;
  }
  .infos div.contentindent {
    padding-left: 5px;
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
  .infos span.newsdate {
    /* font-size: 8px; */
    color: gray;
    font-style: italic;
    white-space: nowrap;
  }
  .infos .info_key_value_table {
    width: 100%;
  }
  .infos .info_key_value_table div.info_key_value {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 100%;
  }

  .infos .info_key_value_table div.info_key, .infos .info_key_value_table div.info_value {
    flex: 1;
    white-space: nowrap;
  }
  .infos .info_key_value_table div.info_value {
    text-align: right;
  }
  /* ? Override for smaller screens or when content doesn't fit side by side */
  /* @media (max-width: 768px) {
    .info_key_value_table div.info_key, .info_key_value_table div.info_value {
      flex-basis: 100%;
      white-space: normal;
    }
  } */
</style>
