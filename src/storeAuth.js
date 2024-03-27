import { writable } from 'svelte/store';

function createAuthStore(logoutListenerFunction) {
    const { subscribe, set } = writable({ isAuthenticated: false, userEmail: '' });

    return {
        subscribe,
        logout: () => {
            set({ isAuthenticated: false, userEmail: '' });
            logoutListenerFunction();
        },
        setAuthState: (isAuthenticated, userEmail) => {
            set({ isAuthenticated, userEmail });
        }
    };
}

function clearLocalStoreOnLogout() {
    localStorage.clear();
    console.log('Local storage cleared');
}

export const auth = createAuthStore(clearLocalStoreOnLogout);
