<script>
    import { onMount } from 'svelte';
    export let authStore;
    
    function authChanged(isAuthenticated, userEmail) {
        authStore.setAuthState(isAuthenticated, userEmail);
    }

    onMount(() => {
        if (!checkAuthenticationOnLoadIsAuthenticated()) {
            googleLoginInit();
        }
    });

    function checkAuthenticationOnLoadIsAuthenticated() {
        let isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        let userEmail = isAuthenticated ? localStorage.getItem("userEmail") : "";
        authChanged(isAuthenticated, userEmail);
        return isAuthenticated;
    }

    function handleCredentialResponse(response) {
        let token = response.credential;
        const payload = JSON.parse(atob(token.split(".")[1]));
        let isAuthenticated = false;
        let userEmail = "";
        if (payload.email === "christian.gintenreiter@gmail.com") {
            isAuthenticated = true;
            userEmail = payload.email;
        }
        localStorage.setItem("isAuthenticated", isAuthenticated.toString());
        localStorage.setItem("userEmail", userEmail);
        authChanged(isAuthenticated, userEmail);
    }

    function googleLoginInit() {
        google.accounts.id.initialize({
            client_id:
                "144501535534-cc4hm6rceqoiur9oavrr5mihjkhm0leg.apps.googleusercontent.com",
            callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(document.getElementById("buttonDiv"), {
            theme: "outline",
            size: "large",
            text: "signin_with",
            locale: "en",
        });
        google.accounts.id.prompt();
    }
</script>

<div class="row">
    <div class="col-auto">
        <div id="buttonDiv"></div>
    </div>
</div>