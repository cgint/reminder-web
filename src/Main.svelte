<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import App from './App.svelte';
  
    let isAuthenticated = false;
  
    onMount(() => {
        googleLoginInit()
    });

    function handleCredentialResponse(response) {
        let token = response.credential
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email === "christian.gintenreiter@gmail.com") {
            isAuthenticated = true;
        } else {
            isAuthenticated = false;
        }
        isAuthenticated = true;
    }

    function googleLoginInit() {
        google.accounts.id.initialize({
            client_id: "144501535534-cc4hm6rceqoiur9oavrr5mihjkhm0leg.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("buttonDiv"),
            { theme: "outline", size: "large" }
        );
        google.accounts.id.prompt(); // also display the One Tap dialog
    }

  </script>
  
  <div>
    {#if !isAuthenticated}
        <div id="buttonDiv"></div>
    {:else}
      <App />
    {/if}
  </div>
  