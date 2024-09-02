<script>
    import Login from '../components/Login.svelte';
    import AuthStatusBanner from '../components/AuthStatusBanner.svelte';
    import App from '../components/App.svelte';
    import { auth } from './storeAuth.ts';

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
