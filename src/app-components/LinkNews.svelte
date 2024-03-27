<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from "svelte";
    export let userInputTicker,
        activeInfoNewsChat,
        info_links,
        gpt_info_info,
        gpt_info_analysis,
        news_links_list,
        gpt_news_info,
        gpt_news_analysis,
        chatInput,
        chat_info,
        chat_stats,
        chat_answer;

    let defaultSection = "info";

    const dispatch = createEventDispatcher();

    onMount(() => {
        fetchActiveInfoNewsChatFromStorage();
        activateSection(activeInfoNewsChat);
        fetchChatInputFromStorage();
    });

    function activateSection(selectedSection) {
        console.log("activateSection", selectedSection);
        storeActiveInfoNewsChatInStorage(selectedSection);
        dispatch("sectionActivated", { selectedSection: selectedSection });
    }

    function triggerChatWithStock() {
        chatInput = chatInput.trim();
        storeChatInputInStorage(chatInput);
        dispatch("triggerChatWithStock", { chatInput });
    }

    function triggerOnEnter(event) {
        if (event.key === "Enter") {
            triggerChatWithStock();
        }
    }


    function storeActiveInfoNewsChatInStorage(activeInfoNewsChat) {
        localStorage.setItem('activeInfoNewsChat', activeInfoNewsChat);
    }
    function fetchActiveInfoNewsChatFromStorage() {
        activeInfoNewsChat = localStorage.getItem('activeInfoNewsChat') || defaultSection;
    }

    function storeChatInputInStorage(chatInput) {
        localStorage.setItem('chatInput', chatInput);
    }
    function fetchChatInputFromStorage() {
        chatInput = localStorage.getItem('chatInput') || "";
    }
</script>

<div class="col-lg-7 col-md-12">
    <div class="row">
        <div class="col-12 columnheader link-options">
            <button
                on:click={() => activateSection('info')}
                class:active={activeInfoNewsChat === "info"}
                style="border: none; cursor: pointer;"
                >Links/GPT-Data-Analysis</button
            >
            <button
                on:click={() => activateSection('news')}
                class:active={activeInfoNewsChat === "news"}
                style="border: none; cursor: pointer;"
                >News/GPT-News-Analysis</button
            >
            <button
                on:click={() => activateSection('chat')}
                class:active={activeInfoNewsChat === "chat"}
                style="border: none; cursor: pointer;"
                >Chat with Stock</button
            >
        </div>
    </div>
    <div class="row">
        <div class="col-12 columncontent textcontent">
            {#if activeInfoNewsChat == "info"}
                <strong>Links:</strong><br />
                <div class="contentindent">
                    {@html info_links}
                </div>
                <br /><br />
                <strong>GPT-Info-Analysis{gpt_info_info}:</strong><br />
                <div class="contentindent min-height-300 gpt-result">
                    <i>{@html gpt_info_analysis}</i>
                </div>
            {/if}
            {#if activeInfoNewsChat == "news"}
                <strong>News:</strong><br />
                <div class="contentindent">
                    {#each news_links_list as news_link}
                        <a href={news_link["link"]} target="_blank"
                            >{news_link["title"]}</a
                        >
                        <span class="newsdate"
                            >({new Date(news_link["providerPublishTime"] * 1000)
                                .toISOString()
                                .slice(0, 10)})</span
                        >
                        <br />
                    {/each}
                </div>
                <br /><br />
                <strong>GPT-News-Analysis{gpt_news_info}:</strong><br />
                <div class="contentindent min-height-300 gpt-result">
                    <i>{@html gpt_news_analysis}</i>
                </div>
            {/if}
            {#if activeInfoNewsChat == "chat"}
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
                        <button class="btn btn-primary" on:click={triggerChatWithStock}>Request Answer</button>
                    </div>
                </div>
                <br /><br />
                <strong title="{chat_stats}">Answer to your question{chat_info}:</strong><br />
                <div class="contentindent min-height-300 gpt-result">
                    <i>{@html chat_answer}</i>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .columnheader {
        font-weight: bold;
        background-color: lightblue;
    }
    .columncontent .gpt-result {
        color: rgb(90, 90, 90);
    }
    .columncontent.textcontent {
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 25px;
    }
    .contentindent {
        padding-left: 5px;
    }
    .link-options {
        display: flex;
    }
    .infos .link-options button {
        background-color: lightblue;
        cursor: pointer;
        padding-left: 5px;
        flex: 1;
    }
    .columncontent .min-height-300 {
        min-height: 300px;
    }
    .infos .link-options .active {
        font-weight: bold;
        background-color: rgb(58, 185, 227);
    }
    .newsdate {
        color: rgb(90, 90, 90);
        font-style: italic;
        white-space: nowrap;
    }
</style>
