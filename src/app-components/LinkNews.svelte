<script>
    import { createEventDispatcher } from "svelte";
    export let linksInfoOrNews,
        info_links,
        gpt_info_info,
        gpt_info_analysis,
        news_links_list,
        gpt_news_info,
        gpt_news_analysis;

    const dispatch = createEventDispatcher();
    function activateLinksAndGptInfo() {
        dispatch("activateLinksAndGptInfo");
    }
    function activateNewsAndGptNews() {
        dispatch("activateNewsAndGptNews");
    }
</script>

<div class="col-lg-7 col-md-12">
    <div class="row">
        <div class="col-12 columnheader link-options">
            <button
                on:click={activateLinksAndGptInfo}
                class:active={linksInfoOrNews === "info"}
                style="border: none; cursor: pointer;"
                >Links/GPT-Data-Analysis</button
            >
            <button
                on:click={activateNewsAndGptNews}
                class:active={linksInfoOrNews === "news"}
                style="border: none; cursor: pointer;"
                >News/GPT-News-Analysis</button
            >
        </div>
    </div>
    <div class="row">
        <div class="col-12 columncontent textcontent">
            {#if linksInfoOrNews == "info"}
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
            {#if linksInfoOrNews == "news"}
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
