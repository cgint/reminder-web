<script>
    import { onMount } from 'svelte';
    import { createEventDispatcher } from "svelte";
    import LinksGptInfo from "./LinksGptInfo.svelte";
    import ChatWithStock from "./ChatWithStock.svelte";
    import NewsLinksGpt from "./NewsLinksGpt.svelte";

    export let activeInfoNewsChat;

    let defaultSection = "info";

    const dispatch = createEventDispatcher();

    onMount(() => {
        fetchActiveInfoNewsChatFromStorage();
        activateSection(activeInfoNewsChat);
    });

    function activateSection(selectedSection) {
        console.log("activateSection", selectedSection);
        storeActiveInfoNewsChatInStorage(selectedSection);
        dispatch("sectionActivated", { selectedSection: selectedSection });
    }


    function storeActiveInfoNewsChatInStorage(activeInfoNewsChat) {
        localStorage.setItem('activeInfoNewsChat', activeInfoNewsChat);
    }
    function fetchActiveInfoNewsChatFromStorage() {
        activeInfoNewsChat = localStorage.getItem('activeInfoNewsChat') || defaultSection;
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
                <LinksGptInfo />
            {/if}
            {#if activeInfoNewsChat == "news"}
                <NewsLinksGpt />
            {/if}
            {#if activeInfoNewsChat == "chat"}
                <ChatWithStock />
            {/if}
        </div>
    </div>
</div>

<style>
    .columnheader {
        font-weight: bold;
        background-color: lightblue;
    }
    .columncontent.textcontent {
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 25px;
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
    .infos .link-options .active {
        font-weight: bold;
        background-color: rgb(58, 185, 227);
    }
</style>
