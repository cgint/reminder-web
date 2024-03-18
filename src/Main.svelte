<script>
    import { onMount } from 'svelte';
    import App from './App.svelte';
  
    let isAuthenticated = false;
    let userEmail = ''; // Declare a variable to store the user's email

    onMount(() => {
        checkAuthentication();
        if (!isAuthenticated) {
            googleLoginInit();
        }
    });

    function checkAuthentication() {
        // Check if the user's authentication status and email are stored in localStorage
        const isUserAuthenticated = localStorage.getItem('isAuthenticated');
        userEmail = localStorage.getItem('userEmail');
        isAuthenticated = isUserAuthenticated === 'true';
    }

    function handleCredentialResponse(response) {
        let token = response.credential;
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email === "christian.gintenreiter@gmail.com") {
            isAuthenticated = true;
            userEmail = payload.email; // Update the userEmail variable
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', userEmail); // Store the user's email in localStorage
        } else {
            isAuthenticated = false;
            userEmail = ''; // Clear the userEmail variable
            localStorage.setItem('isAuthenticated', 'false');
            localStorage.removeItem('userEmail'); // Remove the user's email from localStorage
        }
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
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.removeItem('userEmail');
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
