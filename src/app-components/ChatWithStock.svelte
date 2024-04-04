<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { api_url } from "../constants.js";
    import ChatProcessing from "./ChatProcessing.svelte";
    import { tickerInput } from "../storeTickerInput.js";
    $: userInputTicker = $tickerInput.ticker;

    import { bearer } from "../storeBearer.js";
    $: password = $bearer.bearer;

    let chatInput = "";
    let chat_answering_running = false;
    let chat_info = "";
    let chat_stats = "";
    let chat_answer = "Please provide a question for me to answer.";

    const processingText = "loading...";

    onMount(() => {
        fetchChatInputFromStorage();
    });

    function triggerChatWithStock() {
        chatInput = chatInput.trim();
        storeChatInputInStorage(chatInput);
        load_chat_answer();
    }

    function triggerOnEnter(event) {
        if (event.key === "Enter") {
            triggerChatWithStock();
        }
    }

    function storeChatInputInStorage(chatInput) {
        localStorage.setItem('chatInput', chatInput);
    }
    function fetchChatInputFromStorage() {
        chatInput = localStorage.getItem('chatInput') || "";
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
</script>
<div class="row">
    <div class="col-12">
        <strong>Chat with Stock '{userInputTicker}':</strong>
    </div>
</div>
<div class="row">
    <div class="col-12">
        <i>Answer will be based on: infos, news and gpt-summaries. <nobr>Single questions only for now.</nobr></i>
    </div>
</div>
<div class="row">
    <div class="col-12">
        <input type="text" bind:value={chatInput} placeholder="Why is this stock ... ?" on:keydown={triggerOnEnter} class="form-control" />
    </div>
</div>
<div class="row">
    <div class="col-auto">
        <button class="btn btn-primary" on:click={triggerChatWithStock}>Answer this</button>
    </div>
    {#if chat_answering_running}
        <ChatProcessing processingValue={processingText} />
    {/if}
</div>
<br /><br />
<strong title="{chat_stats}">Answer to your question{chat_info}:</strong><br />
<div class="contentindent min-height-300 gpt-result">
    <i>{@html chat_answer}</i>
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