<script>
    import { onMount } from 'svelte';
    import App from './App.svelte';
  
    let isAuthenticated = false;
    let userEmail = '';

    onMount(() => {
        checkAuthenticationOnLoad();
        if (!isAuthenticated) {
            googleLoginInit();
        }
    });

    function checkAuthenticationOnLoad() {
        isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        userEmail = isAuthenticated ? localStorage.getItem('userEmail') : '';
    }

    function handleCredentialResponse(response) {
        let token = response.credential;
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email === "christian.gintenreiter@gmail.com") {
            isAuthenticated = true;
            userEmail = payload.email; // Update the userEmail variable
        } else {
            isAuthenticated = false;
            userEmail = '';
        }
        localStorage.setItem('isAuthenticated', isAuthenticated.toString());
        localStorage.setItem('userEmail', userEmail);
    }
    function googleLoginInit() {
        google.accounts.id.initialize({
            client_id: "144501535534-cc4hm6rceqoiur9oavrr5mihjkhm0leg.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large", text: "signin_with", locale: "en" }
        );
        google.accounts.id.prompt();
    }

    function logout() {
        isAuthenticated = false;
        userEmail = '';
        localStorage.clear();
        window.location.reload();
    }
</script>

{#if !isAuthenticated}
  <div class="row">
    <div class="col-auto">
      <div id="buttonDiv"></div>
    </div>
  </div>
  {:else}
  <div class="row auth-status-banner">
    <div class="col-md-6 col-sm-12 status">
      <div class="d-flex flex-row flex-nowrap">
        <div class="col-auto">
          <button class="btn btn-light" on:click={logout}>Logout</button>
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
  <App />

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
{/if}
