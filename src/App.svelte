<script>
  import InputFields from "./app-components/InputFields.svelte";
  import InfoKeyValue from "./app-components/InfoKeyValue.svelte";
  import ChartGraphs from "./app-components/ChartGraphs.svelte";
  import LinkNews from "./app-components/LinkNews.svelte";

  import { result_cache_has_key, result_cache_get, result_cache_set, result_cache_delete_today_stock } from "./app-components/result_cache.js";
  import axios from "axios";

  let api_url = import.meta.env.VITE_BACKEND_URL;
  
  let userInputTicker = "";
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
  
  let activeInfoNewsChat = "info";
  
  let news_links_list = [];
  let news_links_prev_input = "";
  let news_links_running = false;
  
  let gpt_news_analysis = "";
  let gpt_news_info = "";
  let gpt_news_analysis_prev_input = "";
  let gpt_news_analysis_running = false;

  let chatInput = "";
  let chat_answering_running = false;
  let chat_info = "";
  let chat_stats = "";
  let chat_answer = "No question - no answer ;) Please provide a question for me to answer.";

  let processingCount = 0;
  let processingValue = "";
  let processingTextInitialSetTime = 100;
  let processingTextInitialTimeout = null;

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
    chat_answering_running = false;
  }
  async function startProcessing() {
    if (processingCount == 0) {
      processingTextInitialTimeout = setTimeout(() => {
        processingValue = "loading ...";
      }, processingTextInitialSetTime);
    }
    processingCount += 1;
  }
  async function stopProcessing() {
    processingCount -= 1;
    if (processingCount == 0) {
      processingValue = "";
      clearTimeout(processingTextInitialTimeout);
      processingValue = "";
    }
  }
  async function processInputIfSet() {
    console.log("processInputIfSet start with input: ", userInputTicker);
    startProcessing();
    try {
      if (userInputTicker) {
        await Promise.all([createStaticInfoLinks(), createSaticInfoGraphs(), processInfoNewsOrChat()]);
      }
    } finally {
      stopProcessing();
    }
  }
  async function deleteTodaysCacheInput() {
    startProcessing();
    try {
      if (userInputTicker) {
        await deleteTodaysCacheForStock()
      }
    } finally {
      stopProcessing();
    }
  }
  async function createStaticInfoLinks() {
    let curtimeEpoch = Math.floor(Date.now() / 1000);
    let linksToCreate = {
      FinViz: `https://finviz.com/quote.ashx?t=${userInputTicker}&p=m`,
      "Yahoo Details": `https://finance.yahoo.com/quote/${userInputTicker}`,
      "Yahoo Analysis": `https://finance.yahoo.com/quote/${userInputTicker}/analysis`,
      "Yahoo Historic Dividends": `https://finance.yahoo.com/quote/${userInputTicker}/history?period1=345427200&period2=${curtimeEpoch}&interval=capitalGain%7Cdiv%7Csplit&filter=div&frequency=1d&includeAdjustedClose=true`,
      "Yahoo Lookup": `https://finance.yahoo.com/lookup?s=${userInputTicker}`,
      "Danelfin": `https://danelfin.com/stock/${userInputTicker}`,
    };

    info_links = "";
    for (let link in linksToCreate) {
      info_links += `<a href="${linksToCreate[link]}" target="_blank">${link} for '${userInputTicker}'</a><br/>`;
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
  async function processInfoNewsOrChat() {
    let functions_to_call = [];
    functions_to_call.push(fetchInfoData());
    if (activeInfoNewsChat == "info") {
      functions_to_call.push(load_info_gpt_analysis());
    } else if (activeInfoNewsChat == "news") {
      functions_to_call.push(load_news_links());
      functions_to_call.push(load_news_gpt_analysis());
    } else if (activeInfoNewsChat == "chat") {
      functions_to_call.push(load_chat_answer());
    }
    await Promise.all(functions_to_call);
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
  async function load_info_gpt_analysis() {
    if (gpt_info_running || userInputTicker == gpt_info_prev_input) {
      return;
    }
    let main_data_key = "gpt_info_analysis";
    if(!result_cache_has_key(userInputTicker, main_data_key)) {
      gpt_info_running = true;
      try {
        if (userInputTicker != gpt_info_prev_input) {
          gpt_info_info = "";
          gpt_info_analysis = 'Analysing. Please wait...';
        }
        await axios.get(
          `${api_url}/gpt/analysis/${userInputTicker}/yfinance`, { headers: { 'password': password } }
        ).then(response => {
          gpt_info_prev_input = userInputTicker;
          result_cache_set(userInputTicker, main_data_key, response.data['analysis']);
          result_cache_set(userInputTicker, "gpt_info_info", " ("+response.data['source']+" for "+response.data['ticker']+")");
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
    if (result_cache_has_key(userInputTicker, main_data_key)) {
      gpt_info_analysis = result_cache_get(userInputTicker, main_data_key);
      gpt_info_info = result_cache_get(userInputTicker, "gpt_info_info");
    }
  }
  async function load_news_links() {
    if (news_links_running || userInputTicker == news_links_prev_input) {
      return;
    }
    let main_data_key = "news_links_list";
    if(!result_cache_has_key(userInputTicker, main_data_key)) {
      news_links_running = true;
      try {
        if (userInputTicker != news_links_prev_input) {
          news_links_list = [];
        }
        await axios.get(
          `${api_url}/data/${userInputTicker}/news/overview`, { headers: { 'password': password } }
        ).then(response => {
          news_links_prev_input = userInputTicker;
          result_cache_set(userInputTicker, main_data_key, JSON.stringify(response.data['news']['data']));
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
    if (result_cache_has_key(userInputTicker, main_data_key)) {
      news_links_list = JSON.parse(result_cache_get(userInputTicker, main_data_key));
    }
  }
  async function load_news_gpt_analysis() {
    if (gpt_news_analysis_running || userInputTicker == gpt_news_analysis_prev_input) {
      return;
    }
    if(!result_cache_has_key(userInputTicker, "gpt_news_analysis")) {
      gpt_news_analysis_running = true;
      try {
        if (userInputTicker != gpt_news_analysis_prev_input) {
          gpt_news_info = "";
          gpt_news_analysis = 'Analysing. Please wait...';
        }
        await axios.get(
          `${api_url}/gpt/analysis/${userInputTicker}/news`, { headers: { 'password': password } }
        ).then(response => {
          gpt_news_analysis_prev_input = userInputTicker;
          result_cache_set(userInputTicker, "gpt_news_analysis", response.data['analysis']);
          result_cache_set(userInputTicker, "gpt_news_info", " ("+response.data['source']+" for "+response.data['ticker']+")");
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
    if (result_cache_has_key(userInputTicker, "gpt_news_analysis")) {
      gpt_news_analysis = result_cache_get(userInputTicker, "gpt_news_analysis");
      gpt_news_info = result_cache_get(userInputTicker, "gpt_news_info");
    }
  }
  async function load_chat_answer() {
    if (chat_answering_running || chatInput == "") {
      return;
    }
    chat_answering_running = true;
    try {
      chat_info = "";
      chat_stats = "";
      chat_answer = 'Reading infos, news and other gpt-summaries ... then thinking ... then answering. Please wait...';
      await axios.get(
        `${api_url}/gpt/answer/${userInputTicker}/chat`, { params: { chatInput: chatInput },  headers: { 'password': password } }
      ).then(response => {
        chat_answer = response.data['analysis'];
        chat_info = " ("+response.data['source']+" for "+response.data['ticker']+")";
        let stats = response.data['stats'];
        chat_stats = `p_len: ${stats['p_len']}, p_words: ${stats['p_words']}, duration_sec: ${stats['duration_sec']}`;
      }).catch(error => {
        console.error("Error fetching answer for chat:", error);
        chat_answer = "Error fetching answer for chat: " + error;
      }).finally(() => {
        chat_answering_running = false;
      });
    } finally {
      chat_answering_running = false;
    }
  }
  async function deleteTodaysCacheForStock() {
    if (delete_todays_cache_running) {
      return;
    }
    resetPrevInputValues();
    resetRunningStates();
    result_cache_delete_today_stock(userInputTicker);
    delete_todays_cache_running = true;
    try {
      await axios.delete(
        `${api_url}/cache/${userInputTicker}/today`, { headers: { 'password': password } }
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
  function sectionActivated(event) {
    let selectedSection = event.detail.selectedSection;
    if (activeInfoNewsChat != selectedSection) {
      activeInfoNewsChat = selectedSection;
      if (selectedSection != "chat") {
        processInputIfSet();
      }
    }
  }
  function processInputIfSetWithFieldsUpdate(event) {
    updateFieldsFromEvent(event);
    processInputIfSet();
  }
  function deleteTodaysCacheInputWithFieldsUpdate(event) {
    updateFieldsFromEvent(event);
    deleteTodaysCacheInput();
  }
  function updateFieldsFromEvent(event) {
    userInputTicker = event.detail.userInputTicker;
    password = event.detail.password;
  }
  function triggerChatWithStock(event) {
    chatInput = event.detail.chatInput;
    processInputIfSet();
  }
</script>
<InputFields  on:processInputIfSetWithFieldsUpdate={processInputIfSetWithFieldsUpdate} 
              on:deleteTodaysCacheInputWithFieldsUpdate={deleteTodaysCacheInputWithFieldsUpdate}
              on:formInputChange={updateFieldsFromEvent}
              processingValue={processingValue} processingCount={processingCount} />
{#if info_links}
  <div class="row">
    <div class="col-12">
      <h3>Infos{infos_ticker_name}</h3>
    </div>
  </div>
  <div class="row contentrow infos">
    <InfoKeyValue info_key_value_pairs={info_key_value_pairs} />
    <ChartGraphs info_graphs={info_graphs} />
    <LinkNews
      on:sectionActivated={sectionActivated} on:triggerChatWithStock={triggerChatWithStock}
      activeInfoNewsChat={activeInfoNewsChat} info_links={info_links} gpt_info_info={gpt_info_info} gpt_info_analysis={gpt_info_analysis}
      news_links_list={news_links_list} gpt_news_info={gpt_news_info} gpt_news_analysis={gpt_news_analysis}
      userInputTicker={userInputTicker} chatInput={chatInput} chat_info={chat_info} chat_stats={chat_stats} chat_answer={chat_answer}
    />
  </div>
{/if}

<style>
  .infos.contentrow {
    background-color: lightgray;
  }
</style>
