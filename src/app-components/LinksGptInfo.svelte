<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { api_url } from "../constants.js";
    import { result_cache_has_key, result_cache_get, result_cache_set } from "./result_cache.js";
    import { bearer } from "../storeBearer.js";
    import { prevInput } from '../storePrevInput.js';
    import { tickerInput } from '../storeTickerInput.js';
    import { processing } from "../storeProcessing.js";
    
    $: password = $bearer.bearer;
    $: userInputTicker = $tickerInput.ticker;
    $: tickerSetDate = $tickerInput.tickerSetDate;
    $: if (tickerSetDate) {
            fetchAll();
        }
    
    let info_links = "";
    let gpt_info_running = false;
    $: gpt_info_prev_input = $prevInput.gpt_info_prev_input;
    let gpt_info_analysis = "";
    let gpt_info_info = "";
    let gpt_info_stats = "";

    onMount(async () => {
        await fetchAll();
    });

    async function fetchAll() {
        processing.startProcessing();
        await Promise.all([createStaticInfoLinks(), load_info_gpt_analysis()]);
        processing.stopProcessing();
    }

    async function createStaticInfoLinks() {
        let curtimeEpoch = Math.floor(Date.now() / 1000);
        let linksToCreate = {
            FinViz: `https://finviz.com/quote.ashx?t=${userInputTicker}&p=m`,
            "Yahoo Details": `https://finance.yahoo.com/quote/${userInputTicker}`,
            "Yahoo Analysis": `https://finance.yahoo.com/quote/${userInputTicker}/analysis`,
            "Yahoo Historic Dividends": `https://finance.yahoo.com/quote/${userInputTicker}/history?period1=345427200&period2=${curtimeEpoch}&interval=capitalGain%7Cdiv%7Csplit&filter=div&frequency=1d&includeAdjustedClose=true`,
            "Yahoo Lookup": `https://finance.yahoo.com/lookup?s=${userInputTicker}`,
            Danelfin: `https://danelfin.com/stock/${userInputTicker}`,
        };

        info_links = "";
        for (let link in linksToCreate) {
            info_links += `<a href="${linksToCreate[link]}" target="_blank">${link} for '${userInputTicker}'</a><br/>`;
        }
    }
    async function load_info_gpt_analysis() {
        if (gpt_info_running || userInputTicker == gpt_info_prev_input) {
            return;
        }
        let main_data_key = "gpt_info_analysis";
        if (!result_cache_has_key(userInputTicker, main_data_key)) {
            gpt_info_running = true;
            try {
                if (userInputTicker != gpt_info_prev_input) {
                    gpt_info_info = "";
                    gpt_info_analysis = "Analysing. Please wait...";
                }
                await axios
                    .get(
                        `${api_url}/gpt/analysis/${userInputTicker}/yfinance`,
                        { headers: { password: password } },
                    )
                    .then((response) => {
                        gpt_info_prev_input = userInputTicker;
                        result_cache_set(
                            userInputTicker,
                            main_data_key,
                            response.data["analysis"],
                        );
                        result_cache_set(
                            userInputTicker,
                            "gpt_info_info",
                            " (" +
                                response.data["source"] +
                                " for " +
                                response.data["ticker"] +
                                ")",
                        );
                        let stats = response.data['stats'];
                        gpt_info_stats = `p_len: ${stats['p_len']}, p_words: ${stats['p_words']}, duration_sec: ${stats['duration_sec']}`;
                    })
                    .catch((error) => {
                        console.error("Error fetching data:", error);
                        gpt_info_analysis = "Error fetching data: " + error;
                    })
                    .finally(() => {
                        gpt_info_running = false;
                    });
            } catch (error) {
                gpt_info_running = false;
                console.error("Error fetching gpt info analysis:", error);
            }
        }
        if (result_cache_has_key(userInputTicker, main_data_key)) {
            gpt_info_analysis = result_cache_get(
                userInputTicker,
                main_data_key,
            );
            gpt_info_info = result_cache_get(userInputTicker, "gpt_info_info");
        }
    }
</script>

<strong>Links:</strong><br />
<div class="contentindent">
    {@html info_links}
</div>
<br /><br />
<strong title="{gpt_info_stats}">GPT-Info-Analysis{gpt_info_info}:</strong><br />
<div class="contentindent min-height-300 gpt-result">
    <i>{@html gpt_info_analysis}</i>
</div>

<style>
    .gpt-result {
        color: rgb(90, 90, 90);
    }
    .contentindent {
        padding-left: 5px;
    }
    .min-height-300 {
        min-height: 300px;
    }
</style>