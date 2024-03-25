<script>
    export let info_key_value_pairs;
</script>

<div class="col-lg-3 col-md-12">
    <div class="row">
        <div class="col-12 columnheader textonly">Numbers</div>
    </div>
    <div class="row infos">
        <div class="col-12 columncontent textcontent min-height-300">
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

<style>
    .columnheader.textonly {
        padding-left: 15px;
    }
    .columnheader {
        font-weight: bold;
        background-color: lightblue;
    }
    .columncontent.min-height-300 {
        min-height: 300px;
    }
    .columncontent.textcontent {
        padding-left: 15px;
        padding-right: 15px;
        padding-bottom: 25px;
    }
    .info_key_value_table {
        width: 100%;
    }
    .info_key_value_table div.info_key_value {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        width: 100%;
    }

    .info_key_value_table div.info_key,
    .info_key_value_table div.info_value {
        flex: 1;
        white-space: nowrap;
    }
    .info_key_value_table div.info_key::first-letter {
        text-transform: uppercase;
    }
    .info_key_value_table div.info_value {
        color: rgb(90, 90, 90);
        text-align: right;
    }
</style>
