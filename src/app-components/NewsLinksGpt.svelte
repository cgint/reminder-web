<script>
    import axios from "axios";
    import { onMount } from "svelte";
    import { api_url } from "../constants.js";
    import { prevInput } from "../storePrevInput.js";
    import { tickerInput } from "../storeTickerInput.js";
    import { bearer } from "../storeBearer.js";
    import { processing } from "../storeProcessing.js";
    import {
        result_cache_has_key,
        result_cache_set,
        result_cache_get,
    } from "./result_cache.js";

    $: userInputTicker = $tickerInput.ticker;
    $: password = $bearer.bearer;

    let news_links_list = [];
    $: news_links_prev_input = $prevInput.news_links_prev_input;
    let news_links_running = false;

    let gpt_news_analysis = "";
    let gpt_news_info = "";
    let gpt_news_stats = "";
    $: gpt_news_analysis_prev_input = $prevInput.gpt_news_analysis_prev_input;
    let gpt_news_analysis_running = false;

    $: tickerSetDate = $tickerInput.tickerSetDate;
    $: if (tickerSetDate) {
        fetchAll();
    }

    onMount(async () => {
        await fetchAll();
    });

    async function fetchAll() {
        processing.startProcessing();
        await Promise.all([load_news_links(), load_news_gpt_analysis()]);
        processing.stopProcessing();
    }
    async function load_news_links() {
        if (news_links_running || userInputTicker == news_links_prev_input) {
            return;
        }
        let main_data_key = "news_links_list";
        if (!result_cache_has_key(userInputTicker, main_data_key)) {
            news_links_running = true;
            try {
                if (userInputTicker != prevInput.news_links_prev_input) {
                    news_links_list = [];
                }
                await axios
                    .get(`${api_url}/data/${userInputTicker}/news/overview`, {
                        headers: { password: password },
                    })
                    .then((response) => {
                        prevInput.setNewsLinksPrevInput(userInputTicker);
                        result_cache_set(
                            userInputTicker,
                            main_data_key,
                            JSON.stringify(response.data["news"]["data"]),
                        );
                    })
                    .catch((error) => {
                        console.error("Error fetching data:", error);
                        news_links_list = [];
                    })
                    .finally(() => {
                        news_links_running = false;
                    });
            } catch (error) {
                news_links_running = false;
                console.error("Error fetching news links:", error);
            }
        }
        if (result_cache_has_key(userInputTicker, main_data_key)) {
            news_links_list = JSON.parse(
                result_cache_get(userInputTicker, main_data_key),
            );
        }
    }
    async function load_news_gpt_analysis() {
        if (
            gpt_news_analysis_running ||
            userInputTicker == gpt_news_analysis_prev_input
        ) {
            return;
        }
        if (!result_cache_has_key(userInputTicker, "gpt_news_analysis")) {
            gpt_news_analysis_running = true;
            try {
                if (userInputTicker != gpt_news_analysis_prev_input) {
                    gpt_news_info = "";
                    gpt_news_stats = "";
                    gpt_news_analysis = "Analysing. Please wait...";
                }
                await axios
                    .get(`${api_url}/gpt/analysis/${userInputTicker}/news`, {
                        headers: { password: password },
                    })
                    .then((response) => {
                        gpt_news_analysis_prev_input = userInputTicker;
                        result_cache_set(
                            userInputTicker,
                            "gpt_news_analysis",
                            response.data["analysis"],
                        );
                        result_cache_set(
                            userInputTicker,
                            "gpt_news_info",
                            " (" +
                                response.data["source"] +
                                " for " +
                                response.data["ticker"] +
                                ")",
                        );
                        let stats = response.data['stats'];
                        gpt_news_stats = `p_len: ${stats['p_len']}, p_words: ${stats['p_words']}, duration_sec: ${stats['duration_sec']}`;
                    })
                    .catch((error) => {
                        console.error("Error fetching data:", error);
                        gpt_news_analysis = "Error fetching data: " + error;
                    })
                    .finally(() => {
                        gpt_news_analysis_running = false;
                    });
            } catch (error) {
                gpt_news_analysis_running = false;
                console.error("Error fetching gpt news analysis:", error);
            }
        }
        if (result_cache_has_key(userInputTicker, "gpt_news_analysis")) {
            gpt_news_analysis = result_cache_get(
                userInputTicker,
                "gpt_news_analysis",
            );
            gpt_news_info = result_cache_get(userInputTicker, "gpt_news_info");
        }
    }
</script>

<strong>News:</strong><br />
<div class="contentindent">
    {#each news_links_list as news_link}
        <a href={news_link["link"]} target="_blank">{news_link["title"]}</a>
        <span class="newsdate"
            >({new Date(news_link["providerPublishTime"] * 1000)
                .toISOString()
                .slice(0, 10)})</span
        >
        <br />
    {/each}
</div>
<br /><br />
<strong title="{gpt_news_stats}">GPT-News-Analysis{gpt_news_info}:</strong><br />
<div class="contentindent min-height-300 gpt-result">
    <i>{@html gpt_news_analysis}</i>
</div>

<style>
    .gpt-result {
        color: rgb(90, 90, 90);
    }
    .contentindent {
        padding-left: 5px;
    }
    .newsdate {
        color: rgb(90, 90, 90);
        font-style: italic;
        white-space: nowrap;
    }
    .min-height-300 {
        min-height: 300px;
    }
</style>
