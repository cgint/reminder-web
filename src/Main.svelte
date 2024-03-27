<script>
    import Login from './Login.svelte';
    import AuthStatusBanner from './AuthStatusBanner.svelte';
    import App from './App.svelte';
    import { auth } from './storeAuth.js'; // Import the store

    // Reactive subscription to the store
    $: isAuthenticated = $auth.isAuthenticated;
    $: userEmail = $auth.userEmail;

</script>

{#if !isAuthenticated}
  <Login authStore={auth} />
{:else}
  <AuthStatusBanner userEmail={userEmail} authStore={auth} />
  <App />
{/if}
