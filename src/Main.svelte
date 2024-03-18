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

<div>
    {#if !isAuthenticated}
        <div id="buttonDiv"></div>
    {:else}
      <div class="auth-status-banner">
          <button on:click={logout}>Logout</button>
          <span>Logged in as '{userEmail}'</span>
        </div>
      <style>
        .auth-status-banner {
          display: flex;
          align-items: center;
          background-color: gray;
          padding: 10px;
          margin: 10px 0;
        }
        .auth-status-banner button {
          margin-right: 10px;
        }
        .auth-status-banner span {
          font-weight: bold;
          color: white;
        }
      </style>
      <App />
    {/if}
</div>
