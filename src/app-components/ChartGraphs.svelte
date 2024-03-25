<script>
    export let info_graphs;
</script>

<div class="col-lg-2 col-md-12 middlecolumn">
    <div class="row">
        <div class="col-12 columnheader textonly">Graphs</div>
    </div>
    <div class="row">
        <div class="col-12 columncontent">
            <div class="graphs_wrapper">
                {@html info_graphs}
            </div>
        </div>
    </div>
</div>

<style>
    .graphs_wrapper {
        padding-bottom: 5px;
        display: block;
        width: 100%;
    }
    .middlecolumn {
        border-left: 1px solid white;
        border-right: 1px solid white;
    }
</style>
