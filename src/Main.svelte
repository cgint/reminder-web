<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import App from './App.svelte';
  
    let isAuthenticated = false;
  
    onMount(() => {
        googleLoginInit()
        //gapiLoaded()
        // needs <script src="https://apis.google.com/js/api.js" async defer></script>
    });

    // function gapiLoaded() {
    //     gapi.load('client:auth2', function() {
    //         gapi.client.init({
    //             client_id: '144501535534-cc4hm6rceqoiur9oavrr5mihjkhm0leg.apps.googleusercontent.com',
    //             scope: 'https://www.googleapis.com/auth/cloud-platform' // specify the necessary scope
    //         }).then(() => {
    //             console.log('gapi client initialized');
    //         });
    //     });
    // }

    // function fetchAccessToken() {
    //     gapi.auth2.getAuthInstance().signIn().then(function(googleUser) {
    //         let access_token = googleUser.getAuthResponse().access_token;
    //         console.log('Access Token:', access_token);
    //     });
    // }

    function handleCredentialResponse(response) {
        let token = response.credential
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email === "christian.gintenreiter@gmail.com") {
            isAuthenticated = true;
            // fetchAccessToken()
        } else {
            isAuthenticated = false;
        }
        
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
  