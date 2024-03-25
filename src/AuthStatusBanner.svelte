<script>
    export let authStore;
    export let userEmail;
</script>

<div class="row auth-status-banner">
    <div class="col-md-6 col-sm-12 status">
      <div class="d-flex flex-row flex-nowrap">
        <div class="col-auto">
          <button class="btn btn-light" on:click={authStore.logout()}>Logout</button>
        </div>
        <div class="col-auto logged-in-as">
          Logged in as '{userEmail}'
        </div>
      </div>
    </div>
    <div class="col-md-6 col-sm-12 cacheinfo">
      (All data on this page is cached on same calendar day)
    </div>
  </div>

  <style>
    .auth-status-banner {
      background-color: gray;
      color: lightgray;
      padding-top: 5px;
      padding-bottom: 5px;
    }
    .auth-status-banner button {
      margin-right: 10px;
    }
    .auth-status-banner div.status {
      font-size: 0.9em;
      flex: 1;
    }
    .auth-status-banner .logged-in-as {
      overflow: hidden;
      white-space: nowrap;
      max-width: 100%;
    }
    .auth-status-banner div.cacheinfo {
      font-size: 0.8em;
      text-align: right;
      font-style: italic;
    }
  </style>
